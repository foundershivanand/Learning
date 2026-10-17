import { 
  Challenge, 
  AttemptEvaluation, 
  DimensionEvaluation, 
  SpeechMetrics 
} from '@personal-mentor/shared';
import { SpeechAnalyzer } from '../speech/speech-analyzer.js';

export interface RawAssessmentResult {
  dimensionScores: {
    dimensionId: string;
    score: number;
    evidenceQuotes: string[];
    identifiedMistakes: string[];
  }[];
  whatWorkedWell: string[];
  whatFailed: string[];
  singleBiggestWeakness: string;
  whyItMatters: string;
  correctiveDrillInstructions: string;
}

export class AssessmentEngine {
  /**
   * Processes the raw AI qualitative evaluation, combines it with acoustic/speech metrics,
   * enforces penalties for constraint breaches, and produces the final deterministic evaluation.
   */
  public static evaluateAttempt(
    challenge: Challenge,
    userText: string,
    durationSeconds?: number,
    aiResult?: RawAssessmentResult
  ): AttemptEvaluation {
    const attemptId = `att-${Date.now()}`;
    const cleanText = (userText || '').trim();

    // 1. Run Speech / Acoustic Analyzer
    const speechMetrics: SpeechMetrics = SpeechAnalyzer.analyzeTranscript(cleanText, durationSeconds);
    const { penalty: speechPenalty, reasons: speechPenaltyReasons } = SpeechAnalyzer.calculatePenalty(speechMetrics);

    // 2. Fallback / Deterministic evaluation if AI result is absent or offline
    const rawResult: RawAssessmentResult = aiResult || this.generateDeterministicFallback(challenge, cleanText, speechMetrics);

    // 3. Score calculation with weights and penalty deductions
    const dimensionEvaluations: DimensionEvaluation[] = [];
    let weightedScoreSum = 0;
    let totalWeight = 0;

    for (const rubricDim of challenge.rubric) {
      const match = rawResult.dimensionScores.find(d => d.dimensionId === rubricDim.dimensionId);
      let baseScore = match ? match.score : 60;

      // Apply speech penalty if applicable to communication or delivery dimensions
      if (rubricDim.dimensionId.includes('comm') || rubricDim.dimensionId.includes('fluency') || rubricDim.dimensionId.includes('delivery')) {
        baseScore = Math.max(0, baseScore - speechPenalty);
      }

      const passed = baseScore >= rubricDim.passThreshold;
      dimensionEvaluations.push({
        dimensionId: rubricDim.dimensionId,
        name: rubricDim.name,
        score: Math.round(baseScore),
        passed,
        evidenceQuotes: match ? match.evidenceQuotes : [],
        identifiedMistakes: [
          ...(match ? match.identifiedMistakes : []),
          ...(baseScore < rubricDim.passThreshold && speechPenaltyReasons.length > 0 ? speechPenaltyReasons : [])
        ],
      });

      weightedScoreSum += baseScore * rubricDim.weight;
      totalWeight += rubricDim.weight;
    }

    const calculatedOverallScore = totalWeight > 0 ? Math.round(weightedScoreSum / totalWeight) : 50;

    // Check pass criteria: overallScore must meet average pass threshold and all dimensions must not fail catastrophically (< 40)
    const avgThreshold = challenge.rubric.reduce((acc, r) => acc + r.passThreshold, 0) / Math.max(1, challenge.rubric.length);
    const hasCatastrophicFailure = dimensionEvaluations.some(d => d.score < 40);
    const passed = calculatedOverallScore >= avgThreshold && !hasCatastrophicFailure;

    // Combine what failed with acoustic reasons if applicable
    const allFailures = [
      ...rawResult.whatFailed,
      ...speechPenaltyReasons,
    ];

    return {
      attemptId,
      challengeId: challenge.id,
      overallScore: calculatedOverallScore,
      passed,
      dimensionScores: dimensionEvaluations,
      brutalCritique: {
        whatWorkedWell: rawResult.whatWorkedWell.length > 0 ? rawResult.whatWorkedWell : ['Maintained effort to attempt challenge'],
        whatFailed: allFailures.length > 0 ? allFailures : ['Did not hit executive standard of precision'],
        singleBiggestWeakness: rawResult.singleBiggestWeakness || (speechPenaltyReasons[0] || 'Vagueness and lack of crisp structural logic'),
        whyItMatters: rawResult.whyItMatters || 'In high-stakes environments, ambiguity or hesitation causes immediate loss of credibility and leverage.',
        correctiveDrillInstructions: rawResult.correctiveDrillInstructions || 'Immediately redo this explanation in 45 seconds using only 3 sentences. No filler words allowed.',
      },
      metrics: speechMetrics,
      evaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Deterministic grading fallback when LLM is offline or during unit tests.
   */
  private static generateDeterministicFallback(
    challenge: Challenge,
    userText: string,
    metrics: SpeechMetrics
  ): RawAssessmentResult {
    const wordCount = metrics.wordCount;
    const hasFillerWords = metrics.fillerWordCount > 2;

    if (wordCount < 20) {
      return {
        dimensionScores: challenge.rubric.map(r => ({
          dimensionId: r.dimensionId,
          score: 35,
          evidenceQuotes: [userText.substring(0, 50)],
          identifiedMistakes: ['Response was severely truncated or incomplete.'],
        })),
        whatWorkedWell: ['Submitted on time'],
        whatFailed: ['Failed to supply sufficient substance or answer the prompt.'],
        singleBiggestWeakness: 'Incomplete execution / avoidance of challenge depth',
        whyItMatters: 'Surface-level responses signal lack of preparation or understanding.',
        correctiveDrillInstructions: 'Expand your point into a full 3-part structured argument.',
      };
    }

    const baseScore = hasFillerWords ? 62 : 74;

    return {
      dimensionScores: challenge.rubric.map(r => ({
        dimensionId: r.dimensionId,
        score: baseScore,
        evidenceQuotes: [userText.slice(0, 80)],
        identifiedMistakes: hasFillerWords ? [`Used ${metrics.fillerWordCount} filler words.`] : ['Pacing could be tighter.'],
      })),
      whatWorkedWell: ['Clear thematic relevance to challenge instructions.'],
      whatFailed: hasFillerWords ? ['Vocal cadence was polluted by verbal crutches.'] : ['Transitions could be more surgical.'],
      singleBiggestWeakness: hasFillerWords ? 'Cadence discipline & filler word elimination' : 'Structural efficiency',
      whyItMatters: 'Top performers articulate complex points effortlessly without cognitive stalling.',
      correctiveDrillInstructions: 'Deliver the core thesis in one single 15-second sentence.',
    };
  }
}
