from datetime import date

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_cash: float
    total_investments: float
    total_card_debt: float
    upcoming_due_count: int


class DueDateItem(BaseModel):
    card_account_id: int
    card_name: str
    due_date: date
    min_payment_due: float
    days_remaining: int
