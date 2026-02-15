# Account Manager

Local-first account management app for tracking:

- bank balances
- investment balances
- credit card balances and due dates
- rewards-based best-card recommendations

## Stack

- Frontend: React + TypeScript + Tailwind (`apps/web`)
- Backend: FastAPI + SQLAlchemy (`apps/api`)
- Database: PostgreSQL (`docker-compose.yml`)

## Quick Start

### Option A: Without Docker (recommended if Docker is not installed)

1. **Terminal 1** – start API (uses SQLite, no DB install needed):
   ```bash
   make dev-api
   ```
2. **Terminal 2** – start frontend:
   ```bash
   make dev-web
   ```
3. Open UI: [http://localhost:5173](http://localhost:5173)
4. API health: [http://localhost:8000/health](http://localhost:8000/health)
5. Seed demo data (optional):
   ```bash
   make seed-local
   ```

### Option B: With Docker

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) for Mac.
2. Start services: `make up`
3. Open UI: [http://localhost:5173](http://localhost:5173)
4. Seed demo data: `make seed`

## CSV Import Templates

### Balances CSV

Required headers:

- `account_id`
- `snapshot_date` (`YYYY-MM-DD`)
- `balance`

### Transactions CSV

Required headers:

- `account_id`
- `transaction_date` (`YYYY-MM-DD`)
- `description`
- `amount`

Optional headers:

- `category`
- `merchant`

## Project Layout

- `apps/api`: API, models, services, migration SQL, tests
- `apps/web`: UI dashboard and forms
- `packages/shared`: shared contracts
- `docs`: architecture and API references
- `scripts`: seed data
- `.github/workflows`: CI

## Roadmap Hooks Added

- Reward rules + best-card endpoint ready
- Offers model included for future offer matching
- Provider adapter-friendly schema for future Plaid/Teller integration
- Dockerized setup for future cloud deployment
