export interface GamificationState {
  totalXp: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate: string | null;
  comboMultiplier: number; // 1.0x to 2.5x based on consecutive daily pass rate
  bossClearsCount: number;
  unlockedTiers: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  category: 'STREAK' | 'DEBT_CLEARANCE' | 'MASTERY' | 'BOSS' | 'REALITY';
  conditionType: string;
  conditionValue: number;
  unlockedAt: string | null;
}

export interface DailyPlan {
  id: string;
  planDate: string; // YYYY-MM-DD
  targetMinutes: number;
  focusSkillId: string;
  priorityWeaknessId?: string;
  challengeIds: string[];
  completedChallengeIds: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';
  overallScore?: number;
  createdAt: string;
}
