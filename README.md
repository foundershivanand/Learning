# Private AI Mentor Operating System

> An adversarial, action-oriented personal skill development engine designed to continuously measure real-world ability, deliberately induce failure, diagnose micro-weaknesses, and enforce extreme accountability through training debt.

---

## 🏛️ System Architecture

```text
                                 YOU
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
            Mobile Web / PWA                 Telegram
            (Next.js / Tailwind)         (Voice/Video/Bot)
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                         CLOUDFLARE WORKER
                           "mentor-api"
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
   SUPABASE DB                AI ROUTER               CLOUDFLARE R2
  (PostgreSQL)                    │                  (Raw Audio/Video)
  • Profile & Skills       ┌──────┴──────┐
  • Skill Dimensions       ▼             ▼
  • Weaknesses        Workers AI       Groq
  • Training Debt    (GLM/Nemotron/   (Llama 3
  • Gamification       Gemma/ASR)      Backup)
  • Attempts/Logs          │
                           ▼
                    ┌─────────────┐
                    │ MENTOR CORE │
                    └──────┬──────┘
                           │
       ┌───────────┬───────┴───────┬───────────┐
       ▼           ▼               ▼           ▼
   Assessment  Challenge       Weakness   Progression
     Engine      Engine         Engine      Engine
```

---

## 🎯 The 15 Core Skills

1. **Communication** (Clarity, Fluency, Structure, Conciseness, Improvisation)
2. **Public Speaking** (Hook Opening, Vocal Modulation & Projection)
3. **Sales** (Discovery Questioning, Objection Rebuttal, Closing & Next Steps)
4. **Negotiation** (Anchoring & Framing, Concession Trading, Tactical Empathy)
5. **Entrepreneurship** (Problem Validation, Unit Economics, MVP Velocity, GTM Distribution)
6. **Business Strategy** (Competitive Moats & Defensibility, Strategic Trade-offs)
7. **Critical Thinking** (Fallacy & Bias Detection, First-Principles Reasoning)
8. **Problem Solving** (MECE Issue Tree Decomposition, 5-Whys Root Cause)
9. **Decision Making** (Type 1 vs Type 2 Reversibility, Asymmetric Risk/Reward)
10. **Leadership** (Radical Candor Feedback, Delegation & Outcome Ownership)
11. **Chess** (Tactical Calculation Depth, Blunder Prevention & Prophylaxis)
12. **Memory & Visualization** (Blindfold Chess Coordinates, Blindfold Piece Tracking)
13. **Learning Ability** (Feynman Simplification, Spaced Recall & Transfer)
14. **Creativity** (Constraint Exploitation, Cross-Domain Lateral Synthesis)
15. **Discipline & Execution** (Resistance to Avoidance, Daily Operating Rhythm)

---

## ⚙️ Core Engines (Deterministic Code vs AI Intelligence)

- **Context Engine**: Compiles a lean, high-signal compact context for the LLM rather than dumping raw chat history.
- **Speech Analyzer**: Parses speech transcripts and audio durations to detect cadence (WPM), speech pauses, and filler word density (*"basically", "like", "you know"*), applying objective deductions.
- **Challenge Engine**: Selects practice targets using the priority formula:
  $$\text{Priority} = \text{Weakness Severity} \times \text{Recent Failure Frequency} \times \text{Skill Weight} \times \text{Recency}$$
- **Progression Engine**: Enforces the anti-luck rule. Advancing from Level 1.1 up to 10.10 requires minimum 3 consecutive clean passes under varying adversarial constraints.
- **Weakness Engine**: Tracks occurrences across attempts. Escalates severity (LOW $\rightarrow$ MEDIUM $\rightarrow$ HIGH $\rightarrow$ CRITICAL) and resolves weaknesses only after 3 consecutive clean remedial drills.
- **Training Debt Engine**: Accrues debt points for misses and repeated flaws. High debt automatically mandates corrective micro-drills and locks forward progression.
- **Reality Mode Engine**: Dispatches physical-world missions (e.g. cold discovery with strangers, in-person price negotiation) and grades 2-minute post-mission voice reflections.

---

## 📁 Repository Structure

```text
personal-mentor/
├── apps/
│   └── web/                   # Next.js mobile-first PWA (Tailwind CSS)
├── workers/
│   └── mentor-api/            # Cloudflare Worker API & Telegram Webhook
├── packages/
│   ├── shared/                # Core types, interfaces, API contracts
│   ├── mentor-core/           # 8 Deterministic engines + unit tests
│   ├── ai-router/             # Cloudflare AI + Groq + Whisper router
│   └── skills/                # 15 Skill configurations & rubrics
├── database/
│   ├── schema.sql             # Supabase PostgreSQL DDL
│   └── seed.sql               # Seed script with all 15 skills & baseline data
└── prompts/
    ├── mentor.md              # Uncompromising Mentor System Prompt
    ├── evaluator.md           # Rubric Assessment Prompt
    ├── challenge-generator.md # Dynamic Challenge Generator Prompt
    └── reality-mission.md     # Real-World Mission Generator Prompt
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run All Engine & Worker Tests
```bash
bun test
```

### 3. Run Web App Locally
```bash
pnpm --filter mentor-web dev
```
Open [http://localhost:3000](http://localhost:3000) on your browser or mobile device.

### 4. Run API Worker Locally
```bash
pnpm --filter mentor-api dev
```

---

## ☁️ 100% Free Cloud Deployment Guide

1. **Database**: Run `database/schema.sql` and `database/seed.sql` in your Supabase SQL Editor.
2. **API Worker**: Run `pnpm --filter mentor-api deploy` to deploy to Cloudflare Workers with your R2 bucket and Cron trigger.
3. **Web / PWA**: Run `pnpm --filter mentor-web build` and deploy to Cloudflare Pages or Vercel.
4. **Telegram Bot**: Set your Cloudflare Worker URL as the Telegram Webhook:
   ```bash
   curl -F "url=https://mentor-api.<your-subdomain>.workers.dev/api/telegram/webhook" \
     https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
   ```
