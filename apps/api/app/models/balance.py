from datetime import date

from sqlalchemy import Date, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class BalanceSnapshot(Base, TimestampMixin):
    __tablename__ = "balance_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), nullable=False, index=True)
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    balance: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)

    account = relationship("Account", back_populates="snapshots")
