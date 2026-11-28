-- UdaYantu Canonical Platform Schema Migration (PostgreSQL 16)
-- Version: 0001_canonical_platform
-- Idempotent & repeatable DDL for udayantu-api shared across udayantu-web and udayantu-admin.
-- All monetary amounts are stored as exact integer paise (BIGINT).
-- Percentages/rates are stored as integer basis points (100% = 10000).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==================== 1. IDENTITY, USERS & ORGANIZATIONS ====================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_role VARCHAR(32) NOT NULL,
  email VARCHAR(255) NOT NULL,
  email_verified_at TIMESTAMPTZ,
  phone_e164 VARCHAR(20),
  phone_verified_at TIMESTAMPTZ,
  full_name VARCHAR(160) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_uq ON users (email);

CREATE TABLE IF NOT EXISTS auth_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(32) NOT NULL,
  provider_uid VARCHAR(255) NOT NULL,
  mfa_enrolled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS auth_identities_provider_uid_uq ON auth_identities (provider, provider_uid);

CREATE TABLE IF NOT EXISTS students (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  degree_stream VARCHAR(64),
  graduation_year INTEGER,
  city VARCHAR(120),
  preferred_language VARCHAR(16) NOT NULL DEFAULT 'en',
  primary_career_track_id VARCHAR(64),
  profile_completion_pct INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS students_track_idx ON students (primary_career_track_id);

CREATE TABLE IF NOT EXISTS employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(180) NOT NULL,
  official_domain VARCHAR(120) NOT NULL,
  registration_id VARCHAR(80),
  industry VARCHAR(120),
  city VARCHAR(120),
  approval_status VARCHAR(24) NOT NULL DEFAULT 'pending',
  billing_model VARCHAR(32) NOT NULL DEFAULT 'success_fee',
  custom_success_fee_bps INTEGER NOT NULL DEFAULT 833,
  custom_monthly_fee_paise BIGINT NOT NULL DEFAULT 499900,
  subscription_status VARCHAR(24) NOT NULL DEFAULT 'none',
  subscription_active_from TIMESTAMPTZ,
  subscription_active_until TIMESTAMPTZ,
  commercial_agreement_version VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS employers_domain_uq ON employers (official_domain);
CREATE INDEX IF NOT EXISTS employers_approval_idx ON employers (approval_status);

CREATE TABLE IF NOT EXISTS employer_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_role VARCHAR(32) NOT NULL DEFAULT 'employer_recruiter',
  status VARCHAR(24) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS employer_members_org_user_uq ON employer_members (employer_id, user_id);

-- ==================== 2. TAX GOVERNANCE & COMMERCIAL DECISIONS ====================

CREATE TABLE IF NOT EXISTS tax_rules (
  id VARCHAR(80) PRIMARY KEY,
  service_category VARCHAR(64) NOT NULL,
  candidate_sac_code VARCHAR(16) NOT NULL,
  sac_description TEXT NOT NULL,
  rate_bps INTEGER NOT NULL DEFAULT 1800,
  effective_from TIMESTAMPTZ NOT NULL,
  effective_until TIMESTAMPTZ,
  approval_status VARCHAR(40) NOT NULL DEFAULT 'PENDING_ACCOUNTANT_REVIEW',
  reviewed_by_ca_name VARCHAR(160),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS tax_rules_category_effective_idx ON tax_rules (service_category, effective_from);

CREATE TABLE IF NOT EXISTS commercial_decisions (
  id VARCHAR(80) PRIMARY KEY,
  decision_number INTEGER NOT NULL,
  title VARCHAR(240) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'PENDING_OWNER_CA_APPROVAL',
  proposed_default TEXT NOT NULL,
  blocks_live_billing BOOLEAN NOT NULL DEFAULT TRUE,
  approved_by VARCHAR(160),
  approved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================== 3. COURSES, VERSIONS, COHORTS & CLASSES ====================

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_track_id VARCHAR(64) NOT NULL,
  slug VARCHAR(96) NOT NULL UNIQUE,
  title_en VARCHAR(160) NOT NULL,
  title_hi VARCHAR(160),
  duration_days INTEGER NOT NULL DEFAULT 90,
  passing_threshold_pct INTEGER NOT NULL DEFAULT 75,
  status VARCHAR(24) NOT NULL DEFAULT 'published',
  current_version_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  version_number INTEGER NOT NULL,
  syllabus_json JSONB NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS course_versions_course_ver_uq ON course_versions (course_id, version_number);

CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  name VARCHAR(120) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 90,
  capacity INTEGER NOT NULL DEFAULT 60,
  status VARCHAR(24) NOT NULL DEFAULT 'active',
  disabled_access_policy VARCHAR(48) NOT NULL DEFAULT 'read_only_preserve_records',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS cohorts_course_status_idx ON cohorts (course_id, status);

CREATE TABLE IF NOT EXISTS cohort_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  platform VARCHAR(32) NOT NULL,
  join_url TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  mentor_name VARCHAR(140) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS cohort_classes_cohort_sched_idx ON cohort_classes (cohort_id, scheduled_at);

-- ==================== 4. ADMISSION PLANS, AGREEMENTS & ENROLLMENTS ====================

CREATE TABLE IF NOT EXISTS admission_plan_configs (
  code VARCHAR(40) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  price_paise BIGINT NOT NULL CHECK (price_paise >= 0),
  gst_rate_bps INTEGER NOT NULL DEFAULT 1800,
  cohort_duration_days INTEGER NOT NULL DEFAULT 90,
  refundable BOOLEAN NOT NULL,
  refund_window_days INTEGER,
  tuition_ctc_bps INTEGER NOT NULL,
  agreement_version VARCHAR(64) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accepted_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  employer_id UUID REFERENCES employers(id) ON DELETE RESTRICT,
  agreement_type VARCHAR(48) NOT NULL,
  agreement_version VARCHAR(64) NOT NULL,
  terms_snapshot_json JSONB NOT NULL,
  accepted_ip_redacted VARCHAR(64),
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS accepted_agreements_user_idx ON accepted_agreements (user_id, agreement_type);

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE RESTRICT,
  plan_code VARCHAR(40) NOT NULL,
  locked_admission_fee_paise BIGINT NOT NULL CHECK (locked_admission_fee_paise >= 0),
  locked_tuition_ctc_bps INTEGER NOT NULL,
  accepted_agreement_id UUID REFERENCES accepted_agreements(id),
  accepted_agreement_version VARCHAR(64) NOT NULL,
  accepted_agreement_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending_payment',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS enrollments_student_course_uq ON enrollments (student_user_id, course_id);

-- ==================== 5. ASSESSMENTS, ELIGIBILITY & CONSENT ====================

CREATE TABLE IF NOT EXISTS question_bank_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_kind VARCHAR(32) NOT NULL,
  version_code VARCHAR(64) NOT NULL UNIQUE,
  questions_json JSONB NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anonymous_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token VARCHAR(128) NOT NULL,
  engine_version VARCHAR(32) NOT NULL,
  answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(24) NOT NULL DEFAULT 'in_progress',
  preview_report_json JSONB,
  full_report_json JSONB,
  claimed_by_user_id UUID REFERENCES users(id),
  utm_source VARCHAR(120),
  utm_medium VARCHAR(120),
  utm_campaign VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS anonymous_assessments_token_uq ON anonymous_assessments (session_token);

CREATE TABLE IF NOT EXISTS final_assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE RESTRICT,
  assessment_version VARCHAR(64) NOT NULL,
  attempt_number INTEGER NOT NULL,
  score_bps INTEGER NOT NULL,
  passing_threshold_bps INTEGER NOT NULL DEFAULT 7500,
  mandatory_coursework_complete BOOLEAN NOT NULL,
  passed BOOLEAN NOT NULL,
  section_scores_json JSONB NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS final_attempts_enrollment_num_uq ON final_assessment_attempts (enrollment_id, attempt_number);
CREATE INDEX IF NOT EXISTS final_attempts_student_idx ON final_assessment_attempts (student_user_id);

CREATE TABLE IF NOT EXISTS student_eligibilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE RESTRICT,
  career_track_id VARCHAR(64) NOT NULL,
  final_score_bps INTEGER NOT NULL,
  passed_at TIMESTAMPTZ NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS student_eligibilities_track_idx ON student_eligibilities (career_track_id, is_verified);

CREATE TABLE IF NOT EXISTS student_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  employer_visibility_granted BOOLEAN NOT NULL DEFAULT FALSE,
  policy_version VARCHAR(32) NOT NULL,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_consent_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action VARCHAR(24) NOT NULL,
  policy_version VARCHAR(32) NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS consent_history_student_idx ON student_consent_history (student_user_id, occurred_at);

-- ==================== 6. RECRUITMENT PIPELINE, OFFERS, CTC & SELECTIONS ====================

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE RESTRICT,
  title VARCHAR(180) NOT NULL,
  career_track_id VARCHAR(64) NOT NULL,
  location VARCHAR(120) NOT NULL,
  min_ctc_paise BIGINT NOT NULL CHECK (min_ctc_paise >= 0),
  max_ctc_paise BIGINT NOT NULL CHECK (max_ctc_paise >= 0),
  openings INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(24) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS jobs_employer_status_idx ON jobs (employer_id, status);

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE RESTRICT,
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  stage VARCHAR(32) NOT NULL DEFAULT 'shortlisted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS applications_job_student_uq ON applications (job_id, student_user_id);
CREATE INDEX IF NOT EXISTS applications_employer_stage_idx ON applications (employer_id, stage);

CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE RESTRICT,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  mode VARCHAR(32) NOT NULL,
  meeting_link TEXT,
  status VARCHAR(24) NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS interviews_employer_idx ON interviews (employer_id, scheduled_at);

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE RESTRICT,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  role_title VARCHAR(180) NOT NULL,
  agreed_ctc_paise BIGINT NOT NULL CHECK (agreed_ctc_paise > 0),
  joining_date VARCHAR(32) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'issued',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS offers_student_status_idx ON offers (student_user_id, status);

CREATE TABLE IF NOT EXISTS ctc_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE RESTRICT,
  version_number INTEGER NOT NULL,
  fixed_annual_ctc_paise BIGINT NOT NULL CHECK (fixed_annual_ctc_paise >= 0),
  variable_component_paise BIGINT NOT NULL DEFAULT 0,
  fee_base_ctc_paise BIGINT NOT NULL CHECK (fee_base_ctc_paise > 0),
  amendment_reason TEXT,
  created_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS ctc_snapshots_offer_ver_uq ON ctc_snapshots (offer_id, version_number);

CREATE TABLE IF NOT EXISTS ctc_component_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ctc_snapshot_id UUID NOT NULL REFERENCES ctc_snapshots(id) ON DELETE CASCADE,
  component_name VARCHAR(120) NOT NULL,
  component_kind VARCHAR(32) NOT NULL,
  included_in_fee_base BOOLEAN NOT NULL,
  annual_amount_paise BIGINT NOT NULL CHECK (annual_amount_paise >= 0)
);
CREATE INDEX IF NOT EXISTS ctc_component_snapshot_idx ON ctc_component_history (ctc_snapshot_id);

CREATE TABLE IF NOT EXISTS selection_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL UNIQUE REFERENCES offers(id) ON DELETE RESTRICT,
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE RESTRICT,
  ctc_snapshot_id UUID REFERENCES ctc_snapshots(id),
  idempotency_key VARCHAR(160) NOT NULL UNIQUE,
  qualifying_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS selection_events_student_idx ON selection_events (student_user_id);

CREATE TABLE IF NOT EXISTS placement_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  selection_event_id UUID NOT NULL UNIQUE REFERENCES selection_events(id) ON DELETE RESTRICT,
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE RESTRICT,
  joined_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'joined',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================== 7. FINANCIAL LEDGER (EXACT INTEGER PAISE) ====================

CREATE TABLE IF NOT EXISTS tuition_obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE RESTRICT,
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE RESTRICT,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
  plan_code VARCHAR(40) NOT NULL,
  agreed_ctc_paise BIGINT NOT NULL CHECK (agreed_ctc_paise > 0),
  tuition_bps INTEGER NOT NULL,
  admission_deduction_paise BIGINT NOT NULL DEFAULT 0 CHECK (admission_deduction_paise = 0),
  taxable_base_paise BIGINT NOT NULL CHECK (taxable_base_paise >= 0),
  gst_amount_paise BIGINT NOT NULL CHECK (gst_amount_paise >= 0),
  total_tuition_inclusive_paise BIGINT NOT NULL CHECK (total_tuition_inclusive_paise >= 0),
  tax_rule_id VARCHAR(80) NOT NULL,
  agreement_version VARCHAR(64) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'issued',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS tuition_obligations_student_uq ON tuition_obligations (student_user_id);

CREATE TABLE IF NOT EXISTS employer_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE RESTRICT,
  billing_model VARCHAR(32) NOT NULL,
  agreement_version VARCHAR(64) NOT NULL,
  success_fee_bps INTEGER,
  monthly_fee_paise BIGINT,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_until TIMESTAMPTZ,
  accepted_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS employer_agreements_emp_idx ON employer_agreements (employer_id);

CREATE TABLE IF NOT EXISTS employer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE RESTRICT,
  agreement_version VARCHAR(64) NOT NULL,
  monthly_base_paise BIGINT NOT NULL CHECK (monthly_base_paise >= 0),
  gst_amount_paise BIGINT NOT NULL CHECK (gst_amount_paise >= 0),
  total_payable_paise BIGINT NOT NULL CHECK (total_payable_paise >= 0),
  status VARCHAR(24) NOT NULL DEFAULT 'active',
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS employer_subs_emp_period_idx ON employer_subscriptions (employer_id, period_end);

CREATE TABLE IF NOT EXISTS employer_success_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE RESTRICT,
  selection_event_id UUID NOT NULL UNIQUE REFERENCES selection_events(id) ON DELETE RESTRICT,
  applied_bps INTEGER NOT NULL,
  agreed_ctc_paise BIGINT NOT NULL CHECK (agreed_ctc_paise >= 0),
  taxable_base_paise BIGINT NOT NULL CHECK (taxable_base_paise >= 0),
  gst_amount_paise BIGINT NOT NULL CHECK (gst_amount_paise >= 0),
  total_payable_paise BIGINT NOT NULL CHECK (total_payable_paise >= 0),
  waived_by_subscription BOOLEAN NOT NULL DEFAULT FALSE,
  waived_reason TEXT,
  tax_rule_id VARCHAR(80) NOT NULL,
  agreement_version VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS employer_success_fees_emp_idx ON employer_success_fees (employer_id);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(64) NOT NULL,
  ledger_domain VARCHAR(24) NOT NULL,
  invoice_kind VARCHAR(40) NOT NULL,
  user_id UUID REFERENCES users(id),
  employer_id UUID REFERENCES employers(id),
  tax_rule_id VARCHAR(80) NOT NULL,
  candidate_sac_code VARCHAR(16) NOT NULL,
  taxable_base_paise BIGINT NOT NULL CHECK (taxable_base_paise >= 0),
  gst_amount_paise BIGINT NOT NULL CHECK (gst_amount_paise >= 0),
  total_payable_paise BIGINT NOT NULL CHECK (total_payable_paise >= 0),
  status VARCHAR(32) NOT NULL DEFAULT 'issued',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS invoices_number_uq ON invoices (invoice_number);
CREATE INDEX IF NOT EXISTS invoices_domain_status_idx ON invoices (ledger_domain, status);

CREATE TABLE IF NOT EXISTS invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  sac_code VARCHAR(16) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_base_paise BIGINT NOT NULL CHECK (unit_base_paise >= 0),
  gst_amount_paise BIGINT NOT NULL CHECK (gst_amount_paise >= 0),
  line_total_paise BIGINT NOT NULL CHECK (line_total_paise >= 0)
);
CREATE INDEX IF NOT EXISTS invoice_lines_inv_idx ON invoice_lines (invoice_id);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ledger_domain VARCHAR(24) NOT NULL DEFAULT 'student',
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  employer_id UUID REFERENCES employers(id),
  enrollment_id UUID REFERENCES enrollments(id),
  invoice_id UUID REFERENCES invoices(id),
  gateway VARCHAR(32) NOT NULL DEFAULT 'razorpay',
  gateway_order_id VARCHAR(128) NOT NULL,
  gateway_payment_id VARCHAR(128),
  taxable_base_paise BIGINT NOT NULL CHECK (taxable_base_paise >= 0),
  gst_amount_paise BIGINT NOT NULL CHECK (gst_amount_paise >= 0),
  total_payable_paise BIGINT NOT NULL CHECK (total_payable_paise >= 0),
  status VARCHAR(24) NOT NULL DEFAULT 'created',
  webhook_event_id VARCHAR(128),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS payments_gateway_order_uq ON payments (gateway_order_id);
CREATE INDEX IF NOT EXISTS payments_domain_status_idx ON payments (ledger_domain, status);

CREATE TABLE IF NOT EXISTS payment_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
  allocated_paise BIGINT NOT NULL CHECK (allocated_paise >= 0),
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS payment_allocations_inv_idx ON payment_allocations (invoice_id);

CREATE TABLE IF NOT EXISTS admission_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  enrollment_id UUID NOT NULL UNIQUE REFERENCES enrollments(id) ON DELETE RESTRICT,
  payment_id UUID REFERENCES payments(id),
  amount_paise BIGINT NOT NULL CHECK (amount_paise >= 0),
  entitlement_vested_at_cutoff BOOLEAN NOT NULL DEFAULT TRUE,
  reason TEXT NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'requested',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS admission_refunds_status_idx ON admission_refunds (status);

CREATE TABLE IF NOT EXISTS credit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_note_number VARCHAR(64) NOT NULL,
  original_invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
  ledger_domain VARCHAR(24) NOT NULL,
  taxable_base_paise BIGINT NOT NULL CHECK (taxable_base_paise >= 0),
  gst_amount_paise BIGINT NOT NULL CHECK (gst_amount_paise >= 0),
  total_credit_paise BIGINT NOT NULL CHECK (total_credit_paise >= 0),
  reason TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS credit_notes_number_uq ON credit_notes (credit_note_number);

-- ==================== 8. CENTRAL ACTIVITY, APPEND-ONLY AUDIT, OUTBOX & GTM ====================

CREATE TABLE IF NOT EXISTS activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seq_id BIGSERIAL NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  event_version INTEGER NOT NULL DEFAULT 1,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_user_id UUID,
  actor_role VARCHAR(32) NOT NULL,
  source_portal VARCHAR(24) NOT NULL,
  entity_type VARCHAR(48) NOT NULL,
  entity_id VARCHAR(128) NOT NULL,
  student_id UUID,
  employer_id UUID,
  career_track_id VARCHAR(64),
  course_id UUID,
  cohort_id UUID,
  correlation_id VARCHAR(128) NOT NULL,
  safe_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS activity_events_type_idx ON activity_events (event_type);
CREATE INDEX IF NOT EXISTS activity_events_occurred_idx ON activity_events (occurred_at);
CREATE INDEX IF NOT EXISTS activity_events_portal_idx ON activity_events (source_portal);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID,
  actor_role VARCHAR(32) NOT NULL,
  action VARCHAR(96) NOT NULL,
  resource_type VARCHAR(64) NOT NULL,
  resource_id VARCHAR(128) NOT NULL,
  previous_values_redacted JSONB,
  new_values_redacted JSONB,
  source_portal VARCHAR(24) NOT NULL,
  request_id VARCHAR(128) NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS audit_logs_occurred_idx ON audit_logs (occurred_at);

-- Enforce strict append-only immutability on audit_logs at the database layer
CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is strictly append-only; UPDATE and DELETE operations are prohibited';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON audit_logs;
CREATE TRIGGER trg_audit_logs_immutable
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_mutation();

CREATE TABLE IF NOT EXISTS outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(80) NOT NULL,
  aggregate_id VARCHAR(128) NOT NULL,
  idempotency_key VARCHAR(160) NOT NULL,
  event_payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  next_attempt_at TIMESTAMPTZ,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  last_error TEXT,
  delivery_status VARCHAR(24) NOT NULL DEFAULT 'pending'
);
CREATE UNIQUE INDEX IF NOT EXISTS outbox_events_idempotency_uq ON outbox_events (idempotency_key);
CREATE INDEX IF NOT EXISTS outbox_events_status_next_idx ON outbox_events (delivery_status, next_attempt_at);

CREATE TABLE IF NOT EXISTS marketing_attribution_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage VARCHAR(64) NOT NULL,
  anonymous_session_token VARCHAR(128),
  user_id UUID REFERENCES users(id),
  utm_source VARCHAR(120),
  utm_medium VARCHAR(120),
  utm_campaign VARCHAR(120),
  referrer TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS marketing_attr_stage_idx ON marketing_attribution_records (stage, occurred_at);
