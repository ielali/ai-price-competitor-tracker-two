-- 001_init.sql: Core schema for AI Competitor Price Tracker

-- Enable TimescaleDB extension if available
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(100),
  our_price NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Competitors table
CREATE TABLE IF NOT EXISTS competitors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  website VARCHAR(500) NOT NULL,
  scrape_interval_minutes INTEGER NOT NULL DEFAULT 360,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Competitor prices (time-series)
CREATE TABLE IF NOT EXISTS competitor_prices (
  id SERIAL,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  competitor_id INTEGER NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  price NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, scraped_at)
);

-- Convert to hypertable for time-series queries (TimescaleDB)
SELECT create_hypertable('competitor_prices', 'scraped_at', if_not_exists => TRUE);

-- Alert rules table
CREATE TABLE IF NOT EXISTS alert_rules (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  rule_type VARCHAR(50) NOT NULL,
  threshold NUMERIC(12, 2),
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alert history table
CREATE TABLE IF NOT EXISTS alert_history (
  id SERIAL PRIMARY KEY,
  alert_rule_id INTEGER REFERENCES alert_rules(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scrape jobs table
CREATE TABLE IF NOT EXISTS scrape_jobs (
  id SERIAL PRIMARY KEY,
  competitor_id INTEGER REFERENCES competitors(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  prices_collected INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_competitor_prices_product ON competitor_prices (product_id, scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_prices_competitor ON competitor_prices (competitor_id, scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_status ON scrape_jobs (status);
CREATE INDEX IF NOT EXISTS idx_alert_history_product ON alert_history (product_id, triggered_at DESC);
