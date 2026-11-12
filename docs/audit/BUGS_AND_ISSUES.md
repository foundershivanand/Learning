# 4. Bugs, Issues & Code Quality Audit

This document catalogues all confirmed bugs, compilation failures, logical flaws, and code quality issues discovered across the repository, along with their resolution status and verification.

---

## Issue Resolution Status Summary

| ID | Issue Description | Severity | Area | Status | Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | Hardcoded Credentials & Exposed Secrets in `wrangler.toml` and test scripts | **CRITICAL** | Security / Config | **RESOLVED** | Credentials sanitized to placeholders; `.dev.vars` created for local run |
| **BUG-02** | Missing `@cloudflare/workers-types` in `workers/mentor-api` | **HIGH** | Build / TypeScript | **RESOLVED** | Installed `@cloudflare/workers-types` v5; `pnpm build` passes |
| **BUG-03** | Type discrepancy on `TrainingDebtItem` (`targetWeaknessId`) | **HIGH** | Type Safety | **RESOLVED** | Added `targetWeaknessId?: string;` to `packages/shared/src/types/weakness.ts` |
| **BUG-04** | Trend Direction type inference bug in `MentorStore` | **HIGH** | Type Safety | **RESOLVED** | Annotated `trend: 'STABLE' as const` in `workers/mentor-api/src/store.ts` |
| **BUG-05** | Missing `tsconfig.json` in `skills` package causing false errors | **HIGH** | Build / Tooling | **RESOLVED** | Created dedicated `skills/tsconfig.json`; `skills` package passes `tsc` |
| **BUG-06** | Broken Telegram webhook response payload | **HIGH** | Integration | **RESOLVED** | Added `{ method: "sendMessage", ... }` and outbound POST with `/train`, `/reflect` |
| **BUG-07** | Missing API authentication & unauthenticated data access | **HIGH** | Security | **RESOLVED** | Added `AUTH_SECRET` Bearer auth guard and `TELEGRAM_WEBHOOK_SECRET` header checks |
| **BUG-08** | Standalone Next.js store not synchronized with Turso | **MEDIUM** | Architecture | **RESOLVED** | Created `apps/web/src/lib/turso-store.ts` and connected `server-state.ts` to Turso DB |
| **BUG-09** | UI label skill count hardcoded to 15 instead of 16 | **LOW** | Frontend UI | **RESOLVED** | Dynamic length interpolation (`All 16`) and `16 Skills Matrix` in sidebar |

---

## Detailed Issue Catalog & Resolution Notes

### 1. BUG-01: Hardcoded Credentials & Exposed Secrets in Source Code
- **Files**: `workers/mentor-api/wrangler.toml`, `database/migrate-turso.ts`, `workers/mentor-api/src/turso-store.test.ts`
- **Severity**: **CRITICAL**
- **Original Problem**: Plaintext libSQL JWT token and Groq API key were committed directly in `wrangler.toml` and test fallbacks.
- **Resolution Applied**:
  - Replaced hardcoded strings in `wrangler.toml` with placeholder instructions to use Cloudflare secret management (`wrangler secret put`).
  - Added `workers/mentor-api/.dev.vars` (ignored by git via `.gitignore`) for local `wrangler dev` execution.
  - Removed fallback credentials from `database/migrate-turso.ts` and `workers/mentor-api/src/turso-store.test.ts`, requiring explicit environment variable injection.
- **Verification**: `git diff` confirms secrets removed; test suite passes without leaking secrets.

---

### 2. BUG-02: TypeScript Compilation Failure in `workers/mentor-api`
- **File**: `workers/mentor-api/package.json`
- **Severity**: **HIGH**
- **Original Problem**: `tsconfig.json` referenced `@cloudflare/workers-types`, but the dependency was missing from `package.json`, causing `TS2688: Cannot find type definition file`.
- **Resolution Applied**:
  - Installed `@cloudflare/workers-types` (`^5.20261110.1`) as a `devDependency` in `workers/mentor-api`.
  - Added `"build": "tsc --noEmit"` to `workers/mentor-api/package.json`.
- **Verification**: `pnpm --filter mentor-api build` completes cleanly with 0 type errors.

---

### 3. BUG-03: Type Discrepancy on `TrainingDebtItem`
- **Files**: `packages/shared/src/types/weakness.ts`, `workers/mentor-api/src/turso-store.ts`
- **Severity**: **HIGH**
- **Original Problem**: `workers/mentor-api/src/turso-store.ts` accessed `d.targetWeaknessId`, but the shared interface only declared `weaknessId?: string`.
- **Resolution Applied**:
  - Updated `TrainingDebtItem` in `packages/shared/src/types/weakness.ts` to support both `weaknessId?: string;` and `targetWeaknessId?: string;`.
- **Verification**: Typechecks cleanly across both `@personal-mentor/shared` and `workers/mentor-api`.

---

### 4. BUG-04: Trend Direction Literal Type Inference Bug
- **File**: `workers/mentor-api/src/store.ts`
- **Severity**: **HIGH**
- **Original Problem**: `initializeDefaultSkills()` initialized `trend: 'STABLE'`, which TypeScript inferred as type `string`, failing assignment to `TrendDirection`.
- **Resolution Applied**:
  - Replaced with `trend: 'STABLE' as const`.
- **Verification**: `workers/mentor-api` compiles without type casting errors.

---

### 5. BUG-05: Missing `tsconfig.json` in `skills` Package
- **File**: `skills/tsconfig.json`
- **Severity**: **HIGH**
- **Original Problem**: Running `tsc` in `skills` defaulted to root `tsconfig.json`, pulling in JSX from Next.js and generating 464 false syntax errors.
- **Resolution Applied**:
  - Created `skills/tsconfig.json` extending root config with module resolution and added `"build": "tsc --noEmit"` to `skills/package.json`.
- **Verification**: `pnpm --filter @personal-mentor/skills build` compiles cleanly.

---

### 6. BUG-06: Broken Telegram Bot Webhook Response Handling
- **File**: `workers/mentor-api/src/index.ts`
- **Severity**: **HIGH**
- **Original Problem**: Handler returned `{ ok: true, chatId, replyText }`, which Telegram's webhook server ignored, preventing bot responses.
- **Resolution Applied**:
  - Updated handler to return standard Telegram webhook method payload:
    `{ method: "sendMessage", chat_id: chatId, text: replyText, parse_mode: "Markdown" }`.
  - Added outbound `fetch` to Telegram Bot API when `TELEGRAM_BOT_TOKEN` is present in the environment.
  - Added support for `/train` and `/reflect` command handling in addition to `/today`, `/debt`, `/history`.
- **Verification**: Verified via test case in `workers/mentor-api/src/index.test.ts`.

---

### 7. BUG-07: Missing API Authentication & Insecure Wildcard CORS
- **File**: `workers/mentor-api/src/index.ts`
- **Severity**: **HIGH**
- **Original Problem**: All API endpoints were completely open without authentication.
- **Resolution Applied**:
  - Implemented `AUTH_SECRET` Bearer token authentication guard protecting `/api/today`, `/api/challenge/*`, `/api/chat`, `/api/profile/*`.
  - Preserved public access for `/api/health`, `/api/telegram/webhook`, and dashboard HTML.
  - Added `TELEGRAM_WEBHOOK_SECRET` header validation (`X-Telegram-Bot-Api-Secret-Token`).
  - Added XML prompt injection delimiters (`<user_attempt_transcript>...`) on LLM synthesis boundaries.
  - Updated `apps/web/src/lib/api-client.ts` to attach `Authorization: Bearer <AUTH_SECRET>`.
- **Verification**: Verified via 401/200 unit tests in `workers/mentor-api/src/index.test.ts`.

---

### 8. BUG-08: Duplicate In-Memory Store in Next.js Standalone
- **Files**: `apps/web/src/lib/turso-store.ts`, `apps/web/src/lib/server-state.ts`
- **Severity**: **MEDIUM**
- **Original Problem**: Next.js API routes ran purely in-memory when worker URL was absent, ignoring Turso DB state.
- **Resolution Applied**:
  - Implemented `TursoWebStore` using `@libsql/client/web` in `apps/web/src/lib/turso-store.ts`.
  - Wired `server-state.ts` to query and mutate Turso DB for dashboard, challenges, attempts, and chat when `TURSO_DATABASE_URL` is set.
- **Verification**: `pnpm --filter mentor-web build` succeeds and routes compile cleanly.

---

### 9. BUG-09: Inconsistent UI Skill Count Mentions
- **Files**: `apps/web/src/components/SkillsView.tsx`, `apps/web/src/components/DesktopSidebar.tsx`
- **Severity**: **LOW**
- **Original Problem**: UI headers and badges hardcoded "15 Skills" and "All 15", omitting Spanish.
- **Resolution Applied**:
  - Updated `SkillsView.tsx` to dynamically interpolate `All ${ALL_SKILLS.length}` (16) and display `16-Skill Mastery Matrix`.
  - Updated sidebar navigation label to `16 Skills Matrix`.
- **Verification**: Visual inspection and Next.js static build pass cleanly.
