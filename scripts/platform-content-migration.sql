CREATE TABLE IF NOT EXISTS platform_classes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  section_name VARCHAR(255) NOT NULL DEFAULT 'General',
  class_level VARCHAR(16) NOT NULL CHECK (class_level IN ('basico', 'avanzado')),
  video_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_classes_level ON platform_classes (class_level, is_published);

CREATE TABLE IF NOT EXISTS platform_calendar_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  zoom_url TEXT,
  event_kind VARCHAR(32) NOT NULL DEFAULT 'clase_en_vivo'
    CHECK (event_kind IN ('clase_en_vivo', 'operativa_en_vivo')),
  event_level VARCHAR(16) NOT NULL CHECK (event_level IN ('basico', 'medio', 'avanzado')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_events_level ON platform_calendar_events (event_level, starts_at);
