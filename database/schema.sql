-- ====================================================================
-- PERSONAL AI MENTOR OS - SUPABASE POSTGRESQL SCHEMA (V1)
-- Designed for single-user extreme performance & deterministic math
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profile Table (Single private user)
CREATE TABLE IF NOT EXISTS profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'User',
    goals TEXT[] NOT NULL DEFAULT ARRAY['Master Communication', 'Scale Entrepreneurial Ventures', 'Reach 1800 Chess & Blindfold'],
    rules TEXT[] NOT NULL DEFAULT ARRAY['Never give empty praise', 'Enforce training debt immediately', 'Make me fail'],
    daily_target_minutes INT NOT NULL DEFAULT 30,
    auth_secret_hash TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Skill Dimensions Table
CREATE TABLE IF NOT EXISTS skill_dimensions (
    id TEXT PRIMARY KEY,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    weight NUMERIC(3,2) NOT NULL DEFAULT 1.00,
    rubric_criteria JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 4. Skill State Table (Continuous level & score tracking)
CREATE TABLE IF NOT EXISTS skill_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    dimension_id TEXT NOT NULL REFERENCES skill_dimensions(id) ON DELETE CASCADE,
    level INT NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 10),
    sublevel INT NOT NULL DEFAULT 1 CHECK (sublevel BETWEEN 1 AND 10),
    score NUMERIC(5,2) NOT NULL DEFAULT 50.00 CHECK (score BETWEEN 0.00 AND 100.00),
    confidence NUMERIC(3,2) NOT NULL DEFAULT 0.50 CHECK (confidence BETWEEN 0.00 AND 1.00),
    trend TEXT NOT NULL DEFAULT 'STABLE' CHECK (trend IN ('IMPROVING', 'STABLE', 'DECLINING')),
    recent_scores NUMERIC(5,2)[] DEFAULT ARRAY[]::NUMERIC(5,2)[],
    consecutive_passes INT NOT NULL DEFAULT 0,
    last_assessed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(dimension_id)
);

-- 5. Challenges Table
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    dimension_id TEXT NOT NULL REFERENCES skill_dimensions(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    instructions TEXT NOT NULL,
    adversary_context TEXT,
    constraints TEXT[] DEFAULT ARRAY[]::TEXT[],
    time_limit_seconds INT NOT NULL DEFAULT 90,
    difficulty INT NOT NULL DEFAULT 50 CHECK (difficulty BETWEEN 1 AND 100),
    rubric JSONB NOT NULL,
    is_boss_challenge BOOLEAN DEFAULT FALSE,
    target_weakness_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Daily Plans Table
CREATE TABLE IF NOT EXISTS daily_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_date DATE UNIQUE NOT NULL,
    target_minutes INT NOT NULL DEFAULT 30,
    focus_skill_id TEXT NOT NULL REFERENCES skills(id),
    priority_weakness_id UUID,
    challenge_ids UUID[] DEFAULT ARRAY[]::UUID[],
    completed_challenge_ids UUID[] DEFAULT ARRAY[]::UUID[],
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED')),
    overall_score NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Attempts Table
CREATE TABLE IF NOT EXISTS attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    daily_plan_id UUID REFERENCES daily_plans(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    response_text TEXT,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('audio', 'video', 'text')),
    metrics JSONB, -- speech metrics: wpm, filler words, pauses
    score NUMERIC(5,2) CHECK (score BETWEEN 0.00 AND 100.00),
    passed BOOLEAN,
    feedback_brutal TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Granular Dimension Evaluations Table
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    dimension_id TEXT NOT NULL REFERENCES skill_dimensions(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,
    passed BOOLEAN NOT NULL,
    evidence_quotes TEXT[] DEFAULT ARRAY[]::TEXT[],
    identified_mistakes TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Weaknesses Table
CREATE TABLE IF NOT EXISTS weaknesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    dimension_id TEXT NOT NULL REFERENCES skill_dimensions(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    confidence NUMERIC(3,2) NOT NULL DEFAULT 0.50,
    occurrence_count INT NOT NULL DEFAULT 1,
    consecutive_passes INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('POTENTIAL', 'ACTIVE', 'DRILLING', 'RESOLVED')),
    first_detected_at TIMESTAMPTZ DEFAULT NOW(),
    last_detected_at TIMESTAMPTZ DEFAULT NOW(),
    recent_evidence TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- 10. Training Debt Table
CREATE TABLE IF NOT EXISTS training_debt (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weakness_id UUID REFERENCES weaknesses(id) ON DELETE SET NULL,
    dimension_id TEXT REFERENCES skill_dimensions(id) ON DELETE SET NULL,
    points INT NOT NULL CHECK (points > 0),
    reason TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 11. Gamification Table
CREATE TABLE IF NOT EXISTS gamification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_xp INT NOT NULL DEFAULT 0,
    current_streak_days INT NOT NULL DEFAULT 0,
    longest_streak_days INT NOT NULL DEFAULT 0,
    last_active_date DATE,
    combo_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00,
    boss_clears_count INT NOT NULL DEFAULT 0,
    unlocked_tiers TEXT[] DEFAULT ARRAY['TIER_1']::TEXT[],
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    xp_reward INT NOT NULL DEFAULT 100,
    category TEXT NOT NULL,
    condition_type TEXT NOT NULL,
    condition_value INT NOT NULL,
    unlocked_at TIMESTAMPTZ
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_skill_state_dimension ON skill_state(dimension_id);
CREATE INDEX IF NOT EXISTS idx_skill_state_skill ON skill_state(skill_id);
CREATE INDEX IF NOT EXISTS idx_weaknesses_status ON weaknesses(status);
CREATE INDEX IF NOT EXISTS idx_training_debt_resolved ON training_debt(resolved_at);
CREATE INDEX IF NOT EXISTS idx_attempts_challenge ON attempts(challenge_id);
CREATE INDEX IF NOT EXISTS idx_daily_plans_date ON daily_plans(plan_date);
