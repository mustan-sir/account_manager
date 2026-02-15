from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.account import Account
from app.models.card import CreditCardDetail
from app.schemas.account import AccountCreate, AccountRead, CardCreate, CardRead

router = APIRouter(prefix="", tags=["accounts"])


@router.post("/accounts", response_model=AccountRead)
def create_account(payload: AccountCreate, db: Session = Depends(get_db)):
    account = Account(**payload.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.get("/accounts", response_model=list[AccountRead])
def list_accounts(db: Session = Depends(get_db)):
    return db.query(Account).order_by(Account.id.asc()).all()


@router.post("/cards", response_model=CardRead)
def create_card(payload: CardCreate, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == payload.account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    if account.account_type != "credit_card":
        raise HTTPException(status_code=400, detail="Card detail can be added only to credit_card accounts")

    card = CreditCardDetail(**payload.model_dump())
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.get("/cards", response_model=list[CardRead])
def list_cards(db: Session = Depends(get_db)):
    return db.query(CreditCardDetail).order_by(CreditCardDetail.id.asc()).all()
