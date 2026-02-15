from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class RewardProgram(Base, TimestampMixin):
    __tablename__ = "reward_programs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    points_balance: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    transfer_partners: Mapped[str | None] = mapped_column(Text, nullable=True)


class RewardRule(Base, TimestampMixin):
    __tablename__ = "reward_rules"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    multiplier: Mapped[float] = mapped_column(Numeric(8, 3), nullable=False, default=1)
    point_currency: Mapped[str] = mapped_column(String(40), nullable=False, default="points")
    cap_description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    exclusions: Mapped[str | None] = mapped_column(String(255), nullable=True)


class Offer(Base, TimestampMixin):
    __tablename__ = "offers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    merchant: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    category: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    bonus_multiplier: Mapped[float] = mapped_column(Numeric(8, 3), nullable=False, default=0)
    valid_until: Mapped[str | None] = mapped_column(String(40), nullable=True)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)


class Recommendation(Base, TimestampMixin):
    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    category: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), nullable=False)
    expected_return: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    rationale: Mapped[str] = mapped_column(String(255), nullable=False)
