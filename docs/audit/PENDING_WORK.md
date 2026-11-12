# 5. Pending & Completed Work Master Inventory

This document tracks the status of all remediations and future backlog items for the **Private AI Mentor OS**.

---

## 1. Remediation Tasks (Batches 1, 2, and 3) - ALL COMPLETED

| Task ID | Task Name | Priority | Complexity | Affected Modules | Status | Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-P0-01** | Add `skills/tsconfig.json` & Fix Skills Types | **P0** | Small | `skills/tsconfig.json`, `skills/package.json` | **COMPLETED** | `tsc --noEmit` passes with 0 errors |
| **TSK-P0-02** | Install `@cloudflare/workers-types` & Fix Worker Types | **P0** | Small | `workers/mentor-api/package.json`, `tsconfig.json` | **COMPLETED** | Worker types resolve cleanly via `@cloudflare/workers-types` v5 |
| **TSK-P0-03** | Fix `TrainingDebtItem` Model & Store Type Casts | **P0** | Small | `packages/shared/src/types/weakness.ts`, `workers/mentor-api/src/store.ts` | **COMPLETED** | Added `targetWeaknessId` and literal type cast `trend: 'STABLE' as const` |
| **TSK-P0-04** | Purge Plaintext Secrets from Code & Wrangler Config | **P0** | Medium | `workers/mentor-api/wrangler.toml`, `database/migrate-turso.ts`, test files | **COMPLETED** | Sanitized tokens to placeholders; `.dev.vars` created for local dev |
| **TSK-P1-01** | Fix Telegram Bot Webhook Response & Outbound Message | **P1** | Medium | `workers/mentor-api/src/index.ts` | **COMPLETED** | Webhook payload `{ method: "sendMessage", ... }` and outbound dispatch working |
| **TSK-P1-02** | Implement API Authentication Guard | **P1** | Medium | `workers/mentor-api/src/index.ts`, `apps/web/src/lib/api-client.ts` | **COMPLETED** | `AUTH_SECRET` Bearer auth guard and `TELEGRAM_WEBHOOK_SECRET` header checks active |
| **TSK-P1-03** | Connect Next.js Standalone Store to Turso DB | **P1** | Medium | `apps/web/src/lib/server-state.ts`, `apps/web/src/lib/turso-store.ts` | **COMPLETED** | TursoWebStore connects and syncs dashboard, challenges, and attempts |
| **TSK-P1-04** | Synchronize 16 Skills Taxonomy in UI Labels | **P1** | Small | `apps/web/src/components/SkillsView.tsx`, `DesktopSidebar.tsx` | **COMPLETED** | `All 16` and `16 Skills Matrix` rendered across UI |
| **TSK-P2-01** | Expand Automated Test Coverage | **P2** | Medium | `packages/mentor-core/src/tests/engines.test.ts`, `workers/mentor-api/src/index.test.ts` | **COMPLETED** | 18/18 tests passing covering all 8 engines, auth, and webhook |
| **TSK-P2-02** | Add Monorepo Build Scripts for All Packages | **P2** | Small | `package.json`, `workers/mentor-api/package.json`, `skills/package.json` | **COMPLETED** | `pnpm build` executes across all 5 workspace projects with 0 errors |
| **TSK-P3-01** | Update Documentation & README | **P3** | Small | `README.md`, `.env.example` | **COMPLETED** | Turso DB, 16 skills, and secret configurations updated |

---

## 2. Future Feature Backlog (Post-Audit Roadmap)

| Backlog ID | Feature / Enhancement | Priority | Estimated Effort | Prerequisites | Description & Scope |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FUT-01** | Cloudflare R2 Audio Storage Pipeline | Medium | 1-2 days | Cloudflare R2 bucket provisioned | Store voice attempt recordings in R2 and persist presigned URLs in the `attempts.recording_url` column. |
| **FUT-02** | Telegram Voice Memo Ingestion Pipeline | Medium | 1-2 days | Cloudflare Worker + Telegram Bot | Receive raw `.ogg` voice memos via Telegram webhook, forward to Groq Whisper API for transcription, and trigger challenge evaluation automatically. |
| **FUT-03** | Daily Push Notification Dispatcher | Low | 1 day | Telegram Bot Token + Cron Trigger | Enhance the scheduled 06:00 AM UTC Cloudflare Cron trigger to proactively push daily training plans and pending debt summaries to the user's Telegram chat. |
| **FUT-04** | End-to-End Browser UI Testing | Low | 1-2 days | Playwright / Vitest | Add headless browser component tests verifying Next.js client audio recording, timer interactions, and score displays. |
