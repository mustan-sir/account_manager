#!/usr/bin/env python3
"""Seed local SQLite database with demo data. Run from project root: python scripts/seed_local.py"""
import sys
from pathlib import Path

# Add apps/api to path so we can import app
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "apps" / "api"))

from sqlalchemy.orm import Session

from app.db import base  # noqa: F401 - loads all models for create_all
from app.db.session import SessionLocal, engine
from app.models.base import Base
from app.models.account import Account
from app.models.card import CreditCardDetail
from app.models.reward import RewardRule


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Account).count() > 0:
            print("Database already has data. Skipping seed.")
            return

        a1 = Account(name="Primary Checking", account_type="checking", currency="USD", current_balance=4200.00)
        a2 = Account(name="Brokerage Portfolio", account_type="investment", currency="USD", current_balance=27500.00)
        a3 = Account(name="Travel Rewards Card", account_type="credit_card", currency="USD", current_balance=-1250.00)
        db.add_all([a1, a2, a3])
        db.flush()

        db.add(
            CreditCardDetail(
                account_id=a3.id,
                issuer_name="Chase",
                apr=22.99,
                statement_day=1,
                due_day=20,
                min_payment_due=45.00,
            )
        )
        db.add(RewardRule(account_id=a3.id, category="travel", multiplier=3.0, point_currency="points"))

        db.commit()
        print("Seed complete. Added 3 accounts, 1 card, 1 reward rule.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
