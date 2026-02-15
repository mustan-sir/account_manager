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

## GitHub Setup

1. Create a new repository on [GitHub](https://github.com/new) (e.g. `account-manager`). Do **not** initialize with a README.
2. Add the remote and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/account-manager.git
   git branch -M main
   git push -u origin main
   ```
3. Replace `YOUR_USERNAME` and `account-manager` with your GitHub username and repo name.

## Plaid Bank Linking

Link bank accounts directly via Plaid:

1. Sign up at [Plaid Dashboard](https://dashboard.plaid.com/) and get your **Client ID** and **Secret** (use Sandbox for testing).
2. Create `apps/api/.env` with:
   ```
   PLAID_CLIENT_ID=your_client_id
   PLAID_SECRET=your_sandbox_secret
   PLAID_ENV=sandbox
   ```
3. Restart the API. The "Link bank account" button will appear on the dashboard.
4. Click **Link new account** to connect a bank (use Plaid sandbox credentials for testing).
5. Use **Sync balances** to refresh balances from linked accounts.

For production, switch to `PLAID_ENV=development` or `production` and use the corresponding keys.

### Plaid Pay-as-you-go (Personal Use)

**Yes, Pay-as-you-go is a good fit** for personal projects:

- No monthly minimum, no upfront commitment
- You pay only for what you use
- For this app (Transactions + Balance): ~$0.30/account/month (Transactions) + $0.10 per balance sync call
- Example: 5 linked accounts, sync 2×/week ≈ $1.50/month + ~$0.80 = **~$2.30/month**

**Additional verification:** Plaid may require you to complete an **Application profile**, **Company profile**, and **Security questionnaire** for full Production access (especially for OAuth institutions like Chase). For personal use, you can use your name or a simple "Personal Finance" description.

**Approval timeline:** Most requests are reviewed within **1–3 business days**. Free trial / personal project requests can sometimes be approved within 24 hours. EU/UK access requires at least one week. Check your email and Plaid Dashboard for status.

## Roadmap Hooks Added

- Reward rules + best-card endpoint ready
- Offers model included for future offer matching
- Provider adapter-friendly schema for future Plaid/Teller integration
- Dockerized setup for future cloud deployment
