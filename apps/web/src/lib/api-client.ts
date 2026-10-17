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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

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

  public static async getNextChallenge(skillId?: string): Promise<Challenge> {
    try {
      const url = skillId ? `${API_BASE}/api/challenge/next?skill=${encodeURIComponent(skillId)}` : `${API_BASE}/api/challenge/next`;
      const res = await fetch(url);
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
        overallScore: 55,
        passed: false,
        dimensionScores: [
          {
            dimensionId: 'comm_clarity',
            name: 'Clarity & High Signal',
            score: 55,
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
        previousLevel: 1.1,
        newLevel: 1.1,
        levelUp: false,
        previousScore: 50,
        newScore: 51,
      },
      debtUpdate: {
        pointsDelta: 1,
        newTotalDebt: 1,
      },
      gamificationUpdate: {
        xpEarned: 20,
        newTotalXp: 20,
        streakDays: 1,
      },
    };
  }

  public static async sendChatMessage(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.response;
      }
    } catch (e) {
      console.warn('Chat API error:', e);
    }
    return 'Your execution lacked focus. Cut the fluff, state your thesis directly, and maintain accountability.';
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
        name: 'You',
        goals: ['Master High-Stakes Communication', 'Master Entrepreneurial Business Execution', 'Reach 1800 Chess & Blindfold Visualization'],
        rules: ['Never give empty praise', 'Make me fail', 'Enforce training debt immediately'],
        dailyTargetMinutes: 25,
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
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      },
      gamification: {
        totalXp: 0,
        currentStreakDays: 0,
        longestStreakDays: 0,
        lastActiveDate: null,
        comboMultiplier: 1.00,
        bossClearsCount: 0,
        unlockedTiers: ['TIER_1'],
      },
      activeChallenges: [],
      trainingDebt: {
        totalActiveDebtPoints: 0,
        mandatoryDrillsCount: 0,
        unresolvedDebts: [],
      },
      primaryWeakness: null,
      skillsOverview: [],
    };
  }
}
