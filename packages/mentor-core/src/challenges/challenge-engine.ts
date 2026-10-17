import { 
  Challenge, 
  ChallengeType, 
  SkillSummary, 
  Weakness, 
  CompactMentorContext 
} from '@personal-mentor/shared';

export interface ChallengeSelectionParams {
  skills: SkillSummary[];
  weaknesses: Weakness[];
  trainingDebtPoints: number;
  recentAttemptsCount: number;
  requestedSkillId?: string;
}

export class ChallengeEngine {
  /**
   * Calculates priority ranking for which dimension/weakness to target next.
   */
  public static calculateTargetPriority(params: ChallengeSelectionParams): {
    skillId: string;
    dimensionId: string;
    targetDifficulty: number;
    targetWeakness?: Weakness;
  } {
    const { skills, weaknesses, trainingDebtPoints, requestedSkillId } = params;

    // If user explicitly requested a specific skill, target its lowest dimension
    if (requestedSkillId) {
      const matchSkill = skills.find(s => s.skill.id === requestedSkillId);
      if (matchSkill && matchSkill.dimensionStates.length > 0) {
        let lowestDim = matchSkill.dimensionStates[0];
        for (const ds of matchSkill.dimensionStates) {
          if (ds.score < lowestDim.score) lowestDim = ds;
        }
        return {
          skillId: requestedSkillId,
          dimensionId: lowestDim.dimensionId,
          targetDifficulty: Math.min(95, Math.max(40, Math.round(lowestDim.score + 10))),
          targetWeakness: weaknesses.find(w => w.dimensionId === lowestDim.dimensionId && w.status !== 'RESOLVED'),
        };
      }
    }

    // Severity weighting map
    const severityWeight: Record<string, number> = {
      CRITICAL: 4.0,
      HIGH: 3.0,
      MEDIUM: 2.0,
      LOW: 1.0,
    };

    // If there is an active weakness, calculate score
    let highestPriorityWeakness: Weakness | undefined;
    let maxPriorityScore = -1;

    for (const w of weaknesses.filter(item => item.status !== 'RESOLVED')) {
      const baseSeverity = severityWeight[w.severity] || 1.0;
      const occurrenceFactor = Math.min(5, w.occurrenceCount);
      const score = baseSeverity * occurrenceFactor * (w.status === 'DRILLING' ? 1.5 : 1.0);

      if (score > maxPriorityScore) {
        maxPriorityScore = score;
        highestPriorityWeakness = w;
      }
    }

    if (highestPriorityWeakness) {
      let currentScore = 50;
      for (const s of skills) {
        const dState = s.dimensionStates.find(d => d.dimensionId === highestPriorityWeakness!.dimensionId);
        if (dState) {
          currentScore = dState.score;
          break;
        }
      }

      const margin = trainingDebtPoints > 3 ? 5 : 8;
      const targetDifficulty = Math.min(95, Math.max(40, Math.round(currentScore + margin)));

      return {
        skillId: highestPriorityWeakness.skillId,
        dimensionId: highestPriorityWeakness.dimensionId,
        targetDifficulty,
        targetWeakness: highestPriorityWeakness,
      };
    }

    // Default fallback: find the skill and dimension with lowest score
    let lowestScore = 999;
    let selectedSkillId = skills[0]?.skill.id || 'communication';
    let selectedDimId = skills[0]?.skill.dimensions[0]?.id || 'comm_clarity';

    for (const s of skills) {
      for (const ds of s.dimensionStates) {
        if (ds.score < lowestScore) {
          lowestScore = ds.score;
          selectedSkillId = s.skill.id;
          selectedDimId = ds.dimensionId;
        }
      }
    }

    return {
      skillId: selectedSkillId,
      dimensionId: selectedDimId,
      targetDifficulty: Math.min(95, Math.max(45, Math.round((lowestScore === 999 ? 50 : lowestScore) + 10))),
    };
  }

  /**
   * Generates masterclass, high-friction, elite challenges across all 15 skills.
   */
  public static generateTemplateChallenge(
    skillId: string, 
    dimensionId: string, 
    difficulty: number,
    targetWeakness?: Weakness
  ): Challenge {
    const id = `chal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const catalog: Record<string, Partial<Challenge>> = {
      // 1. Communication
      communication: {
        type: 'EXPLAIN',
        title: 'Executive Elevator Pitch Under Hostile Interruption',
        instructions: 'Explain Opportunity Cost & Asymmetric Risk to a skeptical board member who interrupts: "We have heard all these theoretical buzzwords before. Tell me exactly why our capital is at risk in 60 seconds."',
        adversaryContext: 'Impatient, cynical enterprise executive protecting annual budget.',
        constraints: [
          'Time ceiling: 60 seconds',
          'Zero filler words (banned crutches: "basically", "like", "you know", "kind of")',
          'Must follow strict 3-part framework: Hook -> Concrete Asymmetric Mechanism -> Punchline Principle',
        ],
        timeLimitSeconds: 60,
        rubric: [
          {
            dimensionId: dimensionId || 'comm_clarity',
            name: 'Clarity & High Signal Delivery',
            maxScore: 100,
            weight: 1.3,
            passThreshold: 75,
            evalPrompt: 'Check for immediate simplicity, zero filler words, and tight structural cohesion without flinching.',
          }
        ],
      },

      // 2. Public Speaking
      public_speaking: {
        type: 'TIMED_PRESSURE',
        title: 'Town Hall Crisis Defense & Restoring Morale',
        instructions: 'A critical system outage wiped 8 hours of client data. Address your company of 200 engineers and salespeople who are demoralized and panicked. Take responsibility, restore order, and rally the team without deflecting blame.',
        adversaryContext: 'Anxious crowd ready to leak internal panic to social media.',
        constraints: [
          'Zero apologies or defensive excuses (banned: "I am sorry", "It was not our fault", "Vendor outage")',
          'Staccato opening cadence: First 3 sentences must be under 8 words each',
          'Time ceiling: 90 seconds',
        ],
        timeLimitSeconds: 90,
        rubric: [
          {
            dimensionId: dimensionId || 'pub_projection_presence',
            name: 'Command, Presence & Restoring Certainty',
            maxScore: 100,
            weight: 1.4,
            passThreshold: 75,
            evalPrompt: 'Evaluate vocal authority, ownership of failure, and absence of groveling or defensiveness.',
          }
        ],
      },

      // 3. Sales
      sales: {
        type: 'ROLEPLAY',
        title: 'Enterprise Discovery on a Defensive Gatekeeper',
        instructions: 'An enterprise buyer says: "We already have an internal custom tool for this that our IT team built 3 years ago. We are not spending a single dollar on external vendors. Why are you wasting my time?" Pivot to unearth latent friction without insulting their internal team.',
        adversaryContext: 'Protective IT VP defending internal headcount and pride.',
        constraints: [
          'Do NOT criticize their internal tool or mention competitor weaknesses',
          'Ask one calibrated diagnostic question around maintenance downtime or technical debt',
          'Time ceiling: 75 seconds',
        ],
        timeLimitSeconds: 75,
        rubric: [
          {
            dimensionId: dimensionId || 'sales_discovery_diagnosis',
            name: 'Diagnostic Precision & Non-Defensive Framing',
            maxScore: 100,
            weight: 1.3,
            passThreshold: 72,
            evalPrompt: 'Check if user avoided pitching features and successfully uncovered hidden maintenance cost.',
          }
        ],
      },

      // 4. Negotiation
      negotiation: {
        type: 'ROLEPLAY',
        title: 'Countering the Hostile Take-It-Or-Leave-It Anchor',
        instructions: 'A monopoly software vendor pushes across the table: "Our rates are going up 45% starting next Monday. Sign the renewal now or your API access terminates." Neutralize this aggressive anchor using Chris Voss tactical empathy.',
        adversaryContext: 'Ruthless account executive leveraging deadline panic and platform lock-in.',
        constraints: [
          'Do NOT offer a unilateral compromise or beg for exceptions',
          'Use an Accusation Audit or calibrated label (e.g., "It seems like you are under corporate mandate...")',
          'Hold 3 seconds of deliberate silence after your calibrated question',
          'Time ceiling: 90 seconds',
        ],
        timeLimitSeconds: 90,
        rubric: [
          {
            dimensionId: dimensionId || 'neg_tactical_empathy',
            name: 'Tactical Empathy & Leverage Preservation',
            maxScore: 100,
            weight: 1.4,
            passThreshold: 75,
            evalPrompt: 'Verify labeling of counterparty fears and absence of hostile threats or weak begging.',
          }
        ],
      },

      // 5. Entrepreneurship
      entrepreneurship: {
        type: 'ROLEPLAY',
        title: 'Kill-Switch Triage Under 3 Weeks Runway',
        instructions: 'Your startup burn rate is $120k/month with only $90k in the bank. Customer Acquisition Cost has doubled from $200 to $420, while gross margin is 65%. Pitch your emergency default-alive triage plan to your cofounder.',
        adversaryContext: 'Panicked cofounder suggesting taking high-interest debt or continuing marketing spend.',
        constraints: [
          'Must name 1 specific acquisition channel to terminate immediately',
          'Must state exact head-count/burn reduction mathematics to reach cash-flow break-even',
          'Time ceiling: 60 seconds',
        ],
        timeLimitSeconds: 60,
        rubric: [
          {
            dimensionId: dimensionId || 'ent_unit_economics',
            name: 'Unit Economic Surgical Triage',
            maxScore: 100,
            weight: 1.3,
            passThreshold: 75,
            evalPrompt: 'Evaluate realistic financial solvency logic and absence of hopium or wishful thinking.',
          }
        ],
      },

      // 6. Business Strategy
      business_strategy: {
        type: 'EXPLAIN',
        title: 'Countering Commoditization & Platform Disintermediation',
        instructions: 'An open-source project backed by Big Tech just cloned your core software features and released them for free. Defend your competitive moat and pricing power to an anxious lead investor.',
        adversaryContext: 'Skeptical venture partner preparing to write down investment value.',
        constraints: [
          'Must articulate a non-replicable moat (data flywheel, counter-positioning, or high switching cost)',
          'Zero generic buzzwords (banned: "synergy", "first-mover advantage", "passionate team")',
          'Time ceiling: 75 seconds',
        ],
        timeLimitSeconds: 75,
        rubric: [
          {
            dimensionId: dimensionId || 'strat_moat_ defensibility',
            name: 'Strategic Moat Articulation',
            maxScore: 100,
            weight: 1.4,
            passThreshold: 75,
            evalPrompt: 'Check for structural economic defensibility beyond superficial feature parity.',
          }
        ],
      },

      // 7. Critical Thinking
      critical_thinking: {
        type: 'DEBATE',
        title: 'First-Principles Deconstruction of Prevailing Dogma',
        instructions: 'A consultant argues: "Industry standard practice dictates that we must hire 50 offshore sales reps to scale enterprise pipeline because competitors do it." Deconstruct this claim using first principles and expose the hidden economic fallacy.',
        adversaryContext: 'Senior executive arguing from tradition and consensus.',
        constraints: [
          'Banned crutches: "obviously", "everyone knows", "in my experience"',
          'Must isolate variable cost per lead vs. conversion yield vs. pipeline pollution',
          'Time ceiling: 75 seconds',
        ],
        timeLimitSeconds: 75,
        rubric: [
          {
            dimensionId: dimensionId || 'crit_first_principles',
            name: 'First Principles Logic & De-biasing',
            maxScore: 100,
            weight: 1.3,
            passThreshold: 75,
            evalPrompt: 'Verify systematic breakdown into fundamental truths versus reasoning by analogy.',
          }
        ],
      },

      // 8. Problem Solving
      problem_solving: {
        type: 'MICRO_DRILL',
        title: 'Root Cause 5-Whys Stress Test on Production Collapse',
        instructions: 'A logistics automated distribution facility suffered a 40% dispatch delay for 7 consecutive days. Perform a live, rigorous 5-Whys root-cause deduction down to the underlying systemic failure.',
        adversaryContext: 'Operations manager trying to blame warehouse workers instead of the dispatch algorithm.',
        constraints: [
          'Must explicitly state all 5 progressive "Why" levels',
          'Each stage must logically and demonstrably cause the subsequent failure',
          'Time ceiling: 90 seconds',
        ],
        timeLimitSeconds: 90,
        rubric: [
          {
            dimensionId: dimensionId || 'prob_root_cause_5whys',
            name: 'Root Cause Rigor & Diagnostic Depth',
            maxScore: 100,
            weight: 1.3,
            passThreshold: 75,
            evalPrompt: 'Check whether the 5th Why addresses systemic incentives or software architecture rather than surface symptoms.',
          }
        ],
      },

      // 9. Decision Making
      decision_making: {
        type: 'EXPLAIN',
        title: 'Asymmetric Downside Hedging Under Extreme Ambiguity',
        instructions: 'You must decide whether to sign an exclusive distribution deal with a tech monopoly (guaranteed $3M upfront, but forfeits direct customer data and brand ownership) or raise a risky seed round. State your decision framework.',
        adversaryContext: 'Board urging the fast cash payout regardless of terminal equity value.',
        constraints: [
          'Must use an asymmetric risk/reward distribution model',
          'Must identify the irreversible "One-Way Door" (Jeff Bezos framework)',
          'Time ceiling: 60 seconds',
        ],
        timeLimitSeconds: 60,
        rubric: [
          {
            dimensionId: dimensionId || 'dec_asymmetric_bets',
            name: 'Asymmetric Decision Architecture',
            maxScore: 100,
            weight: 1.3,
            passThreshold: 75,
            evalPrompt: 'Evaluate clear distinction between reversible vs irreversible decisions and risk of ruin.',
          }
        ],
      },

      // 10. Leadership
      leadership: {
        type: 'ROLEPLAY',
        title: 'Terminating a Toxic High-Performer',
        instructions: 'Your highest revenue-generating account manager consistently berates customer support reps and creates a culture of fear. Deliver their termination notice directly, with zero debate, total dignity, and legal crispness.',
        adversaryContext: 'Arrogant executive counter-arguing: "I bring in 40% of the revenue, you will go out of business without me."',
        constraints: [
          'Do NOT apologize (banned: "I am sorry", "I wish this were different")',
          'Direct, respectful, firm delivery; do not engage in debate over revenue numbers',
          'Time ceiling: 60 seconds',
        ],
        timeLimitSeconds: 60,
        rubric: [
          {
            dimensionId: dimensionId || 'lead_culture_standards',
            name: 'Executive Decisiveness & Boundary Enforcement',
            maxScore: 100,
            weight: 1.4,
            passThreshold: 75,
            evalPrompt: 'Check for unshakeable composure, zero waffling, and total alignment with culture standards.',
          }
        ],
      },

      // 11. Chess
      chess: {
        type: 'CHESS_TACTIC',
        title: 'Grandmaster 4-Ply Forcing Candidate Calculation',
        instructions: 'Position: White: Kh1, Qd1, Rf1, Nd5, pawns f2, g2, h2. Black: Kh8, Qe8, Rf8, Nf6, pawns f7, g7, h7. White plays Nxf6 gxf6 Qh5. Calculate Black\'s forced defensive responses and White\'s winning continuation.',
        constraints: [
          'Must calculate candidate moves: Checks, Captures, Threats',
          'Use exact algebraic notation for all variations',
          'Time limit: 60 seconds',
        ],
        timeLimitSeconds: 60,
        rubric: [
          {
            dimensionId: dimensionId || 'chess_tactical_depth',
            name: 'Calculation Accuracy & Notation Precision',
            maxScore: 100,
            weight: 1.4,
            passThreshold: 75,
            evalPrompt: 'Verify tactical calculation of Qh6 and Rg1 checkmating networks.',
          }
        ],
      },

      // 12. Memory & Visualization
      memory_visualization: {
        type: 'BLINDFOLD_CHESS',
        title: 'Blindfold Coordinate Geometry & Diagonal Trajectory',
        instructions: 'Without looking at any board or screen: 1) State the exact color of square c6. 2) List all squares along the long diagonal passing through c6. 3) Calculate the shortest 3-move knight sequence from b1 to f7.',
        constraints: [
          'Zero physical board references or hand gestures',
          'No pauses longer than 2.5 seconds',
          'Time ceiling: 45 seconds',
        ],
        timeLimitSeconds: 45,
        rubric: [
          {
            dimensionId: dimensionId || 'mem_blindfold_coords',
            name: 'Spatial Mental Model Accuracy',
            maxScore: 100,
            weight: 1.4,
            passThreshold: 80,
            evalPrompt: 'Check instant recall of board geometry without spatial disorientation.',
          }
        ],
      },

      // 13. Learning Ability
      learning_ability: {
        type: 'EXPLAIN',
        title: 'The Feynman Reduction: Quantum Entanglement to a 10-Year-Old',
        instructions: 'Explain the core phenomenon of Quantum Entanglement (or Zero-Knowledge Cryptography) to a 10-year-old using a concrete physical metaphor from a playground game or magical coin.',
        constraints: [
          'Zero technical crutches (banned: "qubit", "wavefunction", "cryptography", "hash", "superposition")',
          'Must clearly explain why this changes the physical world',
          'Time ceiling: 60 seconds',
        ],
        timeLimitSeconds: 60,
        rubric: [
          {
            dimensionId: dimensionId || 'learn_feynman_synthesis',
            name: 'Feynman Synthesis & Conceptual Translation',
            maxScore: 100,
            weight: 1.3,
            passThreshold: 75,
            evalPrompt: 'Evaluate whether the explanation proves genuine intuitive mastery without hiding behind terminology.',
          }
        ],
      },

      // 14. Creativity
      creativity: {
        type: 'MICRO_DRILL',
        title: 'TRIZ Problem Inversion Under Severe Constraint',
        instructions: 'A city needs to dramatically reduce automobile traffic congestion during rush hour, but has $0 budget for new roads, transit, or software development. Invert the problem: How can the traffic bottleneck itself become the mechanism that prevents gridlock?',
        constraints: [
          'Banned answers: "widen roads", "build trains", "congestion tax", "traffic lights"',
          'Must formulate a self-regulating physical or game-theoretic loop',
          'Time ceiling: 75 seconds',
        ],
        timeLimitSeconds: 75,
        rubric: [
          {
            dimensionId: dimensionId || 'creat_constraint_ideation',
            name: 'Lateral Inversion & Non-Obvious Mechanics',
            maxScore: 100,
            weight: 1.3,
            passThreshold: 72,
            evalPrompt: 'Check for genuinely original lateral mechanisms rather than derivative policy tweaks.',
          }
        ],
      },

      // 15. Discipline & Execution
      discipline_execution: {
        type: 'MICRO_DRILL',
        title: 'The Cold-Start Anti-Avoidance Execution Protocol',
        instructions: 'Identify the single highest-friction, most uncomfortable professional task or difficult decision you have postponed over the last 48 hours. Speak your opening sentence, articulate the root of your resistance, and state your non-negotiable execution contract.',
        constraints: [
          'Zero rationalization (banned: "I was waiting on information", "I had other priorities")',
          'Must state exact completion deadline within the next 90 minutes',
          'Time ceiling: 45 seconds',
        ],
        timeLimitSeconds: 45,
        rubric: [
          {
            dimensionId: dimensionId || 'disc_anti_avoidance',
            name: 'Brutal Honesty & Radical Accountability',
            maxScore: 100,
            weight: 1.5,
            passThreshold: 80,
            evalPrompt: 'Evaluate absence of self-deception and immediate commitment to uncomfortable action.',
          }
        ],
      },
    };

    const template = catalog[skillId] || catalog.communication;

    return {
      id,
      skillId,
      dimensionId: dimensionId || (template.rubric?.[0]?.dimensionId || 'comm_clarity'),
      type: (template.type as ChallengeType) || 'EXPLAIN',
      title: template.title || 'Executive Performance Drill',
      instructions: template.instructions || 'Execute defense under strict time pressure.',
      adversaryContext: template.adversaryContext || undefined,
      constraints: template.constraints || ['Time limit: 60s', 'Zero filler words'],
      timeLimitSeconds: template.timeLimitSeconds || 60,
      difficulty,
      isBossChallenge: false,
      targetWeaknessId: targetWeakness?.id,
      rubric: template.rubric || [
        {
          dimensionId: dimensionId || 'comm_clarity',
          name: 'Precision & Composure',
          maxScore: 100,
          weight: 1.0,
          passThreshold: 75,
          evalPrompt: 'Check for high signal-to-noise ratio.',
        }
      ],
      createdAt: now,
    };
  }
}
