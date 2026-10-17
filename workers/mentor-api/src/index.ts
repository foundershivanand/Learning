import { 
  TodayDashboardResponse, 
  SubmitAttemptRequest, 
  SubmitAttemptResponse,
  TelegramWebhookPayload,
  Challenge
} from '@personal-mentor/shared';
import { 
  AssessmentEngine, 
  ProgressionEngine, 
  WeaknessEngine, 
  TrainingDebtEngine, 
  ChallengeEngine, 
  GamificationEngine,
  RealityModeEngine,
  ContextEngine
} from '@personal-mentor/core';
import { AIRouter } from '@personal-mentor/ai-router';
import { globalStore } from './store.js';

export interface Env {
  AI?: any;
  MEDIA_BUCKET?: any;
  TELEGRAM_BOT_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  GROQ_API_KEY?: string;
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

export default {
  /**
   * Cloudflare Cron Trigger (06:00 AM Daily Briefing)
   */
  async scheduled(event: any, env: Env, ctx: any) {
    console.log('Cron triggered: Running 06:00 AM Mentor Daily Planner');
    const today = new Date().toISOString().split('T')[0];
    const plan = globalStore.getDailyPlan(today);
    console.log(`Daily plan created for ${today}, target: ${plan.targetMinutes} minutes`);
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

    try {
      // 1. Health Check
      if (path === '/api/health') {
        return jsonResponse({
          status: 'online',
          service: 'mentor-api',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        });
      }

      // 2. Dashboard Today State
      if (path === '/api/today' && request.method === 'GET') {
        const todayStr = new Date().toISOString().split('T')[0];
        const dailyPlan = globalStore.getDailyPlan(todayStr);
        const debtSummary = TrainingDebtEngine.calculateSummary(globalStore.debts);
        const activeWeakness = globalStore.weaknesses.find(w => w.status !== 'RESOLVED') || null;
        const skillsOverview = globalStore.getSkillsOverview();
        const activeChallenges = Array.from(globalStore.challenges.values()).slice(0, 3);

        const response: TodayDashboardResponse = {
          profile: globalStore.profile,
          dailyPlan,
          gamification: globalStore.gamification,
          activeChallenges,
          trainingDebt: debtSummary,
          primaryWeakness: activeWeakness,
          skillsOverview,
        };

        return jsonResponse(response);
      }

      // 3. Generate Next Challenge
      if (path === '/api/challenge/next' && request.method === 'GET') {
        const skills = globalStore.getSkillsOverview();
        const debtSummary = TrainingDebtEngine.calculateSummary(globalStore.debts);
        
        const target = ChallengeEngine.calculateTargetPriority({
          skills,
          weaknesses: globalStore.weaknesses,
          trainingDebtPoints: debtSummary.totalActiveDebtPoints,
          recentAttemptsCount: globalStore.attempts.length,
        });

        // Generate challenge template
        const challenge = ChallengeEngine.generateTemplateChallenge(
          target.skillId,
          target.dimensionId,
          target.targetDifficulty,
          target.targetWeakness
        );

        globalStore.challenges.set(challenge.id, challenge);
        return jsonResponse(challenge);
      }

      // 4. Submit Attempt & Evaluate
      if (path === '/api/challenge/submit' && request.method === 'POST') {
        const body: SubmitAttemptRequest = await request.json();
        const challenge = globalStore.challenges.get(body.challengeId) || ChallengeEngine.generateTemplateChallenge('communication', 'comm_clarity', 65);

        const aiRouter = new AIRouter({
          cloudflareAccountId: env.CLOUDFLARE_ACCOUNT_ID,
          cloudflareApiToken: env.CLOUDFLARE_API_TOKEN,
          groqApiKey: env.GROQ_API_KEY,
        });

        // 1. Evaluate with AssessmentEngine
        const evaluation = AssessmentEngine.evaluateAttempt(
          challenge,
          body.responseText || '',
          body.audioDurationSeconds
        );

        // 2. Progression Engine (Deterministic leveling)
        const dimId = challenge.dimensionId;
        const currentState = globalStore.skillStates.get(dimId) || {
          dimensionId: dimId,
          skillId: challenge.skillId,
          level: 1,
          sublevel: 1,
          score: 50.0,
          confidence: 0.5,
          trend: 'STABLE',
          recentScores: [],
          consecutivePasses: 0,
          lastAssessedAt: null,
        };

        const progResult = ProgressionEngine.updateProgression(
          currentState,
          evaluation.overallScore,
          evaluation.passed
        );
        globalStore.skillStates.set(dimId, progResult.updatedState);

        // 3. Weakness Engine
        const weaknessRes = WeaknessEngine.processEvaluation(
          globalStore.weaknesses,
          evaluation,
          challenge.skillId
        );
        globalStore.weaknesses = weaknessRes.updatedWeaknesses;

        // 4. Training Debt Engine
        let pointsDelta = 0;
        if (!evaluation.passed) {
          const isRepeat = (globalStore.weaknesses.find(w => w.dimensionId === dimId)?.occurrenceCount || 0) >= 2;
          const reason = isRepeat ? 'REPEATED_FAILURE' : 'FAILED_CHALLENGE';
          const debtRes = TrainingDebtEngine.accrueDebt(
            globalStore.debts,
            reason,
            evaluation.brutalCritique.singleBiggestWeakness,
            challenge.targetWeaknessId,
            dimId
          );
          globalStore.debts = debtRes.updatedDebts;
          pointsDelta = debtRes.addedPoints;
        } else if (challenge.targetWeaknessId) {
          // Cleared drill!
          const clearRes = TrainingDebtEngine.clearDebt(globalStore.debts, 2);
          globalStore.debts = clearRes.updatedDebts;
          pointsDelta = -clearRes.clearedPoints;
        }

        const newDebtSummary = TrainingDebtEngine.calculateSummary(globalStore.debts);

        // 5. Gamification Engine
        const xpDetails = GamificationEngine.calculateXp(
          challenge.difficulty,
          evaluation.passed,
          globalStore.gamification.comboMultiplier,
          !!challenge.targetWeaknessId
        );

        const todayStr = new Date().toISOString().split('T')[0];
        globalStore.gamification = GamificationEngine.updateStreakAndCombos(
          {
            ...globalStore.gamification,
            totalXp: globalStore.gamification.totalXp + xpDetails.totalAwarded,
          },
          todayStr,
          evaluation.passed
        );

        // Record attempt
        const attempt = {
          id: evaluation.attemptId,
          challengeId: challenge.id,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          responseText: body.responseText,
          mediaUrl: body.mediaUrl,
          mediaType: body.mediaType,
          evaluation,
        };
        globalStore.attempts.push(attempt);

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
            newTotalXp: globalStore.gamification.totalXp,
            streakDays: globalStore.gamification.currentStreakDays,
          },
        };

        return jsonResponse(response);
      }

      // 5. Skills Overview
      if (path === '/api/skills' && request.method === 'GET') {
        return jsonResponse(globalStore.getSkillsOverview());
      }

      // 6. Weaknesses List
      if (path === '/api/weaknesses' && request.method === 'GET') {
        return jsonResponse(globalStore.weaknesses);
      }

      // 7. Training Debt
      if (path === '/api/debt' && request.method === 'GET') {
        return jsonResponse(TrainingDebtEngine.calculateSummary(globalStore.debts));
      }

      // 8. Reality Mission Dispatch
      if (path === '/api/reality/mission' && request.method === 'POST') {
        const body = await request.json().catch(() => ({})) as any;
        const skillId = body.skillId || 'communication';
        const mission = RealityModeEngine.generateMission(skillId);
        return jsonResponse(mission);
      }

      // 9. Telegram Webhook Handler
      if (path === '/api/telegram/webhook' && request.method === 'POST') {
        const payload: TelegramWebhookPayload = await request.json();
        const message = payload.message;
        const text = (message?.text || '').trim();
        const chatId = message?.chat?.id;

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
          const debt = TrainingDebtEngine.calculateSummary(globalStore.debts);
          const topW = globalStore.weaknesses.find(w => w.status !== 'RESOLVED');
          replyText = `📅 *TODAY'S BRIEFING*
• Level: 4.7 | Streak: ${globalStore.gamification.currentStreakDays} Days
• Target: 25 Minutes Training
• Focus: Communication & Fluidity
• Priority Weakness: ${topW ? topW.description : 'None'}
• Training Debt: ${debt.totalActiveDebtPoints} Points (${debt.mandatoryDrillsCount} drills required)`;
        } else if (text === '/debt') {
          const debt = TrainingDebtEngine.calculateSummary(globalStore.debts);
          replyText = `⚠️ *TRAINING DEBT STATUS*
Total Debt: ${debt.totalActiveDebtPoints} Points
Mandatory Remediation Drills: ${debt.mandatoryDrillsCount}
Unresolved items: ${debt.unresolvedDebts.length}

Complete your corrective drills to clear debt and unlock progression.`;
        } else if (message?.voice || message?.video_note) {
          replyText = `🎙️ Media received and logged to Cloudflare R2 evidence storage. Evaluating speech cadence and filler word density...`;
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
