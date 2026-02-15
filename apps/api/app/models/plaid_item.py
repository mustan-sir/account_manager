from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class PlaidItem(Base, TimestampMixin):
    """Stores a Plaid Item (bank connection) and encrypted access token."""

    __tablename__ = "plaid_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    item_id: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    institution_id: Mapped[int | None] = mapped_column(ForeignKey("institutions.id"), nullable=True)
    institution_name: Mapped[str] = mapped_column(String(120), nullable=False)
    access_token_encrypted: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(nullable=False, default=True)
