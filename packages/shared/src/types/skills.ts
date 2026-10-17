export type SkillCategory = 
  | 'communication'
  | 'business'
  | 'cognition'
  | 'execution'
  | 'tactics';

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  active: boolean;
  dimensions: SkillDimension[];
}

export interface SkillDimension {
  id: string;
  skillId: string;
  name: string;
  description: string;
  weight: number; // 0.1 to 2.0
  rubricCriteria: Record<string, string>; // e.g. "90-100": "Flawless...", "70-89": "Competent..."
}

export type TrendDirection = 'IMPROVING' | 'STABLE' | 'DECLINING';

export interface SkillState {
  dimensionId: string;
  skillId: string;
  level: number;       // Master level 1 to 10
  sublevel: number;    // Sublevel 1 to 10 (e.g., Level 4.7)
  score: number;       // Continuous score 0.0 to 100.0
  confidence: number;  // 0.0 to 1.0 based on sample size and recency
  trend: TrendDirection;
  recentScores: number[];
  consecutivePasses: number;
  lastAssessedAt: string | null;
}

export interface SkillSummary {
  skill: Skill;
  overallScore: number;
  overallLevel: number;
  overallSublevel: number;
  dimensionStates: SkillState[];
  primaryWeaknessDimensionId?: string;
}
