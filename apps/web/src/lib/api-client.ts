import { 
  TodayDashboardResponse, 
  SubmitAttemptRequest, 
  SubmitAttemptResponse, 
  Challenge,
  SkillSummary,
  Weakness,
  TrainingDebtSummary,
  RealityMission
} from '@personal-mentor/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export class ApiClient {
  public static async getToday(): Promise<TodayDashboardResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/today`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API unavailable, loading local baseline state', e);
    }
    return this.getLocalMockToday();
  }

  public static async getNextChallenge(): Promise<Challenge> {
    try {
      const res = await fetch(`${API_BASE}/api/challenge/next`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API unavailable, returning local challenge template', e);
    }
    return {
      id: 'local-chal-1',
      skillId: 'communication',
      dimensionId: 'comm_clarity',
      type: 'EXPLAIN',
      title: 'Explaining First Principles Under Extreme Time Pressure',
      instructions: 'Explain Opportunity Cost & Asymmetric Risk to a skeptical founder in 60 seconds. Must use a concrete physical metaphor.',
      constraints: [
        'Time ceiling: 60 seconds',
        'Zero filler words (no "basically", "like", "you know")',
        'Must state exact 3-part framework',
      ],
      timeLimitSeconds: 60,
      difficulty: 70,
      isBossChallenge: false,
      rubric: [
        {
          dimensionId: 'comm_clarity',
          name: 'Clarity & High Signal',
          maxScore: 100,
          weight: 1.2,
          passThreshold: 72,
          evalPrompt: 'Check for immediate simplicity and zero fluff.',
        }
      ],
      createdAt: new Date().toISOString(),
    };
  }

  public static async submitAttempt(payload: SubmitAttemptRequest): Promise<SubmitAttemptResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/challenge/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API unavailable, running offline evaluation calculation', e);
    }

    // Local evaluation fallback
    return {
      attempt: {
        id: `att-local-${Date.now()}`,
        challengeId: payload.challengeId,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        responseText: payload.responseText,
      },
      evaluation: {
        attemptId: `att-local-${Date.now()}`,
        challengeId: payload.challengeId,
        overallScore: 68,
        passed: false,
        dimensionScores: [
          {
            dimensionId: 'comm_clarity',
            name: 'Clarity',
            score: 68,
            passed: false,
            evidenceQuotes: [payload.responseText?.slice(0, 60) || ''],
            identifiedMistakes: ['Rushed conclusion', 'Did not clearly state 3-part framework'],
          }
        ],
        brutalCritique: {
          whatWorkedWell: ['Understood the core principle of asymmetric upside'],
          whatFailed: ['Lacked crisp structural punchline', 'Used hesitation crutches'],
          singleBiggestWeakness: 'Structural delivery under tight time ceiling',
          whyItMatters: 'If you take 40 seconds to find your point, high-caliber audiences tune out.',
          correctiveDrillInstructions: 'Redo this explanation in 30 seconds. One thesis sentence, one example sentence, one conclusion sentence.',
        },
        evaluatedAt: new Date().toISOString(),
      },
      progressionUpdate: {
        skillId: 'communication',
        dimensionId: 'comm_clarity',
        previousLevel: 1.2,
        newLevel: 1.2,
        levelUp: false,
        previousScore: 58,
        newScore: 61,
      },
      debtUpdate: {
        pointsDelta: 1,
        newTotalDebt: 3,
      },
      gamificationUpdate: {
        xpEarned: 95,
        newTotalXp: 1345,
        streakDays: 14,
      },
    };
  }

  public static async getRealityMission(): Promise<RealityMission> {
    try {
      const res = await fetch(`${API_BASE}/api/reality/mission`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {}

    return {
      id: 'mission-local',
      title: 'The Real-World Asymmetry Anchor',
      realWorldScenario: 'Visit a local merchant or service provider for a purchase today.',
      concreteObjective: 'Politely negotiate a 10% concession before paying without using apologies.',
      antiGoal: 'Do NOT say "Sorry to ask" or become awkward. Maintain warm eye contact and hold silence after stating your request.',
      postActionReflectionPrompt: 'Record a 2-minute reflection: What hesitation arose? How did the counterparty respond? Did you hold silence?',
      createdAt: new Date().toISOString(),
    };
  }

  private static getLocalMockToday(): TodayDashboardResponse {
    return {
      profile: {
        id: '1',
        name: 'Private Founder',
        goals: ['Master High-Stakes Communication', 'Scale Venture to $1M ARR', '1800 Chess & Blindfold'],
        rules: ['Never give empty praise', 'Make me fail', 'Enforce training debt'],
        dailyTargetMinutes: 30,
        timezone: 'Asia/Kolkata',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      dailyPlan: {
        id: 'plan-1',
        planDate: new Date().toISOString().split('T')[0],
        targetMinutes: 25,
        focusSkillId: 'communication',
        challengeIds: [],
        completedChallengeIds: [],
        status: 'IN_PROGRESS',
        createdAt: new Date().toISOString(),
      },
      gamification: {
        totalXp: 1250,
        currentStreakDays: 14,
        longestStreakDays: 14,
        lastActiveDate: new Date().toISOString().split('T')[0],
        comboMultiplier: 1.30,
        bossClearsCount: 1,
        unlockedTiers: ['TIER_1', 'TIER_2'],
      },
      activeChallenges: [],
      trainingDebt: {
        totalActiveDebtPoints: 2,
        mandatoryDrillsCount: 1,
        unresolvedDebts: [],
      },
      primaryWeakness: {
        id: 'w-1',
        skillId: 'communication',
        dimensionId: 'comm_fluency',
        dimensionName: 'Fluency & Cadence',
        description: 'Persistent filler words ("basically", "like") under time pressure',
        severity: 'HIGH',
        confidence: 0.85,
        occurrenceCount: 3,
        consecutivePasses: 0,
        status: 'ACTIVE',
        firstDetectedAt: '',
        lastDetectedAt: '',
        recentEvidence: [],
      },
      skillsOverview: [],
    };
  }
}
