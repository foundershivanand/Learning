import { 
  TodayDashboardResponse, 
  SubmitAttemptRequest, 
  SubmitAttemptResponse,
  TelegramWebhookPayload,
  Challenge,
  Attempt,
  AttemptWithChallenge
} from '@personal-mentor/shared';
import { 
  AssessmentEngine, 
  ProgressionEngine, 
  WeaknessEngine, 
  TrainingDebtEngine, 
  ChallengeEngine, 
  GamificationEngine,
  RealityModeEngine,
  RawAssessmentResult
} from '@personal-mentor/core';
import { AIRouter } from '@personal-mentor/ai-router';
import { globalStore } from './store.js';
import { TursoMentorStore } from './turso-store.js';
import { renderDashboardHtml } from './ui.js';

export interface Env {
  AI?: any;
  TELEGRAM_BOT_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  GROQ_API_KEY?: string;
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

export function formatDrillHistoryContext(attempts: AttemptWithChallenge[]): string {
  if (!attempts || attempts.length === 0) {
    return 'Zero historical drill attempts recorded. The user has not completed any practice challenges yet.';
  }

  return attempts.map((att, idx) => {
    const ch = att.challenge;
    const ev = att.evaluation;
    const title = ch?.title || `Challenge ${att.challengeId}`;
    const skill = ch ? `${ch.skillId} (${ch.dimensionId})` : 'Skill drill';
    const date = att.completedAt || att.startedAt || 'Recent';
    const score = ev ? `${ev.overallScore}/100 (${ev.passed ? 'PASSED' : 'FAILED'})` : 'Unevaluated';
    const resp = att.responseText ? `"${att.responseText}"` : '[No transcript or response recorded]';
    const weakness = ev?.brutalCritique?.singleBiggestWeakness || 'None recorded';
    const mistakes = ev?.dimensionScores?.flatMap(d => d.identifiedMistakes || []) || [];
    const metrics = ev?.metrics 
      ? `Duration: ${ev.metrics.durationSeconds}s, Word Count: ${ev.metrics.wordCount}, WPM: ${ev.metrics.wordsPerMinute}, Filler Count: ${ev.metrics.fillerWordCount} (${JSON.stringify(ev.metrics.detectedFillers || {})})` 
      : 'N/A';

    const isLatest = idx === 0 ? ' (MOST RECENT / LATEST ATTEMPT)' : '';
    return `[DRILL #${idx + 1}${isLatest}] Date: ${date}
- Title: "${title}"
- Skill Domain: ${skill} | Difficulty: ${ch?.difficulty || 50} | Type: ${ch?.type || 'DRILL'}
- Result: ${score}
- User's Exact Speech / Written Defense:
  ${resp}
- Single Biggest Weakness Caught: ${weakness}
- Specific Mistakes Identified: ${mistakes.length > 0 ? mistakes.join('; ') : 'None'}
- Speech Metrics: ${metrics}`;
  }).join('\n\n');
}

export default {
  /**
   * Cloudflare Cron Trigger (06:00 AM Daily Briefing)
   */
  async scheduled(event: any, env: Env, ctx: any) {
    console.log('Cron triggered: Running 06:00 AM Mentor Daily Planner');
    const today = new Date().toISOString().split('T')[0];
    if (env.TURSO_DATABASE_URL) {
      const store = new TursoMentorStore(env.TURSO_DATABASE_URL, env.TURSO_AUTH_TOKEN);
      const plan = await store.getDailyPlan(today);
      console.log(`Turso Daily plan verified for ${today}, target: ${plan.targetMinutes} minutes`);
    } else {
      const plan = globalStore.getDailyPlan(today);
      console.log(`Daily plan created for ${today}, target: ${plan.targetMinutes} minutes`);
    }
  },

  /**
   * Main HTTP Request Handler
   */
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const turso = env.TURSO_DATABASE_URL ? new TursoMentorStore(env.TURSO_DATABASE_URL, env.TURSO_AUTH_TOKEN) : null;
    const aiRouter = new AIRouter({
      cloudflareAccountId: env.CLOUDFLARE_ACCOUNT_ID,
      cloudflareApiToken: env.CLOUDFLARE_API_TOKEN,
      groqApiKey: env.GROQ_API_KEY,
    });

    try {
      // 0. Serve Interactive Web Dashboard for root and non-API requests
      if (request.method === 'GET' && (!path.startsWith('/api') || path === '/')) {
        return new Response(renderDashboardHtml(), {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            ...CORS_HEADERS,
          },
        });
      }

      // 1. Health Check
      if (path === '/api/health') {
        return jsonResponse({
          status: 'online',
          service: 'mentor-api',
          database: turso ? 'turso-libsql' : 'in-memory',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        });
      }

      // 2. Dashboard Today State
      if (path === '/api/today' && request.method === 'GET') {
        const todayStr = new Date().toISOString().split('T')[0];

        if (turso) {
          const profile = await turso.getProfile();
          const dailyPlan = await turso.getDailyPlan(todayStr);
          const debts = await turso.getDebts();
          const debtSummary = TrainingDebtEngine.calculateSummary(debts);
          const weaknesses = await turso.getWeaknesses();
          const activeWeakness = weaknesses.find(w => w.status !== 'RESOLVED') || null;
          const skillsOverview = await turso.getSkillsOverview();
          const gamification = await turso.getGamification();
          const recentAttempts = await turso.getRecentAttempts(10);

          const response: TodayDashboardResponse = {
            profile,
            dailyPlan,
            gamification,
            activeChallenges: [],
            trainingDebt: debtSummary,
            primaryWeakness: activeWeakness,
            weaknesses,
            skillsOverview,
            recentAttempts,
          };
          return jsonResponse(response);
        }

        const dailyPlan = globalStore.getDailyPlan(todayStr);
        const debtSummary = TrainingDebtEngine.calculateSummary(globalStore.debts);
        const activeWeakness = globalStore.weaknesses.find(w => w.status !== 'RESOLVED') || null;
        const skillsOverview = globalStore.getSkillsOverview();
        const activeChallenges = Array.from(globalStore.challenges.values()).slice(0, 3);
        const recentAttempts = globalStore.getRecentAttempts(10);

        const response: TodayDashboardResponse = {
          profile: globalStore.profile,
          dailyPlan,
          gamification: globalStore.gamification,
          activeChallenges,
          trainingDebt: debtSummary,
          primaryWeakness: activeWeakness,
          weaknesses: globalStore.weaknesses,
          skillsOverview,
          recentAttempts,
        };

        return jsonResponse(response);
      }

      // 3. Generate Next Challenge
      if (path === '/api/challenge/next' && request.method === 'GET') {
        const skills = turso ? await turso.getSkillsOverview() : globalStore.getSkillsOverview();
        const debts = turso ? await turso.getDebts() : globalStore.debts;
        const weaknesses = turso ? await turso.getWeaknesses() : globalStore.weaknesses;
        const debtSummary = TrainingDebtEngine.calculateSummary(debts);
        const requestedSkillId = url.searchParams.get('skill') || undefined;

        const target = ChallengeEngine.calculateTargetPriority({
          skills,
          weaknesses,
          trainingDebtPoints: debtSummary.totalActiveDebtPoints,
          recentAttemptsCount: 0,
          requestedSkillId,
        });

        // 1. Generate masterclass baseline template for the target skill
        let challenge = ChallengeEngine.generateTemplateChallenge(
          target.skillId,
          target.dimensionId,
          target.targetDifficulty,
          target.targetWeakness
        );

        // 2. Synthesize bespoke high-friction drill via Groq AI if available
        if (env.GROQ_API_KEY) {
          try {
            const skillObj = skills.find(s => s.skill.id === target.skillId)?.skill;
            const synthPrompt = `You are the master challenge synthesis engine of the AI Performance Mentor.
Construct a world-class, high-stakes, pressure-tested practical challenge.
Zero passive essays or kindergarten roleplays. Test the user right at their failure boundary.

SKILL: ${skillObj?.name || target.skillId} (${skillObj?.description || ''})
DIMENSION ID: ${target.dimensionId}
DIFFICULTY LEVEL: ${target.targetDifficulty}/100
ACTIVE WEAKNESS TO TARGET: ${target.targetWeakness?.description || 'Structural delivery and precision under pressure'}
TOTAL TRAINING DEBT: ${debtSummary.totalActiveDebtPoints} points

Requirements:
1. Imposing realistic high-stakes scenario (e.g. enterprise executive boardroom, hostile counterparty, grandmaster candidate calculation, crisis turnaround).
2. Exactly 2-3 brutal negative constraints (banned words, strict structural requirement, tight time ceiling between 45s and 90s).
3. If difficulty > 65, introduce adversarial pushback context.

Respond ONLY with valid JSON:
{
  "type": "${challenge.type}",
  "title": string,
  "instructions": string,
  "adversaryContext": string | null,
  "constraints": string[],
  "timeLimitSeconds": number,
  "difficulty": ${target.targetDifficulty},
  "rubric": [
    {
      "dimensionId": "${target.dimensionId}",
      "name": "${challenge.rubric[0]?.name || 'Executive Execution'}",
      "weight": 1.3,
      "passThreshold": 75,
      "evalPrompt": string
    }
  ]
}`;

            const aiResp = await aiRouter.complete([
              { role: 'system', content: 'You are an elite performance training architect. Output valid JSON only.' },
              { role: 'user', content: synthPrompt },
            ], true);

            if (aiResp) {
              const clean = aiResp.replace(/```json/g, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(clean);
              if (parsed.title && parsed.instructions && parsed.constraints) {
                challenge = {
                  ...challenge,
                  ...parsed,
                  id: `chal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                  skillId: target.skillId,
                  dimensionId: target.dimensionId,
                  createdAt: new Date().toISOString(),
                };
              }
            }
          } catch (err) {
            console.warn('Groq challenge synthesis fallback to masterclass template:', err);
          }
        }

        if (turso) {
          await turso.saveChallenge(challenge);
        } else {
          globalStore.challenges.set(challenge.id, challenge);
        }

        return jsonResponse(challenge);
      }

      // 4. Submit Attempt & Evaluate
      if (path === '/api/challenge/submit' && request.method === 'POST') {
        const body: SubmitAttemptRequest = await request.json();
        let challenge: Challenge | null = null;
        if (turso) {
          challenge = await turso.getChallenge(body.challengeId);
        } else {
          challenge = globalStore.challenges.get(body.challengeId) || null;
        }

        if (!challenge) {
          challenge = ChallengeEngine.generateTemplateChallenge('communication', 'comm_clarity', 65);
        }

        // Run live AI evaluation via Groq
        let aiResult: RawAssessmentResult | undefined = undefined;
        try {
          const evalPrompt = `You are the objective evaluation sub-engine of the AI Mentor.
Evaluate this user defense attempt strictly against the challenge rubric.
Zero empty praise. Any violation of constraints, excessive brevity, or filler words must be penalized.

CHALLENGE:
Title: ${challenge.title}
Instructions: ${challenge.instructions}
Constraints: ${challenge.constraints.join('; ')}
Time Limit: ${challenge.timeLimitSeconds} seconds
Difficulty: ${challenge.difficulty}/100

RUBRIC:
${challenge.rubric.map(r => `- ${r.name} (${r.dimensionId}): pass threshold ${r.passThreshold}/100. Prompt: ${r.evalPrompt}`).join('\n')}

USER DEFENSE TEXT:
"${body.responseText || ''}"

Output JSON matching:
{
  "dimensionScores": [{"dimensionId": "${challenge.dimensionId}", "score": number, "evidenceQuotes": string[], "identifiedMistakes": string[]}],
  "whatWorkedWell": string[],
  "whatFailed": string[],
  "singleBiggestWeakness": string,
  "whyItMatters": string,
  "correctiveDrillInstructions": string
}`;

          const aiText = await aiRouter.complete([
            { role: 'system', content: 'You are an objective rubric evaluator. Output valid JSON only.' },
            { role: 'user', content: evalPrompt },
          ], true);

          if (aiText) {
            const clean = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
            aiResult = JSON.parse(clean);
          }
        } catch (e) {
          console.warn('Groq AI evaluation in worker failed, falling back to deterministic:', e);
        }

        // 1. Evaluate with AssessmentEngine
        const evaluation = AssessmentEngine.evaluateAttempt(
          challenge,
          body.responseText || '',
          body.audioDurationSeconds,
          aiResult
        );

        // 2. Progression Engine (Deterministic leveling)
        const dimId = challenge.dimensionId;
        const currentState = turso 
          ? await turso.getSkillState(dimId, challenge.skillId)
          : (globalStore.skillStates.get(dimId) || {
              dimensionId: dimId,
              skillId: challenge.skillId,
              level: 1,
              sublevel: 1,
              score: 50.0,
              confidence: 0.20,
              trend: 'STABLE' as const,
              recentScores: [],
              consecutivePasses: 0,
              lastAssessedAt: null,
            });

        const progResult = ProgressionEngine.updateProgression(
          currentState,
          evaluation.overallScore,
          evaluation.passed
        );

        if (turso) {
          await turso.updateSkillState(progResult.updatedState);
        } else {
          globalStore.skillStates.set(dimId, progResult.updatedState);
        }

        // 3. Weakness Engine
        const currentWeaknesses = turso ? await turso.getWeaknesses() : globalStore.weaknesses;
        const weaknessRes = WeaknessEngine.processEvaluation(
          currentWeaknesses,
          evaluation,
          challenge.skillId
        );

        if (turso) {
          await turso.upsertWeaknesses(weaknessRes.updatedWeaknesses);
        } else {
          globalStore.weaknesses = weaknessRes.updatedWeaknesses;
        }

        // 4. Training Debt Engine
        let currentDebts = turso ? await turso.getDebts() : globalStore.debts;
        let pointsDelta = 0;
        if (!evaluation.passed) {
          const isRepeat = (currentWeaknesses.find(w => w.dimensionId === dimId)?.occurrenceCount || 0) >= 2;
          const reason = isRepeat ? 'REPEATED_FAILURE' : 'FAILED_CHALLENGE';
          const debtRes = TrainingDebtEngine.accrueDebt(
            currentDebts,
            reason,
            evaluation.brutalCritique.singleBiggestWeakness,
            challenge.targetWeaknessId,
            dimId
          );
          currentDebts = debtRes.updatedDebts;
          pointsDelta = debtRes.addedPoints;
        } else if (challenge.targetWeaknessId) {
          const clearRes = TrainingDebtEngine.clearDebt(currentDebts, 2);
          currentDebts = clearRes.updatedDebts;
          pointsDelta = -clearRes.clearedPoints;
        }

        if (turso) {
          await turso.upsertDebts(currentDebts);
        } else {
          globalStore.debts = currentDebts;
        }

        const newDebtSummary = TrainingDebtEngine.calculateSummary(currentDebts);

        // 5. Gamification Engine
        let gamification = turso ? await turso.getGamification() : globalStore.gamification;
        const xpDetails = GamificationEngine.calculateXp(
          challenge.difficulty,
          evaluation.passed,
          gamification.comboMultiplier,
          !!challenge.targetWeaknessId
        );

        const todayStr = new Date().toISOString().split('T')[0];
        const updatedGamification = GamificationEngine.updateStreakAndCombos(
          {
            ...gamification,
            totalXp: gamification.totalXp + xpDetails.totalAwarded,
          },
          todayStr,
          evaluation.passed
        );

        if (turso) {
          await turso.updateGamification(updatedGamification);
        } else {
          globalStore.gamification = updatedGamification;
        }

        // Record attempt
        const attempt: Attempt = {
          id: evaluation.attemptId,
          challengeId: challenge.id,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          responseText: body.responseText,
          mediaUrl: body.mediaUrl,
          mediaType: body.mediaType,
          evaluation,
        };

        if (turso) {
          await turso.saveAttempt(attempt);
        } else {
          globalStore.attempts.push(attempt);
        }

        const response: SubmitAttemptResponse = {
          attempt,
          evaluation,
          progressionUpdate: {
            skillId: challenge.skillId,
            dimensionId: dimId,
            previousLevel: currentState.level + currentState.sublevel / 10,
            newLevel: progResult.updatedState.level + progResult.updatedState.sublevel / 10,
            levelUp: progResult.levelChanged,
            previousScore: currentState.score,
            newScore: progResult.updatedState.score,
          },
          debtUpdate: {
            pointsDelta,
            newTotalDebt: newDebtSummary.totalActiveDebtPoints,
          },
          gamificationUpdate: {
            xpEarned: xpDetails.totalAwarded,
            newTotalXp: updatedGamification.totalXp,
            streakDays: updatedGamification.currentStreakDays,
          },
        };

        return jsonResponse(response);
      }

      // 5. Mentor Sparring Chat
      if (path === '/api/chat' && request.method === 'POST') {
        const body = await request.json() as any;
        const messages = Array.isArray(body.messages) && body.messages.length > 0 
          ? body.messages 
          : (body.message ? [{ role: 'user', content: String(body.message) }] : []);
        const debts = turso ? await turso.getDebts() : globalStore.debts;
        const debt = TrainingDebtEngine.calculateSummary(debts);
        const weaknesses = turso ? await turso.getWeaknesses() : globalStore.weaknesses;
        const activeW = weaknesses.find(w => w.status !== 'RESOLVED');
        const gamification = turso ? await turso.getGamification() : globalStore.gamification;
        const recentAttempts = turso ? await turso.getRecentAttempts(10) : globalStore.getRecentAttempts(10);
        const drillHistoryText = formatDrillHistoryContext(recentAttempts);

        const systemPrompt = `You are the user's personal adversarial performance coach and AI Mentor.
Core Directive: Maximize measurable real-world skill improvement. Never give empty praise. Be ruthlessly honest, rigorous, and demanding.

CURRENT USER OPERATING CONTEXT:
- Streak: ${gamification.currentStreakDays} days | Total XP: ${gamification.totalXp}
- Training Debt: ${debt.totalActiveDebtPoints} points (${debt.mandatoryDrillsCount} mandatory remediation drills required)
- Active Unresolved Weakness: ${activeW ? `${activeW.dimensionName}: ${activeW.description} (Occurrences: ${activeW.occurrenceCount})` : 'None detected yet'}

HISTORICAL DRILL LOGS & REAL ATTEMPTS (${recentAttempts.length} logged):
${drillHistoryText}

INSTRUCTIONS FOR MENTOR SPARRING & ACCOUNTABILITY:
1. You have complete, transparent access to the user's past drill history above. Drills are listed in reverse chronological order: [DRILL #1] is the user's latest/most recent attempt.
2. When the user asks what drills they have taken, what they answered last, how they performed, what their score was, or why they failed, reference these exact drills, their scores, specific quotes from their transcripts, and identified flaws directly. Never claim that you don't have access to their drill logs.
3. Call out their recurring patterns, incoherence, filler words, or failure to follow structure without sugarcoating.
4. If they try to rationalize, push back immediately with their concrete attempt evidence.
5. Tone: Direct, demanding, serious, and concise. No generic pleasantries. Call out hesitation and excuses immediately.`;

        const chatMessages = [
          { role: 'system' as const, content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        ];

        const reply = await aiRouter.complete(chatMessages, false);
        return jsonResponse({ response: reply });
      }

      // 6. Skills Overview
      if (path === '/api/skills' && request.method === 'GET') {
        const skills = turso ? await turso.getSkillsOverview() : globalStore.getSkillsOverview();
        return jsonResponse(skills);
      }

      // 7. Weaknesses List
      if (path === '/api/weaknesses' && request.method === 'GET') {
        const weaknesses = turso ? await turso.getWeaknesses() : globalStore.weaknesses;
        return jsonResponse(weaknesses);
      }

      // 8. Training Debt
      if (path === '/api/debt' && request.method === 'GET') {
        const debts = turso ? await turso.getDebts() : globalStore.debts;
        return jsonResponse(TrainingDebtEngine.calculateSummary(debts));
      }

      // 9. Reality Mission Dispatch
      if (path === '/api/reality/mission' && request.method === 'POST') {
        const body = await request.json().catch(() => ({})) as any;
        const skillId = body.skillId || 'communication';
        const mission = RealityModeEngine.generateMission(skillId);
        return jsonResponse(mission);
      }

      // 10. Telegram Webhook Handler
      if (path === '/api/telegram/webhook' && request.method === 'POST') {
        const payload: TelegramWebhookPayload = await request.json();
        const message = payload.message;
        const text = (message?.text || '').trim();
        const chatId = message?.chat?.id;

        const debts = turso ? await turso.getDebts() : globalStore.debts;
        const debt = TrainingDebtEngine.calculateSummary(debts);
        const weaknesses = turso ? await turso.getWeaknesses() : globalStore.weaknesses;
        const topW = weaknesses.find(w => w.status !== 'RESOLVED');
        const gamification = turso ? await turso.getGamification() : globalStore.gamification;
        const skills = turso ? await turso.getSkillsOverview() : globalStore.getSkillsOverview();
        const avgLevel = (skills.reduce((acc, s) => acc + s.overallLevel + s.overallSublevel / 10, 0) / Math.max(1, skills.length)).toFixed(1);

        let replyText = 'AI Mentor Operating System Active. Commands: /today, /train, /debt, /reflect';

        if (text === '/start' || text === '/help') {
          replyText = `⚔️ *AI MENTOR OPERATING SYSTEM*
Your personal adversarial performance coach is active.

Commands:
• /today — Daily training briefing & mission
• /train — Launch next challenge
• /debt — Check current training debt points
• /reflect — Submit reflection on Reality Mission
• Send voice memo or video note to log exercise recording.`;
        } else if (text === '/today') {
          replyText = `📅 *TODAY'S BRIEFING*
• Level: ${avgLevel} | Streak: ${gamification.currentStreakDays} Days
• Target: 25 Minutes Training
• Focus: Communication & Articulation
• Priority Weakness: ${topW ? topW.description : 'None detected yet'}
• Training Debt: ${debt.totalActiveDebtPoints} Points (${debt.mandatoryDrillsCount} drills required)`;
        } else if (text === '/debt') {
          replyText = `⚠️ *TRAINING DEBT STATUS*
Total Debt: ${debt.totalActiveDebtPoints} Points
Mandatory Remediation Drills: ${debt.mandatoryDrillsCount}
Unresolved items: ${debt.unresolvedDebts.length}

Complete your corrective drills to clear debt and unlock progression.`;
        } else if (text === '/drills' || text === '/history') {
          const recentAttempts = turso ? await turso.getRecentAttempts(5) : globalStore.getRecentAttempts(5);
          if (recentAttempts.length === 0) {
            replyText = `⚔️ *DRILL PERFORMANCE HISTORY*\nNo drills completed yet. Send /train to begin your first challenge!`;
          } else {
            const list = recentAttempts.map((a, i) => {
              const score = a.evaluation?.overallScore ?? 0;
              const passed = a.evaluation?.passed ? '✓ PASS' : '✗ FAIL';
              return `${i + 1}. *${a.challenge?.title || a.challengeId}*\n   Score: ${score}/100 [${passed}]\n   Flaw: ${a.evaluation?.brutalCritique?.singleBiggestWeakness || 'N/A'}`;
            }).join('\n\n');
            replyText = `⚔️ *RECENT DRILL PERFORMANCE*\n\n${list}`;
          }
        } else if (message?.voice || message?.video_note) {
          replyText = `🎙️ Media received. Evaluating speech cadence and filler word density...`;
        }

        return jsonResponse({
          ok: true,
          chatId,
          replyText,
        });
      }

      // 404 Route
      return jsonResponse({ error: 'Endpoint not found', path }, 404);
    } catch (err: any) {
      console.error('Unhandled API Error:', err);
      return jsonResponse({ error: err.message || 'Internal Server Error' }, 500);
    }
  },
};
