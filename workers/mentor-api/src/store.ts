import { 
  MentorProfile, 
  SkillSummary, 
  SkillState, 
  Weakness, 
  TrainingDebtItem, 
  GamificationState, 
  DailyPlan, 
  Challenge, 
  Attempt 
} from '@personal-mentor/shared';
import { ALL_SKILLS } from '@personal-mentor/skills';

export class MentorStore {
  public profile: MentorProfile;
  public skillStates: Map<string, SkillState> = new Map();
  public weaknesses: Weakness[] = [];
  public debts: TrainingDebtItem[] = [];
  public gamification: GamificationState;
  public challenges: Map<string, Challenge> = new Map();
  public attempts: Attempt[] = [];
  public dailyPlans: Map<string, DailyPlan> = new Map();

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

    this.gamification = {
      totalXp: 0,
      currentStreakDays: 0,
      longestStreakDays: 0,
      lastActiveDate: null,
      comboMultiplier: 1.00,
      bossClearsCount: 0,
      unlockedTiers: ['TIER_1'],
    };

    // Initialize all 15 skills to Level 1.1 baseline
    this.initializeDefaultSkills();
    this.initializeStarterChallenges();
  }

  private initializeDefaultSkills() {
    for (const skill of ALL_SKILLS) {
      for (const dim of skill.dimensions) {
        // True baseline state: Level 1.1, Untested
        this.skillStates.set(dim.id, {
          dimensionId: dim.id,
          skillId: skill.id,
          level: 1,
          sublevel: 1,
          score: 50.0,
          confidence: 0.20,
          trend: 'STABLE',
          recentScores: [],
          consecutivePasses: 0,
          lastAssessedAt: null,
        });
      }
    }

    // Zero fake weaknesses: weaknesses will only be detected from user's actual attempts
    this.weaknesses = [];

    // Zero fake debt: debt is accrued when user fails or misses challenges
    this.debts = [];
  }

  private initializeStarterChallenges() {
    const starterChallenges: Challenge[] = [
      {
        id: 'chal-starter-comm-1',
        skillId: 'communication',
        dimensionId: 'comm_clarity',
        type: 'EXPLAIN',
        title: 'Explain Quantum Superposition in 60 Seconds',
        instructions: 'Explain quantum superposition to a 12-year-old using a concrete physical metaphor. You have exactly 60 seconds.',
        constraints: [
          'Ceiling: 60 seconds',
          'Zero technical jargon (banned words: "qubit", "wavefunction", "vector", "state")',
          'Must use an everyday object metaphor (e.g. coin, spinning top)',
        ],
        timeLimitSeconds: 60,
        difficulty: 68,
        isBossChallenge: false,
        rubric: [
          {
            dimensionId: 'comm_clarity',
            name: 'Simplicity & Precision',
            maxScore: 100,
            weight: 1.2,
            passThreshold: 70,
            evalPrompt: 'Did user clearly explain the concept without technical crutches?',
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
        instructions: 'A prospect says: "We already have an internal tool for this that our IT team built 3 years ago. Why would we pay you?"',
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
        instructions: 'White initiates Bxh7+ Kxh7 Ng5+ Kg8 Qh5. State Black\'s only defensive try and White\'s forced checkmating continuation.',
        constraints: [
          'State exact algebraic notation for all 4 moves',
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

    for (const c of starterChallenges) {
      this.challenges.set(c.id, c);
    }
  }

  public getSkillsOverview(): SkillSummary[] {
    return ALL_SKILLS.map(skill => {
      const dimensionStates = skill.dimensions.map(d => {
        return this.skillStates.get(d.id) || {
          dimensionId: d.id,
          skillId: skill.id,
          level: 1,
          sublevel: 1,
          score: 50.0,
          confidence: 0.5,
          trend: 'STABLE',
          recentScores: [50],
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
}

// Global store singleton for Cloudflare Worker runtime
export const globalStore = new MentorStore();
