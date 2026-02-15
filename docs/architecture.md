# Architecture

## Local-First Runtime

- `apps/web`: React + TypeScript + Tailwind dashboard.
- `apps/api`: FastAPI service with SQLAlchemy models and CSV ingestion.
- `db`: PostgreSQL container, persistent local volume.

## Extension Path

- Bank linking can be added through a provider adapter module (Plaid/Teller) without changing core entities.
- Cloud deployment can reuse the same container images with managed Postgres.
