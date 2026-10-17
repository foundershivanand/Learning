import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TursoMentorStore } from './turso-store';

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://reusable-sh15a.aws-ap-south-1.turso.io';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODk4ODMzNDUsImlkIjoiMDFhMGJkNTUtNjYwMS03NDBkLWE0MWUtNWRhYzI5MTQ3Yjg4Iiwia2lkIjoiUEJVVXJDMUljTkFQVmc5WEwyNWlsa1Z1amVTUlFNM0Nqb202b0VvSHpNbyIsInJpZCI6ImNkZGFlYjNkLTY1ODctNDc0Mi04MGJiLWI0YjE2MmQ4NDE1MyJ9.PhzdD9vGWLNwwyS-ZH2VYP6Xh29OIvBXSDH6P_bfPID74DkcN_Gg1Zw_MN9DqWr5JgNcDN3hV26sZbnh7_APDw';

describe('Turso Database Store Integration', () => {
  it('connects to Turso and loads profile and skills overview', async () => {
    const store = new TursoMentorStore(TURSO_URL, TURSO_AUTH_TOKEN);
    const profile = await store.getProfile();
    assert.ok(profile);
    assert.strictEqual(profile.name, 'Shivanand');

    const skills = await store.getSkillsOverview();
    assert.strictEqual(skills.length, 15);
    assert.strictEqual(skills[0].overallLevel, 1);
    assert.strictEqual(skills[0].overallSublevel, 1);

    const gamification = await store.getGamification();
    assert.ok(gamification);
    assert.strictEqual(typeof gamification.totalXp, 'number');
  });
});
