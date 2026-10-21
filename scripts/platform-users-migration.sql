-- Usuarios de la plataforma (miembros / CRM)
CREATE TABLE IF NOT EXISTS platform_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  google_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_users_email ON platform_users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_platform_users_stripe ON platform_users (stripe_customer_id);
