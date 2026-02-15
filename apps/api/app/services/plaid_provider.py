"""Plaid provider adapter - creates link tokens, exchanges public tokens, syncs accounts."""

import plaid
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.accounts_get_request import AccountsGetRequest
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.account import Account, Institution
from app.models.plaid_item import PlaidItem

settings = get_settings()


def _get_plaid_client():
    if not settings.plaid_enabled:
        raise RuntimeError("Plaid is not configured. Set PLAID_CLIENT_ID and PLAID_SECRET.")
    env = plaid.Environment.Sandbox
    if settings.plaid_env == "development":
        env = plaid.Environment.Development
    elif settings.plaid_env == "production":
        env = plaid.Environment.Production
    configuration = plaid.Configuration(
        host=env,
        api_key={
            "clientId": settings.plaid_client_id,
            "secret": settings.plaid_secret,
        },
    )
    api_client = plaid.ApiClient(configuration)
    return plaid_api.PlaidApi(api_client)


def _encrypt_token(plain: str) -> str:
    key = settings.plaid_encryption_key
    if not key:
        return plain
    from cryptography.fernet import Fernet
    f = Fernet(key.encode() if isinstance(key, str) else key)
    return f.encrypt(plain.encode()).decode()


def _decrypt_token(encrypted: str) -> str:
    key = settings.plaid_encryption_key
    if not key:
        return encrypted
    from cryptography.fernet import Fernet
    f = Fernet(key.encode() if isinstance(key, str) else key)
    return f.decrypt(encrypted.encode()).decode()


def create_link_token() -> str:
    """Create a Plaid Link token for initializing the Link UI."""
    client = _get_plaid_client()
    request = LinkTokenCreateRequest(
        user=LinkTokenCreateRequestUser(client_user_id="account_manager_user"),
        client_name="Account Manager",
        products=[Products("transactions")],
        country_codes=[CountryCode("US")],
        language="en",
    )
    response = client.link_token_create(request)
    return response.link_token


def exchange_public_token(db: Session, public_token: str) -> dict:
    """
    Exchange public token for access token, create PlaidItem, sync accounts.
    Returns created accounts info.
    """
    client = _get_plaid_client()
    request = ItemPublicTokenExchangeRequest(public_token=public_token)
    response = client.item_public_token_exchange(request)
    access_token = response.access_token
    item_id = response.item_id

    # Fetch accounts from Plaid
    acct_request = AccountsGetRequest(access_token=access_token)
    acct_response = client.accounts_get(acct_request)

    institution_name = "Connected Bank"
    if hasattr(acct_response, "item") and acct_response.item:
        item = acct_response.item
        if hasattr(item, "institution_id") and item.institution_id:
            institution_name = getattr(item, "institution_name", None) or institution_name

    # Create or get Institution
    institution = db.query(Institution).filter(Institution.name == institution_name).first()
    if not institution:
        institution = Institution(name=institution_name, institution_type="bank")
        db.add(institution)
        db.flush()

    # Store PlaidItem
    plaid_item = PlaidItem(
        item_id=item_id,
        institution_id=institution.id,
        institution_name=institution_name,
        access_token_encrypted=_encrypt_token(access_token),
    )
    db.add(plaid_item)
    db.flush()

    type_map = {
        "depository": "checking",
        "credit": "credit_card",
        "loan": "loan",
        "investment": "investment",
    }

    created = []
    for acct in acct_response.accounts:
        plaid_type = getattr(acct.type, "value", str(acct.type)) if acct.type else "depository"
        our_type = type_map.get(plaid_type, "checking")
        bal = 0.0
        if acct.balances and acct.balances.current is not None:
            bal = float(acct.balances.current)
        if our_type == "credit_card" and bal > 0:
            bal = -bal

        account = Account(
            institution_id=institution.id,
            name=acct.name or f"{institution_name} Account",
            account_type=our_type,
            currency=getattr(acct.balances, "iso_currency_code", None) or "USD",
            current_balance=bal,
        )
        db.add(account)
        db.flush()
        created.append({"id": account.id, "name": account.name, "type": our_type, "balance": bal})

    db.commit()
    return {"item_id": item_id, "institution": institution_name, "accounts": created}


def sync_plaid_accounts(db: Session) -> dict:
    """Sync balances from all linked Plaid items."""
    items = db.query(PlaidItem).filter(PlaidItem.is_active == True).all()
    updated = 0
    errors = []

    for item in items:
        try:
            token = _decrypt_token(item.access_token_encrypted)
            client = _get_plaid_client()
            request = AccountsGetRequest(access_token=token)
            response = client.accounts_get(request)

            for acct in response.accounts:
                our = (
                    db.query(Account)
                    .filter(Account.institution_id == item.institution_id, Account.name == acct.name)
                    .first()
                )
                if our and acct.balances and acct.balances.current is not None:
                    bal = float(acct.balances.current)
                    if our.account_type == "credit_card" and bal > 0:
                        bal = -bal
                    our.current_balance = bal
                    updated += 1
        except Exception as e:
            errors.append({"item_id": item.item_id, "error": str(e)})

    db.commit()
    return {"accounts_updated": updated, "errors": errors}
