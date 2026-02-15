from pydantic import BaseModel, Field


class AccountCreate(BaseModel):
    name: str
    account_type: str = Field(description="checking, savings, investment, credit_card, etc")
    currency: str = "USD"
    current_balance: float = 0
    institution_id: int | None = None


class AccountRead(BaseModel):
    id: int
    name: str
    account_type: str
    currency: str
    current_balance: float
    is_active: bool

    model_config = {"from_attributes": True}


class CardCreate(BaseModel):
    account_id: int
    issuer_name: str
    apr: float | None = None
    statement_day: int = 1
    due_day: int = 20
    min_payment_due: float = 0


class CardRead(BaseModel):
    id: int
    account_id: int
    issuer_name: str
    apr: float | None
    statement_day: int
    due_day: int
    min_payment_due: float

    model_config = {"from_attributes": True}
