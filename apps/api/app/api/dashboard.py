from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.account import Account
from app.models.card import CreditCardDetail
from app.schemas.dashboard import DashboardSummary, DueDateItem
from app.services.due_dates import resolve_next_due_date

router = APIRouter(prefix="", tags=["dashboard"])


@router.get("/dashboard/summary", response_model=DashboardSummary)
def get_summary(db: Session = Depends(get_db)):
    accounts = db.query(Account).all()
    total_cash = sum(float(a.current_balance) for a in accounts if a.account_type in {"checking", "savings"})
    total_investments = sum(float(a.current_balance) for a in accounts if a.account_type in {"investment", "retirement"})
    total_card_debt = sum(abs(float(a.current_balance)) for a in accounts if a.account_type == "credit_card")
    card_count = db.query(CreditCardDetail).count()

    return DashboardSummary(
        total_cash=round(total_cash, 2),
        total_investments=round(total_investments, 2),
        total_card_debt=round(total_card_debt, 2),
        upcoming_due_count=card_count,
    )


@router.get("/due-dates/upcoming", response_model=list[DueDateItem])
def get_due_dates(db: Session = Depends(get_db)):
    cards = db.query(CreditCardDetail).all()
    today = date.today()
    result: list[DueDateItem] = []

    for card in cards:
        due = resolve_next_due_date(card.due_day, card.due_date_override)
        days = (due - today).days
        account = db.query(Account).filter(Account.id == card.account_id).first()
        if not account:
            continue
        result.append(
            DueDateItem(
                card_account_id=card.account_id,
                card_name=account.name,
                due_date=due,
                min_payment_due=float(card.min_payment_due),
                days_remaining=days,
            )
        )

    return sorted(result, key=lambda item: item.days_remaining)
