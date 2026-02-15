CREATE TABLE IF NOT EXISTS plaid_items (
  id SERIAL PRIMARY KEY,
  item_id VARCHAR(64) UNIQUE NOT NULL,
  institution_id INT REFERENCES institutions(id),
  institution_name VARCHAR(120) NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plaid_items_item_id ON plaid_items(item_id);
