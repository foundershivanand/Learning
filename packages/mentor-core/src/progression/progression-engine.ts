import { SkillState, TrendDirection } from '@personal-mentor/shared';

export interface ProgressionResult {
  updatedState: SkillState;
  levelChanged: boolean;
  previousLevelString: string;
  newLevelString: string;
  feedbackMessage: string;
}

export class ProgressionEngine {
  /**
   * Deterministically calculates updated skill state, level, and sublevel.
   * Enforces the rule: "You cannot level up because you got lucky once."
   */
  public static updateProgression(
    currentState: SkillState,
    newAttemptScore: number,
    passed: boolean
  ): ProgressionResult {
    const prevLevel = currentState.level;
    const prevSublevel = currentState.sublevel;
    const prevLevelString = `${prevLevel}.${prevSublevel}`;

    // Update recent scores window (keep last 5 scores)
    const recentScores = [...(currentState.recentScores || []), newAttemptScore].slice(-5);

    // Calculate rolling weighted score (exponential moving average: 70% current, 30% new)
    const updatedScore = parseFloat((currentState.score * 0.70 + newAttemptScore * 0.30).toFixed(2));

    // Update consecutive passes counter
    const consecutivePasses = passed ? currentState.consecutivePasses + 1 : 0;

    // Trend calculation
    let trend: TrendDirection = 'STABLE';
    if (recentScores.length >= 3) {
      const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      if (avgRecent > currentState.score + 2) trend = 'IMPROVING';
      else if (avgRecent < currentState.score - 2) trend = 'DECLINING';
    }

    // Confidence calculation (scales with number of samples, up to 0.95)
    const confidence = parseFloat(Math.min(0.95, 0.40 + recentScores.length * 0.11).toFixed(2));

    let newLevel = prevLevel;
    let newSublevel = prevSublevel;
    let levelChanged = false;
    let feedbackMessage = '';

    // ADVANCEMENT RULE:
    // Requires at least 3 consecutive clean passes AND score >= 72
    if (consecutivePasses >= 3 && updatedScore >= 72) {
      if (newSublevel < 10) {
        newSublevel += 1;
        levelChanged = true;
        feedbackMessage = `Sub-level upgraded to ${newLevel}.${newSublevel} after ${consecutivePasses} consecutive proven completions.`;
      } else if (newLevel < 10) {
        newLevel += 1;
        newSublevel = 1;
        levelChanged = true;
        feedbackMessage = `MASTER LEVEL UNLOCKED: Level ${newLevel}.1 achieved!`;
      }
    } else if (!passed && recentScores.filter(s => s < 60).length >= 3) {
      // REGRESSION / STAGNATION WARNING:
      feedbackMessage = `Performance boundary reached at Level ${newLevel}.${newSublevel}. Diagnostic drills scheduled.`;
    } else {
      feedbackMessage = passed 
        ? `Pass recorded (${consecutivePasses}/3 needed for next sub-level).`
        : `Attempt failed. Consecutive pass streak reset to 0.`;
    }

    const updatedState: SkillState = {
      ...currentState,
      score: updatedScore,
      level: newLevel,
      sublevel: newSublevel,
      confidence,
      trend,
      recentScores,
      consecutivePasses,
      lastAssessedAt: new Date().toISOString(),
    };

    return {
      updatedState,
      levelChanged,
      previousLevelString: prevLevelString,
      newLevelString: `${newLevel}.${newSublevel}`,
      feedbackMessage,
    };
  }
}
