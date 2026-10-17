import { GamificationState } from '@personal-mentor/shared';

export interface XpAwardDetails {
  baseXp: number;
  passBonus: number;
  difficultyBonus: number;
  comboBonus: number;
  totalAwarded: number;
}

export class GamificationEngine {
  /**
   * Computes earned XP for a challenge attempt.
   */
  public static calculateXp(
    difficulty: number,
    passed: boolean,
    currentComboMultiplier: number,
    isCorrectiveDrill = false
  ): XpAwardDetails {
    const baseXp = 40;
    const passBonus = passed ? 80 : 0;
    const difficultyBonus = Math.round(difficulty * 0.8);
    const drillBonus = isCorrectiveDrill && passed ? 60 : 0;

    const preMultiplier = baseXp + passBonus + difficultyBonus + drillBonus;
    const totalAwarded = Math.round(preMultiplier * (passed ? currentComboMultiplier : 1.0));

    return {
      baseXp,
      passBonus,
      difficultyBonus,
      comboBonus: totalAwarded - preMultiplier,
      totalAwarded,
    };
  }

  /**
   * Updates streak and combo multiplier based on completion date.
   */
  public static updateStreakAndCombos(
    currentState: GamificationState,
    todayIsoDate: string, // YYYY-MM-DD
    passed: boolean
  ): GamificationState {
    const lastDate = currentState.lastActiveDate;
    let newStreak = currentState.currentStreakDays;
    let newMultiplier = currentState.comboMultiplier;

    if (!lastDate) {
      newStreak = 1;
    } else {
      const last = new Date(lastDate);
      const today = new Date(todayIsoDate);
      const diffTime = today.getTime() - last.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

      if (diffDays === 1) {
        // Consecutive day
        newStreak += 1;
      } else if (diffDays === 0) {
        // Same day, streak intact
      } else {
        // Streak broken
        newStreak = 1;
      }
    }

    // Combo multiplier logic
    if (passed) {
      newMultiplier = parseFloat(Math.min(2.5, newMultiplier + 0.15).toFixed(2));
    } else {
      newMultiplier = 1.0; // Reset combo on failure
    }

    const longestStreak = Math.max(currentState.longestStreakDays, newStreak);

    return {
      ...currentState,
      currentStreakDays: newStreak,
      longestStreakDays: longestStreak,
      lastActiveDate: todayIsoDate,
      comboMultiplier: newMultiplier,
    };
  }
}
