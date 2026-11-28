/**
 * Authoritative PostgreSQL Schema (Drizzle ORM) — Single Shared Database
 *
 * Shared across udayantu.com (Student + Employer) and admin.udayantu.com (Independent Admin)
 * exclusively via api.udayantu.com.
 *
 * Includes:
 * - Internal UUID users + portable auth_identities mapping (decoupled from Firebase UIDs)
 * - Anonymous pre-login psychometric sessions + full recommendations
 * - Canonical 8 career tracks, courses, 90-day cohorts, live classes, modules, assignments
 * - Plan A (₹9,999 refundable, 33% CTC) & Plan B (₹5,999 non-refundable, 35% CTC) agreements
 * - Server-side payments, GST invoices, 120-day refund lifecycle, idempotent tuition obligations
 * - Final assessments (75% gate), verified eligibility, and immediate recruitment consent
 * - Employer accounts (verified business email + Admin approval), jobs, shortlists, interviews, offers
 * - Employer commercial agreements (8.33% success fee + GST vs ₹4,999/mo subscription + GST)
 * - Central activity_events, append-only audit_logs, transactional outbox_events, funnel_events
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
  bigserial,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    primaryRole: varchar("primary_role", { length: 32 }).notNull(), // student | employer_admin | employer_recruiter | admin | super_admin | mentor | cs_agent
    email: varchar("email", { length: 255 }).notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    phoneE164: varchar("phone_e164", { length: 20 }),
    phoneVerifiedAt: timestamp("phone_verified_at", { withTimezone: true }),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email)]
);

export const authIdentities = pgTable(
  "auth_identities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 32 }).notNull(), // firebase | local_sandbox | oidc
    providerUid: varchar("provider_uid", { length: 255 }).notNull(),
    mfaEnrolled: boolean("mfa_enrolled").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("auth_identities_provider_uid_uq").on(t.provider, t.providerUid)]
);

export const anonymousAssessments = pgTable(
  "anonymous_assessments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionToken: varchar("session_token", { length: 128 }).notNull(),
    engineVersion: varchar("engine_version", { length: 32 }).notNull(),
    answersJson: jsonb("answers_json").notNull().default({}),
    status: varchar("status", { length: 24 }).notNull().default("in_progress"), // in_progress | submitted | claimed
    previewReportJson: jsonb("preview_report_json"),
    fullReportJson: jsonb("full_report_json"),
    claimedByUserId: uuid("claimed_by_user_id").references(() => users.id),
    utmSource: varchar("utm_source", { length: 120 }),
    utmCampaign: varchar("utm_campaign", { length: 120 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("anonymous_assessments_token_uq").on(t.sessionToken)]
);

export const admissionPlanConfigs = pgTable("admission_plan_configs", {
  code: varchar("code", { length: 40 }).primaryKey(), // plan_a_refundable | plan_b_non_refundable
  name: varchar("name", { length: 160 }).notNull(),
  priceInr: numeric("price_inr", { precision: 10, scale: 2 }).notNull(),
  gstRatePercent: numeric("gst_rate_percent", { precision: 5, scale: 2 }).notNull().default("18.00"),
  cohortDurationDays: integer("cohort_duration_days").notNull().default(90),
  refundable: boolean("refundable").notNull(),
  refundWindowDays: integer("refund_window_days"),
  tuitionCtcPercent: numeric("tuition_ctc_percent", { precision: 5, scale: 2 }).notNull(),
  agreementVersion: varchar("agreement_version", { length: 64 }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  careerTrackId: varchar("career_track_id", { length: 64 }).notNull(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  titleEn: varchar("title_en", { length: 160 }).notNull(),
  titleHi: varchar("title_hi", { length: 160 }),
  durationDays: integer("duration_days").notNull().default(90),
  passingThresholdPct: integer("passing_threshold_pct").notNull().default(75),
  status: varchar("status", { length: 24 }).notNull().default("published"), // draft | published | disabled
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cohorts = pgTable("cohorts", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id),
  name: varchar("name", { length: 120 }).notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  capacity: integer("capacity").notNull().default(60),
  status: varchar("status", { length: 24 }).notNull().default("active"), // active | disabled | completed
  disabledAccessPolicy: varchar("disabled_access_policy", { length: 48 })
    .notNull()
    .default("read_only_preserve_records"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentUserId: uuid("student_user_id")
      .notNull()
      .references(() => users.id),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id),
    cohortId: uuid("cohort_id")
      .notNull()
      .references(() => cohorts.id),
    planCode: varchar("plan_code", { length: 40 }).notNull(),
    lockedAdmissionFeeInr: numeric("locked_admission_fee_inr", { precision: 10, scale: 2 }).notNull(),
    lockedTuitionCtcPercent: numeric("locked_tuition_ctc_percent", { precision: 5, scale: 2 }).notNull(),
    acceptedAgreementVersion: varchar("accepted_agreement_version", { length: 64 }).notNull(),
    acceptedAgreementAt: timestamp("accepted_agreement_at", { withTimezone: true }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("pending_payment"), // pending_payment | active | completed | paused_cohort_disabled
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("enrollments_student_course_uq").on(t.studentUserId, t.courseId)]
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    enrollmentId: uuid("enrollment_id").references(() => enrollments.id),
    gateway: varchar("gateway", { length: 32 }).notNull().default("razorpay"),
    gatewayOrderId: varchar("gateway_order_id", { length: 128 }).notNull(),
    gatewayPaymentId: varchar("gateway_payment_id", { length: 128 }),
    taxableBaseInr: numeric("taxable_base_inr", { precision: 10, scale: 2 }).notNull(),
    gstAmountInr: numeric("gst_amount_inr", { precision: 10, scale: 2 }).notNull(),
    totalPayableInr: numeric("total_payable_inr", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("created"), // created | captured | failed | refunded
    webhookEventId: varchar("webhook_event_id", { length: 128 }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("payments_gateway_order_uq").on(t.gatewayOrderId)]
);

export const finalAssessmentAttempts = pgTable("final_assessment_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentUserId: uuid("student_user_id")
    .notNull()
    .references(() => users.id),
  enrollmentId: uuid("enrollment_id")
    .notNull()
    .references(() => enrollments.id),
  assessmentVersion: varchar("assessment_version", { length: 64 }).notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  scorePercent: numeric("score_percent", { precision: 5, scale: 2 }).notNull(),
  passingThresholdPercent: integer("passing_threshold_percent").notNull().default(75),
  passed: boolean("passed").notNull(),
  sectionScoresJson: jsonb("section_scores_json").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
});

export const studentConsents = pgTable("student_consents", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentUserId: uuid("student_user_id")
    .notNull()
    .references(() => users.id)
    .unique(),
  employerVisibilityGranted: boolean("employer_visibility_granted").notNull().default(false),
  policyVersion: varchar("policy_version", { length: 32 }).notNull(),
  grantedAt: timestamp("granted_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const employers = pgTable("employers", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyName: varchar("company_name", { length: 180 }).notNull(),
  officialDomain: varchar("official_domain", { length: 120 }).notNull().unique(),
  registrationId: varchar("registration_id", { length: 80 }),
  approvalStatus: varchar("approval_status", { length: 24 }).notNull().default("pending"), // pending | approved | rejected | suspended
  billingModel: varchar("billing_model", { length: 32 }).notNull().default("success_fee"),
  customSuccessFeePercent: numeric("custom_success_fee_percent", { precision: 5, scale: 2 }).default("8.33"),
  customMonthlyFeeInr: numeric("custom_monthly_fee_inr", { precision: 10, scale: 2 }).default("4999.00"),
  subscriptionActiveFrom: timestamp("subscription_active_from", { withTimezone: true }),
  subscriptionActiveUntil: timestamp("subscription_active_until", { withTimezone: true }),
  commercialAgreementVersion: varchar("commercial_agreement_version", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tuitionObligations = pgTable(
  "tuition_obligations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentUserId: uuid("student_user_id")
      .notNull()
      .references(() => users.id),
    offerId: uuid("offer_id").notNull(),
    employerId: uuid("employer_id")
      .notNull()
      .references(() => employers.id),
    jobId: uuid("job_id").notNull(),
    planCode: varchar("plan_code", { length: 40 }).notNull(),
    agreedCtcInr: numeric("agreed_ctc_inr", { precision: 12, scale: 2 }).notNull(),
    tuitionPercent: numeric("tuition_percent", { precision: 5, scale: 2 }).notNull(),
    totalTuitionInclusiveInr: numeric("total_tuition_inclusive_inr", { precision: 12, scale: 2 }).notNull(),
    agreementVersion: varchar("agreement_version", { length: 64 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("issued"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  // Idempotency: Default policy = first qualifying accepted offer per student
  (t) => [uniqueIndex("tuition_obligations_student_uq").on(t.studentUserId)]
);

export const activityEvents = pgTable(
  "activity_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    seqId: bigserial("seq_id", { mode: "number" }).notNull(),
    eventType: varchar("event_type", { length: 80 }).notNull(),
    eventVersion: integer("event_version").notNull().default(1),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
    actorUserId: uuid("actor_user_id"),
    actorRole: varchar("actor_role", { length: 32 }).notNull(),
    sourcePortal: varchar("source_portal", { length: 24 }).notNull(), // student | employer | admin | system
    entityType: varchar("entity_type", { length: 48 }).notNull(),
    entityId: varchar("entity_id", { length: 128 }).notNull(),
    employerId: uuid("employer_id"),
    correlationId: varchar("correlation_id", { length: 128 }).notNull(),
    safeMetadata: jsonb("safe_metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("activity_events_type_idx").on(t.eventType), index("activity_events_occurred_idx").on(t.occurredAt)]
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: uuid("actor_user_id"),
    actorRole: varchar("actor_role", { length: 32 }).notNull(),
    action: varchar("action", { length: 96 }).notNull(),
    resourceType: varchar("resource_type", { length: 64 }).notNull(),
    resourceId: varchar("resource_id", { length: 128 }).notNull(),
    previousValuesRedacted: jsonb("previous_values_redacted"),
    newValuesRedacted: jsonb("new_values_redacted"),
    sourcePortal: varchar("source_portal", { length: 24 }).notNull(),
    requestId: varchar("request_id", { length: 128 }).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("audit_logs_occurred_idx").on(t.occurredAt)]
);

export const outboxEvents = pgTable(
  "outbox_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventType: varchar("event_type", { length: 80 }).notNull(),
    aggregateId: varchar("aggregate_id", { length: 128 }).notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 160 }).notNull(),
    eventPayload: jsonb("event_payload").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    retryCount: integer("retry_count").notNull().default(0),
    deliveryStatus: varchar("delivery_status", { length: 24 }).notNull().default("pending"), // pending | processing | delivered | dead_letter
  },
  (t) => [uniqueIndex("outbox_events_idempotency_uq").on(t.idempotencyKey)]
);
