export type WeaknessSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type WeaknessStatus = 'POTENTIAL' | 'ACTIVE' | 'DRILLING' | 'RESOLVED';

export interface Weakness {
  id: string;
  skillId: string;
  dimensionId: string;
  dimensionName: string;
  description: string;
  severity: WeaknessSeverity;
  confidence: number;       // 0.0 to 1.0
  occurrenceCount: number;
  consecutivePasses: number; // 3 required to transition to RESOLVED
  status: WeaknessStatus;
  firstDetectedAt: string;
  lastDetectedAt: string;
  recentEvidence: string[];
}

export type DebtReason = 
  | 'MISSED_SESSION'        // +1 debt
  | 'FAILED_CHALLENGE'      // +1 debt
  | 'REPEATED_FAILURE'      // +2 debt
  | 'SKIPPED_DRILL'         // +3 debt
  | 'AVOIDED_WEAKNESS';     // +4 debt

export interface TrainingDebtItem {
  id: string;
  weaknessId?: string;
  targetWeaknessId?: string;
  dimensionId?: string;
  points: number;
  reason: DebtReason;
  description: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface TrainingDebtSummary {
  totalActiveDebtPoints: number;
  mandatoryDrillsCount: number;
  unresolvedDebts: TrainingDebtItem[];
  highRiskWeaknessId?: string;
}
