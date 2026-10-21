ALTER TABLE platform_calendar_events
  ADD COLUMN IF NOT EXISTS zoom_url TEXT;
