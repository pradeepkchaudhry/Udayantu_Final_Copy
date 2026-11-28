/**
 * Canonical Authoritative PostgreSQL 16 Schema (Drizzle ORM) — Single Shared Database
 *
 * Owned exclusively by `udayantu-api`.
 * Consumed indirectly by `udayantu-web` (https://udayantu.com — Student + Employer)
 * and `udayantu-admin` (https://admin.udayantu.com — Independent Admin) strictly via `/v1/*`.
 *
 * Monetary Integrity:
 * - Every financial amount is stored in exact integer paise using PostgreSQL BIGINT (`bigint({ mode: "bigint" })`).
 * - Tax rates and percentages are stored in integer basis points (`*_bps`, 100% = 10000).
 * - Append-only audit logs are protected by a PostgreSQL BEFORE UPDATE OR DELETE trigger
 *   in `/migrations/0001_canonical_platform.sql`.
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  bigint,
  boolean,
  timestamp,
  jsonb,
  bigserial,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ==================== 1. IDENTITY, USERS & ORGANIZATIONS ====================

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
    status: varchar("status", { length: 32 }).notNull().default("active"), // active | suspended | deleted
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

export const students = pgTable(
  "students",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    degreeStream: varchar("degree_stream", { length: 64 }), // BA | BSc | BCom | BBA | Other
    graduationYear: integer("graduation_year"),
    city: varchar("city", { length: 120 }),
    preferredLanguage: varchar("preferred_language", { length: 16 }).notNull().default("en"),
    primaryCareerTrackId: varchar("primary_career_track_id", { length: 64 }),
    profileCompletionPct: integer("profile_completion_pct").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("students_track_idx").on(t.primaryCareerTrackId)]
);

export const employers = pgTable(
  "employers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyName: varchar("company_name", { length: 180 }).notNull(),
    officialDomain: varchar("official_domain", { length: 120 }).notNull(),
    registrationId: varchar("registration_id", { length: 80 }),
    industry: varchar("industry", { length: 120 }),
    city: varchar("city", { length: 120 }),
    approvalStatus: varchar("approval_status", { length: 24 }).notNull().default("pending"), // pending | approved | rejected | suspended
    billingModel: varchar("billing_model", { length: 32 }).notNull().default("success_fee"), // success_fee | monthly_subscription
    customSuccessFeeBps: integer("custom_success_fee_bps").notNull().default(833), // 8.33% = 833 bps
    customMonthlyFeePaise: bigint("custom_monthly_fee_paise", { mode: "bigint" })
      .notNull()
      .default(499900n),
    subscriptionStatus: varchar("subscription_status", { length: 24 }).notNull().default("none"), // none | active | past_due | expired | cancelled
    subscriptionActiveFrom: timestamp("subscription_active_from", { withTimezone: true }),
    subscriptionActiveUntil: timestamp("subscription_active_until", { withTimezone: true }),
    commercialAgreementVersion: varchar("commercial_agreement_version", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("employers_domain_uq").on(t.officialDomain),
    index("employers_approval_idx").on(t.approvalStatus),
  ]
);

export const employerMembers = pgTable(
  "employer_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employerId: uuid("employer_id")
      .notNull()
      .references(() => employers.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    memberRole: varchar("member_role", { length: 32 }).notNull().default("employer_recruiter"), // employer_admin | employer_recruiter
    status: varchar("status", { length: 24 }).notNull().default("active"), // active | invited | revoked
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("employer_members_org_user_uq").on(t.employerId, t.userId)]
);

// ==================== 2. TAX GOVERNANCE & COMMERCIAL DECISIONS ====================

export const taxRules = pgTable(
  "tax_rules",
  {
    id: varchar("id", { length: 80 }).primaryKey(),
    serviceCategory: varchar("service_category", { length: 64 }).notNull(), // student_training_admission | student_tuition | employer_placement_services
    candidateSacCode: varchar("candidate_sac_code", { length: 16 }).notNull(), // 999293 | 998512 | 998519
    sacDescription: text("sac_description").notNull(),
    rateBps: integer("rate_bps").notNull().default(1800),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveUntil: timestamp("effective_until", { withTimezone: true }),
    approvalStatus: varchar("approval_status", { length: 40 })
      .notNull()
      .default("PENDING_ACCOUNTANT_REVIEW"), // PENDING_ACCOUNTANT_REVIEW | APPROVED_FOR_LIVE_INVOICING
    reviewedByCaName: varchar("reviewed_by_ca_name", { length: 160 }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    notes: text("notes"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("tax_rules_category_effective_idx").on(t.serviceCategory, t.effectiveFrom)]
);

export const commercialDecisions = pgTable("commercial_decisions", {
  id: varchar("id", { length: 80 }).primaryKey(),
  decisionNumber: integer("decision_number").notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  status: varchar("status", { length: 40 }).notNull().default("PENDING_OWNER_CA_APPROVAL"), // PENDING_OWNER_CA_APPROVAL | APPROVED
  proposedDefault: text("proposed_default").notNull(),
  blocksLiveBilling: boolean("blocks_live_billing").notNull().default(true),
  approvedBy: varchar("approved_by", { length: 160 }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ==================== 3. COURSES, VERSIONS, COHORTS & CLASSES ====================

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  careerTrackId: varchar("career_track_id", { length: 64 }).notNull(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  titleEn: varchar("title_en", { length: 160 }).notNull(),
  titleHi: varchar("title_hi", { length: 160 }),
  durationDays: integer("duration_days").notNull().default(90),
  passingThresholdPct: integer("passing_threshold_pct").notNull().default(75),
  status: varchar("status", { length: 24 }).notNull().default("published"), // draft | published | disabled | archived
  currentVersionNumber: integer("current_version_number").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const courseVersions = pgTable(
  "course_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "restrict" }),
    versionNumber: integer("version_number").notNull(),
    syllabusJson: jsonb("syllabus_json").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("course_versions_course_ver_uq").on(t.courseId, t.versionNumber)]
);

export const cohorts = pgTable(
  "cohorts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 120 }).notNull(),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    durationDays: integer("duration_days").notNull().default(90),
    capacity: integer("capacity").notNull().default(60),
    status: varchar("status", { length: 24 }).notNull().default("active"), // active | disabled | completed | archived
    disabledAccessPolicy: varchar("disabled_access_policy", { length: 48 })
      .notNull()
      .default("read_only_preserve_records"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("cohorts_course_status_idx").on(t.courseId, t.status)]
);

export const cohortClasses = pgTable(
  "cohort_classes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cohortId: uuid("cohort_id")
      .notNull()
      .references(() => cohorts.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    platform: varchar("platform", { length: 32 }).notNull(), // Zoom | Google Meet
    joinUrl: text("join_url").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    mentorName: varchar("mentor_name", { length: 140 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("cohort_classes_cohort_sched_idx").on(t.cohortId, t.scheduledAt)]
);

// ==================== 4. ADMISSION PLANS, AGREEMENTS & ENROLLMENTS ====================

export const admissionPlanConfigs = pgTable("admission_plan_configs", {
  code: varchar("code", { length: 40 }).primaryKey(), // plan_a_refundable | plan_b_non_refundable
  name: varchar("name", { length: 160 }).notNull(),
  pricePaise: bigint("price_paise", { mode: "bigint" }).notNull(), // 999900 or 599900
  gstRateBps: integer("gst_rate_bps").notNull().default(1800),
  cohortDurationDays: integer("cohort_duration_days").notNull().default(90),
  refundable: boolean("refundable").notNull(),
  refundWindowDays: integer("refund_window_days"),
  tuitionCtcBps: integer("tuition_ctc_bps").notNull(), // 3300 or 3500
  agreementVersion: varchar("agreement_version", { length: 64 }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const acceptedAgreements = pgTable(
  "accepted_agreements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    employerId: uuid("employer_id").references(() => employers.id, { onDelete: "restrict" }),
    agreementType: varchar("agreement_type", { length: 48 }).notNull(), // student_admission | employer_commercial | dpdp_consent
    agreementVersion: varchar("agreement_version", { length: 64 }).notNull(),
    termsSnapshotJson: jsonb("terms_snapshot_json").notNull(),
    acceptedIpRedacted: varchar("accepted_ip_redacted", { length: 64 }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("accepted_agreements_user_idx").on(t.userId, t.agreementType)]
);

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentUserId: uuid("student_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "restrict" }),
    cohortId: uuid("cohort_id")
      .notNull()
      .references(() => cohorts.id, { onDelete: "restrict" }),
    planCode: varchar("plan_code", { length: 40 }).notNull(),
    lockedAdmissionFeePaise: bigint("locked_admission_fee_paise", { mode: "bigint" }).notNull(),
    lockedTuitionCtcBps: integer("locked_tuition_ctc_bps").notNull(),
    acceptedAgreementId: uuid("accepted_agreement_id").references(() => acceptedAgreements.id),
    acceptedAgreementVersion: varchar("accepted_agreement_version", { length: 64 }).notNull(),
    acceptedAgreementAt: timestamp("accepted_agreement_at", { withTimezone: true }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("pending_payment"), // pending_payment | active | completed | paused_cohort_disabled
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("enrollments_student_course_uq").on(t.studentUserId, t.courseId)]
);

// ==================== 5. ASSESSMENTS, ELIGIBILITY & CONSENT ====================

export const questionBankVersions = pgTable("question_bank_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  assessmentKind: varchar("assessment_kind", { length: 32 }).notNull(), // psychometric | final_qualification
  versionCode: varchar("version_code", { length: 64 }).notNull().unique(),
  questionsJson: jsonb("questions_json").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
});

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
    utmMedium: varchar("utm_medium", { length: 120 }),
    utmCampaign: varchar("utm_campaign", { length: 120 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("anonymous_assessments_token_uq").on(t.sessionToken)]
);

export const finalAssessmentAttempts = pgTable(
  "final_assessment_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentUserId: uuid("student_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    enrollmentId: uuid("enrollment_id")
      .notNull()
      .references(() => enrollments.id, { onDelete: "restrict" }),
    assessmentVersion: varchar("assessment_version", { length: 64 }).notNull(),
    attemptNumber: integer("attempt_number").notNull(),
    scoreBps: integer("score_bps").notNull(), // 7500 = 75.00%
    passingThresholdBps: integer("passing_threshold_bps").notNull().default(7500),
    mandatoryCourseworkComplete: boolean("mandatory_coursework_complete").notNull(),
    passed: boolean("passed").notNull(),
    sectionScoresJson: jsonb("section_scores_json").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("final_attempts_enrollment_num_uq").on(t.enrollmentId, t.attemptNumber),
    index("final_attempts_student_idx").on(t.studentUserId),
  ]
);

export const studentEligibilities = pgTable(
  "student_eligibilities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentUserId: uuid("student_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" })
      .unique(),
    enrollmentId: uuid("enrollment_id")
      .notNull()
      .references(() => enrollments.id, { onDelete: "restrict" }),
    careerTrackId: varchar("career_track_id", { length: 64 }).notNull(),
    finalScoreBps: integer("final_score_bps").notNull(),
    passedAt: timestamp("passed_at", { withTimezone: true }).notNull(),
    isVerified: boolean("is_verified").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("student_eligibilities_track_idx").on(t.careerTrackId, t.isVerified)]
);

export const studentConsents = pgTable("student_consents", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentUserId: uuid("student_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" })
    .unique(),
  employerVisibilityGranted: boolean("employer_visibility_granted").notNull().default(false),
  policyVersion: varchar("policy_version", { length: 32 }).notNull(),
  grantedAt: timestamp("granted_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const studentConsentHistory = pgTable(
  "student_consent_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentUserId: uuid("student_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    action: varchar("action", { length: 24 }).notNull(), // granted | revoked
    policyVersion: varchar("policy_version", { length: 32 }).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("consent_history_student_idx").on(t.studentUserId, t.occurredAt)]
);

// ==================== 6. RECRUITMENT PIPELINE, OFFERS, CTC & SELECTIONS ====================

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employerId: uuid("employer_id")
      .notNull()
      .references(() => employers.id, { onDelete: "restrict" }),
    title: varchar("title", { length: 180 }).notNull(),
    careerTrackId: varchar("career_track_id", { length: 64 }).notNull(),
    location: varchar("location", { length: 120 }).notNull(),
    minCtcPaise: bigint("min_ctc_paise", { mode: "bigint" }).notNull(),
    maxCtcPaise: bigint("max_ctc_paise", { mode: "bigint" }).notNull(),
    openings: integer("openings").notNull().default(1),
    status: varchar("status", { length: 24 }).notNull().default("draft"), // draft | published | closed
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("jobs_employer_status_idx").on(t.employerId, t.status)]
);

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "restrict" }),
    employerId: uuid("employer_id")
      .notNull()
      .references(() => employers.id, { onDelete: "restrict" }),
    studentUserId: uuid("student_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    // Canonical stages: applied_sourced | screening | shortlisted | interviewing | offer | accepted | joined | rejected | withdrawn | cancelled
    stage: varchar("stage", { length: 32 }).notNull().default("shortlisted"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("applications_job_student_uq").on(t.jobId, t.studentUserId),
    index("applications_employer_stage_idx").on(t.employerId, t.stage),
  ]
);

export const interviews = pgTable(
  "interviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id").references(() => applications.id),
    employerId: uuid("employer_id")
      .notNull()
      .references(() => employers.id, { onDelete: "restrict" }),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "restrict" }),
    studentUserId: uuid("student_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    mode: varchar("mode", { length: 32 }).notNull(), // Zoom | Google Meet | In-Person
    meetingLink: text("meeting_link"),
    status: varchar("status", { length: 24 }).notNull().default("scheduled"), // scheduled | completed | cancelled
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("interviews_employer_idx").on(t.employerId, t.scheduledAt)]
);

export const offers = pgTable(
  "offers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id").references(() => applications.id),
    employerId: uuid("employer_id")
      .notNull()
      .references(() => employers.id, { onDelete: "restrict" }),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "restrict" }),
    studentUserId: uuid("student_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    roleTitle: varchar("role_title", { length: 180 }).notNull(),
    agreedCtcPaise: bigint("agreed_ctc_paise", { mode: "bigint" }).notNull(),
    joiningDate: varchar("joining_date", { length: 32 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("issued"), // issued | accepted | declined | joined | revoked
    issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
  },
  (t) => [index("offers_student_status_idx").on(t.studentUserId, t.status)]
);

export const ctcSnapshots = pgTable(
  "ctc_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    offerId: uuid("offer_id")
      .notNull()
      .references(() => offers.id, { onDelete: "restrict" }),
    versionNumber: integer("version_number").notNull(),
    fixedAnnualCtcPaise: bigint("fixed_annual_ctc_paise", { mode: "bigint" }).notNull(),
    variableComponentPaise: bigint("variable_component_paise", { mode: "bigint" })
      .notNull()
      .default(0n),
    feeBaseCtcPaise: bigint("fee_base_ctc_paise", { mode: "bigint" }).notNull(),
    amendmentReason: text("amendment_reason"),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("ctc_snapshots_offer_ver_uq").on(t.offerId, t.versionNumber)]
);

export const ctcComponentHistory = pgTable(
  "ctc_component_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ctcSnapshotId: uuid("ctc_snapshot_id")
      .notNull()
      .references(() => ctcSnapshots.id, { onDelete: "cascade" }),
    componentName: varchar("component_name", { length: 120 }).notNull(),
    componentKind: varchar("component_kind", { length: 32 }).notNull(), // fixed | variable | joining_bonus | esop
    includedInFeeBase: boolean("included_in_fee_base").notNull(),
    annualAmountPaise: bigint("annual_amount_paise", { mode: "bigint" }).notNull(),
  },
  (t) => [index("ctc_component_snapshot_idx").on(t.ctcSnapshotId)]
);

export const selectionEvents = pgTable(
  "selection_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    offerId: uuid("offer_id")
      .notNull()
      .references(() => offers.id, { onDelete: "restrict" })
      .unique(),
    studentUserId: uuid("student_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    employerId: uuid("employer_id")
      .notNull()
      .references(() => employers.id, { onDelete: "restrict" }),
    ctcSnapshotId: uuid("ctc_snapshot_id").references(() => ctcSnapshots.id),
    idempotencyKey: varchar("idempotency_key", { length: 160 }).notNull().unique(),
    qualifyingAt: timestamp("qualifying_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("selection_events_student_idx").on(t.studentUserId)]
);

export const placementRecords = pgTable("placement_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  selectionEventId: uuid("selection_event_id")
    .notNull()
    .references(() => selectionEvents.id, { onDelete: "restrict" })
    .unique(),
  studentUserId: uuid("student_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  employerId: uuid("employer_id")
    .notNull()
    .references(() => employers.id, { onDelete: "restrict" }),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("joined"), // joined | no_show | early_attrition
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ==================== 7. FINANCIAL LEDGER (EXACT INTEGER PAISE) ====================

export const tuitionObligations = pgTable(
  "tuition_obligations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentUserId: uuid("student_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    offerId: uuid("offer_id")
      .notNull()
      .references(() => offers.id, { onDelete: "restrict" }),
    employerId: uuid("employer_id")
      .notNull()
      .references(() => employers.id, { onDelete: "restrict" }),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "restrict" }),
    planCode: varchar("plan_code", { length: 40 }).notNull(),
    agreedCtcPaise: bigint("agreed_ctc_paise", { mode: "bigint" }).notNull(),
    tuitionBps: integer("tuition_bps").notNull(), // 3300 or 3500
    admissionDeductionPaise: bigint("admission_deduction_paise", { mode: "bigint" })
      .notNull()
      .default(0n),
    taxableBasePaise: bigint("taxable_base_paise", { mode: "bigint" }).notNull(),
    gstAmountPaise: bigint("gst_amount_paise", { mode: "bigint" }).notNull(),
    totalTuitionInclusivePaise: bigint("total_tuition_inclusive_paise", { mode: "bigint" }).notNull(),
    taxRuleId: varchar("tax_rule_id", { length: 80 }).notNull(),
    agreementVersion: varchar("agreement_version", { length: 64 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("issued"), // issued | partially_paid | settled | adjusted
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  // Idempotency: First qualifying accepted offer per student
  (t) => [uniqueIndex("tuition_obligations_student_uq").on(t.studentUserId)]
);

export const employerAgreements = pgTable(
  "employer_agreements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employerId: uuid("employer_id")
      .notNull()
      .references(() => employers.id, { onDelete: "restrict" }),
    billingModel: varchar("billing_model", { length: 32 }).notNull(),
    agreementVersion: varchar("agreement_version", { length: 64 }).notNull(),
    successFeeBps: integer("success_fee_bps"),
    monthlyFeePaise: bigint("monthly_fee_paise", { mode: "bigint" }),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).defaultNow().notNull(),
    effectiveUntil: timestamp("effective_until", { withTimezone: true }),
    acceptedByUserId: uuid("accepted_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("employer_agreements_emp_idx").on(t.employerId)]
);

export const employerSubscriptions = pgTable(
  "employer_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employerId: uuid("employer_id")
      .notNull()
      .references(() => employers.id, { onDelete: "restrict" }),
    agreementVersion: varchar("agreement_version", { length: 64 }).notNull(),
    monthlyBasePaise: bigint("monthly_base_paise", { mode: "bigint" }).notNull(),
    gstAmountPaise: bigint("gst_amount_paise", { mode: "bigint" }).notNull(),
    totalPayablePaise: bigint("total_payable_paise", { mode: "bigint" }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("active"), // active | past_due | expired | cancelled
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("employer_subs_emp_period_idx").on(t.employerId, t.periodEnd)]
);

export const employerSuccessFees = pgTable(
  "employer_success_fees",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employerId: uuid("employer_id")
      .notNull()
      .references(() => employers.id, { onDelete: "restrict" }),
    selectionEventId: uuid("selection_event_id")
      .notNull()
      .references(() => selectionEvents.id, { onDelete: "restrict" })
      .unique(),
    appliedBps: integer("applied_bps").notNull(),
    agreedCtcPaise: bigint("agreed_ctc_paise", { mode: "bigint" }).notNull(),
    taxableBasePaise: bigint("taxable_base_paise", { mode: "bigint" }).notNull(),
    gstAmountPaise: bigint("gst_amount_paise", { mode: "bigint" }).notNull(),
    totalPayablePaise: bigint("total_payable_paise", { mode: "bigint" }).notNull(),
    waivedBySubscription: boolean("waived_by_subscription").notNull().default(false),
    waivedReason: text("waived_reason"),
    taxRuleId: varchar("tax_rule_id", { length: 80 }).notNull(),
    agreementVersion: varchar("agreement_version", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("employer_success_fees_emp_idx").on(t.employerId)]
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invoiceNumber: varchar("invoice_number", { length: 64 }).notNull(),
    ledgerDomain: varchar("ledger_domain", { length: 24 }).notNull(), // student | employer
    invoiceKind: varchar("invoice_kind", { length: 40 }).notNull(), // student_admission | student_tuition | employer_success_fee | employer_subscription
    userId: uuid("user_id").references(() => users.id),
    employerId: uuid("employer_id").references(() => employers.id),
    taxRuleId: varchar("tax_rule_id", { length: 80 }).notNull(),
    candidateSacCode: varchar("candidate_sac_code", { length: 16 }).notNull(),
    taxableBasePaise: bigint("taxable_base_paise", { mode: "bigint" }).notNull(),
    gstAmountPaise: bigint("gst_amount_paise", { mode: "bigint" }).notNull(),
    totalPayablePaise: bigint("total_payable_paise", { mode: "bigint" }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("issued"), // issued | paid | waived_by_subscription | void | refunded
    issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("invoices_number_uq").on(t.invoiceNumber),
    index("invoices_domain_status_idx").on(t.ledgerDomain, t.status),
  ]
);

export const invoiceLines = pgTable(
  "invoice_lines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    sacCode: varchar("sac_code", { length: 16 }).notNull(),
    quantity: integer("quantity").notNull().default(1),
    unitBasePaise: bigint("unit_base_paise", { mode: "bigint" }).notNull(),
    gstAmountPaise: bigint("gst_amount_paise", { mode: "bigint" }).notNull(),
    lineTotalPaise: bigint("line_total_paise", { mode: "bigint" }).notNull(),
  },
  (t) => [index("invoice_lines_inv_idx").on(t.invoiceId)]
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ledgerDomain: varchar("ledger_domain", { length: 24 }).notNull().default("student"), // student | employer
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    employerId: uuid("employer_id").references(() => employers.id),
    enrollmentId: uuid("enrollment_id").references(() => enrollments.id),
    invoiceId: uuid("invoice_id").references(() => invoices.id),
    gateway: varchar("gateway", { length: 32 }).notNull().default("razorpay"),
    gatewayOrderId: varchar("gateway_order_id", { length: 128 }).notNull(),
    gatewayPaymentId: varchar("gateway_payment_id", { length: 128 }),
    taxableBasePaise: bigint("taxable_base_paise", { mode: "bigint" }).notNull(),
    gstAmountPaise: bigint("gst_amount_paise", { mode: "bigint" }).notNull(),
    totalPayablePaise: bigint("total_payable_paise", { mode: "bigint" }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("created"), // created | captured | failed | refunded
    webhookEventId: varchar("webhook_event_id", { length: 128 }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("payments_gateway_order_uq").on(t.gatewayOrderId),
    index("payments_domain_status_idx").on(t.ledgerDomain, t.status),
  ]
);

export const paymentAllocations = pgTable(
  "payment_allocations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id, { onDelete: "restrict" }),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "restrict" }),
    allocatedPaise: bigint("allocated_paise", { mode: "bigint" }).notNull(),
    allocatedAt: timestamp("allocated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("payment_allocations_inv_idx").on(t.invoiceId)]
);

export const admissionRefunds = pgTable(
  "admission_refunds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentUserId: uuid("student_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    enrollmentId: uuid("enrollment_id")
      .notNull()
      .references(() => enrollments.id, { onDelete: "restrict" })
      .unique(),
    paymentId: uuid("payment_id").references(() => payments.id),
    amountPaise: bigint("amount_paise", { mode: "bigint" }).notNull(),
    entitlementVestedAtCutoff: boolean("entitlement_vested_at_cutoff").notNull().default(true),
    reason: text("reason").notNull(),
    status: varchar("status", { length: 24 }).notNull().default("requested"), // requested | approved | completed | rejected
    requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
    settledAt: timestamp("settled_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("admission_refunds_status_idx").on(t.status)]
);

export const creditNotes = pgTable(
  "credit_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    creditNoteNumber: varchar("credit_note_number", { length: 64 }).notNull(),
    originalInvoiceId: uuid("original_invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "restrict" }),
    ledgerDomain: varchar("ledger_domain", { length: 24 }).notNull(), // student | employer
    taxableBasePaise: bigint("taxable_base_paise", { mode: "bigint" }).notNull(),
    gstAmountPaise: bigint("gst_amount_paise", { mode: "bigint" }).notNull(),
    totalCreditPaise: bigint("total_credit_paise", { mode: "bigint" }).notNull(),
    reason: text("reason").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("credit_notes_number_uq").on(t.creditNoteNumber)]
);

// ==================== 8. CENTRAL ACTIVITY, APPEND-ONLY AUDIT, OUTBOX & GTM ====================

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
    studentId: uuid("student_id"),
    employerId: uuid("employer_id"),
    careerTrackId: varchar("career_track_id", { length: 64 }),
    courseId: uuid("course_id"),
    cohortId: uuid("cohort_id"),
    correlationId: varchar("correlation_id", { length: 128 }).notNull(),
    safeMetadata: jsonb("safe_metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("activity_events_type_idx").on(t.eventType),
    index("activity_events_occurred_idx").on(t.occurredAt),
    index("activity_events_portal_idx").on(t.sourcePortal),
  ]
);

/**
 * Append-only immutable audit log.
 * Database migration enforces a BEFORE UPDATE OR DELETE trigger raising an exception.
 */
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
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
    retryCount: integer("retry_count").notNull().default(0),
    maxRetries: integer("max_retries").notNull().default(3),
    lastError: text("last_error"),
    deliveryStatus: varchar("delivery_status", { length: 24 }).notNull().default("pending"), // pending | processing | delivered | dead_letter
  },
  (t) => [
    uniqueIndex("outbox_events_idempotency_uq").on(t.idempotencyKey),
    index("outbox_events_status_next_idx").on(t.deliveryStatus, t.nextAttemptAt),
  ]
);

export const marketingAttributionRecords = pgTable(
  "marketing_attribution_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    stage: varchar("stage", { length: 64 }).notNull(),
    anonymousSessionToken: varchar("anonymous_session_token", { length: 128 }),
    userId: uuid("user_id").references(() => users.id),
    utmSource: varchar("utm_source", { length: 120 }),
    utmMedium: varchar("utm_medium", { length: 120 }),
    utmCampaign: varchar("utm_campaign", { length: 120 }),
    referrer: text("referrer"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("marketing_attr_stage_idx").on(t.stage, t.occurredAt)]
);
