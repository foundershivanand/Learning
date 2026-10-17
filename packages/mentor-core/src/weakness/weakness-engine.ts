import { Weakness, WeaknessSeverity, WeaknessStatus, AttemptEvaluation } from '@personal-mentor/shared';

export interface WeaknessEngineResult {
  updatedWeaknesses: Weakness[];
  newlyConfirmedWeakness?: Weakness;
  resolvedWeakness?: Weakness;
  escalatedWeakness?: Weakness;
}

export class WeaknessEngine {
  /**
   * Evaluates the attempt results, identifies recurring flaws, escalates severity,
   * and tracks remediation towards full resolution.
   */
  public static processEvaluation(
    currentWeaknesses: Weakness[],
    evaluation: AttemptEvaluation,
    skillId: string
  ): WeaknessEngineResult {
    const weaknesses = [...currentWeaknesses];
    let newlyConfirmedWeakness: Weakness | undefined;
    let resolvedWeakness: Weakness | undefined;
    let escalatedWeakness: Weakness | undefined;

    // Check every evaluated dimension
    for (const dim of evaluation.dimensionScores) {
      const existingIdx = weaknesses.findIndex(w => w.dimensionId === dim.dimensionId && w.status !== 'RESOLVED');

      if (!dim.passed || dim.score < 68) {
        // Dimension failed or underperformed
        if (existingIdx >= 0) {
          const w = weaknesses[existingIdx];
          const occurrences = w.occurrenceCount + 1;
          const oldSeverity = w.severity;

          // Severity escalation ladder
          let newSeverity: WeaknessSeverity = w.severity;
          if (occurrences >= 5) newSeverity = 'CRITICAL';
          else if (occurrences >= 3) newSeverity = 'HIGH';
          else if (occurrences >= 2) newSeverity = 'MEDIUM';

          const updated: Weakness = {
            ...w,
            occurrenceCount: occurrences,
            consecutivePasses: 0, // Reset remediation streak
            severity: newSeverity,
            status: occurrences >= 2 ? 'ACTIVE' : 'POTENTIAL',
            lastDetectedAt: new Date().toISOString(),
            recentEvidence: [
              ...(dim.evidenceQuotes || []),
              ...(dim.identifiedMistakes || []),
            ].slice(0, 5),
          };

          weaknesses[existingIdx] = updated;

          if (oldSeverity !== newSeverity) {
            escalatedWeakness = updated;
          }
        } else {
          // New weakness detected
          const newW: Weakness = {
            id: `weak-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            skillId,
            dimensionId: dim.dimensionId,
            dimensionName: dim.name,
            description: evaluation.brutalCritique.singleBiggestWeakness || `Chronic deficiency in ${dim.name}`,
            severity: 'LOW',
            confidence: 0.60,
            occurrenceCount: 1,
            consecutivePasses: 0,
            status: 'POTENTIAL',
            firstDetectedAt: new Date().toISOString(),
            lastDetectedAt: new Date().toISOString(),
            recentEvidence: [
              ...(dim.evidenceQuotes || []),
              ...(dim.identifiedMistakes || []),
            ].slice(0, 5),
          };

          weaknesses.push(newW);
          newlyConfirmedWeakness = newW;
        }
      } else {
        // Dimension passed! Check if this helps resolve an active weakness
        if (existingIdx >= 0) {
          const w = weaknesses[existingIdx];
          const passes = w.consecutivePasses + 1;

          if (passes >= 3) {
            // RESOLVED! 3 consecutive clean passes
            const resolved: Weakness = {
              ...w,
              consecutivePasses: passes,
              status: 'RESOLVED',
              lastDetectedAt: new Date().toISOString(),
            };
            weaknesses[existingIdx] = resolved;
            resolvedWeakness = resolved;
          } else {
            // Remediation in progress
            weaknesses[existingIdx] = {
              ...w,
              consecutivePasses: passes,
              status: 'DRILLING',
            };
          }
        }
      }
    }

    return {
      updatedWeaknesses: weaknesses,
      newlyConfirmedWeakness,
      resolvedWeakness,
      escalatedWeakness,
    };
  }
}
