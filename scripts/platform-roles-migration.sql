ALTER TABLE platform_users
  ADD COLUMN IF NOT EXISTS platform_role VARCHAR(32);

CREATE INDEX IF NOT EXISTS idx_platform_users_role ON platform_users (platform_role);
