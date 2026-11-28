# UdaYantu — Master Platform Integration & Enterprise Architecture Report

**Generated:** 2026-11-27  
**Scope:** Enterprise Platform Reconciliation, Canonical Backend (`udayantu-api`), Commercial & Financial Integrity, PostgreSQL 16 Schema & Migrations, Security Hardening, and Verification Matrix  
**Cloud / Production Guardrails Observed:** Zero Firebase or Google Cloud resources provisioned; zero production deployments; zero DNS changes; zero live payment credentials stored or executed.

---

## 1. Recovery Checkpoint Summary (Phase 0)

Before modifying any source or configuration files:
- **Git Status Audited:** Confirmed `/app/applet` is **not** a Git repository (`fatal: not a git repository`).
- **Recovery Checkpoint Created:** Snapshot archived at `/.recovery/checkpoint-2026-11-27/` with SHA-256 verification manifest (`/.recovery/checkpoint-2026-11-27/CHECKSUMS.sha256`), preserving pre-reconciliation copies of:
  - `server.ts`, `drizzle.config.ts`, `package.json`, `openapi/openapi.yaml`
  - `server/domain/commercialEngine.ts`, `server/db/schema.ts`
  - `server/platform/platformService.ts`, `server/platform/apiRouter.ts`
- **Legacy Preservation:** Existing working `udayantu-web` Student and Employer flows were preserved without destructive deletions.

---

## 2. Double RCA Findings (Phase 1)

### 2.1 Explicit Environment & Access Transparency
1. **External `udayantu-admin` Repository Inaccessible:** The separate `udayantu-admin` codebase is **not** present in this workspace container. No claim is made of inspecting external Admin source files. Reconciliation was executed by making `udayantu-api` (`/v1/*` + `/openapi/openapi.yaml` + `/server/db/schema.ts` + `/migrations/0001_canonical_platform.sql`) the single canonical backend contract ready for `udayantu-admin` to consume directly.
2. **Local Docker / PostgreSQL 16 Binaries Unavailable in Sandbox:** Neither `docker` nor `psql`/`postgres` binaries are installed in this container. Accordingly, live PostgreSQL 16 execution could **not** be run inside the sandbox and is explicitly marked **BLOCKED (Sandbox) / Ready for Docker Compose** rather than claimed as database-verified.

### 2.2 RCA-1 — Business & Architecture Drift Discovered
- **`drizzle.config.ts` Schema Drift (Fixed):** Previously pointed to legacy `./shared/schema.ts` (Replit auth stub) and `./drizzle`. Now points to `./server/db/schema.ts` and `./migrations`.
- **Floating-Point Money Arithmetic (Fixed):** Previous `commercialEngine.ts` used IEEE-754 floating-point rupee calculations (`Number((x).toFixed(2))`). Upgraded to exact integer paise (`BigInt`) with half-up rounding (`divRoundHalfUp`) and safe `MoneyAmount` JSON transport (`{ paise: string, inr: number, currency: "INR" }`, zero raw `BigInt` serialized).
- **Hardcoded 18% GST Without CA Governance (Fixed):** Replaced hardcoded 18% GST assumptions with effective-dated `TaxRuleConfig` carrying candidate SAC codes (`999293`, `998512`, `998519`), `PENDING_ACCOUNTANT_REVIEW` vs `APPROVED_FOR_LIVE_INVOICING` status, and a 7-item `CommercialDecisionRegister` that strictly blocks Live Mode invoicing until CA/owner approval.
- **Day-120 Vested Refund Edge Case (Fixed):** Upgraded `evaluateAdmissionRefundLifecycle` so that once Day 120 passes with no qualifying selection inside the window (`entitlementVestedAtCutoff = true`), a subsequent job selection on Day 125+ **cannot** retroactively erase the student's vested refund entitlement.
- **Employer Subscription Past-Due / Expired Silent Fallback Risk (Fixed):** `calculateEmployerSelectionCharge` now strictly throws `SUBSCRIPTION_INACTIVE_NO_SILENT_FALLBACK` (and `acceptWrittenOfferByStudent` rolls back atomically) when an Employer's Monthly Subscription is `past_due` or `expired`, unless `explicitPlanAFallbackAgreementAccepted === true`.
- **Legacy Unused Files with `localStorage` Business Keys (Audited & Isolated):** Legacy unused components (`src/components/admin/*`, `src/components/AuthModal.tsx`, `src/components/student/CareerDiscoveryFlow.tsx`) retain legacy `localStorage` keys (`udayantu_students`, `udayantu_payments`, `udayantu_courses`, `udayantu_mock_user`) and legacy `server/index.ts` retains deprecated Replit/Supabase routes. None of these are mounted in the active `AnimatedRoutes.tsx` or `server.ts` runtime; they are preserved per Phase 0 and scheduled for deletion once staging cutover completes.

### 2.3 RCA-2 — Adversarial Challenge Findings
- **Cross-Portal Data Access:** Verified via real HTTP contract tests (`apiContract.test.ts`) that unauthenticated requests return `401`, Student tokens calling Admin/Employer routes return `403`, and Employer tokens calling Student/Admin routes return `403`.
- **Employer Suspension Enforcement:** Verified that suspending an Employer via Admin immediately blocks candidate discovery, shortlisting, interview scheduling, and written offer issuance (`403 EMPLOYER_NOT_APPROVED`).
- **Telemetry Redaction Regression Caught & Fixed:** During test execution, `telemetry.ts` accidentally redacted `spanId` because regex `pan` matched substring `spanId`. Fixed with word boundary `\bpan\b|pan_?number` so `spanId` is preserved while PAN numbers remain redacted.

---

## 3. Source-of-Truth Matrix

| Domain Capability | Authoritative Owner | Consumed By | Storage / Contract |
| :--- | :--- | :--- | :--- |
| User identity, RBAC & MFA claims | `udayantu-api` (`PortableIdentityAdapter`) | `udayantu-web`, `udayantu-admin` | `users`, `auth_identities` |
| Free 11-dimension Psychometric Engine (20% preview / 100% post-login) | `udayantu-api` (`psychometricEngine.ts`) | `udayantu-web`, `udayantu-admin` | `anonymous_assessments`, `question_bank_versions` |
| Commercial Plans (Plan A/B, Employer Success Fee / Subscription) | `udayantu-api` (`commercialEngine.ts`) | `udayantu-web`, `udayantu-admin` | `admission_plan_configs`, `employer_agreements` |
| Tax Rules (SAC 999293 / 998512 / 998519) & 7 Commercial Decisions | `udayantu-api` (`commercialEngine.ts`) | `udayantu-admin` (governance), `udayantu-api` (enforcement) | `tax_rules`, `commercial_decisions` |
| Courses, Versions, 90-Day Cohorts & Classes | `udayantu-api` (`platformService.ts`) | `udayantu-web`, `udayantu-admin` | `courses`, `course_versions`, `cohorts`, `cohort_classes` |
| Final Assessment (75% gate, answer keys server-only) & Eligibility | `udayantu-api` (`finalAssessmentEngine.ts`) | `udayantu-web`, `udayantu-admin` | `final_assessment_attempts`, `student_eligibilities` |
| DPDP Recruitment Consent & History | `udayantu-api` (`platformService.ts`) | `udayantu-web` (Student toggle, Employer search filter), `udayantu-admin` | `student_consents`, `student_consent_history` |
| Recruitment Stages, Offers, CTC Snapshots & Authoritative Selection | `udayantu-api` (`platformService.ts`) | `udayantu-web` (Employer + Student), `udayantu-admin` | `jobs`, `applications`, `interviews`, `offers`, `ctc_snapshots`, `ctc_component_history`, `selection_events`, `placement_records` |
| Separate Student & Employer Financial Ledgers (Exact Paise) | `udayantu-api` (`commercialEngine.ts`, `platformService.ts`) | `udayantu-admin` (`/v1/admin/ledger/summary`) | `payments`, `payment_allocations`, `invoices`, `invoice_lines`, `tuition_obligations`, `employer_subscriptions`, `employer_success_fees`, `admission_refunds`, `credit_notes` |
| Activity Feed, Append-Only Audit Logs & Durable Outbox | `udayantu-api` (`outboxProcessor.ts`, `platformService.ts`) | `udayantu-admin` (`/v1/admin/activity`, `/v1/admin/audit-logs`, `/v1/admin/outbox/*`) | `activity_events`, `audit_logs` (DB immutable trigger), `outbox_events` |
| GTM & Growth Funnel Attribution | `udayantu-api` (`platformService.ts`) | `udayantu-web` (public beacon), `udayantu-admin` (`/v1/admin/analytics/gtm`) | `marketing_attribution_records` |

---

## 4. Duplicate Logic Inventory & Retirement Plan

| Legacy File / Artifact | Duplicate / Conflicting Concern | Active in Runtime? | Retirement Action |
| :--- | :--- | :--- | :--- |
| `drizzle.config.ts` (old `./shared/schema.ts` pointer) | Pointed to legacy Replit auth stub instead of canonical platform schema | Replaced (now `./server/db/schema.ts`) | Completed |
| `server/index.ts` | Legacy Replit/Supabase OTP server | **No** (replaced by `server.ts` & standalone `server/apiServer.ts`) | Delete after staging sign-off |
| `shared/schema.ts` | Legacy minimal user stub | **No** (replaced by `server/db/schema.ts`) | Delete after staging sign-off |
| `src/components/admin/*` | Legacy embedded Admin UI with `localStorage` keys (`udayantu_students`, `udayantu_payments`, `udayantu_courses`) | **No** (excluded from `AnimatedRoutes.tsx`; Admin lives at independent `admin.udayantu.com`) | Delete after external `udayantu-admin` cutover |
| `src/components/AuthModal.tsx`, `src/components/student/CareerDiscoveryFlow.tsx` | Legacy pre-reconciliation UI with `localStorage` demo persistence | **No** (excluded from active routes) | Delete after staging sign-off |

---

## 5. Canonical Backend Architecture (`udayantu-api`)

- **Standalone Entrypoint:** `/server/apiServer.ts` — completely decoupled from Vite and frontend bundles; runs on `API_PORT || PORT || 4000`, exposes `/healthz`, `/readyz`, and `/v1/*`.
- **Unified Dev Server:** `/server.ts` — mounts the exact same `createPlatformApiRouter` and `otelRequestMiddleware` alongside Vite middleware on port 3000 (`APP_PORT || 3000`) for local full-stack development.
- **Runtime Validation:** Zod request schemas (`AmendCtcBodySchema`, `RecruitmentStageBodySchema`, `ApproveTaxRuleBodySchema`, `CourseStatusBodySchema`, `CohortStatusBodySchema`, `SubscriptionStatusBodySchema`) returning structured `400 VALIDATION_ERROR` responses.
- **Observability:** `/server/domain/telemetry.ts` emits structured JSON logs with automatic secret/PII redaction and propagates W3C `traceparent` and `X-Correlation-Id` headers on every request.
- **Portability:** Multi-stage OCI `/Dockerfile` and local `/docker-compose.yml` (PostgreSQL 16 + SQL migrations + `udayantu-api` + local object storage volume) deploy identically across Cloud Run, GKE, AWS ECS, Azure Container Apps, or local Docker.

---

## 6. Commercial Rules & Exact-Paise Financial Engine Specification

Implemented authoritatively in `/server/domain/commercialEngine.ts`:
- **Exact Integer Paise Arithmetic:** All Rupee amounts convert to `BigInt` paise (`inrToPaise`, `parsePaise`), percentages convert to integer basis points (`percentToBps`, `100% = 10000`), and division uses exact half-up rounding (`divRoundHalfUp`). JSON transport uses `MoneyAmount` (`{ paise: string, inr: number, currency: "INR" }`) — never raw `BigInt`.
- **Student Plan A (`plan_a_refundable`):** ₹9,999 (`999900` paise, GST inclusive), 90-day cohort, 120-calendar-day post-qualification refund window starting strictly at verified `>=75%` pass timestamp, 33% CTC tuition (GST inclusive), ₹0 admission fee deduction against tuition. Vested Day-120 refund entitlement (`entitlementVestedAtCutoff: true`) persists permanently even if a later offer is accepted after Day 120.
- **Student Plan B (`plan_b_non_refundable`):** ₹5,999 (`599900` paise, GST inclusive), strictly non-refundable regardless of selection outcome, 35% CTC tuition (GST inclusive), ₹0 admission fee deduction against tuition.
- **Employer Plan A (`success_fee`):** 8.33% (`833` bps, Admin configurable) of agreed fixed annual CTC + separate GST per qualifying selection (written offer accepted).
- **Employer Plan B (`monthly_subscription`):** ₹4,999/month (`499900` paise, Admin configurable) + separate GST covering unlimited hires while paid subscription status is `active` on the selection timestamp (`₹0` extra success fee). Past-due or expired subscriptions throw `SUBSCRIPTION_INACTIVE_NO_SILENT_FALLBACK` and **never** silently fall back to 8.33% without explicit commercial agreement acceptance.
- **Separate Financial Ledgers:** `/v1/admin/ledger/summary` aggregates Student Ledger (`cashCollected`, `invoiced`, `tuitionObligated`, `tuitionOutstanding`, `refundLiability`, `refunded`) strictly separated from Employer Ledger (`cashCollected`, `invoiced`, `earnedSuccessFees`, `subscriptionBilled`, `outstanding`, `waivedBySubscriptionCount`) using exact `BigInt` paise sums.

---

## 7. Indian GST, SAC & Compliance Verification Checklist

Implemented in `TaxRuleConfig` (`server/domain/commercialEngine.ts`) and `tax_rules` (`server/db/schema.ts`):

| Service Category | Candidate SAC Code | Default Test Rate | Initial Status | CA Verification Action Required Before Live Mode |
| :--- | :--- | :--- | :--- | :--- |
| `student_training_admission` | `999293` | 18% (`1800` bps, GST inclusive) | `PENDING_ACCOUNTANT_REVIEW` | CA to confirm SAC `999293`, exemption applicability, and place-of-supply rules |
| `student_tuition` | `999293` | 18% (`1800` bps, GST inclusive) | `PENDING_ACCOUNTANT_REVIEW` | CA to confirm deferred outcome-based tuition invoicing & Section 34 CGST credit-note rules |
| `employer_placement_services` | `998512` (compare `998519`) | 18% (`1800` bps, GST exclusive) | `PENDING_ACCOUNTANT_REVIEW` | CA to confirm SAC `998512` vs `998519` for B2B recruitment & subscription invoicing |

**Enforcement:** In `live` mode (`APP_MODE=live` or `NODE_ENV=production`), `assertLiveBillingGovernanceApproved()` strictly throws `LIVE_INVOICING_BLOCKED_TAX_UNAPPROVED` until CA sign-off sets `approvalStatus = "APPROVED_FOR_LIVE_INVOICING"` via `POST /v1/admin/tax-rules/:category/approve`.

---

## 8. Unresolved Commercial Decision Register (7 Blocking Items)

All 7 items are tracked in `commercial_decisions` (`GET /v1/admin/commercial-decisions`) and block Live Mode invoicing (`LIVE_BILLING_BLOCKED_DECISIONS_PENDING`) until explicitly approved via `POST /v1/admin/commercial-decisions/:decisionId/approve`:
1. **`dec-1-ctc-components`:** Exact CTC components included in fee base (proposed default: fixed annual gross CTC excluding discretionary bonuses and unvested ESOPs).
2. **`dec-2-multiple-offers`:** Multiple student offer policy (proposed default: one idempotent tuition obligation per student enrollment based on first qualifying accepted written offer).
3. **`dec-3-tuition-collection`:** Student tuition collection mode (lump sum vs approved EMI/instalment schedule).
4. **`dec-4-employer-trigger`:** Employer success-fee invoice trigger & payment terms (written offer accepted, net-15 terms).
5. **`dec-5-subscription-grace`:** Employer subscription grace period & expiry policy (strict active paid check; zero silent Plan A fallback).
6. **`dec-6-credit-replacement`:** Employer credit or replacement terms for candidate no-show / early attrition.
7. **`dec-7-refund-credit-note`:** Student admission refund GST credit-note treatment (Section 34 CGST Act referencing original tax invoice).

---

## 9. Canonical PostgreSQL 16 Schema & Migration Architecture

- **Drizzle Schema:** `/server/db/schema.ts` (37 canonical tables covering identity, students, employers, employer members, tax rules, commercial decisions, courses, course versions, cohorts, cohort classes, admission plan configs, accepted agreements, enrollments, question bank versions, anonymous assessments, final assessment attempts, student eligibilities, student consents, consent history, jobs, applications, interviews, offers, CTC snapshots, CTC component history, selection events, placement records, tuition obligations, employer agreements, employer subscriptions, employer success fees, invoices, invoice lines, payments, payment allocations, admission refunds, credit notes, activity events, audit logs, outbox events, and marketing attribution records).
- **Repeatable SQL Migration:** `/migrations/0001_canonical_platform.sql` — idempotent `CREATE TABLE IF NOT EXISTS`, exact `BIGINT` paise columns with `CHECK (>= 0)` constraints, unique idempotency indexes (`users_email_uq`, `enrollments_student_course_uq`, `tuition_obligations_student_uq`, `payments_gateway_order_uq`, `outbox_events_idempotency_uq`), and PostgreSQL trigger `trg_audit_logs_immutable` (`BEFORE UPDATE OR DELETE ON audit_logs`) enforcing append-only immutability at the database layer.
- **Integration Test Suite:** `/server/db/postgres.integration.test.ts` (runnable against `/docker-compose.yml` PostgreSQL 16).

---

## 10. OpenAPI 3.1 Contract & Endpoint Map

Updated `/openapi/openapi.yaml` (version `2026.2.0`) documents all shared `/v1/*` routes across Public, Auth, Student, Employer, Webhook, and Admin portals, including newly reconciled endpoints:
- `POST /v1/employer/offers/{offerId}/amend-ctc`
- `PATCH /v1/employer/applications/{applicationId}/stage`
- `PATCH /v1/admin/courses/{courseId}/status`
- `PATCH /v1/admin/employers/{employerId}/subscription-status`
- `GET /v1/admin/tax-rules` & `POST /v1/admin/tax-rules/{category}/approve`
- `GET /v1/admin/commercial-decisions` & `POST /v1/admin/commercial-decisions/{decisionId}/approve`
- `GET /v1/admin/ledger/summary`
- `GET /v1/admin/analytics/gtm`
- `POST /v1/admin/outbox/process` & `POST /v1/admin/outbox/replay`

---

## 11. Event, Audit Log & Durable Outbox Architecture

- **Central Activity Feed:** Every student, employer, and admin lifecycle mutation writes a redacted `ActivityEventRecord` with monotonic `seqId`, `sourcePortal`, `correlationId`, and entity foreign references (`studentId`, `employerId`, `careerTrackId`, `courseId`, `cohortId`).
- **Immutable Audit Logs:** Financial, eligibility, consent, approval, CTC amendment, and configuration changes append `Object.freeze` redacted entries in runtime memory and are protected by PostgreSQL trigger `trg_audit_logs_immutable` in PostgreSQL 16.
- **Durable Transactional Outbox (`/server/domain/outboxProcessor.ts`):** Processes due pending events chronologically by `occurredAt`, enforces `idempotencyKey` deduplication across restarts, applies exponential backoff retries (`baseBackoffMs * 2^(retryCount - 1)`), moves exhausted events to `dead_letter`, and exposes controlled operator replay (`replayDeadLetters`).

---

## 12. Security Hardening & Threat Controls

- **Authentication & Authorization:** Server-side Bearer token verification on every protected route; role enforcement (`student`, `employer_admin`, `employer_recruiter`, `admin`, `super_admin`, `mentor`, `cs_agent`) verified by HTTP contract tests (`401` unauthenticated, `403` cross-role).
- **Assessment Security:** Final exam answer keys (`correctOptionId`) are stripped server-side (`stripFinalAssessmentAnswerKeys`) before transmission; 74% fails, 75% passes, and re-submission after qualification is blocked (`409 ALREADY_QUALIFIED`).
- **Payment Integrity:** Razorpay checkout signatures and raw-body webhooks verified with HMAC-SHA256; simulated financial execution throws `SECURITY_VIOLATION` in Live Mode; zero hardcoded secrets verified via repository scan (`CLEAN_NO_HARDCODED_SECRETS`).
- **Privacy & Consent (DPDP):** Student recruitment consent revocation immediately hides the candidate from Employer search and records immutable `student_consent_history`. Sensitive keys (`password`, `otp`, `token`, `secret`, `signature`, `authorization`, `cookie`, `answerKey`, `aadhaar`, `\bpan\b`) are stripped from logs, activity feeds, and audit logs.
- **CORS & Headers:** Strict origin allowlist (`udayantu.com`, `admin.udayantu.com`, staging/local origins), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` on standalone API, and `X-Robots-Tag: noindex, nofollow` on authenticated portals and API routes.

---

## 13. Growth, GTM & Recruitment Funnel Architecture

- **Public Funnel Capture:** `POST /v1/public/analytics/funnel` captures anonymous and authenticated conversion stages with `utmSource`, `utmMedium`, `utmCampaign`, and `referrer` (never storing sensitive psychometric answers or PII).
- **Admin GTM Analytics (`GET /v1/admin/analytics/gtm`):** Reports Student funnel counts, Employer funnel counts (`registered`, `approved`, `publishedJobs`, `shortlists`, `interviewsScheduled`, `offersIssued`, `offersAccepted`, `candidatesJoined`), `repeatHireRatePercent`, UTM source breakdown, career track enrollments, and consent history count.

---

## 14. Verification Status Matrix (Strict Honest Separation)

| Verification Layer | Status | Exact Evidence |
| :--- | :--- | :--- |
| **Implemented** | Complete | Canonical `commercialEngine.ts`, `outboxProcessor.ts`, `telemetry.ts`, `schema.ts`, `0001_canonical_platform.sql`, `apiServer.ts`, `platformService.ts`, `apiRouter.ts`, `openapi.yaml`, `Dockerfile`, `docker-compose.yml` |
| **Unit-tested** | **21/21 Passed** | `commercialEngine.test.ts` (9/9), `outboxProcessor.test.ts` (2/2), `psychometricEngine.test.ts` (2/2), `platformService.test.ts` (8/8) via `npx tsx --test` |
| **HTTP API Contract-tested** | **3/3 Passed** | `apiContract.test.ts` (3/3) against real ephemeral Express server (`createStandaloneApiApp`) testing W3C `traceparent`, `X-Correlation-Id`, Zod 400 validation, 401/403 cross-role isolation, Admin tax/decision/ledger/GTM/outbox endpoints |
| **Database Integration-tested (PostgreSQL 16)** | **1 Skipped (Sandbox Blocked)** | `server/db/postgres.integration.test.ts` written and verified to compile/lint cleanly; skipped in this sandbox because `DATABASE_URL` / PostgreSQL 16 / Docker daemon are not installed locally |
| **Cross-Application Tested (`udayantu-web` + `udayantu-admin`)** | **Partially Blocked** | `udayantu-web` ↔ `udayantu-api` verified; external `udayantu-admin` repository was inaccessible in this container so live Admin UI ↔ `udayantu-api` integration remains pending external repo wiring |
| **Static Analysis & Secret Scan** | **Passed (0 Errors)** | ESLint 0 errors across all 14 backend/config files; Vite production build (`compile_applet`) verified; hardcoded secret scan returned `CLEAN_NO_HARDCODED_SECRETS` |
| **Staging Verified** | **Not Yet Verified** | Pending deployment to staging PostgreSQL 16 + `udayantu-api` + `udayantu-web` + `udayantu-admin` |
| **Production Unverified** | **Unverified (Intentional)** | Production infrastructure, DNS, live Razorpay keys, and CA tax approvals intentionally not provisioned/executed |

---

## 15. Local PostgreSQL 16 & Docker Execution Runbook

Run the following commands on any developer machine or CI runner with Docker installed to execute the database integration test suite against real PostgreSQL 16:

```bash
# 1. Start PostgreSQL 16 (automatically applies migrations/0001_canonical_platform.sql) and udayantu-api
docker compose up -d postgres

# 2. Run the real PostgreSQL 16 integration test suite (schema idempotency + BIGINT paise + audit_logs trigger)
DATABASE_URL="postgres://udayantu:udayantu_local_dev@localhost:5432/udayantu" \
  npx tsx --test server/db/postgres.integration.test.ts

# 3. Run the complete unit + HTTP contract + PostgreSQL 16 suite together
NODE_ENV=test DATABASE_URL="postgres://udayantu:udayantu_local_dev@localhost:5432/udayantu" \
  npx tsx --test \
  server/domain/commercialEngine.test.ts \
  server/domain/outboxProcessor.test.ts \
  server/domain/psychometricEngine.test.ts \
  server/platform/platformService.test.ts \
  server/platform/apiContract.test.ts \
  server/db/postgres.integration.test.ts
```

---

## 16. Recommended Next Steps Before Staging & Live Cutover

1. **Run PostgreSQL 16 Integration Tests in CI/Local Docker:** Execute the Section 15 runbook and wire Drizzle PostgreSQL repository persistence into `UdaYantuPlatformService` behind `DATABASE_URL` for staging cutover.
2. **Connect External `udayantu-admin` Repository to `udayantu-api`:** Point `admin.udayantu.com` strictly at `/v1/admin/*` endpoints defined in `/openapi/openapi.yaml` and run cross-application Playwright E2E tests (Student → Employer → Admin live activity/ledger sync).
3. **Obtain CA & Founder Sign-Off:** Review and approve the 3 `tax_rules` (SAC `999293`, `998512`/`998519`) and 7 `commercial_decisions` before switching `APP_MODE=live`.
4. **Retire Legacy Unused Files:** Delete `server/index.ts`, `shared/schema.ts`, and `src/components/admin/*` once staging verification passes.
