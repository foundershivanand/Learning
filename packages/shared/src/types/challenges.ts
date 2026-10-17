export type ChallengeType = 
  | 'EXPLAIN'             // Explain complex concept to specific persona under constraint
  | 'DEBATE'              // Defend a position or defend against hostile objections
  | 'ROLEPLAY'            // High-stakes scenario (sales call, negotiation, leadership feedback)
  | 'TIMED_PRESSURE'      // Rapid-fire responses under 30s-60s
  | 'CHESS_TACTIC'        // Candidate moves and tactical calculation
  | 'BLINDFOLD_CHESS'     // Blind mental board visualization and coordinate verification
  | 'REAL_WORLD_MISSION'  // Physical world action + 2-minute post-reflection
  | 'REVERSE_DEFENSE'     // Defend the polar opposite of your belief
  | 'MICRO_DRILL'         // Laser-targeted corrective drill for an exact weakness
  | 'BOSS_TRIAL';         // 90-minute multi-skill examination

export interface ChallengeRubricDimension {
  dimensionId: string;
  name: string;
  maxScore: number;
  weight: number;
  passThreshold: number;
  evalPrompt: string;
}

export interface Challenge {
  id: string;
  skillId: string;
  dimensionId: string;
  type: ChallengeType;
  title: string;
  instructions: string;
  adversaryContext?: string; // If debate or roleplay
  constraints: string[];     // E.g. ["No filler words", "Under 60 seconds", "3-point structure"]
  timeLimitSeconds: number;
  difficulty: number;        // Scaled to match target challenge difficulty (e.g. 70)
  rubric: ChallengeRubricDimension[];
  isBossChallenge: boolean;
  targetWeaknessId?: string;
  createdAt: string;
}

export interface SpeechMetrics {
  durationSeconds: number;
  wordCount: number;
  wordsPerMinute: number;
  pauseCount: number;
  fillerWordCount: number;
  detectedFillers: Record<string, number>; // e.g. {"basically": 4, "like": 6}
  fillerWordRatio: number; // fillers / total words
}

export interface DimensionEvaluation {
  dimensionId: string;
  name: string;
  score: number;           // 0 to 100
  passed: boolean;
  evidenceQuotes: string[]; // Exact quotes from user transcript or actions
  identifiedMistakes: string[];
}

export interface AttemptEvaluation {
  attemptId: string;
  challengeId: string;
  overallScore: number;    // 0 to 100
  passed: boolean;
  dimensionScores: DimensionEvaluation[];
  brutalCritique: {
    whatWorkedWell: string[];
    whatFailed: string[];
    singleBiggestWeakness: string;
    whyItMatters: string;
    correctiveDrillInstructions: string;
  };
  metrics?: SpeechMetrics;
  evaluatedAt: string;
}

export interface Attempt {
  id: string;
  challengeId: string;
  dailyPlanId?: string;
  startedAt: string;
  completedAt: string;
  responseText?: string;
  mediaUrl?: string;       // Cloudflare R2 link
  mediaType?: 'audio' | 'video' | 'text';
  evaluation?: AttemptEvaluation;
}
