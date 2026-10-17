import { createClient, Client } from '@libsql/client/web';
import { 
  MentorProfile, 
  SkillSummary, 
  SkillState, 
  Weakness, 
  TrainingDebtItem, 
  GamificationState, 
  DailyPlan, 
  Challenge, 
  Attempt 
} from '@personal-mentor/shared';
import { ALL_SKILLS } from '@personal-mentor/skills';

export class TursoMentorStore {
  private client: Client;

  constructor(url: string, authToken?: string) {
    this.client = createClient({
      url,
      authToken,
    });
  }

  public async getProfile(): Promise<MentorProfile> {
    try {
      const res = await this.client.execute('SELECT * FROM profile LIMIT 1');
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: String(row.id),
          name: String(row.name),
          goals: JSON.parse(String(row.goals || '[]')),
          rules: JSON.parse(String(row.rules || '[]')),
          dailyTargetMinutes: Number(row.daily_target_minutes || 25),
          timezone: String(row.timezone || 'Asia/Kolkata'),
          createdAt: String(row.created_at),
          updatedAt: String(row.updated_at),
        };
      }
    } catch (e) {
      console.warn('Error fetching profile from Turso:', e);
    }

    return {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Shivanand',
      goals: [
        'Master High-Stakes Communication & Articulation',
        'Master Entrepreneurial Business Execution',
        'Reach 1800 Chess & Blindfold Visualization',
      ],
      rules: [
        'Never give empty praise',
        'Make me fail',
        'Enforce training debt immediately',
      ],
      dailyTargetMinutes: 25,
      timezone: 'Asia/Kolkata',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  public async getSkillsOverview(): Promise<SkillSummary[]> {
    const stateMap = new Map<string, SkillState>();
    try {
      const res = await this.client.execute('SELECT * FROM skill_state');
      for (const row of res.rows) {
        stateMap.set(String(row.dimension_id), {
          dimensionId: String(row.dimension_id),
          skillId: String(row.skill_id),
          level: Number(row.level),
          sublevel: Number(row.sublevel),
          score: Number(row.score),
          confidence: Number(row.confidence),
          trend: (row.trend as any) || 'STABLE',
          recentScores: JSON.parse(String(row.recent_scores || '[]')),
          consecutivePasses: Number(row.consecutive_passes || 0),
          lastAssessedAt: row.last_assessed_at ? String(row.last_assessed_at) : null,
        });
      }
    } catch (e) {
      console.warn('Error fetching skill_state from Turso:', e);
    }

    return ALL_SKILLS.map(skill => {
      const dimensionStates: SkillState[] = skill.dimensions.map(d => {
        return stateMap.get(d.id) || {
          dimensionId: d.id,
          skillId: skill.id,
          level: 1,
          sublevel: 1,
          score: 50.0,
          confidence: 0.20,
          trend: 'STABLE' as const,
          recentScores: [],
          consecutivePasses: 0,
          lastAssessedAt: null,
        };
      });

      const avgScore = dimensionStates.reduce((acc, d) => acc + d.score, 0) / Math.max(1, dimensionStates.length);
      const avgLevel = Math.max(1, Math.round(dimensionStates.reduce((acc, d) => acc + d.level, 0) / Math.max(1, dimensionStates.length)));
      const avgSublevel = Math.max(1, Math.round(dimensionStates.reduce((acc, d) => acc + d.sublevel, 0) / Math.max(1, dimensionStates.length)));

      return {
        skill,
        overallScore: Math.round(avgScore),
        overallLevel: avgLevel,
        overallSublevel: avgSublevel,
        dimensionStates,
      };
    });
  }

  public async getSkillState(dimensionId: string, skillId: string): Promise<SkillState> {
    try {
      const res = await this.client.execute({
        sql: 'SELECT * FROM skill_state WHERE dimension_id = ?',
        args: [dimensionId],
      });
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          dimensionId: String(row.dimension_id),
          skillId: String(row.skill_id),
          level: Number(row.level),
          sublevel: Number(row.sublevel),
          score: Number(row.score),
          confidence: Number(row.confidence),
          trend: (row.trend as any) || 'STABLE',
          recentScores: JSON.parse(String(row.recent_scores || '[]')),
          consecutivePasses: Number(row.consecutive_passes || 0),
          lastAssessedAt: row.last_assessed_at ? String(row.last_assessed_at) : null,
        };
      }
    } catch (e) {
      console.warn('Error fetching single skill_state:', e);
    }

    return {
      dimensionId,
      skillId,
      level: 1,
      sublevel: 1,
      score: 50.0,
      confidence: 0.20,
      trend: 'STABLE' as const,
      recentScores: [],
      consecutivePasses: 0,
      lastAssessedAt: null,
    };
  }

  public async updateSkillState(state: SkillState): Promise<void> {
    try {
      const now = new Date().toISOString();
      await this.client.execute({
        sql: `INSERT OR REPLACE INTO skill_state 
              (dimension_id, skill_id, level, sublevel, score, confidence, trend, recent_scores, consecutive_passes, last_assessed_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          state.dimensionId,
          state.skillId,
          state.level,
          state.sublevel,
          state.score,
          state.confidence,
          state.trend,
          JSON.stringify(state.recentScores || []),
          state.consecutivePasses,
          state.lastAssessedAt,
          now,
        ],
      });
    } catch (e) {
      console.error('Failed to update skill_state in Turso:', e);
    }
  }

  public async getWeaknesses(): Promise<Weakness[]> {
    try {
      const res = await this.client.execute('SELECT * FROM weaknesses ORDER BY last_detected_at DESC');
      return res.rows.map(row => ({
        id: String(row.id),
        skillId: String(row.skill_id),
        dimensionId: String(row.dimension_id),
        dimensionName: String(row.dimension_name),
        description: String(row.description),
        severity: (row.severity as any) || 'LOW',
        status: (row.status as any) || 'POTENTIAL',
        confidence: Number(row.confidence || 0.5),
        occurrenceCount: Number(row.occurrence_count || 1),
        consecutivePasses: Number(row.consecutive_passes || 0),
        firstDetectedAt: String(row.first_detected_at),
        lastDetectedAt: String(row.last_detected_at),
        recentEvidence: JSON.parse(String(row.recent_evidence || '[]')),
      }));
    } catch (e) {
      console.warn('Error fetching weaknesses from Turso:', e);
      return [];
    }
  }

  public async upsertWeaknesses(weaknesses: Weakness[]): Promise<void> {
    for (const w of weaknesses) {
      try {
        await this.client.execute({
          sql: `INSERT OR REPLACE INTO weaknesses
                (id, skill_id, dimension_id, dimension_name, description, severity, status, confidence, occurrence_count, consecutive_passes, first_detected_at, last_detected_at, recent_evidence)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            w.id,
            w.skillId,
            w.dimensionId,
            w.dimensionName,
            w.description,
            w.severity,
            w.status,
            w.confidence,
            w.occurrenceCount,
            w.consecutivePasses,
            w.firstDetectedAt,
            w.lastDetectedAt,
            JSON.stringify(w.recentEvidence || []),
          ],
        });
      } catch (e) {
        console.error('Failed to upsert weakness in Turso:', e);
      }
    }
  }

  public async getDebts(): Promise<TrainingDebtItem[]> {
    try {
      const res = await this.client.execute('SELECT * FROM training_debt WHERE resolved_at IS NULL ORDER BY created_at DESC');
      return res.rows.map(row => ({
        id: String(row.id),
        dimensionId: row.dimension_id ? String(row.dimension_id) : undefined,
        points: Number(row.points),
        reason: (row.reason as any) || 'FAILED_CHALLENGE',
        description: String(row.description),
        targetWeaknessId: row.target_weakness_id ? String(row.target_weakness_id) : undefined,
        createdAt: String(row.created_at),
        resolvedAt: row.resolved_at ? String(row.resolved_at) : null,
      }));
    } catch (e) {
      console.warn('Error fetching debts from Turso:', e);
      return [];
    }
  }

  public async upsertDebts(debts: TrainingDebtItem[]): Promise<void> {
    for (const d of debts) {
      try {
        await this.client.execute({
          sql: `INSERT OR REPLACE INTO training_debt
                (id, dimension_id, points, reason, description, target_weakness_id, created_at, resolved_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            d.id,
            d.dimensionId || null,
            d.points,
            d.reason,
            d.description,
            d.targetWeaknessId || null,
            d.createdAt,
            d.resolvedAt || null,
          ],
        });
      } catch (e) {
        console.error('Failed to upsert debt in Turso:', e);
      }
    }
  }

  public async getGamification(): Promise<GamificationState> {
    try {
      const res = await this.client.execute('SELECT * FROM gamification WHERE id = ?', ['main']);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          totalXp: Number(row.total_xp || 0),
          currentStreakDays: Number(row.current_streak_days || 0),
          longestStreakDays: Number(row.longest_streak_days || 0),
          lastActiveDate: row.last_active_date ? String(row.last_active_date) : null,
          comboMultiplier: Number(row.combo_multiplier || 1.0),
          bossClearsCount: Number(row.boss_clears_count || 0),
          unlockedTiers: JSON.parse(String(row.unlocked_tiers || '["TIER_1"]')),
        };
      }
    } catch (e) {
      console.warn('Error fetching gamification from Turso:', e);
    }

    return {
      totalXp: 0,
      currentStreakDays: 0,
      longestStreakDays: 0,
      lastActiveDate: null,
      comboMultiplier: 1.0,
      bossClearsCount: 0,
      unlockedTiers: ['TIER_1'],
    };
  }

  public async updateGamification(g: GamificationState): Promise<void> {
    try {
      const now = new Date().toISOString();
      await this.client.execute({
        sql: `INSERT OR REPLACE INTO gamification
              (id, total_xp, current_streak_days, longest_streak_days, last_active_date, combo_multiplier, boss_clears_count, unlocked_tiers, updated_at)
              VALUES ('main', ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          g.totalXp,
          g.currentStreakDays,
          g.longestStreakDays,
          g.lastActiveDate,
          g.comboMultiplier,
          g.bossClearsCount,
          JSON.stringify(g.unlockedTiers || ['TIER_1']),
          now,
        ],
      });
    } catch (e) {
      console.error('Failed to update gamification in Turso:', e);
    }
  }

  public async getDailyPlan(dateStr: string): Promise<DailyPlan> {
    try {
      const res = await this.client.execute({
        sql: 'SELECT * FROM daily_plans WHERE plan_date = ?',
        args: [dateStr],
      });
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: String(row.id),
          planDate: String(row.plan_date),
          targetMinutes: Number(row.target_minutes || 25),
          focusSkillId: String(row.focus_skill_id || 'communication'),
          priorityWeaknessId: row.priority_weakness_id ? String(row.priority_weakness_id) : undefined,
          challengeIds: JSON.parse(String(row.challenge_ids || '[]')),
          completedChallengeIds: JSON.parse(String(row.completed_challenge_ids || '[]')),
          status: (row.status as any) || 'PENDING',
          overallScore: row.overall_score ? Number(row.overall_score) : undefined,
          createdAt: String(row.created_at),
        };
      }
    } catch (e) {
      console.warn('Error fetching daily plan:', e);
    }

    const now = new Date().toISOString();
    const newPlan: DailyPlan = {
      id: `plan-${dateStr}`,
      planDate: dateStr,
      targetMinutes: 25,
      focusSkillId: 'communication',
      challengeIds: [],
      completedChallengeIds: [],
      status: 'PENDING',
      createdAt: now,
    };

    try {
      await this.client.execute({
        sql: `INSERT OR REPLACE INTO daily_plans
              (plan_date, id, target_minutes, focus_skill_id, challenge_ids, completed_challenge_ids, status, created_at, updated_at)
              VALUES (?, ?, 25, 'communication', '[]', '[]', 'PENDING', ?, ?)`,
        args: [dateStr, newPlan.id, now, now],
      });
    } catch (e) {}

    return newPlan;
  }

  public async saveAttempt(attempt: Attempt): Promise<void> {
    try {
      await this.client.execute({
        sql: `INSERT INTO attempts
              (id, challenge_id, started_at, completed_at, response_text, media_url, media_type, evaluation_json, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          attempt.id,
          attempt.challengeId,
          attempt.startedAt,
          attempt.completedAt,
          attempt.responseText || null,
          attempt.mediaUrl || null,
          attempt.mediaType || null,
          JSON.stringify(attempt.evaluation),
          new Date().toISOString(),
        ],
      });
    } catch (e) {
      console.error('Failed to save attempt in Turso:', e);
    }
  }

  public async saveChallenge(challenge: Challenge): Promise<void> {
    try {
      await this.client.execute({
        sql: `INSERT OR REPLACE INTO challenges
              (id, skill_id, dimension_id, type, title, instructions, adversary_context, constraints, time_limit_seconds, difficulty, rubric, is_boss_challenge, target_weakness_id, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          challenge.id,
          challenge.skillId,
          challenge.dimensionId,
          challenge.type,
          challenge.title,
          challenge.instructions,
          challenge.adversaryContext || null,
          JSON.stringify(challenge.constraints || []),
          challenge.timeLimitSeconds,
          challenge.difficulty,
          JSON.stringify(challenge.rubric),
          challenge.isBossChallenge ? 1 : 0,
          challenge.targetWeaknessId || null,
          challenge.createdAt,
        ],
      });
    } catch (e) {
      console.error('Failed to save challenge in Turso:', e);
    }
  }

  public async getChallenge(challengeId: string): Promise<Challenge | null> {
    try {
      const res = await this.client.execute({
        sql: 'SELECT * FROM challenges WHERE id = ?',
        args: [challengeId],
      });
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: String(row.id),
          skillId: String(row.skill_id),
          dimensionId: String(row.dimension_id),
          type: (row.type as any),
          title: String(row.title),
          instructions: String(row.instructions),
          adversaryContext: row.adversary_context ? String(row.adversary_context) : undefined,
          constraints: JSON.parse(String(row.constraints || '[]')),
          timeLimitSeconds: Number(row.time_limit_seconds),
          difficulty: Number(row.difficulty),
          rubric: JSON.parse(String(row.rubric || '[]')),
          isBossChallenge: Boolean(row.is_boss_challenge),
          targetWeaknessId: row.target_weakness_id ? String(row.target_weakness_id) : undefined,
          createdAt: String(row.created_at),
        };
      }
    } catch (e) {
      console.warn('Error fetching challenge from Turso:', e);
    }
    return null;
  }
}
