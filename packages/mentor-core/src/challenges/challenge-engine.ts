import { 
  Challenge, 
  ChallengeType, 
  SkillSummary, 
  Weakness, 
  CompactMentorContext 
} from '@personal-mentor/shared';

export interface ChallengeSelectionParams {
  skills: SkillSummary[];
  weaknesses: Weakness[];
  trainingDebtPoints: number;
  recentAttemptsCount: number;
}

export class ChallengeEngine {
  /**
   * Calculates priority ranking for which dimension/weakness to target next.
   */
  public static calculateTargetPriority(params: ChallengeSelectionParams): {
    skillId: string;
    dimensionId: string;
    targetDifficulty: number;
    targetWeakness?: Weakness;
  } {
    const { skills, weaknesses, trainingDebtPoints } = params;

    // Severity weighting map
    const severityWeight: Record<string, number> = {
      CRITICAL: 4.0,
      HIGH: 3.0,
      MEDIUM: 2.0,
      LOW: 1.0,
    };

    // If there is an active weakness, calculate score
    let highestPriorityWeakness: Weakness | undefined;
    let maxPriorityScore = -1;

    for (const w of weaknesses.filter(item => item.status !== 'RESOLVED')) {
      const baseSeverity = severityWeight[w.severity] || 1.0;
      const occurrenceFactor = Math.min(5, w.occurrenceCount);
      const score = baseSeverity * occurrenceFactor * (w.status === 'DRILLING' ? 1.5 : 1.0);

      if (score > maxPriorityScore) {
        maxPriorityScore = score;
        highestPriorityWeakness = w;
      }
    }

    if (highestPriorityWeakness) {
      // Find current score for that dimension
      let currentScore = 50;
      for (const s of skills) {
        const dState = s.dimensionStates.find(d => d.dimensionId === highestPriorityWeakness!.dimensionId);
        if (dState) {
          currentScore = dState.score;
          break;
        }
      }

      // Target difficulty formula: current_score + challenge_margin (+6 to +12)
      const margin = trainingDebtPoints > 3 ? 5 : 8; // If high debt, drill at slightly tighter threshold
      const targetDifficulty = Math.min(95, Math.max(30, Math.round(currentScore + margin)));

      return {
        skillId: highestPriorityWeakness.skillId,
        dimensionId: highestPriorityWeakness.dimensionId,
        targetDifficulty,
        targetWeakness: highestPriorityWeakness,
      };
    }

    // Default fallback: find the skill and dimension with lowest score
    let lowestScore = 999;
    let selectedSkillId = skills[0]?.skill.id || 'communication';
    let selectedDimId = skills[0]?.skill.dimensions[0]?.id || 'comm_clarity';

    for (const s of skills) {
      for (const ds of s.dimensionStates) {
        if (ds.score < lowestScore) {
          lowestScore = ds.score;
          selectedSkillId = s.skill.id;
          selectedDimId = ds.dimensionId;
        }
      }
    }

    return {
      skillId: selectedSkillId,
      dimensionId: selectedDimId,
      targetDifficulty: Math.min(95, Math.max(35, Math.round((lowestScore === 999 ? 50 : lowestScore) + 8))),
    };
  }

  /**
   * Generates offline/deterministic challenge when LLM is unavailable or for instant starter workouts.
   */
  public static generateTemplateChallenge(
    skillId: string, 
    dimensionId: string, 
    difficulty: number,
    targetWeakness?: Weakness
  ): Challenge {
    const id = `chal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Archetype matching based on skill
    if (skillId === 'chess') {
      return {
        id,
        skillId,
        dimensionId,
        type: 'CHESS_TACTIC',
        title: 'Forcing Tactic Calculation under Time Limit',
        instructions: 'Calculate the forced winning continuation in a complex tactical middlegame position. You have 60 seconds.',
        constraints: [
          'State all candidate moves before choosing',
          'Calculate full variation up to peaceful position',
          'Must complete within 60 seconds',
        ],
        timeLimitSeconds: 60,
        difficulty,
        isBossChallenge: false,
        targetWeaknessId: targetWeakness?.id,
        rubric: [
          {
            dimensionId,
            name: 'Tactical Depth & Precision',
            maxScore: 100,
            weight: 1.0,
            passThreshold: 75,
            evalPrompt: 'Evaluate candidate move pruning, calculation accuracy, and blunder avoidance.',
          }
        ],
        createdAt: new Date().toISOString(),
      };
    }

    if (skillId === 'entrepreneurship' || skillId === 'sales' || skillId === 'negotiation') {
      return {
        id,
        skillId,
        dimensionId,
        type: 'ROLEPLAY',
        title: 'Adversarial Commercial Sparring',
        instructions: 'A potential client or counterparty pushes back with hostility: "Your price is triple your competitor and your timeline is completely unacceptable. Give me a 50% discount right now or we walk."',
        adversaryContext: 'Hostile C-Suite buyer using aggressive deadline pressure and competitive anchors.',
        constraints: [
          'Do NOT offer a unilateral discount or apologize',
          'Ask one calibrated diagnostic question',
          'Reframe around total risk of failure',
          'Time limit: 90 seconds',
        ],
        timeLimitSeconds: 90,
        difficulty,
        isBossChallenge: false,
        targetWeaknessId: targetWeakness?.id,
        rubric: [
          {
            dimensionId,
            name: 'Consultative Leverage & Emotional Control',
            maxScore: 100,
            weight: 1.0,
            passThreshold: 70,
            evalPrompt: 'Check if user maintained composure, refused unilateral concessions, and reframed value.',
          }
        ],
        createdAt: new Date().toISOString(),
      };
    }

    // Default communication challenge
    return {
      id,
      skillId: 'communication',
      dimensionId: 'comm_clarity',
      type: 'EXPLAIN',
      title: 'Synthesizing Complexity Under Extreme Time Pressure',
      instructions: 'Explain the concept of "Opportunity Cost & Asymmetric Risk" to an impatient investor who has never taken a finance course.',
      constraints: [
        'Time ceiling: 60 seconds',
        'Zero jargon (banned words: "beta", "variance", "macroeconomic", "arbitrage")',
        'Must follow strict 3-part structure: Hook -> Concrete Real-World Example -> Punchline Principle',
      ],
      timeLimitSeconds: 60,
      difficulty,
      isBossChallenge: false,
      targetWeaknessId: targetWeakness?.id,
      rubric: [
        {
          dimensionId: 'comm_clarity',
          name: 'Clarity & High Signal',
          maxScore: 100,
          weight: 1.2,
          passThreshold: 75,
          evalPrompt: 'Check for immediate simplicity, zero filler words, and tight structural cohesion.',
        }
      ],
      createdAt: new Date().toISOString(),
    };
  }
}
