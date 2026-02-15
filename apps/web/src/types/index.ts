export type Account = {
  id: number;
  name: string;
  account_type: string;
  currency: string;
  current_balance: number;
  is_active: boolean;
};

export type Card = {
  id: number;
  account_id: number;
  issuer_name: string;
  apr: number | null;
  statement_day: number;
  due_day: number;
  min_payment_due: number;
};

export type DashboardSummary = {
  total_cash: number;
  total_investments: number;
  total_card_debt: number;
  upcoming_due_count: number;
};

export type DueDateItem = {
  card_account_id: number;
  card_name: string;
  due_date: string;
  min_payment_due: number;
  days_remaining: number;
};

export type Recommendation = {
  category: string;
  account_id: number;
  card_name: string;
  expected_return: number;
  rationale: string;
};
