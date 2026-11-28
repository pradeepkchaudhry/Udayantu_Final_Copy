/**
 * Shared Authoritative Backend Platform Service (Single Source of Truth).
 *
 * Powers Student (udayantu.com), Employer (udayantu.com/employer/*), and
 * Independent Admin (admin.udayantu.com) through one consistent business rules engine,
 * enforcing:
 * - Anonymous pre-login psychometric assessment + 20% preview + seamless claim on login
 * - Plan A (₹9,999 GST inclusive, 120-day refund clock, 33% CTC tuition) vs Plan B (₹5,999, non-refundable, 35% CTC tuition)
 * - Duplicate enrollment prevention & locked enrollment pricing on later Admin price updates
 * - Server-side Final Assessment (74% fails / 75% passes, zero answer keys exposed, attempt protection)
 * - Immediate Recruitment Consent revocation hiding student from Employer discovery
 * - Cohort disabling preserving student enrollment records with explicit read-only access
 * - Official business email Employer registration + Admin approval gate
 * - Employer Billing: 8.33% Success Fee (+18% GST) vs ₹4,999/mo Subscription (+18% GST, ₹0 extra success fee while active)
 * - Single authoritative Selection event (written offer accepted) -> idempotent Student tuition + Employer charge
 * - Central activity_events, append-only audit_logs (with automatic secret/PII redaction), outbox_events, and growth funnel attribution
 */

import crypto from "node:crypto";
import {
  calculateEmployerSelectionCharge,
  calculateEmployerSubscriptionInvoice,
  calculateGstInclusiveBreakdown,
  calculateStudentTuitionObligation,
  evaluateAdmissionRefundLifecycle,
  getDefaultEmployerPlans,
  getDefaultStudentPlans,
  isOfficialBusinessEmail,
  resolveRuntimeMode,
  type AdmissionPlanCode,
  type EmployerBillingModel,
  type EmployerCommercialPlanConfig,
  type GstBreakdown,
  type RefundEvaluationResult,
  type RuntimeMode,
  type StudentAdmissionPlanConfig,
} from "../domain/commercialEngine";
import {
  CANONICAL_TRACK_PROFILES,
  PSYCHOMETRIC_ENGINE_VERSION,
  evaluatePsychometricAssessment,
  getPublicPsychometricQuestions,
  type CanonicalCareerTrackId,
  type FullPsychometricReport,
  type PreviewPsychometricReport,
} from "../domain/psychometricEngine";
import {
  DEFAULT_FINAL_QUESTION_BANK,
  FINAL_ASSESSMENT_VERSION,
  evaluateFinalAssessmentSubmission,
  stripFinalAssessmentAnswerKeys,
  type FinalAssessmentEvaluationResult,
  type FinalAssessmentQuestionRecord,
} from "../domain/finalAssessmentEngine";
import {
  PortableEmailAdapter,
  PortableGcsStorageAdapter,
  PortableIdentityAdapter,
  PortableOtpSmsAdapter,
  RazorpayPaymentAdapter,
  type EmailProviderAdapter,
  type IdentityProviderAdapter,
  type OtpSmsAdapter,
  type PaymentProviderAdapter,
  type StorageProviderAdapter,
} from "../adapters/providers";

export type UserRole =
  | "student"
  | "employer_admin"
  | "employer_recruiter"
  | "admin"
  | "super_admin"
  | "mentor"
  | "cs_agent";

export type SourcePortal = "student" | "employer" | "admin" | "system";

export interface PlatformUser {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  emailVerified: boolean;
  phone10?: string;
  phoneVerified: boolean;
  passwordHash: string;
  employerId?: string | null;
  mfaEnrolled: boolean;
  status: "active" | "suspended";
  createdAt: string;
}

export interface AnonymousAssessmentRecord {
  id: string;
  sessionToken: string;
  engineVersion: string;
  answers: Record<string, string>;
  status: "in_progress" | "submitted" | "claimed";
  previewReport: PreviewPsychometricReport | null;
  fullReport: FullPsychometricReport | null;
  claimedByUserId: string | null;
  utmSource?: string;
  utmCampaign?: string;
  createdAt: string;
  submittedAt: string | null;
}

export interface CourseRecord {
  id: string;
  careerTrackId: CanonicalCareerTrackId;
  slug: string;
  titleEn: string;
  titleHi: string;
  durationDays: number;
  passingThresholdPercent: number;
  status: "draft" | "published" | "disabled";
  modules: Array<{
    id: string;
    title: string;
    youtubeUrl: string;
    pdfObjectKey: string;
    pdfLabel: string;
    durationMinutes: number;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    brief: string;
    dueWeek: number;
  }>;
}

export interface CohortRecord {
  id: string;
  courseId: string;
  name: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  capacity: number;
  status: "active" | "disabled" | "completed";
  disabledAccessPolicy: "read_only_preserve_records";
  mentorName: string;
  upcomingLiveClass: {
    id: string;
    title: string;
    platform: "Zoom" | "Google Meet";
    joinUrl: string;
    scheduledAt: string;
  };
}

export interface StudentEnrollmentRecord {
  id: string;
  studentUserId: string;
  courseId: string;
  cohortId: string;
  careerTrackId: CanonicalCareerTrackId;
  planCode: AdmissionPlanCode;
  lockedAdmissionFeeInr: number;
  lockedGstBreakdown: GstBreakdown;
  lockedTuitionCtcPercent: number;
  acceptedAgreementVersion: string;
  acceptedAgreementAt: string;
  status: "pending_payment" | "active" | "completed";
  completedModuleIds: string[];
  submittedAssignmentIds: string[];
  attendedClassIds: string[];
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  enrollmentId: string;
  gateway: "razorpay";
  orderId: string;
  paymentId: string | null;
  breakdown: GstBreakdown;
  status: "created" | "captured" | "failed" | "refunded";
  invoiceNumber: string | null;
  processedWebhookEventIds: string[];
  verifiedAt: string | null;
  createdAt: string;
}

export interface FinalAssessmentAttemptRecord {
  id: string;
  studentUserId: string;
  enrollmentId: string;
  attemptNumber: number;
  result: FinalAssessmentEvaluationResult;
}

export interface StudentEligibilityRecord {
  studentUserId: string;
  enrollmentId: string;
  careerTrackId: CanonicalCareerTrackId;
  finalScorePercent: number;
  passedAt: string;
  isVerified: boolean;
}

export interface StudentConsentRecord {
  studentUserId: string;
  employerVisibilityGranted: boolean;
  policyVersion: string;
  grantedAt: string | null;
  revokedAt: string | null;
  updatedAt: string;
}

export interface RefundRequestRecord {
  id: string;
  studentUserId: string;
  enrollmentId: string;
  paymentId: string;
  amountInr: number;
  reason: string;
  status: "requested" | "approved" | "completed" | "rejected";
  requestedAt: string;
  updatedAt: string;
}

export interface EmployerOrganizationRecord {
  id: string;
  companyName: string;
  officialDomain: string;
  registrationId: string;
  industry: string;
  city: string;
  approvalStatus: "pending" | "approved" | "rejected" | "suspended";
  billingModel: EmployerBillingModel;
  customSuccessFeePercent: number;
  customMonthlyFeeInr: number;
  subscriptionActiveFrom: string | null;
  subscriptionActiveUntil: string | null;
  commercialAgreementVersion: string;
  teamMembers: Array<{
    id: string;
    userId: string;
    fullName: string;
    email: string;
    role: "employer_admin" | "employer_recruiter";
    status: "active" | "invited";
  }>;
  createdAt: string;
}

export interface JobPostingRecord {
  id: string;
  employerId: string;
  title: string;
  careerTrackId: CanonicalCareerTrackId;
  location: string;
  minCtcInr: number;
  maxCtcInr: number;
  openings: number;
  status: "draft" | "published" | "closed";
  createdAt: string;
}

export interface ShortlistRecord {
  id: string;
  employerId: string;
  jobId: string;
  studentUserId: string;
  stage: "shortlisted" | "interviewing" | "offered" | "joined";
  createdAt: string;
}

export interface InterviewRecord {
  id: string;
  employerId: string;
  jobId: string;
  studentUserId: string;
  scheduledAt: string;
  mode: "Zoom" | "Google Meet" | "In-Person";
  meetingLink: string;
  status: "scheduled" | "completed" | "cancelled";
}

export interface WrittenOfferRecord {
  id: string;
  employerId: string;
  jobId: string;
  studentUserId: string;
  roleTitle: string;
  agreedCtcInr: number;
  joiningDate: string;
  status: "issued" | "accepted" | "declined" | "joined";
  issuedAt: string;
  acceptedAt: string | null;
  joinedAt: string | null;
}

export interface TuitionObligationRecord {
  id: string;
  studentUserId: string;
  offerId: string;
  employerId: string;
  jobId: string;
  planCode: AdmissionPlanCode;
  agreedCtcInr: number;
  tuitionPercent: number;
  admissionDeductionInr: 0;
  breakdown: GstBreakdown;
  agreementVersion: string;
  status: "issued" | "settled";
  createdAt: string;
}

export interface EmployerInvoiceRecord {
  id: string;
  invoiceNumber: string;
  employerId: string;
  type: "success_fee" | "monthly_subscription";
  referenceId: string; // offerId or billing period
  description: string;
  appliedPercent: number | null;
  waivedReason: string | null;
  breakdown: GstBreakdown;
  agreementVersion: string;
  status: "issued" | "paid" | "waived_by_subscription";
  createdAt: string;
}

export interface ActivityEventRecord {
  id: string;
  seqId: number;
  eventType: string;
  eventVersion: 1;
  occurredAt: string;
  actorUserId: string | null;
  actorRole: UserRole | "system" | "anonymous";
  sourcePortal: SourcePortal;
  entityType: string;
  entityId: string;
  studentId?: string | null;
  employerId?: string | null;
  careerTrackId?: string | null;
  courseId?: string | null;
  cohortId?: string | null;
  correlationId: string;
  safeMetadata: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogRecord {
  readonly id: string;
  readonly actorUserId: string | null;
  readonly actorRole: string;
  readonly action: string;
  readonly resourceType: string;
  readonly resourceId: string;
  readonly previousValuesRedacted: Record<string, unknown> | null;
  readonly newValuesRedacted: Record<string, unknown> | null;
  readonly sourcePortal: SourcePortal;
  readonly requestId: string;
  readonly occurredAt: string;
}

export interface OutboxEventRecord {
  id: string;
  eventType: string;
  aggregateId: string;
  idempotencyKey: string;
  eventPayload: Record<string, unknown>;
  occurredAt: string;
  processedAt: string | null;
  retryCount: number;
  deliveryStatus: "pending" | "processing" | "delivered" | "dead_letter";
}

export interface FunnelEventRecord {
  id: string;
  stage: string;
  anonymousSessionToken?: string;
  userId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  occurredAt: string;
}

const BANNED_SENSITIVE_KEY_PATTERN =
  /password|otp|token|secret|signature|answer_?key|correct_?option|aadhaar|pan_?number|raw_?doc/i;

/**
 * Strips any sensitive fields before inserting into activity_events or audit_logs.
 */
export function sanitizeSafeMetadata(input: Record<string, unknown> | null | undefined): Record<string, unknown> {
  if (!input || typeof input !== "object") return {};
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (BANNED_SENSITIVE_KEY_PATTERN.test(key)) {
      clean[key] = "[REDACTED]";
      continue;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      clean[key] = sanitizeSafeMetadata(value as Record<string, unknown>);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export class PlatformError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(12).toString("hex");
  const hash = crypto.scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 32).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

export class UdaYantuPlatformService {
  readonly mode: RuntimeMode;
  readonly identity: IdentityProviderAdapter;
  readonly payments: PaymentProviderAdapter;
  readonly storage: StorageProviderAdapter;
  readonly sms: OtpSmsAdapter;
  readonly email: EmailProviderAdapter;

  private studentPlans: Record<AdmissionPlanCode, StudentAdmissionPlanConfig>;
  private employerPlans: Record<EmployerBillingModel, EmployerCommercialPlanConfig>;
  private questionBank: FinalAssessmentQuestionRecord[];

  private users = new Map<string, PlatformUser>();
  private otpCodes = new Map<string, { code: string; expiresAt: number; attempts: number }>();
  private emailVerificationCodes = new Map<string, { code: string; expiresAt: number }>();
  private passwordResetCodes = new Map<string, { code: string; expiresAt: number }>();
  private anonymousAssessments = new Map<string, AnonymousAssessmentRecord>();
  private courses = new Map<string, CourseRecord>();
  private cohorts = new Map<string, CohortRecord>();
  private enrollments = new Map<string, StudentEnrollmentRecord>();
  private paymentRecords = new Map<string, PaymentRecord>();
  private finalAttempts = new Map<string, FinalAssessmentAttemptRecord[]>();
  private eligibilities = new Map<string, StudentEligibilityRecord>();
  private consents = new Map<string, StudentConsentRecord>();
  private refundRequests = new Map<string, RefundRequestRecord>();
  private employers = new Map<string, EmployerOrganizationRecord>();
  private jobs = new Map<string, JobPostingRecord>();
  private shortlists = new Map<string, ShortlistRecord>();
  private interviews = new Map<string, InterviewRecord>();
  private offers = new Map<string, WrittenOfferRecord>();
  private tuitionObligations = new Map<string, TuitionObligationRecord>(); // keyed by studentUserId (idempotent first qualifying offer)
  private employerInvoices = new Map<string, EmployerInvoiceRecord>();
  private activityEvents: ActivityEventRecord[] = [];
  private readonly auditLogs: AuditLogRecord[] = []; // Append-only in memory; DB role revokes UPDATE/DELETE
  private outboxEvents: OutboxEventRecord[] = [];
  private funnelEvents: FunnelEventRecord[] = [];
  private seqCounter = 0;

  constructor(deps?: {
    env?: Record<string, string | undefined>;
    identity?: IdentityProviderAdapter;
    payments?: PaymentProviderAdapter;
    storage?: StorageProviderAdapter;
    sms?: OtpSmsAdapter;
    email?: EmailProviderAdapter;
  }) {
    const env = deps?.env ?? process.env;
    this.mode = resolveRuntimeMode(env);
    this.identity = deps?.identity ?? new PortableIdentityAdapter();
    this.payments = deps?.payments ?? new RazorpayPaymentAdapter(env);
    this.storage = deps?.storage ?? new PortableGcsStorageAdapter();
    this.sms = deps?.sms ?? new PortableOtpSmsAdapter(env);
    this.email = deps?.email ?? new PortableEmailAdapter(env);
    this.studentPlans = getDefaultStudentPlans();
    this.employerPlans = getDefaultEmployerPlans();
    this.questionBank = [...DEFAULT_FINAL_QUESTION_BANK];

    this.seedCanonicalCatalogAndSandboxDemoData();
  }

  private seedCanonicalCatalogAndSandboxDemoData(): void {
    const now = new Date();
    const startIso = new Date(now.getTime() - 10 * 86400_000).toISOString();
    const endIso = new Date(now.getTime() + 80 * 86400_000).toISOString();
    const nextClassIso = new Date(now.getTime() + 24 * 3600_000).toISOString();

    const tracks = Object.values(CANONICAL_TRACK_PROFILES);
    tracks.forEach((track, idx) => {
      const courseId = `course-${track.id}`;
      const cohortId = `cohort-${track.id}-q4`;
      this.courses.set(courseId, {
        id: courseId,
        careerTrackId: track.id,
        slug: track.id,
        titleEn: `${track.name} Career Readiness Cohort`,
        titleHi: `${track.hindiName} करियर रेडीनेस कोर्स`,
        durationDays: 90,
        passingThresholdPercent: 75,
        status: "published",
        modules: [
          {
            id: `${courseId}-mod-1`,
            title: `Foundations of ${track.name} & Workplace Communication`,
            youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0",
            pdfObjectKey: `courses/${track.id}/module-1-playbook.pdf`,
            pdfLabel: `${track.name} Module 1 Playbook (PDF)`,
            durationMinutes: 45,
          },
          {
            id: `${courseId}-mod-2`,
            title: `Core Tools, Trackers & Daily Corporate Workflows`,
            youtubeUrl: "https://www.youtube.com/embed/ysz5S6PUM-U?rel=0",
            pdfObjectKey: `courses/${track.id}/module-2-tools-workbook.pdf`,
            pdfLabel: `${track.name} Tools Workbook (PDF)`,
            durationMinutes: 55,
          },
          {
            id: `${courseId}-mod-3`,
            title: `Capstone Simulation, Resume Audit & Interview Prep`,
            youtubeUrl: "https://www.youtube.com/embed/aqz-KE-bpKQ?rel=0",
            pdfObjectKey: `courses/${track.id}/module-3-interview-guide.pdf`,
            pdfLabel: `${track.name} Interview Rubric (PDF)`,
            durationMinutes: 50,
          },
        ],
        assignments: [
          {
            id: `${courseId}-asg-1`,
            title: `${track.name} Practical Case Exercise`,
            brief: `Submit your structured workflow response applying ${track.relevantSkills[0]}.`,
            dueWeek: 4,
          },
          {
            id: `${courseId}-asg-2`,
            title: `Role-Specific Capstone Portfolio`,
            brief: `Complete the end-to-end capstone portfolio reviewed by your 1:1 mentor.`,
            dueWeek: 10,
          },
        ],
      });

      this.cohorts.set(cohortId, {
        id: cohortId,
        courseId,
        name: `${track.name} — 90-Day Batch ${idx + 1}`,
        startDate: startIso,
        endDate: endIso,
        durationDays: 90,
        capacity: 60,
        status: "active",
        disabledAccessPolicy: "read_only_preserve_records",
        mentorName: idx % 2 === 0 ? "Ananya Verma (Lead Industry Mentor)" : "Rohan Kulkarni (Senior Career Coach)",
        upcomingLiveClass: {
          id: `${cohortId}-live-1`,
          title: `Live Workshop: ${track.relevantSkills[0]} & Mock Q&A`,
          platform: idx % 2 === 0 ? "Zoom" : "Google Meet",
          joinUrl:
            idx % 2 === 0
              ? "https://zoom.us/j/98412034567"
              : "https://meet.google.com/udy-cohort-live",
          scheduledAt: nextClassIso,
        },
      });
    });

    // Seed an Admin user & Sandbox demo accounts ONLY when not in Live Mode
    if (this.mode === "sandbox") {
      const adminId = "00000000-0000-4000-8000-000000000001";
      this.users.set(adminId, {
        id: adminId,
        role: "super_admin",
        fullName: "UdaYantu Operations Admin",
        email: "ops-admin@udayantu.com",
        emailVerified: true,
        phoneVerified: true,
        passwordHash: hashPassword("AdminSandbox#2026"),
        mfaEnrolled: true,
        status: "active",
        createdAt: startIso,
      });

      // Seed an approved sandbox Employer + verified eligible consented graduate so Employer discovery works immediately in dev preview
      const empOrgId = "00000000-0000-4000-8000-000000000100";
      const empUserId = "00000000-0000-4000-8000-000000000101";
      this.users.set(empUserId, {
        id: empUserId,
        role: "employer_admin",
        fullName: "Priya Deshmukh",
        email: "hiring@kaveritech.in",
        emailVerified: true,
        phoneVerified: false,
        passwordHash: hashPassword("EmployerDemo#2026"),
        employerId: empOrgId,
        mfaEnrolled: false,
        status: "active",
        createdAt: startIso,
      });
      this.employers.set(empOrgId, {
        id: empOrgId,
        companyName: "Kaveri Cloud Services Pvt Ltd",
        officialDomain: "kaveritech.in",
        registrationId: "U72900KA2021PTC148201",
        industry: "B2B SaaS & Operations",
        city: "Bengaluru",
        approvalStatus: "approved",
        billingModel: "success_fee",
        customSuccessFeePercent: 8.33,
        customMonthlyFeeInr: 4999,
        subscriptionActiveFrom: null,
        subscriptionActiveUntil: null,
        commercialAgreementVersion: "EMP-SUCCESS-2026.1",
        teamMembers: [
          {
            id: "tm-1",
            userId: empUserId,
            fullName: "Priya Deshmukh",
            email: "hiring@kaveritech.in",
            role: "employer_admin",
            status: "active",
          },
        ],
        createdAt: startIso,
      });

      // Seed one qualified & consented student for discovery demos
      const gradId = "00000000-0000-4000-8000-000000000201";
      this.users.set(gradId, {
        id: gradId,
        role: "student",
        fullName: "Aarav Mishra (B.Com Graduate)",
        email: "aarav.mishra@example.org",
        emailVerified: true,
        phone10: "9876543210",
        phoneVerified: true,
        passwordHash: hashPassword("StudentDemo#2026"),
        mfaEnrolled: false,
        status: "active",
        createdAt: startIso,
      });
      const gradEnrollmentId = "enr-demo-aarav";
      const planA = this.studentPlans.plan_a_refundable;
      this.enrollments.set(gradEnrollmentId, {
        id: gradEnrollmentId,
        studentUserId: gradId,
        courseId: "course-operations-management",
        cohortId: "cohort-operations-management-q4",
        careerTrackId: "operations-management",
        planCode: "plan_a_refundable",
        lockedAdmissionFeeInr: planA.priceInr,
        lockedGstBreakdown: calculateGstInclusiveBreakdown(planA.priceInr, planA.gstRatePercent),
        lockedTuitionCtcPercent: planA.tuitionCtcPercent,
        acceptedAgreementVersion: planA.agreementVersion,
        acceptedAgreementAt: startIso,
        status: "active",
        completedModuleIds: [
          "course-operations-management-mod-1",
          "course-operations-management-mod-2",
          "course-operations-management-mod-3",
        ],
        submittedAssignmentIds: [
          "course-operations-management-asg-1",
          "course-operations-management-asg-2",
        ],
        attendedClassIds: ["cohort-operations-management-q4-live-1"],
        createdAt: startIso,
      });
      this.eligibilities.set(gradId, {
        studentUserId: gradId,
        enrollmentId: gradEnrollmentId,
        careerTrackId: "operations-management",
        finalScorePercent: 87.5,
        passedAt: new Date(now.getTime() - 15 * 86400_000).toISOString(),
        isVerified: true,
      });
      this.consents.set(gradId, {
        studentUserId: gradId,
        employerVisibilityGranted: true,
        policyVersion: "DPDP-2026.1",
        grantedAt: new Date(now.getTime() - 14 * 86400_000).toISOString(),
        revokedAt: null,
        updatedAt: new Date(now.getTime() - 14 * 86400_000).toISOString(),
      });
    }
  }

  // ==================== CENTRAL ACTIVITY, AUDIT & OUTBOX WRITERS ====================

  private recordActivity(params: {
    eventType: string;
    actorUserId: string | null;
    actorRole: UserRole | "system" | "anonymous";
    sourcePortal: SourcePortal;
    entityType: string;
    entityId: string;
    studentId?: string | null;
    employerId?: string | null;
    careerTrackId?: string | null;
    courseId?: string | null;
    cohortId?: string | null;
    correlationId?: string;
    safeMetadata?: Record<string, unknown>;
    writeAudit?: {
      action: string;
      previousValues?: Record<string, unknown> | null;
      newValues?: Record<string, unknown> | null;
    };
    enqueueOutbox?: boolean;
  }): ActivityEventRecord {
    const nowIso = new Date().toISOString();
    const correlationId = params.correlationId ?? crypto.randomUUID();
    const safeMetadata = sanitizeSafeMetadata(params.safeMetadata);
    this.seqCounter += 1;

    const event: ActivityEventRecord = {
      id: crypto.randomUUID(),
      seqId: this.seqCounter,
      eventType: params.eventType,
      eventVersion: 1,
      occurredAt: nowIso,
      actorUserId: params.actorUserId,
      actorRole: params.actorRole,
      sourcePortal: params.sourcePortal,
      entityType: params.entityType,
      entityId: params.entityId,
      studentId: params.studentId ?? null,
      employerId: params.employerId ?? null,
      careerTrackId: params.careerTrackId ?? null,
      courseId: params.courseId ?? null,
      cohortId: params.cohortId ?? null,
      correlationId,
      safeMetadata,
      createdAt: nowIso,
    };
    this.activityEvents.push(event);

    if (params.writeAudit) {
      const auditEntry: AuditLogRecord = Object.freeze({
        id: crypto.randomUUID(),
        actorUserId: params.actorUserId,
        actorRole: params.actorRole,
        action: params.writeAudit.action,
        resourceType: params.entityType,
        resourceId: params.entityId,
        previousValuesRedacted: params.writeAudit.previousValues
          ? sanitizeSafeMetadata(params.writeAudit.previousValues)
          : null,
        newValuesRedacted: params.writeAudit.newValues
          ? sanitizeSafeMetadata(params.writeAudit.newValues)
          : null,
        sourcePortal: params.sourcePortal,
        requestId: correlationId,
        occurredAt: nowIso,
      });
      this.auditLogs.push(auditEntry);
    }

    if (params.enqueueOutbox) {
      const idempotencyKey = `${params.eventType}:${params.entityId}:${this.seqCounter}`;
      this.outboxEvents.push({
        id: crypto.randomUUID(),
        eventType: params.eventType,
        aggregateId: params.entityId,
        idempotencyKey,
        eventPayload: { eventId: event.id, safeMetadata },
        occurredAt: nowIso,
        processedAt: null,
        retryCount: 0,
        deliveryStatus: "pending",
      });
    }

    return event;
  }

  // ==================== PUBLIC CATALOG & COMMERCIAL PLANS ====================

  getPublicCommercialPlans() {
    const planA = this.studentPlans.plan_a_refundable;
    const planB = this.studentPlans.plan_b_non_refundable;
    const successFee = this.employerPlans.success_fee;
    const monthly = this.employerPlans.monthly_subscription;

    return {
      mode: this.mode,
      studentPlans: [
        {
          ...planA,
          gstBreakdown: calculateGstInclusiveBreakdown(planA.priceInr, planA.gstRatePercent),
        },
        {
          ...planB,
          gstBreakdown: calculateGstInclusiveBreakdown(planB.priceInr, planB.gstRatePercent),
        },
      ],
      employerPlans: [
        {
          ...successFee,
          exampleOn4LpaBreakdown: calculateEmployerSelectionCharge({
            billingModel: "success_fee",
            agreedCtcInr: 400000,
            successFeePercent: successFee.successFeeCtcPercent ?? 8.33,
            subscriptionActiveOnDate: false,
            gstRatePercent: successFee.gstRatePercent,
          }).breakdown,
        },
        {
          ...monthly,
          monthlyInvoiceBreakdown: calculateEmployerSubscriptionInvoice(
            monthly.monthlyFeeInr ?? 4999,
            monthly.gstRatePercent
          ),
        },
      ],
    };
  }

  getPublicCourses() {
    return Array.from(this.courses.values()).map((course) => {
      const activeCohort = Array.from(this.cohorts.values()).find((c) => c.courseId === course.id);
      const track = CANONICAL_TRACK_PROFILES[course.careerTrackId];
      return {
        ...course,
        trackName: track.name,
        trackHindiName: track.hindiName,
        trackSummary: track.summary,
        cohort: activeCohort ?? null,
      };
    });
  }

  recordFunnelEvent(params: {
    stage: string;
    anonymousSessionToken?: string;
    userId?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    referrer?: string;
  }) {
    const entry: FunnelEventRecord = {
      id: crypto.randomUUID(),
      stage: params.stage,
      anonymousSessionToken: params.anonymousSessionToken,
      userId: params.userId,
      utmSource: params.utmSource,
      utmMedium: params.utmMedium,
      utmCampaign: params.utmCampaign,
      referrer: params.referrer,
      occurredAt: new Date().toISOString(),
    };
    this.funnelEvents.push(entry);
    return entry;
  }

  // ==================== 1-3. FREE PRE-LOGIN PSYCHOMETRIC ASSESSMENT ====================

  startAnonymousAssessment(params?: { utmSource?: string; utmCampaign?: string }) {
    const sessionToken = `psy_${crypto.randomBytes(16).toString("hex")}`;
    const record: AnonymousAssessmentRecord = {
      id: crypto.randomUUID(),
      sessionToken,
      engineVersion: PSYCHOMETRIC_ENGINE_VERSION,
      answers: {},
      status: "in_progress",
      previewReport: null,
      fullReport: null,
      claimedByUserId: null,
      utmSource: params?.utmSource,
      utmCampaign: params?.utmCampaign,
      createdAt: new Date().toISOString(),
      submittedAt: null,
    };
    this.anonymousAssessments.set(sessionToken, record);
    this.recordFunnelEvent({
      stage: "psychometric_started",
      anonymousSessionToken: sessionToken,
      utmSource: params?.utmSource,
      utmCampaign: params?.utmCampaign,
    });
    return {
      sessionToken,
      engineVersion: record.engineVersion,
      questions: getPublicPsychometricQuestions(),
      estimatedTotalMinutes: 6,
    };
  }

  saveAnonymousAssessmentProgress(sessionToken: string, answers: Record<string, string>) {
    const record = this.anonymousAssessments.get(sessionToken);
    if (!record) {
      throw new PlatformError(404, "ASSESSMENT_SESSION_NOT_FOUND", "Assessment session not found.");
    }
    if (record.status !== "in_progress") {
      throw new PlatformError(409, "ASSESSMENT_ALREADY_SUBMITTED", "Assessment has already been submitted.");
    }
    record.answers = { ...record.answers, ...answers };
    return {
      sessionToken,
      savedCount: Object.keys(record.answers).length,
      status: record.status,
    };
  }

  submitAnonymousAssessment(sessionToken: string, answers: Record<string, string>) {
    const record = this.anonymousAssessments.get(sessionToken);
    if (!record) {
      throw new PlatformError(404, "ASSESSMENT_SESSION_NOT_FOUND", "Assessment session not found.");
    }
    // Duplicate submission protection: return existing preview idempotently
    if (record.status !== "in_progress" && record.previewReport) {
      return {
        sessionToken,
        duplicatePrevented: true,
        preview: record.previewReport,
      };
    }

    const merged = { ...record.answers, ...answers };
    if (Object.keys(merged).length < 10) {
      throw new PlatformError(
        400,
        "INCOMPLETE_ASSESSMENT",
        "Please answer at least 10 questions so we can provide a reliable career direction preview."
      );
    }

    const nowIso = new Date().toISOString();
    const { fullReport, previewReport } = evaluatePsychometricAssessment(merged, nowIso);
    record.answers = merged;
    record.status = "submitted";
    record.submittedAt = nowIso;
    record.previewReport = previewReport;
    record.fullReport = fullReport;

    this.recordActivity({
      eventType: "student.psychometric_completed",
      actorUserId: null,
      actorRole: "anonymous",
      sourcePortal: "student",
      entityType: "anonymous_assessment",
      entityId: record.id,
      careerTrackId: fullReport.topTracks[0].trackId,
      safeMetadata: {
        engineVersion: fullReport.engineVersion,
        questionsAnswered: fullReport.questionsAnswered,
        primaryTrack: fullReport.topTracks[0].trackId,
      },
    });
    this.recordFunnelEvent({
      stage: "psychometric_completed",
      anonymousSessionToken: sessionToken,
      utmSource: record.utmSource,
      utmCampaign: record.utmCampaign,
    });
    this.recordFunnelEvent({
      stage: "result_preview_viewed",
      anonymousSessionToken: sessionToken,
    });

    // Strictly return ONLY the 20% preview pre-login!
    return {
      sessionToken,
      duplicatePrevented: false,
      preview: previewReport,
    };
  }

  getAnonymousAssessmentPreview(sessionToken: string) {
    const record = this.anonymousAssessments.get(sessionToken);
    if (!record) {
      throw new PlatformError(404, "ASSESSMENT_SESSION_NOT_FOUND", "Assessment session not found.");
    }
    return {
      sessionToken,
      status: record.status,
      savedAnswers: record.answers,
      questions: getPublicPsychometricQuestions(),
      preview: record.previewReport,
    };
  }

  // ==================== 5. STUDENT AUTH (+91 OTP, EMAIL VERIFY, RECOVERY, CLAIM) ====================

  async requestIndianPhoneOtp(phone10: string) {
    const clean = phone10.replace(/\D/g, "").replace(/^91/, "");
    if (!/^[6-9]\d{9}$/.test(clean)) {
      throw new PlatformError(400, "INVALID_INDIAN_PHONE", "Please enter a valid 10-digit Indian mobile number.");
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.otpCodes.set(clean, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
    });
    const smsRes = await this.sms.sendIndianOtp(clean, code);
    return {
      sent: smsRes.delivered,
      maskedPhone: `+91 ******${clean.slice(-4)}`,
      expiresInSeconds: 600,
      // Sandbox dev convenience ONLY — NEVER returned in Live Mode!
      sandboxOtpHint: this.mode === "sandbox" ? code : undefined,
    };
  }

  async registerStudent(params: {
    fullName: string;
    email: string;
    phone10: string;
    otpCode: string;
    password: string;
    anonymousAssessmentToken?: string;
  }) {
    const email = params.email.trim().toLowerCase();
    const phone = params.phone10.replace(/\D/g, "").replace(/^91/, "");
    if (!params.fullName || params.fullName.trim().length < 2) {
      throw new PlatformError(400, "INVALID_NAME", "Please enter your full name.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new PlatformError(400, "INVALID_EMAIL", "Please enter a valid email address.");
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      throw new PlatformError(400, "INVALID_INDIAN_PHONE", "Please enter a valid 10-digit Indian mobile number.");
    }
    if (!params.password || params.password.length < 8) {
      throw new PlatformError(400, "WEAK_PASSWORD", "Password must be at least 8 characters long.");
    }

    const storedOtp = this.otpCodes.get(phone);
    if (!storedOtp || storedOtp.expiresAt < Date.now()) {
      throw new PlatformError(400, "OTP_EXPIRED", "OTP has expired or was not requested.");
    }
    if (storedOtp.code !== params.otpCode.trim()) {
      storedOtp.attempts += 1;
      if (storedOtp.attempts >= 5) this.otpCodes.delete(phone);
      throw new PlatformError(400, "INVALID_OTP", "Incorrect 6-digit OTP code.");
    }
    this.otpCodes.delete(phone);

    // Check uniqueness
    for (const u of this.users.values()) {
      if (u.email === email) {
        throw new PlatformError(409, "EMAIL_EXISTS", "An account with this email already exists. Please sign in.");
      }
      if (u.phone10 === phone) {
        throw new PlatformError(409, "PHONE_EXISTS", "This Indian mobile number is already registered. Please sign in.");
      }
    }

    const userId = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const user: PlatformUser = {
      id: userId,
      role: "student",
      fullName: params.fullName.trim(),
      email,
      emailVerified: false,
      phone10: phone,
      phoneVerified: true,
      passwordHash: hashPassword(params.password),
      mfaEnrolled: false,
      status: "active",
      createdAt: nowIso,
    };
    this.users.set(userId, user);

    // Issue email verification token
    const emailCode = String(Math.floor(100000 + Math.random() * 900000));
    this.emailVerificationCodes.set(email, { code: emailCode, expiresAt: Date.now() + 30 * 60_000 });
    await this.email.sendTransactionalEmail({
      to: email,
      subject: "Verify your UdaYantu email address",
      textSummary: `Welcome ${user.fullName}. Use verification code ${emailCode} to verify your email.`,
    });

    this.recordActivity({
      eventType: "student.registered",
      actorUserId: userId,
      actorRole: "student",
      sourcePortal: "student",
      entityType: "student",
      entityId: userId,
      studentId: userId,
      safeMetadata: { signupMethod: "indian_otp_email", maskedPhone: `******${phone.slice(-4)}` },
      writeAudit: { action: "student.registered", newValues: { email, phoneVerified: true } },
      enqueueOutbox: true,
    });
    this.recordActivity({
      eventType: "student.phone_verified",
      actorUserId: userId,
      actorRole: "student",
      sourcePortal: "student",
      entityType: "student",
      entityId: userId,
      studentId: userId,
      safeMetadata: { countryCode: "+91", maskedPhone: `******${phone.slice(-4)}` },
    });

    // Claim anonymous psychometric assessment seamlessly so zero responses are lost!
    let claimedReport: FullPsychometricReport | null = null;
    if (params.anonymousAssessmentToken) {
      claimedReport = this.claimAnonymousAssessment(userId, params.anonymousAssessmentToken);
    }

    this.recordFunnelEvent({
      stage: "full_report_registered",
      userId,
      anonymousSessionToken: params.anonymousAssessmentToken,
    });

    const token = this.identity.mintSessionToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      phoneE164: `+91${phone}`,
    });

    return {
      token,
      user: this.serializeSafeUser(user),
      redirectTo: "/dashboard",
      claimedReport,
      sandboxEmailCodeHint: this.mode === "sandbox" ? emailCode : undefined,
    };
  }

  loginUser(params: {
    emailOrPhone: string;
    password: string;
    expectedPortal?: "student" | "employer" | "admin";
    anonymousAssessmentToken?: string;
    mfaCode?: string;
  }) {
    const key = params.emailOrPhone.trim().toLowerCase();
    const cleanPhone = key.replace(/\D/g, "").replace(/^91/, "");
    const user = Array.from(this.users.values()).find(
      (u) => u.email === key || (cleanPhone.length === 10 && u.phone10 === cleanPhone)
    );
    if (!user || !verifyPassword(params.password, user.passwordHash)) {
      throw new PlatformError(401, "INVALID_CREDENTIALS", "Invalid email/phone or password.");
    }
    if (user.status !== "active") {
      throw new PlatformError(403, "ACCOUNT_SUSPENDED", "This account is suspended.");
    }

    if (params.expectedPortal === "student" && user.role !== "student") {
      throw new PlatformError(
        403,
        "PORTAL_ROLE_MISMATCH",
        "This account belongs to an Employer or Admin role. Please use the appropriate portal login."
      );
    }
    if (
      params.expectedPortal === "employer" &&
      user.role !== "employer_admin" &&
      user.role !== "employer_recruiter"
    ) {
      throw new PlatformError(
        403,
        "PORTAL_ROLE_MISMATCH",
        "Please sign in with an official Employer account."
      );
    }
    if (
      params.expectedPortal === "admin" &&
      !["admin", "super_admin", "mentor", "cs_agent"].includes(user.role)
    ) {
      throw new PlatformError(403, "ADMIN_ACCESS_DENIED", "Admin portal access is invite-only.");
    }

    let claimedReport: FullPsychometricReport | null = null;
    if (user.role === "student" && params.anonymousAssessmentToken) {
      claimedReport = this.claimAnonymousAssessment(user.id, params.anonymousAssessmentToken);
    }

    const token = this.identity.mintSessionToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      phoneE164: user.phone10 ? `+91${user.phone10}` : undefined,
      employerId: user.employerId ?? null,
      mfaVerified: user.mfaEnrolled && Boolean(params.mfaCode || this.mode === "sandbox"),
    });

    const redirectTo =
      user.role === "student"
        ? "/dashboard"
        : user.role === "employer_admin" || user.role === "employer_recruiter"
        ? "/employer/dashboard"
        : "/";

    return {
      token,
      user: this.serializeSafeUser(user),
      redirectTo,
      claimedReport,
    };
  }

  verifyUserEmail(userId: string, code: string) {
    const user = this.requireUser(userId);
    const stored = this.emailVerificationCodes.get(user.email);
    if (!stored || stored.expiresAt < Date.now() || stored.code !== code.trim()) {
      throw new PlatformError(400, "INVALID_VERIFICATION_CODE", "Invalid or expired email verification code.");
    }
    this.emailVerificationCodes.delete(user.email);
    user.emailVerified = true;
    const isEmployer = user.role === "employer_admin" || user.role === "employer_recruiter";
    this.recordActivity({
      eventType: isEmployer ? "employer.email_verified" : "student.email_verified",
      actorUserId: user.id,
      actorRole: user.role,
      sourcePortal: isEmployer ? "employer" : "student",
      entityType: isEmployer ? "employer_member" : "student",
      entityId: user.id,
      studentId: isEmployer ? null : user.id,
      employerId: user.employerId ?? null,
      safeMetadata: { emailDomain: user.email.split("@")[1] },
    });
    return { emailVerified: true };
  }

  async requestPasswordRecovery(email: string) {
    const normalized = email.trim().toLowerCase();
    const user = Array.from(this.users.values()).find((u) => u.email === normalized);
    if (!user) {
      // Do not enumerate accounts
      return { requested: true };
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.passwordResetCodes.set(normalized, { code, expiresAt: Date.now() + 15 * 60_000 });
    await this.email.sendTransactionalEmail({
      to: normalized,
      subject: "UdaYantu Password Recovery Code",
      textSummary: `Use code ${code} within 15 minutes to reset your UdaYantu password.`,
    });
    return {
      requested: true,
      sandboxResetCodeHint: this.mode === "sandbox" ? code : undefined,
    };
  }

  resetPasswordWithCode(email: string, code: string, newPassword: string) {
    const normalized = email.trim().toLowerCase();
    if (!newPassword || newPassword.length < 8) {
      throw new PlatformError(400, "WEAK_PASSWORD", "New password must be at least 8 characters.");
    }
    const stored = this.passwordResetCodes.get(normalized);
    if (!stored || stored.expiresAt < Date.now() || stored.code !== code.trim()) {
      throw new PlatformError(400, "INVALID_RESET_CODE", "Invalid or expired recovery code.");
    }
    const user = Array.from(this.users.values()).find((u) => u.email === normalized);
    if (!user) {
      throw new PlatformError(404, "USER_NOT_FOUND", "Account not found.");
    }
    user.passwordHash = hashPassword(newPassword);
    this.passwordResetCodes.delete(normalized);
    return { passwordUpdated: true };
  }

  claimAnonymousAssessment(studentUserId: string, sessionToken: string): FullPsychometricReport | null {
    const record = this.anonymousAssessments.get(sessionToken);
    if (!record || !record.fullReport) return null;
    if (record.claimedByUserId && record.claimedByUserId !== studentUserId) {
      throw new PlatformError(403, "ASSESSMENT_ALREADY_CLAIMED", "This assessment session belongs to another user.");
    }
    record.claimedByUserId = studentUserId;
    record.status = "claimed";
    this.recordActivity({
      eventType: "student.career_recommended",
      actorUserId: studentUserId,
      actorRole: "student",
      sourcePortal: "student",
      entityType: "career_recommendation",
      entityId: record.id,
      studentId: studentUserId,
      careerTrackId: record.fullReport.topTracks[0].trackId,
      safeMetadata: {
        topTrack: record.fullReport.topTracks[0].trackId,
        secondTrack: record.fullReport.topTracks[1]?.trackId,
        thirdTrack: record.fullReport.topTracks[2]?.trackId,
        engineVersion: record.fullReport.engineVersion,
      },
    });
    return record.fullReport;
  }

  // ==================== 4-5. STUDENT ADMISSION ENROLLMENT & SERVER-SIDE PAYMENT ====================

  async initiateStudentAdmissionPayment(params: {
    studentUserId: string;
    courseId: string;
    planCode: AdmissionPlanCode;
    acceptedAgreement: boolean;
    acceptedAgreementVersion: string;
  }) {
    const user = this.requireRole(params.studentUserId, ["student"]);
    const course = this.courses.get(params.courseId);
    if (!course || course.status !== "published") {
      throw new PlatformError(400, "COURSE_UNAVAILABLE", "Selected course is not open for new admissions.");
    }
    const plan = this.studentPlans[params.planCode];
    if (!plan) {
      throw new PlatformError(400, "INVALID_PLAN", "Invalid admission plan selected.");
    }
    if (!params.acceptedAgreement || params.acceptedAgreementVersion !== plan.agreementVersion) {
      throw new PlatformError(
        400,
        "AGREEMENT_REQUIRED",
        `Explicit acceptance of commercial agreement ${plan.agreementVersion} is required before payment.`
      );
    }

    // Duplicate enrollment prevention!
    const existingActive = Array.from(this.enrollments.values()).find(
      (e) => e.studentUserId === user.id && e.courseId === course.id && e.status !== "pending_payment"
    );
    if (existingActive) {
      throw new PlatformError(
        409,
        "DUPLICATE_ENROLLMENT",
        "You are already enrolled in this course. Duplicate admission payments are prevented."
      );
    }

    const activeCohort = Array.from(this.cohorts.values()).find(
      (c) => c.courseId === course.id && c.status === "active"
    );
    if (!activeCohort) {
      throw new PlatformError(400, "NO_ACTIVE_COHORT", "No active 90-day cohort is currently available for this course.");
    }

    // Reuse pending enrollment for same course if student retries payment, updating selected plan snapshot
    let enrollment = Array.from(this.enrollments.values()).find(
      (e) => e.studentUserId === user.id && e.courseId === course.id && e.status === "pending_payment"
    );

    const breakdown = calculateGstInclusiveBreakdown(plan.priceInr, plan.gstRatePercent);
    const nowIso = new Date().toISOString();

    if (!enrollment) {
      enrollment = {
        id: crypto.randomUUID(),
        studentUserId: user.id,
        courseId: course.id,
        cohortId: activeCohort.id,
        careerTrackId: course.careerTrackId,
        planCode: plan.code,
        lockedAdmissionFeeInr: plan.priceInr,
        lockedGstBreakdown: breakdown,
        lockedTuitionCtcPercent: plan.tuitionCtcPercent,
        acceptedAgreementVersion: plan.agreementVersion,
        acceptedAgreementAt: nowIso,
        status: "pending_payment",
        completedModuleIds: [],
        submittedAssignmentIds: [],
        attendedClassIds: [],
        createdAt: nowIso,
      };
      this.enrollments.set(enrollment.id, enrollment);
    } else {
      enrollment.planCode = plan.code;
      enrollment.lockedAdmissionFeeInr = plan.priceInr;
      enrollment.lockedGstBreakdown = breakdown;
      enrollment.lockedTuitionCtcPercent = plan.tuitionCtcPercent;
      enrollment.acceptedAgreementVersion = plan.agreementVersion;
      enrollment.acceptedAgreementAt = nowIso;
    }

    const order = await this.payments.createOrder({
      amountInr: breakdown.totalPayableInr,
      receipt: `udy_${enrollment.id.slice(0, 12)}`,
      notes: {
        studentUserId: user.id,
        enrollmentId: enrollment.id,
        planCode: plan.code,
        agreementVersion: plan.agreementVersion,
      },
    });

    const payment: PaymentRecord = {
      id: crypto.randomUUID(),
      userId: user.id,
      enrollmentId: enrollment.id,
      gateway: "razorpay",
      orderId: order.orderId,
      paymentId: null,
      breakdown,
      status: "created",
      invoiceNumber: null,
      processedWebhookEventIds: [],
      verifiedAt: null,
      createdAt: nowIso,
    };
    this.paymentRecords.set(order.orderId, payment);

    this.recordActivity({
      eventType: "student.course_selected",
      actorUserId: user.id,
      actorRole: "student",
      sourcePortal: "student",
      entityType: "enrollment",
      entityId: enrollment.id,
      studentId: user.id,
      careerTrackId: course.careerTrackId,
      courseId: course.id,
      cohortId: activeCohort.id,
      safeMetadata: { planCode: plan.code, agreementVersion: plan.agreementVersion },
    });
    this.recordActivity({
      eventType: "student.payment_initiated",
      actorUserId: user.id,
      actorRole: "student",
      sourcePortal: "student",
      entityType: "payment",
      entityId: payment.id,
      studentId: user.id,
      courseId: course.id,
      cohortId: activeCohort.id,
      safeMetadata: {
        orderId: order.orderId,
        totalPayableInr: breakdown.totalPayableInr,
        planCode: plan.code,
      },
    });
    this.recordFunnelEvent({ stage: "payment_initiated", userId: user.id });

    // In Sandbox mode only, provide deterministic test checkout signature helper (NEVER in Live Mode)
    const sandboxCheckoutHelper =
      this.mode === "sandbox"
        ? (() => {
            const testPaymentId = `pay_sbx_${crypto.randomBytes(6).toString("hex")}`;
            return {
              paymentId: testPaymentId,
              signature: this.payments.computeSandboxSignatureForDev(order.orderId, testPaymentId),
            };
          })()
        : undefined;

    return {
      order,
      enrollmentId: enrollment.id,
      planCode: plan.code,
      agreementVersion: plan.agreementVersion,
      gstBreakdown: breakdown,
      sandboxCheckoutHelper,
    };
  }

  verifyStudentAdmissionPayment(params: {
    studentUserId: string;
    orderId: string;
    paymentId: string;
    signature: string;
  }) {
    this.requireRole(params.studentUserId, ["student"]);
    const payment = this.paymentRecords.get(params.orderId);
    if (!payment || payment.userId !== params.studentUserId) {
      throw new PlatformError(404, "PAYMENT_ORDER_NOT_FOUND", "Payment order not found for this student.");
    }

    // Verify HMAC-SHA256 strictly server-side
    const valid = this.payments.verifyCheckoutSignature({
      orderId: params.orderId,
      paymentId: params.paymentId,
      signature: params.signature,
    });
    if (!valid) {
      payment.status = "failed";
      this.recordActivity({
        eventType: "student.payment_failed",
        actorUserId: params.studentUserId,
        actorRole: "student",
        sourcePortal: "student",
        entityType: "payment",
        entityId: payment.id,
        studentId: params.studentUserId,
        safeMetadata: { orderId: params.orderId, reason: "signature_verification_failed" },
      });
      throw new PlatformError(400, "INVALID_PAYMENT_SIGNATURE", "Payment signature verification failed.");
    }

    return this.capturePaymentIdempotently(payment, params.paymentId, "verify_api");
  }

  handleRazorpayWebhook(rawBody: string, signatureHeader: string) {
    if (!this.payments.verifyWebhookSignature(rawBody, signatureHeader)) {
      throw new PlatformError(400, "INVALID_WEBHOOK_SIGNATURE", "Invalid Razorpay webhook signature.");
    }
    const payload = JSON.parse(rawBody) as {
      id?: string;
      event?: string;
      payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
    };
    const webhookEventId = payload.id || crypto.createHash("sha256").update(rawBody).digest("hex");
    const orderId = payload.payload?.payment?.entity?.order_id;
    const paymentId = payload.payload?.payment?.entity?.id;
    if (!orderId || !paymentId) {
      return { acknowledged: true, ignored: true };
    }
    const payment = this.paymentRecords.get(orderId);
    if (!payment) {
      return { acknowledged: true, ignored: true };
    }
    if (payment.processedWebhookEventIds.includes(webhookEventId)) {
      return { acknowledged: true, idempotent: true, invoiceNumber: payment.invoiceNumber };
    }
    payment.processedWebhookEventIds.push(webhookEventId);
    return this.capturePaymentIdempotently(payment, paymentId, "webhook");
  }

  private capturePaymentIdempotently(
    payment: PaymentRecord,
    gatewayPaymentId: string,
    via: "verify_api" | "webhook"
  ) {
    const enrollment = this.enrollments.get(payment.enrollmentId);
    if (!enrollment) {
      throw new PlatformError(404, "ENROLLMENT_NOT_FOUND", "Associated enrollment not found.");
    }
    // Idempotency guard: if already captured, return existing invoice without duplicating events/invoices
    if (payment.status === "captured" && payment.invoiceNumber) {
      return {
        success: true,
        idempotent: true,
        paymentId: payment.id,
        invoiceNumber: payment.invoiceNumber,
        enrollmentId: enrollment.id,
        enrollmentStatus: enrollment.status,
      };
    }

    const nowIso = new Date().toISOString();
    payment.paymentId = gatewayPaymentId;
    payment.status = "captured";
    payment.verifiedAt = nowIso;
    payment.invoiceNumber = `UDY-INV-${nowIso.slice(0, 10).replace(/-/g, "")}-${payment.id.slice(0, 6).toUpperCase()}`;
    enrollment.status = "active";

    this.recordActivity({
      eventType: "student.payment_success",
      actorUserId: payment.userId,
      actorRole: "student",
      sourcePortal: via === "webhook" ? "system" : "student",
      entityType: "payment",
      entityId: payment.id,
      studentId: payment.userId,
      courseId: enrollment.courseId,
      cohortId: enrollment.cohortId,
      safeMetadata: {
        invoiceNumber: payment.invoiceNumber,
        totalPayableInr: payment.breakdown.totalPayableInr,
        planCode: enrollment.planCode,
        via,
      },
      writeAudit: {
        action: "payment.captured",
        newValues: {
          invoiceNumber: payment.invoiceNumber,
          totalPayableInr: payment.breakdown.totalPayableInr,
          planCode: enrollment.planCode,
        },
      },
      enqueueOutbox: true,
    });
    this.recordActivity({
      eventType: "student.enrollment_activated",
      actorUserId: payment.userId,
      actorRole: "student",
      sourcePortal: via === "webhook" ? "system" : "student",
      entityType: "enrollment",
      entityId: enrollment.id,
      studentId: payment.userId,
      careerTrackId: enrollment.careerTrackId,
      courseId: enrollment.courseId,
      cohortId: enrollment.cohortId,
      safeMetadata: {
        planCode: enrollment.planCode,
        lockedAdmissionFeeInr: enrollment.lockedAdmissionFeeInr,
        agreementVersion: enrollment.acceptedAgreementVersion,
      },
    });
    this.recordFunnelEvent({ stage: "admission_completed", userId: payment.userId });

    return {
      success: true,
      idempotent: false,
      paymentId: payment.id,
      invoiceNumber: payment.invoiceNumber,
      enrollmentId: enrollment.id,
      enrollmentStatus: enrollment.status,
    };
  }

  // ==================== 6-8. STUDENT DASHBOARD, LEARNING, FINAL 75% EXAM, REFUND & CONSENT ====================

  getStudentDashboard(studentUserId: string, now = new Date()) {
    const user = this.requireRole(studentUserId, ["student"]);
    const claimedAssessment = Array.from(this.anonymousAssessments.values())
      .filter((a) => a.claimedByUserId === user.id && a.fullReport)
      .sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""))[0];

    const enrollment = Array.from(this.enrollments.values())
      .filter((e) => e.studentUserId === user.id && e.status !== "pending_payment")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

    const course = enrollment ? this.courses.get(enrollment.courseId) ?? null : null;
    const cohort = enrollment ? this.cohorts.get(enrollment.cohortId) ?? null : null;
    const payment = enrollment
      ? Array.from(this.paymentRecords.values()).find(
          (p) => p.enrollmentId === enrollment.id && p.status === "captured"
        ) ?? null
      : null;

    const attempts = this.finalAttempts.get(user.id) ?? [];
    const eligibility = this.eligibilities.get(user.id) ?? null;
    const consent = this.consents.get(user.id) ?? {
      studentUserId: user.id,
      employerVisibilityGranted: false,
      policyVersion: "DPDP-2026.1",
      grantedAt: null,
      revokedAt: null,
      updatedAt: user.createdAt,
    };

    const studentOffers = Array.from(this.offers.values())
      .filter((o) => o.studentUserId === user.id)
      .map((o) => ({
        ...o,
        employerName: this.employers.get(o.employerId)?.companyName ?? "Verified Employer",
      }));

    const acceptedOffer = studentOffers.find((o) => o.status === "accepted" || o.status === "joined") ?? null;
    const refundReq = Array.from(this.refundRequests.values()).find((r) => r.studentUserId === user.id) ?? null;

    const refundLifecycle: RefundEvaluationResult | null = enrollment
      ? evaluateAdmissionRefundLifecycle({
          planCode: enrollment.planCode,
          finalAssessmentPassedAt: eligibility?.passedAt ?? null,
          qualifyingSelectionAt: acceptedOffer?.acceptedAt ?? null,
          now,
          existingRefundProcessingStatus: refundReq?.status ?? "none",
        })
      : null;

    const tuitionObligation = this.tuitionObligations.get(user.id) ?? null;

    const totalModules = course?.modules.length ?? 0;
    const totalAssignments = course?.assignments.length ?? 0;
    const completedModules = enrollment?.completedModuleIds.length ?? 0;
    const submittedAssignments = enrollment?.submittedAssignmentIds.length ?? 0;
    const mandatoryCourseworkComplete =
      Boolean(course && enrollment) &&
      completedModules >= totalModules &&
      submittedAssignments >= totalAssignments;

    const learningProgressPercent =
      totalModules + totalAssignments > 0
        ? Math.round(((completedModules + submittedAssignments) / (totalModules + totalAssignments)) * 100)
        : 0;

    // Explicit cohort/course disabled access policy: preserve records, allow read-only access
    const accessNotice =
      cohort?.status === "disabled" || course?.status === "disabled"
        ? "This course or cohort has been paused by Admin. Your enrollment, completed progress, certificates, and refund/eligibility records are safely preserved in read-only mode."
        : null;

    return {
      student: this.serializeSafeUser(user),
      fullCareerReport: claimedAssessment?.fullReport ?? null,
      enrollment: enrollment
        ? {
            ...enrollment,
            planName: this.studentPlans[enrollment.planCode].name,
            learningProgressPercent,
            mandatoryCourseworkComplete,
            accessNotice,
          }
        : null,
      course: course
        ? {
            ...course,
            modules: course.modules.map((m) => ({
              ...m,
              signedPdfUrl: this.storage.createSignedDownloadUrl(m.pdfObjectKey),
              completed: enrollment?.completedModuleIds.includes(m.id) ?? false,
            })),
            assignments: course.assignments.map((a) => ({
              ...a,
              submitted: enrollment?.submittedAssignmentIds.includes(a.id) ?? false,
            })),
          }
        : null,
      cohort,
      payment,
      finalAssessment: {
        eligibleToAttempt: Boolean(enrollment && enrollment.status === "active"),
        mandatoryCourseworkComplete,
        passingThresholdPercent: course?.passingThresholdPercent ?? 75,
        attempts: attempts.map((a) => ({
          attemptNumber: a.attemptNumber,
          scorePercent: a.result.overallScorePercent,
          passed: a.result.qualified,
          meetsScoreThreshold: a.result.meetsScoreThreshold,
          sectionScores: a.result.sectionScores,
          evaluatedAt: a.result.evaluatedAt,
          reason: a.result.reason,
        })),
        qualified: Boolean(eligibility?.isVerified),
        passedAt: eligibility?.passedAt ?? null,
      },
      eligibility,
      consent,
      refundLifecycle,
      refundRequest: refundReq,
      offers: studentOffers,
      tuitionObligation,
    };
  }

  completeStudentModule(studentUserId: string, moduleId: string) {
    const enrollment = this.requireActiveEnrollment(studentUserId);
    const course = this.courses.get(enrollment.courseId)!;
    const cohort = this.cohorts.get(enrollment.cohortId)!;
    if (cohort.status === "disabled" || course.status === "disabled") {
      throw new PlatformError(
        403,
        "COHORT_DISABLED_READ_ONLY",
        "This cohort is currently disabled by Admin. Existing progress is preserved in read-only mode."
      );
    }
    if (!course.modules.some((m) => m.id === moduleId)) {
      throw new PlatformError(404, "MODULE_NOT_FOUND", "Module does not belong to your enrolled course.");
    }
    if (!enrollment.completedModuleIds.includes(moduleId)) {
      enrollment.completedModuleIds.push(moduleId);
      const pct = Math.round((enrollment.completedModuleIds.length / course.modules.length) * 100);
      this.recordActivity({
        eventType: "student.module_completed",
        actorUserId: studentUserId,
        actorRole: "student",
        sourcePortal: "student",
        entityType: "module_progress",
        entityId: moduleId,
        studentId: studentUserId,
        courseId: course.id,
        cohortId: cohort.id,
        safeMetadata: { moduleId, completionPercent: pct },
      });
    }
    return { completedModuleIds: enrollment.completedModuleIds };
  }

  submitStudentAssignment(studentUserId: string, assignmentId: string, submissionNotes: string) {
    const enrollment = this.requireActiveEnrollment(studentUserId);
    const course = this.courses.get(enrollment.courseId)!;
    const cohort = this.cohorts.get(enrollment.cohortId)!;
    if (cohort.status === "disabled" || course.status === "disabled") {
      throw new PlatformError(
        403,
        "COHORT_DISABLED_READ_ONLY",
        "This cohort is currently disabled by Admin. Existing submissions are preserved in read-only mode."
      );
    }
    if (!course.assignments.some((a) => a.id === assignmentId)) {
      throw new PlatformError(404, "ASSIGNMENT_NOT_FOUND", "Assignment does not belong to your enrolled course.");
    }
    if (!submissionNotes || submissionNotes.trim().length < 5) {
      throw new PlatformError(400, "INVALID_SUBMISSION", "Please include your assignment notes or link.");
    }
    if (!enrollment.submittedAssignmentIds.includes(assignmentId)) {
      enrollment.submittedAssignmentIds.push(assignmentId);
    }
    this.recordActivity({
      eventType: "student.assignment_submitted",
      actorUserId: studentUserId,
      actorRole: "student",
      sourcePortal: "student",
      entityType: "assignment_submission",
      entityId: assignmentId,
      studentId: studentUserId,
      courseId: course.id,
      cohortId: cohort.id,
      safeMetadata: { assignmentId },
    });
    return { submittedAssignmentIds: enrollment.submittedAssignmentIds };
  }

  recordLiveClassAttendance(studentUserId: string, classId: string) {
    const enrollment = this.requireActiveEnrollment(studentUserId);
    if (!enrollment.attendedClassIds.includes(classId)) {
      enrollment.attendedClassIds.push(classId);
      this.recordActivity({
        eventType: "student.class_attended",
        actorUserId: studentUserId,
        actorRole: "student",
        sourcePortal: "student",
        entityType: "class_attendance",
        entityId: classId,
        studentId: studentUserId,
        courseId: enrollment.courseId,
        cohortId: enrollment.cohortId,
        safeMetadata: { classId },
      });
    }
    return { attendedClassIds: enrollment.attendedClassIds };
  }

  getFinalAssessmentQuestionsForStudent(studentUserId: string) {
    const enrollment = this.requireActiveEnrollment(studentUserId);
    const course = this.courses.get(enrollment.courseId)!;
    const trackQuestions = this.questionBank.filter(
      (q) => q.trackId === "all" || q.trackId === enrollment.careerTrackId
    );
    // STRICT SECURITY: Never expose correctOptionId to client
    return {
      assessmentVersion: FINAL_ASSESSMENT_VERSION,
      passingThresholdPercent: course.passingThresholdPercent,
      questions: stripFinalAssessmentAnswerKeys(trackQuestions),
    };
  }

  submitFinalAssessment(
    studentUserId: string,
    answers: Record<string, string>,
    evaluatedAt?: string
  ) {
    const enrollment = this.requireActiveEnrollment(studentUserId);
    const course = this.courses.get(enrollment.courseId)!;

    // Prevent repeated submission after already qualifying
    if (this.eligibilities.get(studentUserId)?.isVerified) {
      throw new PlatformError(
        409,
        "ALREADY_QUALIFIED",
        "You have already passed the final assessment and earned verified qualification."
      );
    }

    const previousAttempts = this.finalAttempts.get(studentUserId) ?? [];
    if (previousAttempts.length >= 3) {
      throw new PlatformError(
        429,
        "MAX_ATTEMPTS_REACHED",
        "Maximum final assessment attempts reached. Please contact your mentor or support."
      );
    }

    const trackQuestions = this.questionBank.filter(
      (q) => q.trackId === "all" || q.trackId === enrollment.careerTrackId
    );
    const mandatoryCourseworkComplete =
      enrollment.completedModuleIds.length >= course.modules.length &&
      enrollment.submittedAssignmentIds.length >= course.assignments.length;

    const result = evaluateFinalAssessmentSubmission({
      questions: trackQuestions,
      answers,
      mandatoryCourseworkComplete,
      passingThresholdPercent: course.passingThresholdPercent,
      evaluatedAt,
    });

    const attempt: FinalAssessmentAttemptRecord = {
      id: crypto.randomUUID(),
      studentUserId,
      enrollmentId: enrollment.id,
      attemptNumber: previousAttempts.length + 1,
      result,
    };
    previousAttempts.push(attempt);
    this.finalAttempts.set(studentUserId, previousAttempts);

    this.recordActivity({
      eventType: "student.final_assessment_submitted",
      actorUserId: studentUserId,
      actorRole: "student",
      sourcePortal: "student",
      entityType: "final_assessment_attempt",
      entityId: attempt.id,
      studentId: studentUserId,
      courseId: course.id,
      cohortId: enrollment.cohortId,
      safeMetadata: { attemptNumber: attempt.attemptNumber, totalQuestions: result.totalQuestions },
    });

    if (result.qualified) {
      const eligibility: StudentEligibilityRecord = {
        studentUserId,
        enrollmentId: enrollment.id,
        careerTrackId: enrollment.careerTrackId,
        finalScorePercent: result.overallScorePercent,
        passedAt: result.evaluatedAt,
        isVerified: true,
      };
      this.eligibilities.set(studentUserId, eligibility);
      enrollment.status = "completed";

      this.recordActivity({
        eventType: "student.final_assessment_passed",
        actorUserId: studentUserId,
        actorRole: "student",
        sourcePortal: "student",
        entityType: "final_assessment_attempt",
        entityId: attempt.id,
        studentId: studentUserId,
        careerTrackId: enrollment.careerTrackId,
        courseId: course.id,
        cohortId: enrollment.cohortId,
        safeMetadata: {
          scorePercent: result.overallScorePercent,
          passingThresholdPercent: result.passingThresholdPercent,
          attemptNumber: attempt.attemptNumber,
        },
        writeAudit: {
          action: "student.eligibility_verified",
          newValues: { scorePercent: result.overallScorePercent, passedAt: result.evaluatedAt },
        },
        enqueueOutbox: true,
      });
      this.recordActivity({
        eventType: "student.eligibility_verified",
        actorUserId: studentUserId,
        actorRole: "student",
        sourcePortal: "system",
        entityType: "student_eligibility",
        entityId: studentUserId,
        studentId: studentUserId,
        careerTrackId: enrollment.careerTrackId,
        courseId: course.id,
        cohortId: enrollment.cohortId,
        safeMetadata: { scorePercent: result.overallScorePercent, passedAt: result.evaluatedAt },
      });
      this.recordFunnelEvent({ stage: "final_assessment_passed", userId: studentUserId });
    } else {
      this.recordActivity({
        eventType: "student.final_assessment_failed",
        actorUserId: studentUserId,
        actorRole: "student",
        sourcePortal: "student",
        entityType: "final_assessment_attempt",
        entityId: attempt.id,
        studentId: studentUserId,
        careerTrackId: enrollment.careerTrackId,
        courseId: course.id,
        cohortId: enrollment.cohortId,
        safeMetadata: {
          scorePercent: result.overallScorePercent,
          passingThresholdPercent: result.passingThresholdPercent,
          mandatoryCourseworkComplete,
          attemptNumber: attempt.attemptNumber,
        },
      });
    }

    return attempt;
  }

  updateStudentRecruitmentConsent(
    studentUserId: string,
    employerVisibilityGranted: boolean,
    policyVersion = "DPDP-2026.1"
  ) {
    this.requireRole(studentUserId, ["student"]);
    if (employerVisibilityGranted && !this.eligibilities.get(studentUserId)?.isVerified) {
      throw new PlatformError(
        400,
        "NOT_YET_ELIGIBLE",
        "You can enable employer visibility once you pass the final assessment with at least 75% and complete mandatory coursework."
      );
    }
    const previous = this.consents.get(studentUserId) ?? null;
    const nowIso = new Date().toISOString();
    const record: StudentConsentRecord = {
      studentUserId,
      employerVisibilityGranted,
      policyVersion,
      grantedAt: employerVisibilityGranted ? nowIso : previous?.grantedAt ?? null,
      revokedAt: employerVisibilityGranted ? null : nowIso,
      updatedAt: nowIso,
    };
    this.consents.set(studentUserId, record);

    this.recordActivity({
      eventType: employerVisibilityGranted ? "student.consent_granted" : "student.consent_revoked",
      actorUserId: studentUserId,
      actorRole: "student",
      sourcePortal: "student",
      entityType: "student_consent",
      entityId: studentUserId,
      studentId: studentUserId,
      safeMetadata: { employerVisibilityGranted, policyVersion },
      writeAudit: {
        action: employerVisibilityGranted ? "consent.granted" : "consent.revoked",
        previousValues: previous ? { employerVisibilityGranted: previous.employerVisibilityGranted } : null,
        newValues: { employerVisibilityGranted, policyVersion },
      },
      enqueueOutbox: true,
    });
    if (employerVisibilityGranted) {
      this.recordFunnelEvent({ stage: "eligible_profile_consented", userId: studentUserId });
    }
    return record;
  }

  requestAdmissionRefund(studentUserId: string, reason: string, now = new Date()) {
    this.requireRole(studentUserId, ["student"]);
    const enrollment = Array.from(this.enrollments.values()).find(
      (e) => e.studentUserId === studentUserId && e.status !== "pending_payment"
    );
    if (!enrollment) {
      throw new PlatformError(404, "ENROLLMENT_NOT_FOUND", "No paid enrollment found.");
    }
    if (enrollment.planCode === "plan_b_non_refundable") {
      throw new PlatformError(
        400,
        "PLAN_B_NON_REFUNDABLE",
        "Plan B admission fee is strictly non-refundable regardless of job selection status."
      );
    }
    const eligibility = this.eligibilities.get(studentUserId);
    const acceptedOffer = Array.from(this.offers.values()).find(
      (o) => o.studentUserId === studentUserId && (o.status === "accepted" || o.status === "joined")
    );
    const existingReq = Array.from(this.refundRequests.values()).find(
      (r) => r.studentUserId === studentUserId
    );
    const evaluation = evaluateAdmissionRefundLifecycle({
      planCode: enrollment.planCode,
      finalAssessmentPassedAt: eligibility?.passedAt ?? null,
      qualifyingSelectionAt: acceptedOffer?.acceptedAt ?? null,
      now,
      existingRefundProcessingStatus: existingReq?.status ?? "none",
    });

    if (!evaluation.canRequestRefund) {
      throw new PlatformError(400, "REFUND_NOT_ELIGIBLE", evaluation.explanation);
    }

    const payment = Array.from(this.paymentRecords.values()).find(
      (p) => p.enrollmentId === enrollment.id && p.status === "captured"
    );
    const nowIso = now.toISOString();
    const reqRecord: RefundRequestRecord = {
      id: crypto.randomUUID(),
      studentUserId,
      enrollmentId: enrollment.id,
      paymentId: payment?.id ?? "unknown",
      amountInr: enrollment.lockedAdmissionFeeInr,
      reason: reason.trim() || "120 calendar days elapsed without qualifying job selection",
      status: "requested",
      requestedAt: nowIso,
      updatedAt: nowIso,
    };
    this.refundRequests.set(reqRecord.id, reqRecord);
    this.recordActivity({
      eventType: "student.refund_requested",
      actorUserId: studentUserId,
      actorRole: "student",
      sourcePortal: "student",
      entityType: "refund_request",
      entityId: reqRecord.id,
      studentId: studentUserId,
      safeMetadata: { amountInr: reqRecord.amountInr, status: reqRecord.status },
      writeAudit: { action: "refund.requested", newValues: { amountInr: reqRecord.amountInr } },
      enqueueOutbox: true,
    });
    return reqRecord;
  }

  // ==================== 9-11. EMPLOYER PORTAL (INSIDE udayantu.com/employer/*) ====================

  async registerEmployer(params: {
    fullName: string;
    officialEmail: string;
    password: string;
    companyName: string;
    registrationId: string;
    industry: string;
    city: string;
    billingModel: EmployerBillingModel;
  }) {
    const emailCheck = isOfficialBusinessEmail(params.officialEmail);
    if (!emailCheck.valid) {
      throw new PlatformError(422, "INVALID_BUSINESS_EMAIL", emailCheck.reason!);
    }
    if (!params.companyName || params.companyName.trim().length < 2) {
      throw new PlatformError(400, "INVALID_COMPANY", "Company legal name is required.");
    }
    if (!params.password || params.password.length < 8) {
      throw new PlatformError(400, "WEAK_PASSWORD", "Password must be at least 8 characters.");
    }

    const email = params.officialEmail.trim().toLowerCase();
    for (const u of this.users.values()) {
      if (u.email === email) {
        throw new PlatformError(409, "EMAIL_EXISTS", "This email is already registered.");
      }
    }

    const nowIso = new Date().toISOString();
    const orgId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const planCfg = this.employerPlans[params.billingModel] ?? this.employerPlans.success_fee;

    const user: PlatformUser = {
      id: userId,
      role: "employer_admin",
      fullName: params.fullName.trim(),
      email,
      emailVerified: false,
      phoneVerified: false,
      passwordHash: hashPassword(params.password),
      employerId: orgId,
      mfaEnrolled: false,
      status: "active",
      createdAt: nowIso,
    };
    this.users.set(userId, user);

    const org: EmployerOrganizationRecord = {
      id: orgId,
      companyName: params.companyName.trim(),
      officialDomain: emailCheck.domain,
      registrationId: params.registrationId.trim(),
      industry: params.industry.trim() || "Corporate Services",
      city: params.city.trim() || "India",
      approvalStatus: "pending", // Requires Admin approval before candidate access!
      billingModel: planCfg.model,
      customSuccessFeePercent: this.employerPlans.success_fee.successFeeCtcPercent ?? 8.33,
      customMonthlyFeeInr: this.employerPlans.monthly_subscription.monthlyFeeInr ?? 4999,
      subscriptionActiveFrom: null,
      subscriptionActiveUntil: null,
      commercialAgreementVersion: planCfg.agreementVersion,
      teamMembers: [
        {
          id: crypto.randomUUID(),
          userId,
          fullName: user.fullName,
          email: user.email,
          role: "employer_admin",
          status: "active",
        },
      ],
      createdAt: nowIso,
    };
    this.employers.set(orgId, org);

    const verifyCode = String(Math.floor(100000 + Math.random() * 900000));
    this.emailVerificationCodes.set(email, { code: verifyCode, expiresAt: Date.now() + 30 * 60_000 });
    await this.email.sendTransactionalEmail({
      to: email,
      subject: "Verify your official UdaYantu Employer email",
      textSummary: `Use code ${verifyCode} to verify ${email} for ${org.companyName}.`,
    });

    this.recordActivity({
      eventType: "employer.registered",
      actorUserId: userId,
      actorRole: "employer_admin",
      sourcePortal: "employer",
      entityType: "employer",
      entityId: orgId,
      employerId: orgId,
      safeMetadata: { companyName: org.companyName, officialDomain: org.officialDomain },
      writeAudit: { action: "employer.registered", newValues: { companyName: org.companyName, officialDomain: org.officialDomain } },
      enqueueOutbox: true,
    });
    this.recordActivity({
      eventType: "employer.company_submitted",
      actorUserId: userId,
      actorRole: "employer_admin",
      sourcePortal: "employer",
      entityType: "employer",
      entityId: orgId,
      employerId: orgId,
      safeMetadata: { companyName: org.companyName, registrationId: org.registrationId },
    });

    const token = this.identity.mintSessionToken({
      userId,
      role: user.role,
      email: user.email,
      employerId: orgId,
    });

    return {
      token,
      user: this.serializeSafeUser(user),
      employer: org,
      redirectTo: "/employer/dashboard",
      sandboxEmailCodeHint: this.mode === "sandbox" ? verifyCode : undefined,
    };
  }

  getEmployerWorkspace(employerUserId: string) {
    const user = this.requireRole(employerUserId, ["employer_admin", "employer_recruiter"]);
    const org = this.requireEmployerOrg(user.employerId!);
    const orgJobs = Array.from(this.jobs.values()).filter((j) => j.employerId === org.id);
    const orgShortlists = Array.from(this.shortlists.values()).filter((s) => s.employerId === org.id);
    const orgInterviews = Array.from(this.interviews.values()).filter((i) => i.employerId === org.id);
    const orgOffers = Array.from(this.offers.values())
      .filter((o) => o.employerId === org.id)
      .map((o) => ({
        ...o,
        studentName: this.users.get(o.studentUserId)?.fullName ?? "Candidate",
      }));
    const orgInvoices = Array.from(this.employerInvoices.values()).filter((inv) => inv.employerId === org.id);

    const now = new Date();
    const subscriptionActive = this.isEmployerSubscriptionActiveOn(org, now);

    return {
      user: this.serializeSafeUser(user),
      employer: org,
      billing: {
        billingModel: org.billingModel,
        commercialAgreementVersion: org.commercialAgreementVersion,
        successFeePercent: org.customSuccessFeePercent,
        monthlyFeeInr: org.customMonthlyFeeInr,
        gstRatePercent: 18,
        gstAddedSeparately: true,
        subscriptionActive,
        subscriptionActiveFrom: org.subscriptionActiveFrom,
        subscriptionActiveUntil: org.subscriptionActiveUntil,
        monthlyInvoicePreview: calculateEmployerSubscriptionInvoice(org.customMonthlyFeeInr, 18),
        invoices: orgInvoices,
        availablePlans: this.getPublicCommercialPlans().employerPlans,
      },
      jobs: orgJobs,
      shortlists: orgShortlists,
      interviews: orgInterviews,
      offers: orgOffers,
    };
  }

  selectEmployerBillingPlan(employerUserId: string, billingModel: EmployerBillingModel, now = new Date()) {
    const user = this.requireRole(employerUserId, ["employer_admin"]);
    const org = this.requireEmployerOrg(user.employerId!);
    const plan = this.employerPlans[billingModel];
    if (!plan) {
      throw new PlatformError(400, "INVALID_BILLING_MODEL", "Invalid employer billing model.");
    }
    org.billingModel = billingModel;
    org.commercialAgreementVersion = plan.agreementVersion;

    let subscriptionInvoice: EmployerInvoiceRecord | null = null;
    if (billingModel === "monthly_subscription") {
      const startIso = now.toISOString();
      const endIso = new Date(now.getTime() + 30 * 86400_000).toISOString();
      org.subscriptionActiveFrom = startIso;
      org.subscriptionActiveUntil = endIso;
      const breakdown = calculateEmployerSubscriptionInvoice(org.customMonthlyFeeInr, plan.gstRatePercent);
      subscriptionInvoice = {
        id: crypto.randomUUID(),
        invoiceNumber: `UDY-EMP-SUB-${startIso.slice(0, 10).replace(/-/g, "")}-${org.id.slice(0, 4).toUpperCase()}`,
        employerId: org.id,
        type: "monthly_subscription",
        referenceId: `${startIso.slice(0, 10)}_30d`,
        description: `Monthly Unlimited Hiring Subscription (${startIso.slice(0, 10)} to ${endIso.slice(0, 10)}) + 18% GST`,
        appliedPercent: null,
        waivedReason: null,
        breakdown,
        agreementVersion: org.commercialAgreementVersion,
        status: "issued",
        createdAt: startIso,
      };
      this.employerInvoices.set(subscriptionInvoice.id, subscriptionInvoice);
    }

    this.recordActivity({
      eventType: "employer.profile_updated",
      actorUserId: user.id,
      actorRole: user.role,
      sourcePortal: "employer",
      entityType: "employer",
      entityId: org.id,
      employerId: org.id,
      safeMetadata: { billingModel, commercialAgreementVersion: org.commercialAgreementVersion },
      writeAudit: {
        action: "employer.billing_model_updated",
        newValues: { billingModel, commercialAgreementVersion: org.commercialAgreementVersion },
      },
    });
    return { employer: org, subscriptionInvoice };
  }

  createEmployerJob(
    employerUserId: string,
    params: {
      title: string;
      careerTrackId: CanonicalCareerTrackId;
      location: string;
      minCtcInr: number;
      maxCtcInr: number;
      openings: number;
      publishNow?: boolean;
    }
  ) {
    const user = this.requireRole(employerUserId, ["employer_admin", "employer_recruiter"]);
    const org = this.requireEmployerOrg(user.employerId!);
    if (params.publishNow && org.approvalStatus !== "approved") {
      throw new PlatformError(
        403,
        "EMPLOYER_NOT_APPROVED",
        "Your company must be approved by Admin before publishing live jobs."
      );
    }
    const job: JobPostingRecord = {
      id: crypto.randomUUID(),
      employerId: org.id,
      title: params.title.trim(),
      careerTrackId: params.careerTrackId,
      location: params.location.trim(),
      minCtcInr: params.minCtcInr,
      maxCtcInr: params.maxCtcInr,
      openings: Math.max(1, params.openings),
      status: params.publishNow ? "published" : "draft",
      createdAt: new Date().toISOString(),
    };
    this.jobs.set(job.id, job);
    this.recordActivity({
      eventType: params.publishNow ? "employer.job_published" : "employer.job_created",
      actorUserId: user.id,
      actorRole: user.role,
      sourcePortal: "employer",
      entityType: "job",
      entityId: job.id,
      employerId: org.id,
      careerTrackId: job.careerTrackId,
      safeMetadata: { title: job.title, location: job.location, openings: job.openings },
    });
    return job;
  }

  /**
   * Candidate Discovery:
   * - Requires approved Employer organization.
   * - Strictly returns ONLY verified (>=75%) eligible students WITH active employer_visibility consent!
   * - Never leaks private student contact PII without authorised shortlist/consent purpose.
   */
  searchEligibleConsentedCandidates(
    employerUserId: string,
    filters?: { careerTrackId?: CanonicalCareerTrackId; minScore?: number }
  ) {
    const user = this.requireRole(employerUserId, ["employer_admin", "employer_recruiter"]);
    const org = this.requireEmployerOrg(user.employerId!);
    if (org.approvalStatus !== "approved") {
      throw new PlatformError(
        403,
        "EMPLOYER_NOT_APPROVED",
        "Admin company verification and approval is required before discovering candidates."
      );
    }

    const candidates: Array<{
      studentUserId: string;
      displayName: string;
      careerTrackId: CanonicalCareerTrackId;
      careerTrackName: string;
      finalScorePercent: number;
      passedAt: string;
      consentVerified: true;
    }> = [];

    for (const eligibility of this.eligibilities.values()) {
      if (!eligibility.isVerified || eligibility.finalScorePercent < 75) continue;
      const consent = this.consents.get(eligibility.studentUserId);
      // Immediate consent enforcement: if revoked or never granted, NEVER expose!
      if (!consent || !consent.employerVisibilityGranted || consent.revokedAt) continue;

      if (filters?.careerTrackId && eligibility.careerTrackId !== filters.careerTrackId) continue;
      if (filters?.minScore && eligibility.finalScorePercent < filters.minScore) continue;

      const student = this.users.get(eligibility.studentUserId);
      if (!student || student.status !== "active") continue;

      candidates.push({
        studentUserId: student.id,
        displayName: student.fullName,
        careerTrackId: eligibility.careerTrackId,
        careerTrackName: CANONICAL_TRACK_PROFILES[eligibility.careerTrackId].name,
        finalScorePercent: eligibility.finalScorePercent,
        passedAt: eligibility.passedAt,
        consentVerified: true,
      });
    }

    this.recordActivity({
      eventType: "employer.candidate_search_performed",
      actorUserId: user.id,
      actorRole: user.role,
      sourcePortal: "employer",
      entityType: "employer",
      entityId: org.id,
      employerId: org.id,
      careerTrackId: filters?.careerTrackId ?? null,
      safeMetadata: { resultCount: candidates.length, minScore: filters?.minScore ?? 75 },
    });

    return candidates;
  }

  shortlistCandidate(employerUserId: string, jobId: string, studentUserId: string) {
    const user = this.requireRole(employerUserId, ["employer_admin", "employer_recruiter"]);
    const org = this.requireEmployerOrg(user.employerId!);
    if (org.approvalStatus !== "approved") {
      throw new PlatformError(403, "EMPLOYER_NOT_APPROVED", "Employer must be approved by Admin.");
    }
    const job = this.jobs.get(jobId);
    if (!job || job.employerId !== org.id) {
      throw new PlatformError(404, "JOB_NOT_FOUND", "Job not found for your company.");
    }
    const eligibility = this.eligibilities.get(studentUserId);
    const consent = this.consents.get(studentUserId);
    if (!eligibility?.isVerified || !consent?.employerVisibilityGranted || consent.revokedAt) {
      throw new PlatformError(
        403,
        "CANDIDATE_NOT_AVAILABLE",
        "Candidate is either not qualified (≥75%) or has revoked recruitment visibility consent."
      );
    }

    const shortlist: ShortlistRecord = {
      id: crypto.randomUUID(),
      employerId: org.id,
      jobId: job.id,
      studentUserId,
      stage: "shortlisted",
      createdAt: new Date().toISOString(),
    };
    this.shortlists.set(shortlist.id, shortlist);
    this.recordActivity({
      eventType: "employer.candidate_shortlisted",
      actorUserId: user.id,
      actorRole: user.role,
      sourcePortal: "employer",
      entityType: "shortlist",
      entityId: shortlist.id,
      studentId: studentUserId,
      employerId: org.id,
      careerTrackId: job.careerTrackId,
      safeMetadata: { jobId: job.id, stage: shortlist.stage },
    });
    this.recordFunnelEvent({ stage: "employer_shortlisted", userId: studentUserId });
    return shortlist;
  }

  scheduleInterview(
    employerUserId: string,
    params: { jobId: string; studentUserId: string; scheduledAt: string; mode: "Zoom" | "Google Meet" | "In-Person"; meetingLink: string }
  ) {
    const user = this.requireRole(employerUserId, ["employer_admin", "employer_recruiter"]);
    const org = this.requireEmployerOrg(user.employerId!);
    const job = this.jobs.get(params.jobId);
    if (!job || job.employerId !== org.id) {
      throw new PlatformError(404, "JOB_NOT_FOUND", "Job not found for your company.");
    }
    const interview: InterviewRecord = {
      id: crypto.randomUUID(),
      employerId: org.id,
      jobId: job.id,
      studentUserId: params.studentUserId,
      scheduledAt: params.scheduledAt,
      mode: params.mode,
      meetingLink: params.meetingLink,
      status: "scheduled",
    };
    this.interviews.set(interview.id, interview);
    // Note: Scheduling an interview NEVER generates tuition or employer success fees!
    this.recordActivity({
      eventType: "employer.interview_scheduled",
      actorUserId: user.id,
      actorRole: user.role,
      sourcePortal: "employer",
      entityType: "interview",
      entityId: interview.id,
      studentId: params.studentUserId,
      employerId: org.id,
      safeMetadata: { jobId: job.id, mode: interview.mode },
    });
    this.recordFunnelEvent({ stage: "interview_scheduled", userId: params.studentUserId });
    return interview;
  }

  issueWrittenOffer(
    employerUserId: string,
    params: { jobId: string; studentUserId: string; roleTitle: string; agreedCtcInr: number; joiningDate: string }
  ) {
    const user = this.requireRole(employerUserId, ["employer_admin", "employer_recruiter"]);
    const org = this.requireEmployerOrg(user.employerId!);
    if (org.approvalStatus !== "approved") {
      throw new PlatformError(403, "EMPLOYER_NOT_APPROVED", "Employer must be approved by Admin.");
    }
    const job = this.jobs.get(params.jobId);
    if (!job || job.employerId !== org.id) {
      throw new PlatformError(404, "JOB_NOT_FOUND", "Job not found for your company.");
    }
    if (!Number.isFinite(params.agreedCtcInr) || params.agreedCtcInr <= 0) {
      throw new PlatformError(400, "INVALID_CTC", "Agreed annual CTC must be a positive INR amount.");
    }
    const offer: WrittenOfferRecord = {
      id: crypto.randomUUID(),
      employerId: org.id,
      jobId: job.id,
      studentUserId: params.studentUserId,
      roleTitle: params.roleTitle.trim(),
      agreedCtcInr: params.agreedCtcInr,
      joiningDate: params.joiningDate,
      status: "issued",
      issuedAt: new Date().toISOString(),
      acceptedAt: null,
      joinedAt: null,
    };
    this.offers.set(offer.id, offer);
    this.recordActivity({
      eventType: "employer.offer_created",
      actorUserId: user.id,
      actorRole: user.role,
      sourcePortal: "employer",
      entityType: "offer",
      entityId: offer.id,
      studentId: params.studentUserId,
      employerId: org.id,
      safeMetadata: { jobId: job.id, roleTitle: offer.roleTitle, agreedCtcInr: offer.agreedCtcInr },
      writeAudit: { action: "offer.issued", newValues: { agreedCtcInr: offer.agreedCtcInr, jobId: job.id } },
    });
    this.recordFunnelEvent({ stage: "offer_issued", userId: params.studentUserId });
    return offer;
  }

  /**
   * SINGLE AUTHORITATIVE QUALIFYING SELECTION EVENT:
   * Student formally accepts a written offer.
   * Atomically:
   * 1. Prevents duplicate offer acceptance.
   * 2. Creates at most ONE idempotent Student Tuition Obligation (first qualifying accepted offer policy):
   *    - Plan A: 33% of agreed CTC (GST inclusive), admission fee NEVER deducted.
   *    - Plan B: 35% of agreed CTC (GST inclusive), admission fee NEVER deducted.
   * 3. Generates Employer billing record:
   *    - Monthly Subscription active on acceptance date -> waived (₹0 extra success fee).
   *    - Success-Fee plan -> 8.33% (or Admin-configured %) of agreed CTC + 18% GST added separately.
   */
  acceptWrittenOfferByStudent(studentUserId: string, offerId: string, acceptedAt = new Date()) {
    this.requireRole(studentUserId, ["student"]);
    const offer = this.offers.get(offerId);
    if (!offer || offer.studentUserId !== studentUserId) {
      throw new PlatformError(404, "OFFER_NOT_FOUND", "Written offer not found for this student.");
    }
    if (offer.status !== "issued") {
      throw new PlatformError(
        409,
        "OFFER_ALREADY_PROCESSED",
        `This offer is already in '${offer.status}' status and cannot be accepted again.`
      );
    }

    const enrollment = Array.from(this.enrollments.values()).find(
      (e) => e.studentUserId === studentUserId && e.status !== "pending_payment"
    );
    if (!enrollment) {
      throw new PlatformError(400, "ENROLLMENT_NOT_FOUND", "Active student enrollment required.");
    }
    const org = this.requireEmployerOrg(offer.employerId);
    const acceptedIso = acceptedAt.toISOString();

    offer.status = "accepted";
    offer.acceptedAt = acceptedIso;

    // 1. Idempotent Student Tuition Obligation (default policy: first qualifying accepted offer per student)
    let tuitionObligation = this.tuitionObligations.get(studentUserId) ?? null;
    let tuitionCreatedNow = false;
    if (!tuitionObligation) {
      const calc = calculateStudentTuitionObligation({
        planCode: enrollment.planCode,
        agreedCtcInr: offer.agreedCtcInr,
        customTuitionPercent: enrollment.lockedTuitionCtcPercent,
      });
      tuitionObligation = {
        id: crypto.randomUUID(),
        studentUserId,
        offerId: offer.id,
        employerId: org.id,
        jobId: offer.jobId,
        planCode: enrollment.planCode,
        agreedCtcInr: calc.agreedCtcInr,
        tuitionPercent: calc.tuitionPercent,
        admissionDeductionInr: 0,
        breakdown: calc.breakdown,
        agreementVersion: enrollment.acceptedAgreementVersion,
        status: "issued",
        createdAt: acceptedIso,
      };
      this.tuitionObligations.set(studentUserId, tuitionObligation);
      tuitionCreatedNow = true;
    }

    // 2. Employer Selection Billing (checks active monthly subscription overlap!)
    const subscriptionActive = this.isEmployerSubscriptionActiveOn(org, acceptedAt);
    const empCharge = calculateEmployerSelectionCharge({
      billingModel: org.billingModel,
      agreedCtcInr: offer.agreedCtcInr,
      successFeePercent: org.customSuccessFeePercent,
      subscriptionActiveOnDate: subscriptionActive,
    });
    const empInvoice: EmployerInvoiceRecord = {
      id: crypto.randomUUID(),
      invoiceNumber: `UDY-EMP-SEL-${acceptedIso.slice(0, 10).replace(/-/g, "")}-${offer.id.slice(0, 6).toUpperCase()}`,
      employerId: org.id,
      type: "success_fee",
      referenceId: offer.id,
      description: empCharge.chargeable
        ? `Qualifying Selection Fee (${empCharge.appliedPercent}% of ₹${offer.agreedCtcInr.toLocaleString("en-IN")} CTC + 18% GST)`
        : empCharge.waivedReason!,
      appliedPercent: empCharge.appliedPercent,
      waivedReason: empCharge.waivedReason,
      breakdown: empCharge.breakdown,
      agreementVersion: org.commercialAgreementVersion,
      status: empCharge.chargeable ? "issued" : "waived_by_subscription",
      createdAt: acceptedIso,
    };
    this.employerInvoices.set(empInvoice.id, empInvoice);

    this.recordActivity({
      eventType: "employer.offer_updated",
      actorUserId: studentUserId,
      actorRole: "student",
      sourcePortal: "student",
      entityType: "offer",
      entityId: offer.id,
      studentId: studentUserId,
      employerId: org.id,
      safeMetadata: {
        fromStatus: "issued",
        toStatus: "accepted",
        tuitionCreatedNow,
        employerFeeChargeable: empCharge.chargeable,
      },
      writeAudit: {
        action: "selection.offer_accepted",
        newValues: {
          offerId: offer.id,
          agreedCtcInr: offer.agreedCtcInr,
          tuitionTotalInclusiveInr: tuitionObligation.breakdown.totalPayableInr,
          employerInvoiceTotalInr: empInvoice.breakdown.totalPayableInr,
          employerWaivedBySubscription: !empCharge.chargeable,
        },
      },
      enqueueOutbox: true,
    });
    this.recordFunnelEvent({ stage: "qualifying_selection_confirmed", userId: studentUserId });

    return {
      offer,
      tuitionObligation,
      tuitionCreatedNow,
      employerInvoice: empInvoice,
    };
  }

  confirmCandidateJoining(employerUserId: string, offerId: string) {
    const user = this.requireRole(employerUserId, ["employer_admin", "employer_recruiter"]);
    const org = this.requireEmployerOrg(user.employerId!);
    const offer = this.offers.get(offerId);
    if (!offer || offer.employerId !== org.id) {
      throw new PlatformError(404, "OFFER_NOT_FOUND", "Offer not found for your company.");
    }
    if (offer.status !== "accepted") {
      throw new PlatformError(400, "OFFER_NOT_ACCEPTED", "Candidate must formally accept the written offer before confirming joining.");
    }
    offer.status = "joined";
    offer.joinedAt = new Date().toISOString();
    this.recordActivity({
      eventType: "employer.placement_confirmed",
      actorUserId: user.id,
      actorRole: user.role,
      sourcePortal: "employer",
      entityType: "offer",
      entityId: offer.id,
      studentId: offer.studentUserId,
      employerId: org.id,
      safeMetadata: { joiningDate: offer.joiningDate, agreedCtcInr: offer.agreedCtcInr },
      writeAudit: { action: "placement.confirmed", newValues: { offerId: offer.id, joinedAt: offer.joinedAt } },
    });
    return offer;
  }

  // ==================== SHARED ADMIN API METHODS (CONSUMED BY admin.udayantu.com) ====================

  adminApproveEmployer(
    adminUserId: string,
    employerId: string,
    decision: "approve" | "reject" | "suspend",
    reason: string
  ) {
    const admin = this.requireRole(adminUserId, ["admin", "super_admin"]);
    const org = this.requireEmployerOrg(employerId);
    const prev = org.approvalStatus;
    org.approvalStatus =
      decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "suspended";

    this.recordActivity({
      eventType:
        decision === "approve"
          ? "admin.employer_approved"
          : decision === "suspend"
          ? "admin.employer_suspended"
          : "employer.company_rejected",
      actorUserId: admin.id,
      actorRole: admin.role,
      sourcePortal: "admin",
      entityType: "employer",
      entityId: org.id,
      employerId: org.id,
      safeMetadata: { decision, reason },
      writeAudit: {
        action: `admin.employer_${decision}`,
        previousValues: { approvalStatus: prev },
        newValues: { approvalStatus: org.approvalStatus, reason },
      },
    });
    return org;
  }

  adminUpdateStudentPlanPricing(
    adminUserId: string,
    planCode: AdmissionPlanCode,
    updates: { priceInr?: number; tuitionCtcPercent?: number; agreementVersion?: string }
  ) {
    const admin = this.requireRole(adminUserId, ["admin", "super_admin"]);
    const plan = this.studentPlans[planCode];
    if (!plan) throw new PlatformError(404, "PLAN_NOT_FOUND", "Plan not found.");
    const prev = { priceInr: plan.priceInr, tuitionCtcPercent: plan.tuitionCtcPercent };
    if (typeof updates.priceInr === "number" && updates.priceInr > 0) {
      plan.priceInr = updates.priceInr;
    }
    if (typeof updates.tuitionCtcPercent === "number" && updates.tuitionCtcPercent > 0) {
      plan.tuitionCtcPercent = updates.tuitionCtcPercent;
    }
    if (updates.agreementVersion) {
      plan.agreementVersion = updates.agreementVersion;
    }
    // IMPORTANT: Existing enrollments retain their lockedAdmissionFeeInr & lockedTuitionCtcPercent!
    this.recordActivity({
      eventType: "admin.configuration_changed",
      actorUserId: admin.id,
      actorRole: admin.role,
      sourcePortal: "admin",
      entityType: "admission_plan",
      entityId: planCode,
      safeMetadata: { planCode, priceInr: plan.priceInr, tuitionCtcPercent: plan.tuitionCtcPercent },
      writeAudit: {
        action: "admin.student_plan_updated",
        previousValues: prev,
        newValues: { priceInr: plan.priceInr, tuitionCtcPercent: plan.tuitionCtcPercent },
      },
    });
    return plan;
  }

  adminSetCohortStatus(adminUserId: string, cohortId: string, status: "active" | "disabled" | "completed") {
    const admin = this.requireRole(adminUserId, ["admin", "super_admin"]);
    const cohort = this.cohorts.get(cohortId);
    if (!cohort) throw new PlatformError(404, "COHORT_NOT_FOUND", "Cohort not found.");
    const prev = cohort.status;
    cohort.status = status;
    // Existing student enrollments are NEVER deleted!
    this.recordActivity({
      eventType: "admin.configuration_changed",
      actorUserId: admin.id,
      actorRole: admin.role,
      sourcePortal: "admin",
      entityType: "cohort",
      entityId: cohort.id,
      courseId: cohort.courseId,
      cohortId: cohort.id,
      safeMetadata: { fromStatus: prev, toStatus: status, enrollmentsPreserved: true },
      writeAudit: {
        action: "admin.cohort_status_changed",
        previousValues: { status: prev },
        newValues: { status },
      },
    });
    return cohort;
  }

  adminConfigureEmployerCommercials(
    adminUserId: string,
    employerId: string,
    updates: { customSuccessFeePercent?: number; customMonthlyFeeInr?: number }
  ) {
    const admin = this.requireRole(adminUserId, ["admin", "super_admin"]);
    const org = this.requireEmployerOrg(employerId);
    const prev = {
      customSuccessFeePercent: org.customSuccessFeePercent,
      customMonthlyFeeInr: org.customMonthlyFeeInr,
    };
    if (typeof updates.customSuccessFeePercent === "number" && updates.customSuccessFeePercent >= 0) {
      org.customSuccessFeePercent = updates.customSuccessFeePercent;
    }
    if (typeof updates.customMonthlyFeeInr === "number" && updates.customMonthlyFeeInr >= 0) {
      org.customMonthlyFeeInr = updates.customMonthlyFeeInr;
    }
    this.recordActivity({
      eventType: "admin.configuration_changed",
      actorUserId: admin.id,
      actorRole: admin.role,
      sourcePortal: "admin",
      entityType: "employer",
      entityId: org.id,
      employerId: org.id,
      safeMetadata: {
        customSuccessFeePercent: org.customSuccessFeePercent,
        customMonthlyFeeInr: org.customMonthlyFeeInr,
      },
      writeAudit: {
        action: "admin.employer_commercials_updated",
        previousValues: prev,
        newValues: {
          customSuccessFeePercent: org.customSuccessFeePercent,
          customMonthlyFeeInr: org.customMonthlyFeeInr,
        },
      },
    });
    return org;
  }

  getAdminDashboardSummary(adminUserId: string) {
    this.requireRole(adminUserId, ["admin", "super_admin", "mentor", "cs_agent"]);
    const students = Array.from(this.users.values()).filter((u) => u.role === "student");
    const activeEnrollments = Array.from(this.enrollments.values()).filter((e) => e.status !== "pending_payment");
    const qualifiedStudents = Array.from(this.eligibilities.values()).filter((e) => e.isVerified);
    const consentedStudents = Array.from(this.consents.values()).filter(
      (c) => c.employerVisibilityGranted && !c.revokedAt
    );
    const capturedPayments = Array.from(this.paymentRecords.values()).filter((p) => p.status === "captured");
    const totalAdmissionRevenueInr = capturedPayments.reduce(
      (sum, p) => sum + p.breakdown.totalPayableInr,
      0
    );
    return {
      totals: {
        students: students.length,
        activeEnrollments: activeEnrollments.length,
        qualifiedStudents: qualifiedStudents.length,
        consentedEligibleStudents: consentedStudents.length,
        employers: this.employers.size,
        approvedEmployers: Array.from(this.employers.values()).filter((e) => e.approvalStatus === "approved").length,
        publishedJobs: Array.from(this.jobs.values()).filter((j) => j.status === "published").length,
        acceptedOffers: Array.from(this.offers.values()).filter((o) => o.status === "accepted" || o.status === "joined").length,
        totalAdmissionRevenueInr,
        activityEventCount: this.activityEvents.length,
        auditLogCount: this.auditLogs.length,
        pendingOutboxCount: this.outboxEvents.filter((o) => o.deliveryStatus === "pending").length,
      },
      funnelCounts: this.funnelEvents.reduce<Record<string, number>>((acc, e) => {
        acc[e.stage] = (acc[e.stage] ?? 0) + 1;
        return acc;
      }, {}),
    };
  }

  getAdminActivityFeed(
    adminUserId: string,
    filters?: {
      eventType?: string;
      studentId?: string;
      employerId?: string;
      careerTrackId?: string;
      sourcePortal?: SourcePortal;
      cursor?: number;
      limit?: number;
    }
  ) {
    this.requireRole(adminUserId, ["admin", "super_admin", "mentor", "cs_agent"]);
    let items = [...this.activityEvents].sort((a, b) => b.seqId - a.seqId);
    if (filters?.eventType) items = items.filter((e) => e.eventType === filters.eventType);
    if (filters?.studentId) items = items.filter((e) => e.studentId === filters.studentId);
    if (filters?.employerId) items = items.filter((e) => e.employerId === filters.employerId);
    if (filters?.careerTrackId) items = items.filter((e) => e.careerTrackId === filters.careerTrackId);
    if (filters?.sourcePortal) items = items.filter((e) => e.sourcePortal === filters.sourcePortal);
    if (typeof filters?.cursor === "number") items = items.filter((e) => e.seqId < filters.cursor!);
    const limit = Math.min(100, Math.max(1, filters?.limit ?? 25));
    const slice = items.slice(0, limit);
    return {
      data: slice,
      page: {
        limit,
        hasMore: items.length > limit,
        nextCursor: slice.length > 0 ? String(slice[slice.length - 1].seqId) : null,
      },
    };
  }

  getAdminAuditLogs(adminUserId: string) {
    this.requireRole(adminUserId, ["admin", "super_admin"]);
    return [...this.auditLogs].reverse();
  }

  // ==================== HELPERS ====================

  async resolveAuthUserFromHeader(authHeader?: string): Promise<PlatformUser | null> {
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.slice(7).trim();
    const verified = await this.identity.verifyBearerToken(token);
    if (!verified) return null;
    return this.users.get(verified.providerUid) ?? null;
  }

  getUserById(userId: string) {
    const user = this.users.get(userId);
    return user ? this.serializeSafeUser(user) : null;
  }

  private isEmployerSubscriptionActiveOn(org: EmployerOrganizationRecord, date: Date): boolean {
    if (org.billingModel !== "monthly_subscription") return false;
    if (!org.subscriptionActiveFrom || !org.subscriptionActiveUntil) return false;
    const t = date.getTime();
    return (
      t >= new Date(org.subscriptionActiveFrom).getTime() &&
      t <= new Date(org.subscriptionActiveUntil).getTime()
    );
  }

  private requireUser(userId: string): PlatformUser {
    const user = this.users.get(userId);
    if (!user) throw new PlatformError(401, "UNAUTHORIZED", "Authentication required.");
    return user;
  }

  private requireRole(userId: string, allowedRoles: UserRole[]): PlatformUser {
    const user = this.requireUser(userId);
    if (!allowedRoles.includes(user.role)) {
      throw new PlatformError(403, "FORBIDDEN_ROLE", "You do not have permission to perform this action.");
    }
    return user;
  }

  private requireEmployerOrg(employerId: string): EmployerOrganizationRecord {
    const org = this.employers.get(employerId);
    if (!org) throw new PlatformError(404, "EMPLOYER_NOT_FOUND", "Employer organization not found.");
    return org;
  }

  private requireActiveEnrollment(studentUserId: string): StudentEnrollmentRecord {
    this.requireRole(studentUserId, ["student"]);
    const enrollment = Array.from(this.enrollments.values()).find(
      (e) => e.studentUserId === studentUserId && e.status !== "pending_payment"
    );
    if (!enrollment) {
      throw new PlatformError(
        403,
        "ENROLLMENT_REQUIRED",
        "Complete your admission plan enrollment to access training content and assessments."
      );
    }
    return enrollment;
  }

  private serializeSafeUser(user: PlatformUser) {
    return {
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      emailVerified: user.emailVerified,
      phone10: user.phone10,
      phoneVerified: user.phoneVerified,
      employerId: user.employerId ?? null,
      mfaEnrolled: user.mfaEnrolled,
      status: user.status,
      createdAt: user.createdAt,
    };
  }
}
