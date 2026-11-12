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
    assert.ok(body.skillsOverview.length >= 16, `Expected 16 skills, got ${body.skillsOverview.length}`);
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
    assert.strictEqual(tgData.method, 'sendMessage');
    assert.strictEqual(tgData.chat_id, 999);
    assert.ok(tgData.replyText.includes('TODAY'));

    // Test /train command
    const trainReq = new Request('http://localhost/api/telegram/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        update_id: 123457,
        message: {
          message_id: 2,
          from: { id: 999, first_name: 'Founder' },
          chat: { id: 999, type: 'private' },
          date: Date.now(),
          text: '/train',
        },
      }),
    });
    const trainRes = await worker.fetch(trainReq, {}, {});
    assert.strictEqual(trainRes.status, 200);
    const trainData = await trainRes.json() as any;
    assert.strictEqual(trainData.method, 'sendMessage');
    assert.ok(trainData.replyText.includes('NEXT PRACTICE CHALLENGE'));
  });

  it('GET /api/challenge/next?skill=spanish returns a high-stakes Spanish challenge', async () => {
    const req = new Request('http://localhost/api/challenge/next?skill=spanish', { method: 'GET' });
    const res = await worker.fetch(req, {}, {});
    assert.strictEqual(res.status, 200);

    const challenge = await res.json() as any;
    assert.strictEqual(challenge.skillId, 'spanish');
    assert.ok(challenge.title);
    assert.ok(challenge.instructions);
    assert.ok(challenge.constraints.length >= 2);
  });

  it('enforces AUTH_SECRET on protected API endpoints when configured', async () => {
    const mockEnv = { AUTH_SECRET: 'test-secret-token-123' };

    // Request without token -> 401
    const unauthReq = new Request('http://localhost/api/today', { method: 'GET' });
    const unauthRes = await worker.fetch(unauthReq, mockEnv, {});
    assert.strictEqual(unauthRes.status, 401);

    // Request with invalid token -> 401
    const badTokenReq = new Request('http://localhost/api/today', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer wrong-token' },
    });
    const badTokenRes = await worker.fetch(badTokenReq, mockEnv, {});
    assert.strictEqual(badTokenRes.status, 401);

    // Request with valid token -> 200
    const authReq = new Request('http://localhost/api/today', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer test-secret-token-123' },
    });
    const authRes = await worker.fetch(authReq, mockEnv, {});
    assert.strictEqual(authRes.status, 200);

    // /api/health remains public even when AUTH_SECRET is set
    const healthReq = new Request('http://localhost/api/health', { method: 'GET' });
    const healthRes = await worker.fetch(healthReq, mockEnv, {});
    assert.strictEqual(healthRes.status, 200);
  });

  it('enforces TELEGRAM_WEBHOOK_SECRET verification when configured', async () => {
    const mockEnv = { TELEGRAM_WEBHOOK_SECRET: 'tg-secret-123' };

    // Request without secret header -> 401
    const unauthReq = new Request('http://localhost/api/telegram/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: { text: '/today' } }),
    });
    const unauthRes = await worker.fetch(unauthReq, mockEnv, {});
    assert.strictEqual(unauthRes.status, 401);

    // Request with valid secret header -> 200
    const authReq = new Request('http://localhost/api/telegram/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Bot-Api-Secret-Token': 'tg-secret-123',
      },
      body: JSON.stringify({ message: { text: '/today' } }),
    });
    const authRes = await worker.fetch(authReq, mockEnv, {});
    assert.strictEqual(authRes.status, 200);
  });
});
