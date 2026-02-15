from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.services.plaid_provider import (
    create_link_token,
    exchange_public_token,
    sync_plaid_accounts,
)

router = APIRouter(prefix="", tags=["plaid"])


class ExchangeRequest(BaseModel):
    public_token: str


@router.get("/plaid/link-token")
def get_link_token():
    """Create a Plaid Link token. Returns 503 if Plaid is not configured."""
    if not get_settings().plaid_enabled:
        raise HTTPException(
            status_code=503,
            detail="Plaid is not configured. Set PLAID_CLIENT_ID and PLAID_SECRET in .env",
        )
    try:
        token = create_link_token()
        return {"link_token": token}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/plaid/exchange-token")
def exchange_token(payload: ExchangeRequest, db: Session = Depends(get_db)):
    """Exchange Plaid public token for access token and import linked accounts."""
    if not get_settings().plaid_enabled:
        raise HTTPException(status_code=503, detail="Plaid is not configured.")
    try:
        result = exchange_public_token(db, payload.public_token)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/plaid/sync")
def sync_accounts(db: Session = Depends(get_db)):
    """Sync balances from all linked Plaid items."""
    if not get_settings().plaid_enabled:
        raise HTTPException(status_code=503, detail="Plaid is not configured.")
    try:
        result = sync_plaid_accounts(db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/plaid/status")
def plaid_status():
    """Check if Plaid integration is enabled."""
    return {"enabled": get_settings().plaid_enabled}
