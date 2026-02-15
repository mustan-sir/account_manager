from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class CreditCardDetail(Base, TimestampMixin):
    __tablename__ = "credit_card_details"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), nullable=False, unique=True)
    issuer_name: Mapped[str] = mapped_column(String(120), nullable=False)
    apr: Mapped[float | None] = mapped_column(Numeric(6, 3), nullable=True)
    statement_day: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    due_day: Mapped[int] = mapped_column(Integer, nullable=False, default=20)
    due_date_override: Mapped[date | None] = mapped_column(Date, nullable=True)
    min_payment_due: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False, default=0)

    account = relationship("Account", back_populates="card_details")
