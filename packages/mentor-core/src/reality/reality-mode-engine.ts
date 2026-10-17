import { RealityMission } from '@personal-mentor/shared';

export class RealityModeEngine {
  /**
   * Generates a concrete real-world mission to bridge digital training into physical reality.
   */
  public static generateMission(skillId: string, weaknessDescription?: string): RealityMission {
    const id = `mission-${Date.now()}`;

    if (skillId === 'negotiation' || skillId === 'sales') {
      return {
        id,
        title: 'The Real-World Asymmetry Anchor',
        realWorldScenario: 'Visit a local merchant, coffee shop, or service provider today for a purchase you were already planning.',
        concreteObjective: 'Politely negotiate a 10% discount or an added concession before paying, without using apologies.',
        antiGoal: 'Do NOT say "Sorry to ask" or become awkward. Maintain warm eye contact and hold silence after stating your request.',
        postActionReflectionPrompt: 'Record a 2-minute reflection: What physical sensations or hesitation arose? How did the counterparty respond? Did you hold silence or fill the gap?',
        createdAt: new Date().toISOString(),
      };
    }

    if (skillId === 'communication' || skillId === 'public_speaking') {
      return {
        id,
        title: 'The Cold Conversational Diagnostic',
        realWorldScenario: 'Engage with someone you have never spoken with before (barista, stranger in transit, colleague from another team) for exactly 3 minutes.',
        concreteObjective: 'Ask 3 open-ended diagnostic questions that get them to speak for 70% of the time, without turning the interaction into an interrogation.',
        antiGoal: 'Do NOT talk about yourself unless explicitly asked. Eliminate all filler words ("like", "basically").',
        postActionReflectionPrompt: 'Record a 2-minute debrief: Did you genuinely listen, or were you merely waiting for your turn to speak? Quote one non-obvious insight you learned about them.',
        createdAt: new Date().toISOString(),
      };
    }

    // Default reality mission
    return {
      id,
      title: 'Radical Candor Confrontation',
      realWorldScenario: 'Identify an issue in your current project or team that has been left ambiguous or unsaid.',
      concreteObjective: 'Deliver direct, compassionate feedback in person or live call in under 90 seconds. Outline the specific issue and required change.',
      antiGoal: 'Do NOT hide behind softening platitudes. State the truth cleanly.',
      postActionReflectionPrompt: 'Record a 2-minute reflection: How did you regulate your adrenaline? Did you dilute your message, or hold the standard?',
      createdAt: new Date().toISOString(),
    };
  }
}
