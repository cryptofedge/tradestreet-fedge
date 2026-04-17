-- ============================================
-- FEDGE 2.O — Database Schema
-- apps/api/src/db/schema.sql
-- ============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS
-- ============================================

CREATE TYPE user_tier AS ENUM ('free', 'pro');
CREATE TYPE brokerage_platform AS ENUM ('alpaca', 'robinhood', 'webull', 'schwab', 'ibkr', 'coinbase', 'kraken');

CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email               VARCHAR(255) UNIQUE NOT NULL,
  password_hash       VARCHAR(255) NOT NULL,
  tier                user_tier NOT NULL DEFAULT 'free',
  platform            brokerage_platform,
  platform_connected  BOOLEAN NOT NULL DEFAULT FALSE,
  platform_token_enc  TEXT,                           -- AES-256 encrypted brokerage OAuth token
  xp                  INTEGER NOT NULL DEFAULT 0,
  level               INTEGER NOT NULL DEFAULT 1,
  streak_days         INTEGER NOT NULL DEFAULT 0,
  last_active_date    DATE,
  revenuecat_user_id  VARCHAR(255),
  expo_push_token     TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tier ON users(tier);

-- ============================================
-- BADGES
-- ============================================

CREATE TABLE user_badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id    VARCHAR(50) NOT NULL,
  awarded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ============================================
-- SIGNALS
-- ============================================

CREATE TYPE signal_action AS ENUM ('BUY', 'SELL', 'HOLD', 'WATCH');
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE asset_class AS ENUM ('stocks', 'crypto', 'etf', 'options');

CREATE TABLE signals (
  id              VARCHAR(50) PRIMARY KEY,    -- sig_{ulid}
  ticker          VARCHAR(20) NOT NULL,
  asset_class     asset_class NOT NULL,
  action          signal_action NOT NULL,
  confidence      DECIMAL(4,3) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  risk_level      risk_level NOT NULL,
  reasoning       TEXT NOT NULL,
  entry_low       DECIMAL(12,4),
  entry_high      DECIMAL(12,4),
  stop_loss       DECIMAL(12,4),
  target_price    DECIMAL(12,4),
  tier_required   user_tier NOT NULL DEFAULT 'free',
  expires_at      TIMESTAMPTZ NOT NULL,
  generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_signals_ticker ON signals(ticker);
CREATE INDEX idx_signals_expires_at ON signals(expires_at);

CREATE TABLE user_signal_views (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signal_id   VARCHAR(50) NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed    BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (user_id, signal_id)
);

-- ============================================
-- MISSIONS
-- ============================================

CREATE TYPE mission_type AS ENUM ('HOLD', 'TRADE', 'RESEARCH', 'DIVERSIFY', 'LEARN');
CREATE TYPE mission_status AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED');

CREATE TABLE missions (
  id              VARCHAR(50) PRIMARY KEY,    -- msn_{ulid}
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            mission_type NOT NULL,
  title           VARCHAR(100) NOT NULL,
  description     TEXT NOT NULL,
  xp_reward       INTEGER NOT NULL,
  status          mission_status NOT NULL DEFAULT 'ACTIVE',
  progress        INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  expires_at      TIMESTAMPTZ NOT NULL,
  completed_at    TIMESTAMPTZ,
  generated_by    VARCHAR(50) NOT NULL DEFAULT 'FEDGE Brain v2',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_missions_user_id ON missions(user_id);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_date ON missions(created_at::DATE);

-- ============================================
-- SQUADS
-- ============================================

CREATE TABLE squads (
  id              VARCHAR(50) PRIMARY KEY,    -- sqd_{ulid}
  name            VARCHAR(50) NOT NULL,
  invite_code     VARCHAR(8) UNIQUE NOT NULL,
  created_by      UUID NOT NULL REFERENCES users(id),
  max_members     INTEGER NOT NULL DEFAULT 5 CHECK (max_members BETWEEN 2 AND 6),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE squad_members (
  squad_id        VARCHAR(50) NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (squad_id, user_id)
);

-- ============================================
-- ORDERS (local audit log — source of truth is brokerage)
-- ============================================

CREATE TYPE order_side AS ENUM ('buy', 'sell');

CREATE TABLE orders (
  id                      VARCHAR(100) PRIMARY KEY, -- brokerage order ID
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol                  VARCHAR(20) NOT NULL,
  side                    order_side NOT NULL,
  qty                     DECIMAL(12,6) NOT NULL,
  filled_qty              DECIMAL(12,6) NOT NULL DEFAULT 0,
  filled_avg_price        DECIMAL(12,4),
  order_value             DECIMAL(14,2),
  status                  VARCHAR(30) NOT NULL,
  platform                brokerage_platform NOT NULL,
  fedge_signal_id         VARCHAR(50) REFERENCES signals(id),
  fedge_post_trade_comment TEXT,
  submitted_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  filled_at               TIMESTAMPTZ
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_symbol ON orders(symbol);

-- ============================================
-- XP LEDGER
-- ============================================

CREATE TABLE xp_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  reason      VARCHAR(100) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_xp_events_user_id ON xp_events(user_id);

-- ============================================
-- ADVISOR SESSIONS
-- ============================================

CREATE TABLE advisor_sessions (
  id          VARCHAR(50) PRIMARY KEY,    -- sess_{ulid}
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE advisor_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  VARCHAR(50) NOT NULL REFERENCES advisor_sessions(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  tokens_used INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_advisor_messages_session ON advisor_messages(session_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER advisor_sessions_updated_at BEFORE UPDATE ON advisor_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-level-up on XP change
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
DECLARE
  new_level INTEGER;
BEGIN
  -- Level formula: level = floor(sqrt(xp / 100)) + 1
  new_level := FLOOR(SQRT(NEW.xp::FLOAT / 100)) + 1;
  IF new_level != OLD.level THEN
    NEW.level := new_level;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_level_up BEFORE UPDATE OF xp ON users
  FOR EACH ROW EXECUTE FUNCTION update_user_level();
