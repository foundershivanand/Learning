import { 
  Challenge, 
  AttemptEvaluation, 
  CompactMentorContext 
} from '@personal-mentor/shared';

export interface AIRouterConfig {
  cloudflareAccountId?: string;
  cloudflareApiToken?: string;
  groqApiKey?: string;
  openRouterApiKey?: string;
  preferProvider?: 'cloudflare' | 'groq' | 'mock';
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIRouter {
  private config: AIRouterConfig;

  constructor(config?: AIRouterConfig) {
    const env = typeof process !== 'undefined' && process.env ? process.env : ({} as Record<string, string | undefined>);
    this.config = {
      groqApiKey: env.GROQ_API_KEY,
      cloudflareAccountId: env.CLOUDFLARE_ACCOUNT_ID,
      cloudflareApiToken: env.CLOUDFLARE_API_TOKEN,
      ...(config || {}),
    };
  }

  /**
   * Main completion router with automatic multi-provider fallback.
   */
  public async complete(messages: ChatMessage[], jsonMode = false): Promise<string> {
    const prefer = this.config.preferProvider;

    // 1. Try Groq (Ultra-fast, high intelligence)
    if (this.config.groqApiKey) {
      try {
        return await this.callGroq(messages, jsonMode);
      } catch (e) {
        console.warn('Groq failed, attempting Cloudflare Workers AI fallback...', e);
      }
    }

    // 2. Try Cloudflare Workers AI
    if (this.config.cloudflareAccountId && this.config.cloudflareApiToken) {
      try {
        return await this.callCloudflareAI(messages);
      } catch (e) {
        console.warn('Cloudflare Workers AI failed...', e);
      }
    }

    // 3. Offline / Mock fallback
    return this.mockCompletion(messages, jsonMode);
  }

  /**
   * Cloudflare Workers AI API client
   */
  private async callCloudflareAI(messages: ChatMessage[]): Promise<string> {
    const model = '@cf/meta/llama-3-8b-instruct';
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.config.cloudflareAccountId}/ai/run/${model}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.cloudflareApiToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'PersonalMentor/1.0',
      },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
      throw new Error(`Cloudflare AI error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json() as any;
    return data.result?.response || '';
  }

  /**
   * Groq API client
   */
  private async callGroq(messages: ChatMessage[], jsonMode = false): Promise<string> {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const model = 'qwen/qwen3.8-27b';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.groqApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'PersonalMentor/1.0',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json() as any;
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * Transcribes raw audio buffer via Cloudflare Workers AI Whisper or mock
   */
  public async transcribeAudio(audioBytes: Uint8Array): Promise<string> {
    if (this.config.cloudflareAccountId && this.config.cloudflareApiToken) {
      try {
        const model = '@cf/openai/whisper';
        const url = `https://api.cloudflare.com/client/v4/accounts/${this.config.cloudflareAccountId}/ai/run/${model}`;

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.cloudflareApiToken}`,
            'Content-Type': 'application/octet-stream',
          },
          body: audioBytes as unknown as BodyInit,
        });

        if (res.ok) {
          const data = await res.json() as any;
          return data.result?.text || '';
        }
      } catch (e) {
        console.warn('Whisper ASR failed, falling back...', e);
      }
    }

    // Mock transcript
    return 'Basically, I think we should prioritize the core unit economics before scaling customer acquisition, you know, because otherwise we will burn capital on an unproven loop.';
  }

  /**
   * Deterministic mock completion for zero-dependency offline mode and unit tests.
   */
  private mockCompletion(messages: ChatMessage[], jsonMode: boolean): string {
    const lastMsg = messages[messages.length - 1]?.content || '';

    if (jsonMode || lastMsg.includes('schema') || lastMsg.includes('JSON')) {
      if (lastMsg.includes('evaluation') || lastMsg.includes('rubric') || lastMsg.includes('EVALUATOR')) {
        return JSON.stringify({
          overallScore: 68,
          passed: false,
          dimensionScores: [
            {
              dimensionId: 'comm_structure',
              name: 'Logical Structure',
              score: 64,
              passed: false,
              evidenceQuotes: ['Basically, I think we should...'],
              identifiedMistakes: ['Rambled on introductory filler', 'Delayed core point by 20 seconds'],
            }
          ],
          brutalCritique: {
            whatWorkedWell: ['Understood the fundamental commercial trade-off'],
            whatFailed: ['Lacked structural punchline', 'Used 3 filler words in first 15 seconds'],
            singleBiggestWeakness: 'Slow lead-in and structural hesitation',
            whyItMatters: 'Executive audiences tune out after 10 seconds of weak rambling.',
            correctiveDrillInstructions: 'Deliver the core thesis in one single 15-second sentence without saying "Basically" or "like".',
          }
        });
      }

      if (lastMsg.includes('CHALLENGE') || lastMsg.includes('challenge')) {
        return JSON.stringify({
          type: 'EXPLAIN',
          title: 'Explaining First Principles to a Hostile Board',
          instructions: 'Explain why we are shutting down our legacy feature in under 60 seconds.',
          constraints: ['No apologetic tone', 'Under 60 seconds', 'Zero filler words'],
          timeLimitSeconds: 60,
          difficulty: 72,
          rubric: [
            {
              dimensionId: 'comm_clarity',
              name: 'Clarity & Conviction',
              weight: 1.2,
              passThreshold: 75,
              evalPrompt: 'Evaluate sharpness and absence of apologetic defensiveness.',
            }
          ]
        });
      }
    }

    return "Your explanation lacked structure. You took 20 seconds to reach the premise. Fix this before advancing.";
  }
}
