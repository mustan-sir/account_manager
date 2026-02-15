SHELL := /bin/bash

# Docker-based (requires Docker Desktop)
up:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

seed:
	docker compose exec -T db psql -U account_user -d account_manager < scripts/seed_data.sql

# Local dev without Docker (no install required)
dev-api:
	cd apps/api && pip install -r requirements.txt && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-web:
	cd apps/web && npm install && npm run dev

dev:
	@echo "Run in two terminals:"
	@echo "  Terminal 1: make dev-api"
	@echo "  Terminal 2: make dev-web"

seed-local:
	python scripts/seed_local.py

# Works with both Docker and local
lint:
	cd apps/web && npm run lint

test:
	cd apps/api && pip install -r requirements.txt && pytest -q tests
