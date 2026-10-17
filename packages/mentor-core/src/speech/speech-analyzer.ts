import { SpeechMetrics } from '@personal-mentor/shared';

export const COMMON_FILLER_WORDS = [
  'basically',
  'like',
  'you know',
  'uh',
  'um',
  'sort of',
  'kind of',
  'actually',
  'literally',
  'honestly',
  'i mean',
  'right',
  'o sea',
  'eh',
  'em',
];

export class SpeechAnalyzer {
  /**
   * Analyzes raw speech transcript and calculates cadence, filler counts, and speaking rate.
   */
  public static analyzeTranscript(transcript: string, durationSeconds?: number): SpeechMetrics {
    const cleanText = transcript.trim().toLowerCase();
    if (!cleanText) {
      return {
        durationSeconds: durationSeconds || 0,
        wordCount: 0,
        wordsPerMinute: 0,
        pauseCount: 0,
        fillerWordCount: 0,
        detectedFillers: {},
        fillerWordRatio: 0,
      };
    }

    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Estimate duration if not provided (assume average conversational 140 WPM)
    const effectiveDuration = durationSeconds && durationSeconds > 0 
      ? durationSeconds 
      : Math.max(1, (wordCount / 140) * 60);

    const wordsPerMinute = Math.round((wordCount / (effectiveDuration / 60)));

    // Detect pauses based on ellipses, dashes, or long punctuation gaps
    const pauseMatches = transcript.match(/(\.{3}|—|–|\.{2,})/g);
    const pauseCount = pauseMatches ? pauseMatches.length : 0;

    // Detect filler words
    const detectedFillers: Record<string, number> = {};
    let totalFillers = 0;

    for (const filler of COMMON_FILLER_WORDS) {
      // Regex boundary search
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = cleanText.match(regex);
      if (matches && matches.length > 0) {
        detectedFillers[filler] = matches.length;
        totalFillers += matches.length;
      }
    }

    const fillerWordRatio = wordCount > 0 ? parseFloat((totalFillers / wordCount).toFixed(3)) : 0;

    return {
      durationSeconds: Math.round(effectiveDuration),
      wordCount,
      wordsPerMinute,
      pauseCount,
      fillerWordCount: totalFillers,
      detectedFillers,
      fillerWordRatio,
    };
  }

  /**
   * Calculates a deduction score (0 to 40 points) based on excessive filler word density or cadence collapse.
   */
  public static calculatePenalty(metrics: SpeechMetrics): { penalty: number; reasons: string[] } {
    let penalty = 0;
    const reasons: string[] = [];

    // Excessive filler ratio (> 3% of words is bad, > 6% is severe)
    if (metrics.fillerWordRatio >= 0.06) {
      penalty += 20;
      reasons.push(`Extreme filler word density: ${(metrics.fillerWordRatio * 100).toFixed(1)}% of vocabulary was verbal garbage (${metrics.fillerWordCount} fillers).`);
    } else if (metrics.fillerWordRatio >= 0.03) {
      penalty += 10;
      reasons.push(`Noticeable filler words: ${(metrics.fillerWordRatio * 100).toFixed(1)}% of speech (${metrics.fillerWordCount} fillers).`);
    }

    // Unnatural WPM cadence (ideal conversational range is 120-170 WPM)
    if (metrics.wordsPerMinute > 210) {
      penalty += 10;
      reasons.push(`Speaking rate was excessively rushed (${metrics.wordsPerMinute} WPM). You spoke too fast to retain executive gravity.`);
    } else if (metrics.wordsPerMinute < 90 && metrics.wordCount > 15) {
      penalty += 10;
      reasons.push(`Speaking rate was sluggish (${metrics.wordsPerMinute} WPM). Lacks momentum and command.`);
    }

    return { penalty, reasons };
  }
}
