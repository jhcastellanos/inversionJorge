CREATE TABLE IF NOT EXISTS platform_academy_modules (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academy_modules_sort ON platform_academy_modules (sort_order, is_published);

CREATE TABLE IF NOT EXISTS platform_academy_lessons (
  id SERIAL PRIMARY KEY,
  module_id INT NOT NULL REFERENCES platform_academy_modules(id) ON DELETE CASCADE,
  lesson_code VARCHAR(32) NOT NULL DEFAULT '1.1',
  title VARCHAR(255) NOT NULL,
  lesson_type VARCHAR(16) NOT NULL CHECK (lesson_type IN ('video', 'pdf', 'link')),
  file_url TEXT,
  duration_label VARCHAR(32),
  file_size_bytes BIGINT,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academy_lessons_module ON platform_academy_lessons (module_id, sort_order);

ALTER TABLE platform_calendar_events
  ADD COLUMN IF NOT EXISTS event_tier VARCHAR(32) DEFAULT 'clase_retrospectiva';

UPDATE platform_calendar_events SET event_tier = 'clase_retrospectiva'
  WHERE event_tier IS NULL OR event_tier = '';

UPDATE platform_calendar_events SET event_tier = 'operativa_trading'
  WHERE event_tier = 'clase_retrospectiva' AND event_level = 'medio';

UPDATE platform_calendar_events SET event_tier = 'avanzado'
  WHERE event_level = 'avanzado';
