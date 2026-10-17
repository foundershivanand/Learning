import { createClient } from '@libsql/client';
import { ALL_SKILLS } from '../skills/index';

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://learning-sh15aa.aws-ap-south-1.turso.io';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTIyMjg2ODUsImlkIjoiMDFhMTQ5MjctMWYwMS03NjMyLTgwMmMtMjMzM2RiZjE2MzY5Iiwia2lkIjoiWF9DMjR2aUQyM3BtWUR2U2MzWUh5RjdIVkc5dW5qb01rVFV5Z3ItaGZtWSIsInJpZCI6ImUzOGQyYjYzLWUyNzQtNGJhYi05M2FkLWFiOWYzYWI0MzhiYSJ9.Qc3rDENAVJpMN-vzGk0Au0XGsejKjJXYJ47uiQIfxRE-6ISTzn4hrf-7sMMSEnz-CDBb7AHnAmGnUqC9cSF3Cg';

export async function runMigration() {
  console.log('Connecting to Turso Database:', TURSO_URL);
  const client = createClient({
    url: TURSO_URL,
    authToken: TURSO_AUTH_TOKEN,
  });

  console.log('Creating tables in Turso (SQLite/libSQL schema)...');

  // 1. Profile Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS profile (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT 'User',
      goals TEXT NOT NULL, -- JSON array
      rules TEXT NOT NULL, -- JSON array
      daily_target_minutes INTEGER NOT NULL DEFAULT 25,
      timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 2. Skills Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );
  `);

  // 3. Skill Dimensions Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS skill_dimensions (
      id TEXT PRIMARY KEY,
      skill_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      weight REAL NOT NULL DEFAULT 1.0,
      rubric_criteria TEXT NOT NULL DEFAULT '{}'
    );
  `);

  // 4. Skill State Table (Level, sublevel, score, passes)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS skill_state (
      dimension_id TEXT PRIMARY KEY,
      skill_id TEXT NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      sublevel INTEGER NOT NULL DEFAULT 1,
      score REAL NOT NULL DEFAULT 50.0,
      confidence REAL NOT NULL DEFAULT 0.20,
      trend TEXT NOT NULL DEFAULT 'STABLE',
      recent_scores TEXT NOT NULL DEFAULT '[]',
      consecutive_passes INTEGER NOT NULL DEFAULT 0,
      last_assessed_at TEXT,
      updated_at TEXT NOT NULL
    );
  `);

  // 5. Weaknesses Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS weaknesses (
      id TEXT PRIMARY KEY,
      skill_id TEXT NOT NULL,
      dimension_id TEXT NOT NULL,
      dimension_name TEXT NOT NULL,
      description TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'LOW',
      status TEXT NOT NULL DEFAULT 'POTENTIAL',
      confidence REAL NOT NULL DEFAULT 0.5,
      occurrence_count INTEGER NOT NULL DEFAULT 1,
      consecutive_passes INTEGER NOT NULL DEFAULT 0,
      first_detected_at TEXT NOT NULL,
      last_detected_at TEXT NOT NULL,
      recent_evidence TEXT NOT NULL DEFAULT '[]'
    );
  `);

  // 6. Training Debt Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS training_debt (
      id TEXT PRIMARY KEY,
      dimension_id TEXT,
      points INTEGER NOT NULL,
      reason TEXT NOT NULL,
      description TEXT NOT NULL,
      target_weakness_id TEXT,
      created_at TEXT NOT NULL,
      resolved_at TEXT
    );
  `);

  // 7. Gamification Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS gamification (
      id TEXT PRIMARY KEY,
      total_xp INTEGER NOT NULL DEFAULT 0,
      current_streak_days INTEGER NOT NULL DEFAULT 0,
      longest_streak_days INTEGER NOT NULL DEFAULT 0,
      last_active_date TEXT,
      combo_multiplier REAL NOT NULL DEFAULT 1.0,
      boss_clears_count INTEGER NOT NULL DEFAULT 0,
      unlocked_tiers TEXT NOT NULL DEFAULT '["TIER_1"]',
      updated_at TEXT NOT NULL
    );
  `);

  // 8. Challenges Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      skill_id TEXT NOT NULL,
      dimension_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      instructions TEXT NOT NULL,
      adversary_context TEXT,
      constraints TEXT NOT NULL DEFAULT '[]',
      time_limit_seconds INTEGER NOT NULL DEFAULT 60,
      difficulty INTEGER NOT NULL DEFAULT 50,
      rubric TEXT NOT NULL DEFAULT '[]',
      is_boss_challenge INTEGER NOT NULL DEFAULT 0,
      target_weakness_id TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 9. Daily Plans Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS daily_plans (
      plan_date TEXT PRIMARY KEY,
      id TEXT NOT NULL,
      target_minutes INTEGER NOT NULL DEFAULT 25,
      focus_skill_id TEXT NOT NULL,
      priority_weakness_id TEXT,
      challenge_ids TEXT NOT NULL DEFAULT '[]',
      completed_challenge_ids TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'PENDING',
      overall_score REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 10. Attempts Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      response_text TEXT,
      media_url TEXT,
      media_type TEXT,
      evaluation_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  console.log('All 10 tables verified in Turso!');

  // Seed Profile if empty
  const profileCheck = await client.execute('SELECT COUNT(*) as count FROM profile');
  const profileCount = Number(profileCheck.rows[0]?.count || 0);

  const now = new Date().toISOString();

  if (profileCount === 0) {
    console.log('Seeding initial baseline profile in Turso...');
    await client.execute({
      sql: `INSERT INTO profile (id, name, goals, rules, daily_target_minutes, timezone, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        '00000000-0000-0000-0000-000000000001',
        'Shivanand',
        JSON.stringify([
          'Master High-Stakes Communication & Articulation',
          'Master Entrepreneurial Business Execution',
          'Reach 1800 Chess & Blindfold Visualization',
        ]),
        JSON.stringify([
          'Never give empty praise',
          'Make me fail',
          'Enforce training debt immediately',
        ]),
        25,
        'Asia/Kolkata',
        now,
        now,
      ],
    });
  }

  // Seed Gamification if empty
  const gamCheck = await client.execute('SELECT COUNT(*) as count FROM gamification');
  const gamCount = Number(gamCheck.rows[0]?.count || 0);
  if (gamCount === 0) {
    console.log('Seeding baseline gamification state in Turso...');
    await client.execute({
      sql: `INSERT INTO gamification (id, total_xp, current_streak_days, longest_streak_days, last_active_date, combo_multiplier, boss_clears_count, unlocked_tiers, updated_at)
            VALUES (?, 0, 0, 0, NULL, 1.0, 0, '["TIER_1"]', ?)`,
      args: ['main', now],
    });
  }

  // Seed all 16 skills & baseline dimensions
  console.log('Upserting 16 skills and baseline dimension states in Turso...');
  for (const skill of ALL_SKILLS) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO skills (id, name, description, category, active, created_at)
            VALUES (?, ?, ?, ?, 1, ?)`,
      args: [skill.id, skill.name, skill.description, skill.category, now],
    });

    for (const dim of skill.dimensions) {
      await client.execute({
        sql: `INSERT OR REPLACE INTO skill_dimensions (id, skill_id, name, description, weight, rubric_criteria)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [dim.id, skill.id, dim.name, dim.description, dim.weight, JSON.stringify(dim.rubricCriteria || {})],
      });

      // Insert baseline skill_state if not exists
      const stateCheck = await client.execute({
        sql: 'SELECT dimension_id FROM skill_state WHERE dimension_id = ?',
        args: [dim.id],
      });
      if (stateCheck.rows.length === 0) {
        await client.execute({
          sql: `INSERT INTO skill_state (dimension_id, skill_id, level, sublevel, score, confidence, trend, recent_scores, consecutive_passes, last_assessed_at, updated_at)
                VALUES (?, ?, 1, 1, 50.0, 0.20, 'STABLE', '[]', 0, NULL, ?)`,
          args: [dim.id, skill.id, now],
        });
      }
    }
  }

  console.log('Turso Database Migration and Baseline Seed Completed Successfully!');
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
