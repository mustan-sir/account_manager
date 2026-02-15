from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings

settings = get_settings()

# SQLite needs check_same_thread=False for FastAPI
connect_args = {} if "sqlite" not in settings.database_url else {"check_same_thread": False}
engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    pool_pre_ping="sqlite" not in settings.database_url,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
