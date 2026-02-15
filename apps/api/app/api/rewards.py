from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.reward import RewardRule
from app.schemas.reward import RecommendationRead, RewardRuleCreate
from app.services.recommendation import get_best_card_for_category

router = APIRouter(prefix="", tags=["rewards"])


@router.post("/rewards/rules")
def create_reward_rule(payload: RewardRuleCreate, db: Session = Depends(get_db)):
    rule = RewardRule(**payload.model_dump(), category=payload.category.strip().lower())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return {"id": rule.id, "message": "rule_created"}


@router.get("/recommendations/best-card", response_model=RecommendationRead)
def best_card(
    category: str = Query(..., min_length=2),
    amount: float = Query(default=100.0, gt=0),
    db: Session = Depends(get_db),
):
    recommendation = get_best_card_for_category(db, category=category, amount=amount)
    if not recommendation:
        raise HTTPException(status_code=404, detail="No reward rules found for this category")
    return recommendation
