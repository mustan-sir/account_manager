from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class ImportJob(Base, TimestampMixin):
    __tablename__ = "import_jobs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    source_name: Mapped[str] = mapped_column(String(120), nullable=False)
    import_type: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="pending", index=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
