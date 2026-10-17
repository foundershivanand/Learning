import { 
  MentorProfile, 
  CompactMentorContext, 
  SkillSummary, 
  Weakness, 
  TrainingDebtSummary,
  Attempt
} from '@personal-mentor/shared';

export interface ContextEngineInput {
  profile: MentorProfile;
  skills: SkillSummary[];
  focusSkillId?: string;
  activeWeaknesses: Weakness[];
  trainingDebt: TrainingDebtSummary;
  recentAttempts: Attempt[];
  mode?: 'BRUTAL_COACH' | 'EXAMINER' | 'OPPONENT' | 'REALITY';
}

export class ContextEngine {
  /**
   * Compiles the lean, high-signal compact state for the LLM.
   * Eliminates unnecessary personal trivia while preserving performance history.
   */
  public static buildCompactContext(input: ContextEngineInput): CompactMentorContext {
    const { profile, skills, focusSkillId, activeWeaknesses, trainingDebt, recentAttempts } = input;

    // Determine focus skill: either explicitly requested, or skill with lowest overall score
    let selectedSkill = skills.find(s => s.skill.id === focusSkillId);
    if (!selectedSkill && skills.length > 0) {
      // Pick skill with lowest score
      selectedSkill = [...skills].sort((a, b) => a.overallScore - b.overallScore)[0];
    }

    const fallbackSkill = {
      skill: { id: 'communication', name: 'Communication' },
      overallScore: 50,
      overallLevel: 1,
      overallSublevel: 1,
      dimensionStates: [],
    };

    const targetSkillSummary = selectedSkill || (fallbackSkill as unknown as SkillSummary);

    // Find target dimension with lowest score
    let targetDimensionName = 'General Execution';
    let targetDimensionScore = targetSkillSummary.overallScore;

    if (targetSkillSummary.dimensionStates && targetSkillSummary.dimensionStates.length > 0) {
      const sortedDims = [...targetSkillSummary.dimensionStates].sort((a, b) => a.score - b.score);
      const lowestDimState = sortedDims[0];
      const dimDef = targetSkillSummary.skill.dimensions?.find(d => d.id === lowestDimState.dimensionId);
      targetDimensionName = dimDef?.name || lowestDimState.dimensionId;
      targetDimensionScore = lowestDimState.score;
    }

    // Find primary weakness
    const sortedWeaknesses = [...activeWeaknesses]
      .filter(w => w.status !== 'RESOLVED')
      .sort((a, b) => {
        const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity] || b.occurrenceCount - a.occurrenceCount;
      });

    const topWeakness = sortedWeaknesses[0] || null;

    // Extract recent failure patterns from attempts
    const failurePatterns: string[] = [];
    const failedAttempts = recentAttempts
      .filter(a => a.evaluation && !a.evaluation.passed)
      .slice(0, 5);

    for (const att of failedAttempts) {
      if (att.evaluation?.brutalCritique.singleBiggestWeakness) {
        failurePatterns.push(att.evaluation.brutalCritique.singleBiggestWeakness);
      }
    }

    // Calculate overall user level across all active skills
    const overallScoreAvg = skills.length > 0
      ? skills.reduce((acc, s) => acc + s.overallScore, 0) / skills.length
      : 50;
    
    // Scale 0-100 score to 1.0 - 10.0 level
    const overallLevel = parseFloat((1 + (overallScoreAvg / 100) * 9).toFixed(1));

    return {
      userName: profile.name || 'Founder',
      userGoals: profile.goals || ['Achieve excellence'],
      currentOverallLevel: overallLevel,
      focusSkill: {
        id: targetSkillSummary.skill.id,
        name: targetSkillSummary.skill.name,
        level: targetSkillSummary.overallLevel,
        sublevel: targetSkillSummary.overallSublevel,
        score: targetSkillSummary.overallScore,
        targetDimension: targetDimensionName,
        dimensionScore: targetDimensionScore,
      },
      primaryWeakness: topWeakness ? {
        dimensionName: topWeakness.dimensionName,
        description: topWeakness.description,
        severity: topWeakness.severity,
        consecutivePassesNeeded: Math.max(0, 3 - topWeakness.consecutivePasses),
      } : null,
      recentFailurePatterns: [...new Set(failurePatterns)].slice(0, 3),
      activeTrainingDebt: trainingDebt.totalActiveDebtPoints,
      currentStreakDays: input.profile ? 1 : 0,
      operatingMode: input.mode || 'BRUTAL_COACH',
    };
  }

  /**
   * Formats the compact context into a markdown block for system prompt injection.
   */
  public static toPromptString(ctx: CompactMentorContext): string {
    return `
### CURRENT USER STATE (MANDATORY OPERATIONAL CONTEXT)
- **User**: ${ctx.userName}
- **Current Overall Level**: ${ctx.currentOverallLevel} / 10.0
- **Focus Skill**: ${ctx.focusSkill.name} (Level ${ctx.focusSkill.level}.${ctx.focusSkill.sublevel}, Score: ${ctx.focusSkill.score}/100)
- **Target Dimension**: ${ctx.focusSkill.targetDimension} (Current: ${ctx.focusSkill.dimensionScore}/100)
- **Active Training Debt**: ${ctx.activeTrainingDebt} points
- **Primary Weakness**: ${ctx.primaryWeakness ? `[${ctx.primaryWeakness.severity}] ${ctx.primaryWeakness.dimensionName}: ${ctx.primaryWeakness.description} (Needs ${ctx.primaryWeakness.consecutivePassesNeeded} clean passes)` : 'None currently flagged'}
- **Recent Failure Patterns**: ${ctx.recentFailurePatterns.length > 0 ? ctx.recentFailurePatterns.join(' | ') : 'None recorded'}
- **Operating Mode**: ${ctx.operatingMode}
`.trim();
  }
}
