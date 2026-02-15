INSERT INTO accounts (name, account_type, currency, current_balance)
VALUES
  ('Primary Checking', 'checking', 'USD', 4200.00),
  ('Brokerage Portfolio', 'investment', 'USD', 27500.00),
  ('Travel Rewards Card', 'credit_card', 'USD', -1250.00)
ON CONFLICT DO NOTHING;

INSERT INTO credit_card_details (account_id, issuer_name, apr, statement_day, due_day, min_payment_due)
SELECT a.id, 'Chase', 22.990, 1, 20, 45.00
FROM accounts a
WHERE a.name = 'Travel Rewards Card'
ON CONFLICT DO NOTHING;

INSERT INTO reward_rules (account_id, category, multiplier, point_currency)
SELECT a.id, 'travel', 3.0, 'points'
FROM accounts a
WHERE a.name = 'Travel Rewards Card'
ON CONFLICT DO NOTHING;
