import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TursoMentorStore } from './turso-store';

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://learning-sh15aa.aws-ap-south-1.turso.io';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

describe('Turso Database Store Integration', () => {
  it('connects to Turso and loads profile and skills overview', async () => {
    if (!TURSO_AUTH_TOKEN) {
      console.warn('Skipping Turso network integration test: TURSO_AUTH_TOKEN not set in environment');
      return;
    }
    const store = new TursoMentorStore(TURSO_URL, TURSO_AUTH_TOKEN);
    const profile = await store.getProfile();
    assert.ok(profile);
    assert.strictEqual(profile.name, 'Shivanand');

    const skills = await store.getSkillsOverview();
    assert.strictEqual(skills.length, 16);
    assert.strictEqual(skills[0].overallLevel, 1);
    assert.strictEqual(skills[0].overallSublevel, 1);

    const gamification = await store.getGamification();
    assert.ok(gamification);
    assert.strictEqual(typeof gamification.totalXp, 'number');

    const recentAttempts = await store.getRecentAttempts(5);
    assert.ok(Array.isArray(recentAttempts));
    assert.ok(recentAttempts.length > 0, 'Expected to find logged attempts in Turso');
    assert.ok(recentAttempts[0].id);
    assert.ok(recentAttempts[0].evaluation);
  });
});
