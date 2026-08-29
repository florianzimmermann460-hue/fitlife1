CREATE TABLE IF NOT EXISTS health_daily (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  date DATE NOT NULL,
  steps INTEGER,
  active_calories NUMERIC,
  sleep_minutes INTEGER,
  weight_kg NUMERIC,
  heart_rate_avg NUMERIC,
  workouts JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);
CREATE INDEX IF NOT EXISTS health_daily_user_date_idx ON health_daily(user_id, date DESC);
