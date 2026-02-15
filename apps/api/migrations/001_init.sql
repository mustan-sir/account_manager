CREATE TABLE IF NOT EXISTS institutions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) UNIQUE NOT NULL,
  institution_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  institution_id INT REFERENCES institutions(id),
  name VARCHAR(120) NOT NULL,
  account_type VARCHAR(50) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'USD',
  current_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_card_details (
  id SERIAL PRIMARY KEY,
  account_id INT UNIQUE NOT NULL REFERENCES accounts(id),
  issuer_name VARCHAR(120) NOT NULL,
  apr NUMERIC(6,3),
  statement_day INT NOT NULL DEFAULT 1,
  due_day INT NOT NULL DEFAULT 20,
  due_date_override DATE,
  min_payment_due NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS balance_snapshots (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(id),
  snapshot_date DATE NOT NULL,
  balance NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(id),
  transaction_date DATE NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  category VARCHAR(80),
  merchant VARCHAR(120),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reward_programs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) UNIQUE NOT NULL,
  points_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  transfer_partners TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reward_rules (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(id),
  category VARCHAR(80) NOT NULL,
  multiplier NUMERIC(8,3) NOT NULL DEFAULT 1,
  point_currency VARCHAR(40) NOT NULL DEFAULT 'points',
  cap_description VARCHAR(255),
  exclusions VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(id),
  title VARCHAR(255) NOT NULL,
  merchant VARCHAR(120),
  category VARCHAR(80),
  bonus_multiplier NUMERIC(8,3) NOT NULL DEFAULT 0,
  valid_until VARCHAR(40),
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recommendations (
  id SERIAL PRIMARY KEY,
  category VARCHAR(80) NOT NULL,
  account_id INT NOT NULL REFERENCES accounts(id),
  expected_return NUMERIC(10,2) NOT NULL DEFAULT 0,
  rationale VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS import_jobs (
  id SERIAL PRIMARY KEY,
  source_name VARCHAR(120) NOT NULL,
  import_type VARCHAR(60) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
