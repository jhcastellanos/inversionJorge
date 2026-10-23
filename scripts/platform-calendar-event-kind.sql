ALTER TABLE platform_calendar_events
  ADD COLUMN IF NOT EXISTS event_kind VARCHAR(32) NOT NULL DEFAULT 'clase_en_vivo'
  CHECK (event_kind IN ('clase_en_vivo', 'operativa_en_vivo'));
