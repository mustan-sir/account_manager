from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    project_name: str = "Account Manager API"
    database_url: str = "sqlite:///./account_manager.db"
    cors_origins: str = "http://localhost:5173"

    # Plaid (optional - set to enable bank linking)
    plaid_client_id: str | None = None
    plaid_secret: str | None = None
    plaid_env: str = "sandbox"  # sandbox | development | production
    plaid_encryption_key: str | None = None  # base64 Fernet key for encrypting access tokens

    @property
    def plaid_enabled(self) -> bool:
        return bool(self.plaid_client_id and self.plaid_secret)

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
