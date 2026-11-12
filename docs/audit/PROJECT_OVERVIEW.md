# 1. Project Overview & Architecture: Private AI Mentor OS

## Executive Description
**Private AI Mentor OS** is an adversarial, action-oriented personal skill development engine. Unlike generic chat-based AI assistants that provide pleasantries and unstructured conversational advice, this system is explicitly engineered to:
1. Continuously measure real-world user performance through timed drills and speech submissions.
2. Deliberately induce failure at the boundary of competence.
3. Diagnose micro-weaknesses objectively through a 16-skill, 42-dimension rubric.
4. Enforce extreme accountability via deterministic **Training Debt** and an "Anti-Luck" progression ladder.

---

## Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Interfaces"]
        UI_Web["Next.js 15 PWA\n(Mobile & Expansive Desktop)"]
        UI_Worker["Edge HTML Dashboard\n(Embedded in Worker)"]
        TG["Telegram Bot\n(/today, /train, /debt, Voice)"]
    end

    subgraph EdgeLayer ["Edge & API Layer (Cloudflare Workers)"]
        CF_Worker["mentor-api Worker\n(Route Handler & Webhook)"]
        CRON["Daily Cron Trigger\n(06:00 AM IST / 00:30 UTC)"]
    end

    subgraph CorePackages ["Core Monorepo Packages"]
        CoreEngines["@personal-mentor/core\n• AssessmentEngine\n• SpeechAnalyzer\n• ProgressionEngine\n• WeaknessEngine\n• TrainingDebtEngine\n• ChallengeEngine\n• GamificationEngine\n• RealityModeEngine"]
        AIRouterPkg["@personal-mentor/ai-router\n• Groq (qwen/qwen3.8-27b)\n• Cloudflare AI (Llama 3)\n• Whisper ASR"]
        SkillsPkg["@personal-mentor/skills\n• 16 Skills JSON Configs\n• 42 Graded Dimensions"]
        SharedPkg["@personal-mentor/shared\n• TypeScript Types & Contracts"]
    end

    subgraph DataLayer ["Persistence & External Services"]
        TursoDB[("Turso Database\nlibSQL / SQLite over HTTP\n10 Relational Tables")]
        GroqAPI["Groq Cloud API\n(LLM Inference)"]
    end

    UI_Web -->|HTTP / REST| CF_Worker
    UI_Web -.->|Offline / Local API| CoreEngines
    UI_Worker -->|In-Process / REST| CF_Worker
    TG -->|POST /api/telegram/webhook| CF_Worker
    CRON --> CF_Worker

    CF_Worker --> CoreEngines
    CF_Worker --> AIRouterPkg
    CF_Worker --> SkillsPkg
    CF_Worker --> TursoDB

    AIRouterPkg --> GroqAPI
```

---

## Monorepo Layout & Workspaces

The codebase is structured as a `pnpm` workspace monorepo:

| Directory | Package Name | Role & Technology |
| :--- | :--- | :--- |
| `apps/web` | `mentor-web` | Next.js 15.1.7 (App Router), React 19, Tailwind CSS 3.4.17, Lucide React, Web Speech API |
| `workers/mentor-api` | `mentor-api` | Cloudflare Worker edge service, Wrangler 3.109.2, `@libsql/client/web` |
| `packages/mentor-core` | `@personal-mentor/core` | 8 deterministic calculation engines, zero runtime external dependencies |
| `packages/ai-router` | `@personal-mentor/ai-router` | Multi-provider LLM router (Groq, Cloudflare AI, mock fallback) |
| `packages/skills` | `@personal-mentor/skills` | 16 skill definitions in JSON, 42 dimensions, scoring criteria |
| `packages/shared` | `@personal-mentor/shared` | Core TypeScript interfaces, API payloads, database models |
| `database` | N/A | Turso migration script (`migrate-turso.ts`), PostgreSQL schema/seed |
| `prompts` | N/A | Raw markdown prompts for mentor, evaluator, challenge generation |

---

## Technology Stack

- **Runtime Environments**: Node.js v22.23.2, Bun v1.4.2 (used for testing), Cloudflare Workers (Workerd V8 edge runtime).
- **Package Manager**: pnpm 12.4.2.
- **Frontend**: Next.js 15.1.7 (Turbopack/Webpack), React 19.0.0, Tailwind CSS 3.4.17.
- **Backend / Edge**: Cloudflare Workers API.
- **Database**: Turso Database (`libsql://learning-sh15aa.aws-ap-south-1.turso.io`) using `@libsql/client`.
- **AI Models**: Groq Cloud API (`qwen/qwen3.8-27b`), Cloudflare Workers AI (`@cf/meta/llama-3-8b-instruct`, `@cf/openai/whisper`).
- **Acoustic & Speech Analysis**: Deterministic in-browser and server-side `SpeechAnalyzer` (cadence WPM, filler word density, pause estimation).
- **Communication Integrations**: Telegram Bot Webhook.
