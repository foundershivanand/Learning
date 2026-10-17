import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TursoMentorStore } from './turso-store';

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://learning-sh15aa.aws-ap-south-1.turso.io';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTIyMjg2ODUsImlkIjoiMDFhMTQ5MjctMWYwMS03NjMyLTgwMmMtMjMzM2RiZjE2MzY5Iiwia2lkIjoiWF9DMjR2aUQyM3BtWUR2U2MzWUh5RjdIVkc5dW5qb01rVFV5Z3ItaGZtWSIsInJpZCI6ImUzOGQyYjYzLWUyNzQtNGJhYi05M2FkLWFiOWYzYWI0MzhiYSJ9.Qc3rDENAVJpMN-vzGk0Au0XGsejKjJXYJ47uiQIfxRE-6ISTzn4hrf-7sMMSEnz-CDBb7AHnAmGnUqC9cSF3Cg';

describe('Turso Database Store Integration', () => {
  it('connects to Turso and loads profile and skills overview', async () => {
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
