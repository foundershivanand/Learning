import { SkillSummary } from './skills.js';
import { Challenge, Attempt, AttemptEvaluation } from './challenges.js';
import { Weakness, TrainingDebtSummary } from './weakness.js';
import { GamificationState, DailyPlan } from './gamification.js';
import { MentorProfile, RealityMission } from './mentor.js';

export interface TodayDashboardResponse {
  profile: MentorProfile;
  dailyPlan: DailyPlan;
  gamification: GamificationState;
  activeChallenges: Challenge[];
  trainingDebt: TrainingDebtSummary;
  primaryWeakness: Weakness | null;
  skillsOverview: SkillSummary[];
}

export interface SubmitAttemptRequest {
  challengeId: string;
  responseText?: string;
  mediaUrl?: string;
  mediaType?: 'audio' | 'video' | 'text';
  audioDurationSeconds?: number;
}

export interface SubmitAttemptResponse {
  attempt: Attempt;
  evaluation: AttemptEvaluation;
  progressionUpdate: {
    skillId: string;
    dimensionId: string;
    previousLevel: number;
    newLevel: number;
    levelUp: boolean;
    previousScore: number;
    newScore: number;
  };
  debtUpdate: {
    pointsDelta: number;
    newTotalDebt: number;
  };
  gamificationUpdate: {
    xpEarned: number;
    newTotalXp: number;
    streakDays: number;
  };
}

export interface TelegramWebhookPayload {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text?: string;
    voice?: {
      file_id: string;
      duration: number;
      mime_type?: string;
      file_size?: number;
    };
    video_note?: {
      file_id: string;
      duration: number;
      file_size?: number;
    };
    caption?: string;
  };
}
