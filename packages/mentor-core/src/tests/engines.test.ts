import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  SpeechAnalyzer, 
  ProgressionEngine, 
  WeaknessEngine, 
  TrainingDebtEngine, 
  ChallengeEngine,
  AssessmentEngine,
  GamificationEngine
} from '../index.js';
import { SkillState, Weakness, Challenge } from '@personal-mentor/shared';

describe('AI Mentor Core Engines Test Suite', () => {
  describe('SpeechAnalyzer', () => {
    it('accurately identifies filler words and computes cadence', () => {
      const sample = 'Basically, I think like we should, you know, prioritize the unit economics, actually.';
      const metrics = SpeechAnalyzer.analyzeTranscript(sample, 10);

      assert.strictEqual(metrics.wordCount, 13);
      assert.ok(metrics.fillerWordCount >= 4, `Expected at least 4 fillers, got ${metrics.fillerWordCount}`);
      assert.strictEqual(metrics.detectedFillers['basically'], 1);
      assert.strictEqual(metrics.detectedFillers['like'], 1);
      assert.strictEqual(metrics.detectedFillers['you know'], 1);
      assert.strictEqual(metrics.detectedFillers['actually'], 1);

      const penalty = SpeechAnalyzer.calculatePenalty(metrics);
      assert.ok(penalty.penalty >= 10, 'Expected penalty for excessive filler density');
    });
  });

  describe('ProgressionEngine', () => {
    it('prevents leveling up from a single lucky pass', () => {
      const initial: SkillState = {
        dimensionId: 'comm_clarity',
        skillId: 'communication',
        level: 1,
        sublevel: 1,
        score: 55.0,
        confidence: 0.5,
        trend: 'STABLE',
        recentScores: [55],
        consecutivePasses: 0,
        lastAssessedAt: null,
      };

      // 1 single high pass
      const result = ProgressionEngine.updateProgression(initial, 92.0, true);
      assert.strictEqual(result.levelChanged, false, 'Should NOT level up on single pass');
      assert.strictEqual(result.updatedState.consecutivePasses, 1);
      assert.strictEqual(result.newLevelString, '1.1');
    });

    it('advances sublevel only after 3 consecutive clean passes', () => {
      let state: SkillState = {
        dimensionId: 'comm_clarity',
        skillId: 'communication',
        level: 1,
        sublevel: 1,
        score: 70.0,
        confidence: 0.5,
        trend: 'STABLE',
        recentScores: [70],
        consecutivePasses: 0,
        lastAssessedAt: null,
      };

      // Pass 1
      state = ProgressionEngine.updateProgression(state, 80.0, true).updatedState;
      assert.strictEqual(state.sublevel, 1);

      // Pass 2
      state = ProgressionEngine.updateProgression(state, 82.0, true).updatedState;
      assert.strictEqual(state.sublevel, 1);

      // Pass 3 (Consistently proven)
      const res3 = ProgressionEngine.updateProgression(state, 85.0, true);
      assert.strictEqual(res3.levelChanged, true);
      assert.strictEqual(res3.updatedState.sublevel, 2, 'Should upgrade to Level 1.2 after 3 consecutive passes');
    });
  });

  describe('WeaknessEngine', () => {
    it('detects, escalates, and resolves weaknesses upon proven remediation', () => {
      const skillId = 'communication';
      const mockChallenge: Challenge = {
        id: 'chal-1',
        skillId,
        dimensionId: 'comm_structure',
        type: 'EXPLAIN',
        title: 'Structure Test',
        instructions: 'Test',
        constraints: [],
        timeLimitSeconds: 60,
        difficulty: 60,
        isBossChallenge: false,
        rubric: [{ dimensionId: 'comm_structure', name: 'Structure', maxScore: 100, weight: 1.0, passThreshold: 70, evalPrompt: '' }],
        createdAt: new Date().toISOString(),
      };

      // 1. Initial Failure
      const eval1 = AssessmentEngine.evaluateAttempt(mockChallenge, 'Incomplete rambling text with no thesis.', 20, {
        dimensionScores: [{ dimensionId: 'comm_structure', score: 45, evidenceQuotes: ['Incomplete rambling'], identifiedMistakes: ['No thesis'] }],
        whatWorkedWell: [],
        whatFailed: ['Lacked structure'],
        singleBiggestWeakness: 'Absence of executive thesis structure',
        whyItMatters: 'Rambling loses the audience',
        correctiveDrillInstructions: 'Redo in 3 sentences',
      });

      let weaknesses: Weakness[] = [];
      const res1 = WeaknessEngine.processEvaluation(weaknesses, eval1, skillId);
      weaknesses = res1.updatedWeaknesses;
      assert.strictEqual(weaknesses.length, 1);
      assert.strictEqual(weaknesses[0].status, 'POTENTIAL');

      // 2. Second failure -> Escalates to ACTIVE and MEDIUM
      const res2 = WeaknessEngine.processEvaluation(weaknesses, eval1, skillId);
      weaknesses = res2.updatedWeaknesses;
      assert.strictEqual(weaknesses[0].status, 'ACTIVE');
      assert.strictEqual(weaknesses[0].severity, 'MEDIUM');
      assert.strictEqual(weaknesses[0].occurrenceCount, 2);

      // 3. Remediation passes (3 consecutive passes)
      const passEval = AssessmentEngine.evaluateAttempt(mockChallenge, 'Perfect structured response with hook and conclusion.', 45, {
        dimensionScores: [{ dimensionId: 'comm_structure', score: 88, evidenceQuotes: [], identifiedMistakes: [] }],
        whatWorkedWell: ['Crisp structure'],
        whatFailed: [],
        singleBiggestWeakness: '',
        whyItMatters: '',
        correctiveDrillInstructions: '',
      });

      weaknesses = WeaknessEngine.processEvaluation(weaknesses, passEval, skillId).updatedWeaknesses;
      assert.strictEqual(weaknesses[0].consecutivePasses, 1);
      assert.strictEqual(weaknesses[0].status, 'DRILLING');

      weaknesses = WeaknessEngine.processEvaluation(weaknesses, passEval, skillId).updatedWeaknesses;
      assert.strictEqual(weaknesses[0].consecutivePasses, 2);

      const resResolved = WeaknessEngine.processEvaluation(weaknesses, passEval, skillId);
      weaknesses = resResolved.updatedWeaknesses;
      assert.strictEqual(weaknesses[0].consecutivePasses, 3);
      assert.strictEqual(weaknesses[0].status, 'RESOLVED', 'Weakness should be RESOLVED after 3 clean passes');
    });
  });

  describe('TrainingDebtEngine', () => {
    it('correctly tracks and resolves training debt points', () => {
      let debts: any[] = [];

      // Add debt for missed session (+1)
      debts = TrainingDebtEngine.accrueDebt(debts, 'MISSED_SESSION', 'Skipped morning training').updatedDebts;
      // Add debt for repeated failure (+2)
      debts = TrainingDebtEngine.accrueDebt(debts, 'REPEATED_FAILURE', 'Failed structure drill twice').updatedDebts;

      const summary = TrainingDebtEngine.calculateSummary(debts);
      assert.strictEqual(summary.totalActiveDebtPoints, 3);
      assert.strictEqual(summary.mandatoryDrillsCount, 2); // ceil(3 / 2) = 2

      // Clear 2 points
      const clearedRes = TrainingDebtEngine.clearDebt(debts, 2);
      debts = clearedRes.updatedDebts;
      const newSummary = TrainingDebtEngine.calculateSummary(debts);
      assert.ok(newSummary.totalActiveDebtPoints < 3, 'Active debt should reduce after clearance');
    });
  });

  describe('ChallengeEngine', () => {
    it('prioritizes active critical weaknesses and computes challenge margin', () => {
      const weaknesses: Weakness[] = [
        {
          id: 'w-1',
          skillId: 'communication',
          dimensionId: 'comm_clarity',
          dimensionName: 'Clarity',
          description: 'Chronic filler words',
          severity: 'HIGH',
          confidence: 0.8,
          occurrenceCount: 4,
          consecutivePasses: 0,
          status: 'ACTIVE',
          firstDetectedAt: '',
          lastDetectedAt: '',
          recentEvidence: [],
        }
      ];

      const skills: any[] = [
        {
          skill: { id: 'communication', dimensions: [] },
          overallScore: 62,
          dimensionStates: [{ dimensionId: 'comm_clarity', score: 60 }],
        }
      ];

      const target = ChallengeEngine.calculateTargetPriority({
        skills,
        weaknesses,
        trainingDebtPoints: 2,
        recentAttemptsCount: 5,
      });

      assert.strictEqual(target.skillId, 'communication');
      assert.strictEqual(target.dimensionId, 'comm_clarity');
      assert.strictEqual(target.targetDifficulty, 68, 'Expected current score 60 + margin 8 = 68');
    });
  });
});
