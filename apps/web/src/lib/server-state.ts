import { 
  MentorProfile, 
  SkillSummary, 
  SkillState, 
  Weakness, 
  TrainingDebtItem, 
  GamificationState, 
  DailyPlan, 
  Challenge, 
  Attempt,
  TodayDashboardResponse,
  SubmitAttemptRequest,
  SubmitAttemptResponse,
  RealityMission
} from '@personal-mentor/shared';
import { ALL_SKILLS } from '@personal-mentor/skills';
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

export class MentorServerStore {
  public profile: MentorProfile;
  public skillStates: Map<string, SkillState> = new Map();
  public weaknesses: Weakness[] = [];
  public debts: TrainingDebtItem[] = [];
  public gamification: GamificationState;
  public challenges: Map<string, Challenge> = new Map();
  public attempts: Attempt[] = [];
  public dailyPlans: Map<string, DailyPlan> = new Map();
  public aiRouter: AIRouter;

  constructor() {
    this.profile = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'You',
      goals: [
        'Master High-Stakes Communication & Articulation',
        'Master Entrepreneurial Business Execution',
        'Reach 1800 Chess & Blindfold Visualization',
      ],
      rules: [
        'Never give empty praise',
        'Make me fail',
        'Enforce training debt immediately',
      ],
      dailyTargetMinutes: 25,
      timezone: 'Asia/Kolkata',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // True baseline: Level 1.1, 0 XP, 0 Streak, 0 Debt
    this.gamification = {
      totalXp: 0,
      currentStreakDays: 0,
      longestStreakDays: 0,
      lastActiveDate: null,
      comboMultiplier: 1.00,
      bossClearsCount: 0,
      unlockedTiers: ['TIER_1'],
    };

    this.aiRouter = new AIRouter({
      groqApiKey: process.env.GROQ_API_KEY,
      cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN,
    });

    this.initializeDefaultSkills();
    this.initializeStarterChallenges();
  }

  private initializeDefaultSkills() {
    for (const skill of ALL_SKILLS) {
      for (const dim of skill.dimensions) {
        this.skillStates.set(dim.id, {
          dimensionId: dim.id,
          skillId: skill.id,
          level: 1,
          sublevel: 1,
          score: 50.0,
          confidence: 0.20,
          trend: 'STABLE' as const,
          recentScores: [],
          consecutivePasses: 0,
          lastAssessedAt: null,
        });
      }
    }
    this.weaknesses = [];
    this.debts = [];
  }

  private initializeStarterChallenges() {
    const starters: Challenge[] = [
      {
        id: 'chal-starter-comm-1',
        skillId: 'communication',
        dimensionId: 'comm_clarity',
        type: 'EXPLAIN',
        title: 'Explain Opportunity Cost & Asymmetric Risk in 60 Seconds',
        instructions: 'Explain Opportunity Cost and Asymmetric Risk to a skeptical founder in exactly 60 seconds using a concrete physical metaphor.',
        constraints: [
          'Time ceiling: 60 seconds',
          'Zero filler words (banned crutches: "basically", "like", "you know")',
          'Must state a clear 3-part framework before explaining',
        ],
        timeLimitSeconds: 60,
        difficulty: 68,
        isBossChallenge: false,
        rubric: [
          {
            dimensionId: 'comm_clarity',
            name: 'Simplicity & Structural Precision',
            maxScore: 100,
            weight: 1.2,
            passThreshold: 70,
            evalPrompt: 'Did user clearly state a 3-part framework and use a physical metaphor without fluff?',
          }
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'chal-starter-ent-1',
        skillId: 'entrepreneurship',
        dimensionId: 'ent_problem_validation',
        type: 'ROLEPLAY',
        title: 'Cold Discovery on a Skeptical Buyer',
        instructions: 'A prospect says: "We already have an internal tool for this that our IT team built 3 years ago. Why would we pay you?" Respond to uncover pain without defensiveness.',
        adversaryContext: 'Hostile prospect protecting internal team pride and budget.',
        constraints: [
          'Do NOT criticize their internal tool',
          'Ask one calibrated question about maintenance downtime or hidden maintenance cost',
          'Time limit: 90 seconds',
        ],
        timeLimitSeconds: 90,
        difficulty: 72,
        isBossChallenge: false,
        rubric: [
          {
            dimensionId: 'ent_problem_validation',
            name: 'Discovery & Leverage',
            maxScore: 100,
            weight: 1.3,
            passThreshold: 72,
            evalPrompt: 'Evaluate discovery framing and absence of defensive arguing.',
          }
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'chal-starter-chess-1',
        skillId: 'chess',
        dimensionId: 'chess_tactical_depth',
        type: 'CHESS_TACTIC',
        title: 'Tactical Calculation: Greek Gift Sacrifice',
        instructions: 'White initiates Bxh7+ Kxh7 Ng5+ Kg8 Qh5. State Black\'s only defensive try and White\'s forced checkmating continuation in algebraic notation.',
        constraints: [
          'State exact algebraic notation for all candidate moves',
          'Time limit: 60 seconds',
        ],
        timeLimitSeconds: 60,
        difficulty: 70,
        isBossChallenge: false,
        rubric: [
          {
            dimensionId: 'chess_tactical_depth',
            name: 'Tactical Accuracy',
            maxScore: 100,
            weight: 1.4,
            passThreshold: 75,
            evalPrompt: 'Verify calculation of Qh7+ and Qh8# variations.',
          }
        ],
        createdAt: new Date().toISOString(),
      }
    ];

    for (const c of starters) {
      this.challenges.set(c.id, c);
    }
  }

  public getSkillsOverview(): SkillSummary[] {
    return ALL_SKILLS.map(skill => {
      const dimensionStates: SkillState[] = skill.dimensions.map(d => {
        return this.skillStates.get(d.id) || {
          dimensionId: d.id,
          skillId: skill.id,
          level: 1,
          sublevel: 1,
          score: 50.0,
          confidence: 0.20,
          trend: 'STABLE' as const,
          recentScores: [],
          consecutivePasses: 0,
          lastAssessedAt: null,
        };
      });

      const avgScore = dimensionStates.reduce((acc, d) => acc + d.score, 0) / Math.max(1, dimensionStates.length);
      const avgLevel = Math.max(1, Math.round(dimensionStates.reduce((acc, d) => acc + d.level, 0) / Math.max(1, dimensionStates.length)));
      const avgSublevel = Math.max(1, Math.round(dimensionStates.reduce((acc, d) => acc + d.sublevel, 0) / Math.max(1, dimensionStates.length)));

      return {
        skill,
        overallScore: Math.round(avgScore),
        overallLevel: avgLevel,
        overallSublevel: avgSublevel,
        dimensionStates,
      };
    });
  }

  public getDailyPlan(dateStr: string): DailyPlan {
    const existing = this.dailyPlans.get(dateStr);
    if (existing) return existing;

    const newPlan: DailyPlan = {
      id: `plan-${dateStr}`,
      planDate: dateStr,
      targetMinutes: 25,
      focusSkillId: 'communication',
      priorityWeaknessId: this.weaknesses.find(w => w.status !== 'RESOLVED')?.id,
      challengeIds: Array.from(this.challenges.keys()),
      completedChallengeIds: [],
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.dailyPlans.set(dateStr, newPlan);
    return newPlan;
  }

  public getTodayDashboard(): TodayDashboardResponse {
    const todayStr = new Date().toISOString().split('T')[0];
    const dailyPlan = this.getDailyPlan(todayStr);
    const debtSummary = TrainingDebtEngine.calculateSummary(this.debts);
    const activeWeakness = this.weaknesses.find(w => w.status !== 'RESOLVED') || null;
    const skillsOverview = this.getSkillsOverview();
    const activeChallenges = Array.from(this.challenges.values()).slice(0, 3);

    return {
      profile: this.profile,
      dailyPlan,
      gamification: this.gamification,
      activeChallenges,
      trainingDebt: debtSummary,
      primaryWeakness: activeWeakness,
      weaknesses: this.weaknesses,
      skillsOverview,
    };
  }

  public async getNextChallenge(): Promise<Challenge> {
    const skills = this.getSkillsOverview();
    const debtSummary = TrainingDebtEngine.calculateSummary(this.debts);
    
    const target = ChallengeEngine.calculateTargetPriority({
      skills,
      weaknesses: this.weaknesses,
      trainingDebtPoints: debtSummary.totalActiveDebtPoints,
      recentAttemptsCount: this.attempts.length,
    });

    const challenge = ChallengeEngine.generateTemplateChallenge(
      target.skillId,
      target.dimensionId,
      target.targetDifficulty,
      target.targetWeakness
    );

    this.challenges.set(challenge.id, challenge);
    return challenge;
  }

  public async submitAttempt(body: SubmitAttemptRequest): Promise<SubmitAttemptResponse> {
    const challenge = this.challenges.get(body.challengeId) || 
      ChallengeEngine.generateTemplateChallenge('communication', 'comm_clarity', 65);

    // Call live AI Evaluation (Groq / Qwen / Cloudflare)
    let aiResult: RawAssessmentResult | undefined = undefined;
    try {
      const evaluationPrompt = `You are the objective evaluation sub-engine of the AI Mentor.
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

USER ATTEMPT TRANSCRIPT / TEXT:
"${body.responseText || ''}"

Audio Duration: ${body.audioDurationSeconds || 0} seconds

Respond ONLY with a valid JSON object matching this schema:
{
  "dimensionScores": [
    {
      "dimensionId": "${challenge.dimensionId}",
      "score": number, // 0 to 100
      "evidenceQuotes": string[],
      "identifiedMistakes": string[]
    }
  ],
  "whatWorkedWell": string[],
  "whatFailed": string[],
  "singleBiggestWeakness": string,
  "whyItMatters": string,
  "correctiveDrillInstructions": string
}`;

      const aiResponse = await this.aiRouter.complete([
        { role: 'system', content: 'You are an objective rubric evaluator. Output valid JSON only.' },
        { role: 'user', content: evaluationPrompt }
      ], true);

      if (aiResponse) {
        // Strip markdown code fences if model enclosed JSON
        const cleaned = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.dimensionScores && parsed.singleBiggestWeakness) {
          aiResult = parsed;
        }
      }
    } catch (e) {
      console.warn('Live AI Evaluation call error, falling back to deterministic evaluation:', e);
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
    const currentState = this.skillStates.get(dimId) || {
      dimensionId: dimId,
      skillId: challenge.skillId,
      level: 1,
      sublevel: 1,
      score: 50.0,
      confidence: 0.20,
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
    this.skillStates.set(dimId, progResult.updatedState);

    // 3. Weakness Engine
    const weaknessRes = WeaknessEngine.processEvaluation(
      this.weaknesses,
      evaluation,
      challenge.skillId
    );
    this.weaknesses = weaknessRes.updatedWeaknesses;

    // 4. Training Debt Engine
    let pointsDelta = 0;
    if (!evaluation.passed) {
      const isRepeat = (this.weaknesses.find(w => w.dimensionId === dimId)?.occurrenceCount || 0) >= 2;
      const reason = isRepeat ? 'REPEATED_FAILURE' : 'FAILED_CHALLENGE';
      const debtRes = TrainingDebtEngine.accrueDebt(
        this.debts,
        reason,
        evaluation.brutalCritique.singleBiggestWeakness,
        challenge.targetWeaknessId,
        dimId
      );
      this.debts = debtRes.updatedDebts;
      pointsDelta = debtRes.addedPoints;
    } else if (challenge.targetWeaknessId) {
      const clearRes = TrainingDebtEngine.clearDebt(this.debts, 2);
      this.debts = clearRes.updatedDebts;
      pointsDelta = -clearRes.clearedPoints;
    }

    const newDebtSummary = TrainingDebtEngine.calculateSummary(this.debts);

    // 5. Gamification Engine
    const xpDetails = GamificationEngine.calculateXp(
      challenge.difficulty,
      evaluation.passed,
      this.gamification.comboMultiplier,
      !!challenge.targetWeaknessId
    );

    const todayStr = new Date().toISOString().split('T')[0];
    this.gamification = GamificationEngine.updateStreakAndCombos(
      {
        ...this.gamification,
        totalXp: this.gamification.totalXp + xpDetails.totalAwarded,
      },
      todayStr,
      evaluation.passed
    );

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
    this.attempts.push(attempt);

    return {
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
        newTotalXp: this.gamification.totalXp,
        streakDays: this.gamification.currentStreakDays,
      },
    };
  }

  public async chat(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
    const debt = TrainingDebtEngine.calculateSummary(this.debts);
    const activeW = this.weaknesses.find(w => w.status !== 'RESOLVED');

    const systemPrompt = `You are the user's personal adversarial performance coach and AI Mentor.
Core Directive: Maximize measurable real-world skill improvement. Never give empty praise.
Current User Context:
- Streak: ${this.gamification.currentStreakDays} days | Total XP: ${this.gamification.totalXp}
- Training Debt: ${debt.totalActiveDebtPoints} points (${debt.mandatoryDrillsCount} mandatory drills required)
- Active Unresolved Weakness: ${activeW ? activeW.description : 'None detected yet'}

Tone: Direct, demanding, serious, and concise. No generic pleasantries. Call out hesitation and excuses immediately.`;

    const chatMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ];

    return await this.aiRouter.complete(chatMessages, false);
  }

  public getRealityMission(skillId?: string): RealityMission {
    return RealityModeEngine.generateMission(skillId || 'communication');
  }
}

// Preserve singleton across Next.js dev reloads
declare global {
  var __mentorServerStore: MentorServerStore | undefined;
}

export const serverStore = globalThis.__mentorServerStore || new MentorServerStore();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__mentorServerStore = serverStore;
}
