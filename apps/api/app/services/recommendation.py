from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.reward import Offer, RewardRule


def get_best_card_for_category(db: Session, category: str, amount: float) -> dict | None:
    normalized = category.strip().lower()
    rule_rows = db.execute(
        select(RewardRule, Account).join(Account, RewardRule.account_id == Account.id).where(RewardRule.category == normalized)
    ).all()

    if not rule_rows:
        return None

    best = None
    for rule, account in rule_rows:
        offer = db.execute(
            select(Offer)
            .where(Offer.account_id == account.id)
            .where((Offer.category == normalized) | (Offer.category.is_(None)))
            .order_by(Offer.bonus_multiplier.desc())
        ).scalars().first()

        bonus = float(offer.bonus_multiplier) if offer else 0.0
        multiplier = float(rule.multiplier) + bonus
        expected_return = round(amount * multiplier, 2)
        rationale = f"{multiplier:.2f}x effective return ({rule.multiplier} base + {bonus} offer bonus)."

        candidate = {
            "category": normalized,
            "account_id": account.id,
            "card_name": account.name,
            "expected_return": expected_return,
            "rationale": rationale,
        }
        if best is None or candidate["expected_return"] > best["expected_return"]:
            best = candidate

    return best
