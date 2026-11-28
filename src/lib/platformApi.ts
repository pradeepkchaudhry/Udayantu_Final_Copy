/**
 * Typed client for the unified UdaYantu Platform API (/v1/*).
 *
 * Shared by Student and Employer experiences inside https://udayantu.com.
 * - Never hardcodes pricing, commercial terms, or payment secrets.
 * - Stores Bearer token in sessionStorage (with cross-tab sync event) — zero mock user localStorage bypasses.
 */

export type AdmissionPlanCode = "plan_a_refundable" | "plan_b_non_refundable";
export type EmployerBillingModel = "success_fee" | "monthly_subscription";
export type CanonicalCareerTrackId =
  | "business-development"
  | "customer-success"
  | "project-management"
  | "operations-management"
  | "product-management"
  | "human-resources"
  | "marketing-management"
  | "customer-support";

export interface GstBreakdown {
  gstRatePercent: number;
  isGstInclusive: boolean;
  taxableBaseInr: number;
  gstAmountInr: number;
  totalPayableInr: number;
}

export interface StudentAdmissionPlanDto {
  code: AdmissionPlanCode;
  name: string;
  tagline: string;
  priceInr: number;
  gstRatePercent: number;
  isGstInclusive: true;
  cohortDurationDays: number;
  refundable: boolean;
  refundWindowCalendarDays: number | null;
  passingThresholdPercent: number;
  tuitionCtcPercent: number;
  tuitionGstInclusive: true;
  admissionAdjustedAgainstTuition: false;
  agreementVersion: string;
  agreementSummary: string;
  highlights: string[];
  refundPolicyNotice: string;
  gstBreakdown: GstBreakdown;
}

export interface EmployerCommercialPlanDto {
  model: EmployerBillingModel;
  name: string;
  tagline: string;
  successFeeCtcPercent: number | null;
  monthlyFeeInr: number | null;
  gstRatePercent: number;
  gstAddedSeparately: true;
  unlimitedHiresWhileActive: boolean;
  agreementVersion: string;
  termsSummary: string;
  monthlyInvoicePreview: GstBreakdown | null;
}

export interface PublicCourseDto {
  id: string;
  careerTrackId: CanonicalCareerTrackId;
  slug: string;
  titleEn: string;
  titleHi: string;
  durationDays: number;
  passingThresholdPercent: number;
  status: string;
  moduleCount: number;
  assignmentCount: number;
  activeCohort: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    mentorName: string;
    status: string;
  } | null;
}

export interface PublicPsychometricQuestionDto {
  id: string;
  order: number;
  category: string;
  primaryDimension: string;
  promptEn: string;
  promptHi: string;
  estimatedSeconds: number;
  options: Array<{ id: string; labelEn: string; labelHi: string }>;
}

export interface PreviewPsychometricReportDto {
  engineVersion: string;
  previewSharePercent: 20;
  completedAt: string;
  questionsAnswered: number;
  totalQuestions: number;
  primaryTrack: {
    trackId: CanonicalCareerTrackId;
    name: string;
    hindiName: string;
    alignmentPercent: number;
    summary: string;
    whyItFits: string;
  };
  keyBehaviouralInsights: string[];
  briefStrengthsSummary: string[];
  developmentOpportunity: string;
  fullReportIncludes: string[];
  nonClinicalDisclaimer: string;
}

export interface FullPsychometricReportDto {
  engineVersion: string;
  completedAt: string;
  questionsAnswered: number;
  totalQuestions: number;
  topTracks: Array<{
    rank: 1 | 2 | 3;
    trackId: CanonicalCareerTrackId;
    name: string;
    hindiName: string;
    alignmentPercent: number;
    summary: string;
    whyItFits: string;
    relevantSkills: string[];
    suitableJobFamilies: string[];
    recommendedLearningPath: string[];
    jobAvailabilityContext: string;
  }>;
  strengths: string[];
  developmentOpportunities: string[];
  workStylePreferences: string[];
  dimensionProfiles: Array<{
    dimension: string;
    label: string;
    tendencyLabel: string;
    scoreOutOf100: number;
    description: string;
  }>;
  aptitudeScorePercent: number;
  englishScorePercent: number;
  nonClinicalDisclaimer: string;
}

export interface PlatformUserDto {
  id: string;
  role: "student" | "employer_admin" | "employer_recruiter" | "admin" | "super_admin" | "mentor" | "cs_agent";
  fullName: string;
  email: string;
  emailVerified: boolean;
  phone10?: string;
  phoneVerified: boolean;
  employerId?: string | null;
  mfaEnrolled: boolean;
  status: "active" | "suspended";
  createdAt: string;
}

export interface RefundLifecycleDto {
  planCode: AdmissionPlanCode;
  refundablePlan: boolean;
  assessmentPassDate: string | null;
  refundDeadlineDate: string | null;
  daysRemainingInWindow: number | null;
  qualifyingSelectionOccurred: boolean;
  qualifyingSelectionDate: string | null;
  status:
    | "not_applicable_plan_b"
    | "awaiting_final_assessment_pass"
    | "window_active"
    | "eligible_for_refund"
    | "non_refundable_due_to_selection"
    | "refund_requested"
    | "refund_approved"
    | "refund_completed";
  canRequestRefund: boolean;
  explanation: string;
}

export interface StudentDashboardDto {
  student: PlatformUserDto;
  fullCareerReport: FullPsychometricReportDto | null;
  enrollment: {
    id: string;
    courseId: string;
    cohortId: string;
    careerTrackId: CanonicalCareerTrackId;
    planCode: AdmissionPlanCode;
    planName: string;
    lockedAdmissionFeeInr: number;
    lockedGstBreakdown: GstBreakdown;
    lockedTuitionCtcPercent: number;
    acceptedAgreementVersion: string;
    acceptedAgreementAt: string;
    status: "pending_payment" | "active" | "completed";
    completedModuleIds: string[];
    submittedAssignmentIds: string[];
    attendedClassIds: string[];
    learningProgressPercent: number;
    mandatoryCourseworkComplete: boolean;
    accessNotice: string | null;
  } | null;
  course: {
    id: string;
    careerTrackId: CanonicalCareerTrackId;
    titleEn: string;
    titleHi: string;
    durationDays: number;
    passingThresholdPercent: number;
    status: string;
    modules: Array<{
      id: string;
      title: string;
      youtubeUrl: string;
      pdfObjectKey: string;
      pdfLabel: string;
      durationMinutes: number;
      signedPdfUrl: string;
      completed: boolean;
    }>;
    assignments: Array<{
      id: string;
      title: string;
      brief: string;
      dueWeek: number;
      submitted: boolean;
    }>;
  } | null;
  cohort: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    durationDays: number;
    status: string;
    mentorName: string;
    upcomingLiveClass: {
      id: string;
      title: string;
      platform: "Zoom" | "Google Meet";
      joinUrl: string;
      scheduledAt: string;
    };
  } | null;
  payment: {
    id: string;
    orderId: string;
    paymentId: string | null;
    breakdown: GstBreakdown;
    status: string;
    invoiceNumber: string | null;
    verifiedAt: string | null;
  } | null;
  finalAssessment: {
    eligibleToAttempt: boolean;
    mandatoryCourseworkComplete: boolean;
    passingThresholdPercent: number;
    attempts: Array<{
      attemptNumber: number;
      scorePercent: number;
      passed: boolean;
      meetsScoreThreshold: boolean;
      sectionScores: Array<{
        sectionId: string;
        sectionTitle: string;
        correctCount: number;
        totalCount: number;
        scorePercent: number;
      }>;
      evaluatedAt: string;
      reason: string;
    }>;
    qualified: boolean;
    passedAt: string | null;
  };
  eligibility: {
    finalScorePercent: number;
    passedAt: string;
    isVerified: boolean;
  } | null;
  consent: {
    studentUserId: string;
    employerVisibilityGranted: boolean;
    policyVersion: string;
    grantedAt: string | null;
    revokedAt: string | null;
    updatedAt: string;
  };
  refundLifecycle: RefundLifecycleDto | null;
  refundRequest: {
    id: string;
    amountInr: number;
    reason: string;
    status: string;
    requestedAt: string;
  } | null;
  offers: Array<{
    id: string;
    employerId: string;
    employerName: string;
    jobId: string;
    roleTitle: string;
    agreedCtcInr: number;
    joiningDate: string;
    status: "issued" | "accepted" | "declined" | "joined";
    issuedAt: string;
    acceptedAt: string | null;
    joinedAt: string | null;
  }>;
  tuitionObligation: {
    id: string;
    offerId: string;
    planCode: AdmissionPlanCode;
    agreedCtcInr: number;
    tuitionPercent: number;
    admissionDeductionInr: 0;
    breakdown: GstBreakdown;
    agreementVersion: string;
    status: string;
    createdAt: string;
  } | null;
}

export interface EmployerWorkspaceDto {
  user: PlatformUserDto;
  employer: {
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
  };
  billing: {
    billingModel: EmployerBillingModel;
    commercialAgreementVersion: string;
    successFeePercent: number;
    monthlyFeeInr: number;
    gstRatePercent: number;
    gstAddedSeparately: true;
    subscriptionActive: boolean;
    subscriptionActiveFrom: string | null;
    subscriptionActiveUntil: string | null;
    monthlyInvoicePreview: GstBreakdown;
    invoices: Array<{
      id: string;
      invoiceNumber: string;
      type: "success_fee" | "monthly_subscription";
      description: string;
      appliedPercent: number | null;
      waivedReason: string | null;
      breakdown: GstBreakdown;
      agreementVersion: string;
      status: "issued" | "paid" | "waived_by_subscription";
      createdAt: string;
    }>;
    availablePlans: EmployerCommercialPlanDto[];
  };
  jobs: Array<{
    id: string;
    title: string;
    careerTrackId: CanonicalCareerTrackId;
    location: string;
    minCtcInr: number;
    maxCtcInr: number;
    openings: number;
    status: "draft" | "published" | "closed";
    createdAt: string;
  }>;
  shortlists: Array<{
    id: string;
    jobId: string;
    studentUserId: string;
    stage: string;
    createdAt: string;
  }>;
  interviews: Array<{
    id: string;
    jobId: string;
    studentUserId: string;
    scheduledAt: string;
    mode: string;
    meetingLink: string;
    status: string;
  }>;
  offers: Array<{
    id: string;
    jobId: string;
    studentUserId: string;
    studentName: string;
    roleTitle: string;
    agreedCtcInr: number;
    joiningDate: string;
    status: "issued" | "accepted" | "declined" | "joined";
    issuedAt: string;
    acceptedAt: string | null;
    joinedAt: string | null;
  }>;
}

export interface EligibleCandidateDto {
  studentUserId: string;
  displayName: string;
  careerTrackId: CanonicalCareerTrackId;
  careerTrackName: string;
  finalScorePercent: number;
  passedAt: string;
  consentVerified: true;
}

export class PlatformApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

const TOKEN_STORAGE_KEY = "udayantu_auth_token_v1";
const ANON_ASSESSMENT_KEY = "udayantu_anon_assessment_token";

export function getAuthToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    window.dispatchEvent(new Event("udayantu-auth-change"));
  } catch {
    // ignore storage restrictions
  }
}

export function getAnonymousAssessmentToken(): string | null {
  try {
    return localStorage.getItem(ANON_ASSESSMENT_KEY);
  } catch {
    return null;
  }
}

export function setAnonymousAssessmentToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(ANON_ASSESSMENT_KEY, token);
    } else {
      localStorage.removeItem(ANON_ASSESSMENT_KEY);
    }
  } catch {
    // ignore
  }
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "/v1";

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  const text = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new PlatformApiError(
      res.status,
      typeof json?.code === "string" ? json.code : "REQUEST_FAILED",
      typeof json?.message === "string"
        ? json.message
        : typeof json?.error === "string"
        ? json.error
        : `Request failed (${res.status})`
    );
  }

  return json as T;
}

export const platformApi = {
  // Public
  getCommercialPlans: () =>
    apiRequest<{
      mode: "live" | "sandbox";
      studentPlans: StudentAdmissionPlanDto[];
      employerPlans: EmployerCommercialPlanDto[];
    }>("/public/commercial-plans"),

  getCourses: () => apiRequest<{ courses: PublicCourseDto[] }>("/public/courses"),

  // Anonymous Psychometric Assessment
  startAnonymousAssessment: (payload?: { utmSource?: string; utmCampaign?: string }) =>
    apiRequest<{
      sessionToken: string;
      engineVersion: string;
      estimatedMinutes: number;
      questions: PublicPsychometricQuestionDto[];
    }>("/public/assessments/anonymous/start", {
      method: "POST",
      body: JSON.stringify(payload ?? {}),
    }),

  getAnonymousAssessment: (token: string) =>
    apiRequest<{
      sessionToken: string;
      status: "in_progress" | "submitted" | "claimed";
      answers: Record<string, string>;
      preview: PreviewPsychometricReportDto | null;
      questions: PublicPsychometricQuestionDto[];
    }>(`/public/assessments/anonymous/${encodeURIComponent(token)}`),

  saveAnonymousAssessmentProgress: (token: string, answers: Record<string, string>) =>
    apiRequest<{ sessionToken: string; answeredCount: number; status: string }>(
      `/public/assessments/anonymous/${encodeURIComponent(token)}`,
      { method: "PATCH", body: JSON.stringify({ answers }) }
    ),

  submitAnonymousAssessment: (token: string, answers: Record<string, string>) =>
    apiRequest<{
      sessionToken: string;
      duplicatePrevented: boolean;
      preview: PreviewPsychometricReportDto;
    }>(`/public/assessments/anonymous/${encodeURIComponent(token)}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),

  // Auth
  getMe: () => apiRequest<{ user: PlatformUserDto }>("/auth/me"),

  requestOtp: (phone: string) =>
    apiRequest<{
      sent: boolean;
      maskedPhone: string;
      expiresInSeconds: number;
      sandboxOtpHint?: string;
    }>("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),

  registerStudent: (payload: {
    fullName: string;
    email: string;
    phone: string;
    otpCode: string;
    password: string;
    anonymousAssessmentToken?: string | null;
  }) =>
    apiRequest<{
      token: string;
      user: PlatformUserDto;
      redirectTo: string;
      claimedReport: FullPsychometricReportDto | null;
      sandboxEmailCodeHint?: string;
    }>("/auth/student/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  registerEmployer: (payload: {
    fullName: string;
    officialEmail: string;
    password: string;
    companyName: string;
    registrationId: string;
    industry: string;
    city: string;
    billingModel: EmployerBillingModel;
  }) =>
    apiRequest<{
      token: string;
      user: PlatformUserDto;
      employer: EmployerWorkspaceDto["employer"];
      redirectTo: string;
      sandboxEmailCodeHint?: string;
    }>("/auth/employer/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: {
    emailOrPhone: string;
    password: string;
    expectedPortal?: "student" | "employer" | "admin";
    anonymousAssessmentToken?: string | null;
    mfaCode?: string;
  }) =>
    apiRequest<{
      token: string;
      user: PlatformUserDto;
      redirectTo: string;
      claimedReport?: FullPsychometricReportDto | null;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyEmail: (code: string) =>
    apiRequest<{ verified: boolean }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  requestPasswordRecovery: (email: string) =>
    apiRequest<{ sent: boolean; sandboxResetCodeHint?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (payload: { email: string; code: string; newPassword: string }) =>
    apiRequest<{ reset: boolean }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Student Portal
  getStudentDashboard: () => apiRequest<StudentDashboardDto>("/student/dashboard"),

  claimAssessment: (sessionToken: string) =>
    apiRequest<{ report: FullPsychometricReportDto | null }>("/student/assessments/claim", {
      method: "POST",
      body: JSON.stringify({ sessionToken }),
    }),

  createAdmissionPaymentOrder: (payload: {
    courseId: string;
    planCode: AdmissionPlanCode;
    acceptedAgreement: boolean;
    acceptedAgreementVersion: string;
  }) =>
    apiRequest<{
      order: {
        orderId: string;
        amountPaise: number;
        currency: "INR";
        keyId: string;
        isSandboxOrder: boolean;
      };
      enrollmentId: string;
      planCode: AdmissionPlanCode;
      agreementVersion: string;
      gstBreakdown: GstBreakdown;
      sandboxCheckoutHelper?: { paymentId: string; signature: string };
    }>("/student/payments/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyAdmissionPayment: (payload: {
    orderId: string;
    paymentId: string;
    signature: string;
  }) =>
    apiRequest<{
      success: boolean;
      idempotent: boolean;
      paymentId: string;
      invoiceNumber: string;
      enrollmentId: string;
      enrollmentStatus: string;
    }>("/student/payments/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  completeModule: (moduleId: string) =>
    apiRequest<{ completedModuleIds: string[] }>(
      `/student/modules/${encodeURIComponent(moduleId)}/complete`,
      { method: "POST" }
    ),

  submitAssignment: (assignmentId: string, submissionNotes: string) =>
    apiRequest<{ submittedAssignmentIds: string[] }>(
      `/student/assignments/${encodeURIComponent(assignmentId)}/submit`,
      { method: "POST", body: JSON.stringify({ submissionNotes }) }
    ),

  attendLiveClass: (classId: string) =>
    apiRequest<{ attendedClassIds: string[] }>(
      `/student/classes/${encodeURIComponent(classId)}/attend`,
      { method: "POST" }
    ),

  getFinalAssessmentQuestions: () =>
    apiRequest<{
      assessmentVersion: string;
      passingThresholdPercent: number;
      questions: Array<{
        id: string;
        sectionId: string;
        sectionTitle: string;
        prompt: string;
        options: Array<{ id: string; label: string }>;
      }>;
    }>("/student/final-assessment/questions"),

  submitFinalAssessment: (answers: Record<string, string>) =>
    apiRequest<{
      id: string;
      attemptNumber: number;
      result: {
        overallScorePercent: number;
        passingThresholdPercent: number;
        meetsScoreThreshold: boolean;
        mandatoryCourseworkComplete: boolean;
        qualified: boolean;
        sectionScores: Array<{
          sectionId: string;
          sectionTitle: string;
          correctCount: number;
          totalCount: number;
          scorePercent: number;
        }>;
        evaluatedAt: string;
        reason: string;
      };
    }>("/student/final-assessment/submit", {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),

  updateRecruitmentConsent: (employerVisibilityGranted: boolean, policyVersion = "DPDP-2026.1") =>
    apiRequest<StudentDashboardDto["consent"]>("/student/consent", {
      method: "PUT",
      body: JSON.stringify({ employerVisibilityGranted, policyVersion }),
    }),

  requestAdmissionRefund: (reason: string) =>
    apiRequest<{ id: string; status: string; amountInr: number }>("/student/refund/request", {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  acceptWrittenOffer: (offerId: string) =>
    apiRequest<{
      offer: StudentDashboardDto["offers"][number];
      tuitionObligation: NonNullable<StudentDashboardDto["tuitionObligation"]>;
      tuitionCreatedNow: boolean;
    }>(`/student/offers/${encodeURIComponent(offerId)}/accept`, { method: "POST" }),

  // Employer Portal
  getEmployerWorkspace: () => apiRequest<EmployerWorkspaceDto>("/employer/workspace"),

  selectEmployerBillingPlan: (billingModel: EmployerBillingModel) =>
    apiRequest<{
      employer: EmployerWorkspaceDto["employer"];
      subscriptionInvoice: EmployerWorkspaceDto["billing"]["invoices"][number] | null;
    }>("/employer/billing/plan", {
      method: "PUT",
      body: JSON.stringify({ billingModel }),
    }),

  createEmployerJob: (payload: {
    title: string;
    careerTrackId: CanonicalCareerTrackId;
    location: string;
    minCtcInr: number;
    maxCtcInr: number;
    openings: number;
    publishNow: boolean;
  }) =>
    apiRequest<EmployerWorkspaceDto["jobs"][number]>("/employer/jobs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  searchCandidates: (filters?: { careerTrackId?: CanonicalCareerTrackId; minScore?: number }) => {
    const params = new URLSearchParams();
    if (filters?.careerTrackId) params.set("careerTrackId", filters.careerTrackId);
    if (typeof filters?.minScore === "number") params.set("minScore", String(filters.minScore));
    const qs = params.toString();
    return apiRequest<{ candidates: EligibleCandidateDto[] }>(
      `/employer/candidates${qs ? `?${qs}` : ""}`
    );
  },

  shortlistCandidate: (jobId: string, studentUserId: string) =>
    apiRequest<EmployerWorkspaceDto["shortlists"][number]>("/employer/shortlists", {
      method: "POST",
      body: JSON.stringify({ jobId, studentUserId }),
    }),

  scheduleInterview: (payload: {
    jobId: string;
    studentUserId: string;
    scheduledAt: string;
    mode: "Zoom" | "Google Meet" | "In-Person";
    meetingLink: string;
  }) =>
    apiRequest<EmployerWorkspaceDto["interviews"][number]>("/employer/interviews", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  issueWrittenOffer: (payload: {
    jobId: string;
    studentUserId: string;
    roleTitle: string;
    agreedCtcInr: number;
    joiningDate: string;
  }) =>
    apiRequest<EmployerWorkspaceDto["offers"][number]>("/employer/offers", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  confirmJoining: (offerId: string) =>
    apiRequest<EmployerWorkspaceDto["offers"][number]>(
      `/employer/offers/${encodeURIComponent(offerId)}/confirm-joining`,
      { method: "POST" }
    ),
};
