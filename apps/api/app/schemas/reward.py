from pydantic import BaseModel


class RewardRuleCreate(BaseModel):
    account_id: int
    category: str
    multiplier: float = 1.0
    point_currency: str = "points"
    cap_description: str | None = None
    exclusions: str | None = None


class RecommendationRead(BaseModel):
    category: str
    account_id: int
    card_name: str
    expected_return: float
    rationale: str


class RecommendationQuery(BaseModel):
    category: str
    amount: float = 100.0
