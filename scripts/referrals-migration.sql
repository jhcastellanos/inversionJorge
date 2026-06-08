-- Referral system tables for Inversión Real

CREATE TABLE IF NOT EXISTS referral_traders (
  id SERIAL PRIMARY KEY,
  alias VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  referral_code VARCHAR(32) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_traders_email ON referral_traders(email);
CREATE INDEX IF NOT EXISTS idx_referral_traders_code ON referral_traders(referral_code);

CREATE TABLE IF NOT EXISTS referral_conversions (
  id SERIAL PRIMARY KEY,
  referral_trader_id INTEGER NOT NULL REFERENCES referral_traders(id) ON DELETE RESTRICT,
  referral_code VARCHAR(32) NOT NULL,
  referred_name VARCHAR(255),
  referred_email VARCHAR(255) NOT NULL,
  membership_type VARCHAR(255) NOT NULL,
  commission_amount NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
  stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
  completed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_conversions_trader ON referral_conversions(referral_trader_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_email ON referral_conversions(referred_email);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_completed ON referral_conversions(completed_at DESC);
