from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Institution(Base, TimestampMixin):
    __tablename__ = "institutions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    institution_type: Mapped[str] = mapped_column(String(50), nullable=False)

    accounts = relationship("Account", back_populates="institution")


class Account(Base, TimestampMixin):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    institution_id: Mapped[int | None] = mapped_column(ForeignKey("institutions.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    account_type: Mapped[str] = mapped_column(String(50), nullable=False)
    currency: Mapped[str] = mapped_column(String(8), nullable=False, default="USD")
    current_balance: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(nullable=False, default=True)

    institution = relationship("Institution", back_populates="accounts")
    card_details = relationship("CreditCardDetail", back_populates="account", uselist=False)
    snapshots = relationship("BalanceSnapshot", back_populates="account")
    transactions = relationship("Transaction", back_populates="account")
