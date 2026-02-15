from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import accounts, dashboard, imports, plaid, rewards
from app.core.config import get_settings
from app.models.base import Base
from app.db.session import engine

settings = get_settings()

app = FastAPI(title=settings.project_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(accounts.router)
app.include_router(dashboard.router)
app.include_router(imports.router)
app.include_router(plaid.router)
app.include_router(rewards.router)
