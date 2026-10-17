import { SkillSummary } from './skills';
import { Weakness } from './weakness';
import { TrainingDebtSummary } from './weakness';
import { GamificationState, DailyPlan } from './gamification';

export interface MentorProfile {
  id: string;
  name: string;
  goals: string[];
  rules: string[];
  dailyTargetMinutes: number;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * The compact, token-efficient state payload that Context Engine generates.
 * Never dumps raw full history; gives the LLM exact actionable coordinates.
 */
export interface CompactMentorContext {
  userName: string;
  userGoals: string[];
  currentOverallLevel: number; // e.g. 4.7
  focusSkill: {
    id: string;
    name: string;
    level: number;
    sublevel: number;
    score: number;
    targetDimension: string;
    dimensionScore: number;
  };
  primaryWeakness: {
    dimensionName: string;
    description: string;
    severity: string;
    consecutivePassesNeeded: number;
  } | null;
  recentFailurePatterns: string[];
  activeTrainingDebt: number;
  currentStreakDays: number;
  operatingMode: 'BRUTAL_COACH' | 'EXAMINER' | 'OPPONENT' | 'REALITY';
}

export interface RealityMission {
  id: string;
  title: string;
  realWorldScenario: string;
  concreteObjective: string;
  antiGoal: string; // What not to do (e.g., "Do not turn this into an interview")
  postActionReflectionPrompt: string;
  createdAt: string;
}

export interface DailyBriefing {
  planDate: string;
  totalPlannedMinutes: number;
  focusSkillName: string;
  priorityWeaknessName?: string;
  trainingDebtPoints: number;
  streakDays: number;
  telegramMessageText: string;
}
