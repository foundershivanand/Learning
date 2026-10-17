import { 
  TrainingDebtItem, 
  TrainingDebtSummary, 
  DebtReason 
} from '@personal-mentor/shared';

export class TrainingDebtEngine {
  /**
   * Calculates the current active debt summary and mandatory drill obligations.
   */
  public static calculateSummary(debtItems: TrainingDebtItem[]): TrainingDebtSummary {
    const activeDebts = debtItems.filter(d => !d.resolvedAt);
    const totalPoints = activeDebts.reduce((acc, d) => acc + d.points, 0);

    // Each 2 points of debt generates 1 mandatory corrective micro-drill
    const mandatoryDrillsCount = Math.max(0, Math.ceil(totalPoints / 2));

    // Find the weakness most heavily represented in debt
    const weaknessCounts: Record<string, number> = {};
    for (const d of activeDebts) {
      if (d.weaknessId) {
        weaknessCounts[d.weaknessId] = (weaknessCounts[d.weaknessId] || 0) + d.points;
      }
    }

    let highRiskWeaknessId: string | undefined;
    let maxDebt = 0;
    for (const [wId, pts] of Object.entries(weaknessCounts)) {
      if (pts > maxDebt) {
        maxDebt = pts;
        highRiskWeaknessId = wId;
      }
    }

    return {
      totalActiveDebtPoints: totalPoints,
      mandatoryDrillsCount,
      unresolvedDebts: activeDebts,
      highRiskWeaknessId,
    };
  }

  /**
   * Adds new training debt item based on failure or avoidance.
   */
  public static accrueDebt(
    existingDebts: TrainingDebtItem[],
    reason: DebtReason,
    description: string,
    weaknessId?: string,
    dimensionId?: string
  ): { updatedDebts: TrainingDebtItem[]; addedPoints: number } {
    const pointsMap: Record<DebtReason, number> = {
      MISSED_SESSION: 1,
      FAILED_CHALLENGE: 1,
      REPEATED_FAILURE: 2,
      SKIPPED_DRILL: 3,
      AVOIDED_WEAKNESS: 4,
    };

    const points = pointsMap[reason] || 1;
    const newItem: TrainingDebtItem = {
      id: `debt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      weaknessId,
      dimensionId,
      points,
      reason,
      description,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };

    return {
      updatedDebts: [...existingDebts, newItem],
      addedPoints: points,
    };
  }

  /**
   * Clears debt points upon successful completion of a corrective drill.
   */
  public static clearDebt(
    existingDebts: TrainingDebtItem[],
    pointsToClear: number
  ): { updatedDebts: TrainingDebtItem[]; clearedPoints: number } {
    let remainingToClear = pointsToClear;
    let cleared = 0;

    const updated = existingDebts.map(d => {
      if (!d.resolvedAt && remainingToClear > 0) {
        cleared += d.points;
        remainingToClear -= d.points;
        return {
          ...d,
          resolvedAt: new Date().toISOString(),
        };
      }
      return d;
    });

    return {
      updatedDebts: updated,
      clearedPoints: cleared,
    };
  }
}
