import { describe, it } from 'node:test';
import assert from 'node:assert';
import worker from './index.js';

describe('mentor-api Cloudflare Worker Endpoints', () => {
  it('GET /api/health returns online status', async () => {
    const req = new Request('http://localhost/api/health', { method: 'GET' });
    const res = await worker.fetch(req, {}, {});
    assert.strictEqual(res.status, 200);

    const body = await res.json() as any;
    assert.strictEqual(body.status, 'online');
    assert.strictEqual(body.service, 'mentor-api');
  });

  it('GET /api/today returns profile, daily plan, debt, and skills', async () => {
    const req = new Request('http://localhost/api/today', { method: 'GET' });
    const res = await worker.fetch(req, {}, {});
    assert.strictEqual(res.status, 200);

    const body = await res.json() as any;
    assert.ok(body.profile);
    assert.ok(body.dailyPlan);
    assert.ok(body.trainingDebt);
    assert.ok(body.skillsOverview.length >= 15, `Expected 15 skills, got ${body.skillsOverview.length}`);
  });

  it('GET /api/challenge/next returns a targeted challenge', async () => {
    const req = new Request('http://localhost/api/challenge/next', { method: 'GET' });
    const res = await worker.fetch(req, {}, {});
    assert.strictEqual(res.status, 200);

    const challenge = await res.json() as any;
    assert.ok(challenge.id);
    assert.ok(challenge.title);
    assert.ok(challenge.difficulty);
    assert.ok(challenge.constraints.length > 0);
  });

  it('POST /api/challenge/submit evaluates attempt and updates state', async () => {
    // 1. Get next challenge
    const nextReq = new Request('http://localhost/api/challenge/next', { method: 'GET' });
    const nextRes = await worker.fetch(nextReq, {}, {});
    const challenge = await nextRes.json() as any;

    // 2. Submit attempt with response text
    const submitReq = new Request('http://localhost/api/challenge/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challengeId: challenge.id,
        responseText: 'The core reason is that opportunity cost dictates every dollar allocated to legacy maintenance is a dollar stolen from our high-growth distribution channel.',
        audioDurationSeconds: 15,
      }),
    });

    const submitRes = await worker.fetch(submitReq, {}, {});
    assert.strictEqual(submitRes.status, 200);

    const data = await submitRes.json() as any;
    assert.ok(data.attempt);
    assert.ok(data.evaluation);
    assert.ok(data.evaluation.overallScore >= 0);
    assert.ok(data.evaluation.brutalCritique);
    assert.ok(data.progressionUpdate);
    assert.ok(data.gamificationUpdate.xpEarned > 0);
  });

  it('POST /api/telegram/webhook responds to commands', async () => {
    const tgReq = new Request('http://localhost/api/telegram/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        update_id: 123456,
        message: {
          message_id: 1,
          from: { id: 999, first_name: 'Founder' },
          chat: { id: 999, type: 'private' },
          date: Date.now(),
          text: '/today',
        },
      }),
    });

    const tgRes = await worker.fetch(tgReq, {}, {});
    assert.strictEqual(tgRes.status, 200);
    const tgData = await tgRes.json() as any;
    assert.strictEqual(tgData.ok, true);
    assert.ok(tgData.replyText.includes('TODAY'));
  });
});
