/**
 * Authoritative UdaYantu Commercial, Tax, Refund & Tuition Engine.
 *
 * Single server-side source of truth shared across Student, Employer, and Admin APIs.
 * Never replicate these financial calculations on the frontend or introduce mock
 * financial math in Live Mode.
 */

export type AdmissionPlanCode = "plan_a_refundable" | "plan_b_non_refundable";
export type EmployerBillingModel = "success_fee" | "monthly_subscription";
export type RuntimeMode = "live" | "sandbox";

export interface GstBreakdown {
  gstRatePercent: number;
  isGstInclusive: boolean;
  taxableBaseInr: number;
  gstAmountInr: number;
  totalPayableInr: number;
}

export interface StudentAdmissionPlanConfig {
  code: AdmissionPlanCode;
  name: string;
  tagline: string;
  priceInr: number; // GST inclusive
  gstRatePercent: number;
  isGstInclusive: true;
  cohortDurationDays: number;
  refundable: boolean;
  refundWindowCalendarDays: number | null; // 120 calendar days from >=75% final pass for Plan A; null for Plan B
  passingThresholdPercent: number;
  tuitionCtcPercent: number; // 33% for Plan A, 35% for Plan B (GST inclusive)
  tuitionGstInclusive: true;
  admissionAdjustedAgainstTuition: false;
  agreementVersion: string;
  agreementSummary: string;
  highlights: string[];
  refundPolicyNotice: string;
}

export interface EmployerCommercialPlanConfig {
  model: EmployerBillingModel;
  name: string;
  tagline: string;
  successFeeCtcPercent: number | null; // 8.33% default, Admin configurable
  monthlyFeeInr: number | null; // ₹4,999 default, Admin configurable
  gstRatePercent: number;
  gstAddedSeparately: true;
  unlimitedHiresWhileActive: boolean;
  agreementVersion: string;
  termsSummary: string;
}

export const DEFAULT_GST_RATE_PERCENT = 18;
export const DEFAULT_COHORT_DURATION_DAYS = 90;
export const DEFAULT_PASSING_THRESHOLD_PERCENT = 75;
export const DEFAULT_PLAN_A_REFUND_WINDOW_DAYS = 120;

export function getDefaultStudentPlans(): Record<AdmissionPlanCode, StudentAdmissionPlanConfig> {
  return {
    plan_a_refundable: {
      code: "plan_a_refundable",
      name: "Plan A — Refundable Admission",
      tagline: "90-day training cohort with 120-day post-qualification admission refund protection",
      priceInr: 9999,
      gstRatePercent: DEFAULT_GST_RATE_PERCENT,
      isGstInclusive: true,
      cohortDurationDays: DEFAULT_COHORT_DURATION_DAYS,
      refundable: true,
      refundWindowCalendarDays: DEFAULT_PLAN_A_REFUND_WINDOW_DAYS,
      passingThresholdPercent: DEFAULT_PASSING_THRESHOLD_PERCENT,
      tuitionCtcPercent: 33,
      tuitionGstInclusive: true,
      admissionAdjustedAgainstTuition: false,
      agreementVersion: "STU-PLAN-A-2026.1",
      agreementSummary:
        "Admission fee of ₹9,999 (GST inclusive) covers 90-day cohort enrollment, psychometric-aligned training, assessments, and configured mentorship. Refundable if you pass the final assessment with at least 75% and receive no qualifying job selection within 120 calendar days of your verified pass date. On a qualifying selection (written offer accepted), the admission fee becomes non-refundable, is never adjusted against tuition fees, and tuition fee of 33% of agreed CTC (GST inclusive) applies.",
      highlights: [
        "90-day psychometric-aligned training cohort & structured resources",
        "Assessments, assignments, mentorship & configured live Zoom/Meet sessions",
        "Eligible for admission refund if unselected within 120 calendar days after passing final assessment (≥75%)",
        "Tuition upon qualifying accepted written offer: 33% of agreed CTC (GST inclusive)",
        "Admission fee is never adjusted against tuition fees",
      ],
      refundPolicyNotice:
        "Refund clock starts strictly from your verified final-assessment pass date (≥75%). If a qualifying written offer is accepted before day 120, the admission fee becomes non-refundable.",
    },
    plan_b_non_refundable: {
      code: "plan_b_non_refundable",
      name: "Plan B — Non-Refundable Admission",
      tagline: "Lower upfront admission fee for the same 90-day training cohort and mentorship",
      priceInr: 5999,
      gstRatePercent: DEFAULT_GST_RATE_PERCENT,
      isGstInclusive: true,
      cohortDurationDays: DEFAULT_COHORT_DURATION_DAYS,
      refundable: false,
      refundWindowCalendarDays: null,
      passingThresholdPercent: DEFAULT_PASSING_THRESHOLD_PERCENT,
      tuitionCtcPercent: 35,
      tuitionGstInclusive: true,
      admissionAdjustedAgainstTuition: false,
      agreementVersion: "STU-PLAN-B-2026.1",
      agreementSummary:
        "Admission fee of ₹5,999 (GST inclusive) covers 90-day cohort enrollment, psychometric-aligned training, assessments, and configured mentorship. This admission fee is strictly non-refundable regardless of selection outcome and is never adjusted against tuition fees. Upon a qualifying selection (written offer accepted), a tuition fee of 35% of agreed CTC (GST inclusive) applies.",
      highlights: [
        "90-day psychometric-aligned training cohort & structured resources",
        "Assessments, assignments, mentorship & configured live Zoom/Meet sessions",
        "Lower upfront admission fee (non-refundable regardless of selection outcome)",
        "Tuition upon qualifying accepted written offer: 35% of agreed CTC (GST inclusive)",
        "Admission fee is never adjusted against tuition fees",
      ],
      refundPolicyNotice:
        "Plan B admission fee is strictly non-refundable regardless of job selection status.",
    },
  };
}

export function getDefaultEmployerPlans(): Record<EmployerBillingModel, EmployerCommercialPlanConfig> {
  return {
    success_fee: {
      model: "success_fee",
      name: "Success-Fee Hiring Plan",
      tagline: "Pay per qualifying hire with Admin-configurable commercial terms",
      successFeeCtcPercent: 8.33,
      monthlyFeeInr: null,
      gstRatePercent: DEFAULT_GST_RATE_PERCENT,
      gstAddedSeparately: true,
      unlimitedHiresWhileActive: false,
      agreementVersion: "EMP-SUCCESS-2026.1",
      termsSummary:
        "One-time fee of 8.33% of agreed annual CTC (negotiable and Admin configurable) billed per qualifying selection (written offer accepted by student). Applicable 18% GST is added separately.",
    },
    monthly_subscription: {
      model: "monthly_subscription",
      name: "Monthly Unlimited Hiring Subscription",
      tagline: "Unlimited qualifying hires while your subscription is active",
      successFeeCtcPercent: null,
      monthlyFeeInr: 4999,
      gstRatePercent: DEFAULT_GST_RATE_PERCENT,
      gstAddedSeparately: true,
      unlimitedHiresWhileActive: true,
      agreementVersion: "EMP-SUB-2026.1",
      termsSummary:
        "Flat ₹4,999/month (Admin configurable) with applicable 18% GST added separately. Covers unlimited qualifying hires during active subscription dates with zero additional 8.33% success-fee charges.",
    },
  };
}

function roundInr(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Extracts taxable base + GST from a GST-inclusive INR amount.
 * Student admission and student tuition prices are always GST inclusive.
 */
export function calculateGstInclusiveBreakdown(
  totalInclusiveInr: number,
  gstRatePercent = DEFAULT_GST_RATE_PERCENT
): GstBreakdown {
  if (!Number.isFinite(totalInclusiveInr) || totalInclusiveInr < 0) {
    throw new Error("Invalid GST-inclusive amount");
  }
  const divisor = 1 + gstRatePercent / 100;
  const taxableBaseInr = roundInr(totalInclusiveInr / divisor);
  const gstAmountInr = roundInr(totalInclusiveInr - taxableBaseInr);
  return {
    gstRatePercent,
    isGstInclusive: true,
    taxableBaseInr,
    gstAmountInr,
    totalPayableInr: roundInr(totalInclusiveInr),
  };
}

/**
 * Adds GST separately on top of an exclusive base INR amount.
 * Employer success-fee and monthly subscription plans always add GST separately.
 */
export function calculateGstExclusiveBreakdown(
  baseExclusiveInr: number,
  gstRatePercent = DEFAULT_GST_RATE_PERCENT
): GstBreakdown {
  if (!Number.isFinite(baseExclusiveInr) || baseExclusiveInr < 0) {
    throw new Error("Invalid GST-exclusive amount");
  }
  const taxableBaseInr = roundInr(baseExclusiveInr);
  const gstAmountInr = roundInr((taxableBaseInr * gstRatePercent) / 100);
  const totalPayableInr = roundInr(taxableBaseInr + gstAmountInr);
  return {
    gstRatePercent,
    isGstInclusive: false,
    taxableBaseInr,
    gstAmountInr,
    totalPayableInr,
  };
}

/**
 * Calculates student tuition obligation upon qualifying accepted written offer.
 * Admission fee is NEVER deducted or adjusted against tuition fees.
 */
export function calculateStudentTuitionObligation(params: {
  planCode: AdmissionPlanCode;
  agreedCtcInr: number;
  customTuitionPercent?: number;
  gstRatePercent?: number;
}): {
  planCode: AdmissionPlanCode;
  agreedCtcInr: number;
  tuitionPercent: number;
  admissionDeductionInr: 0;
  breakdown: GstBreakdown;
} {
  if (!Number.isFinite(params.agreedCtcInr) || params.agreedCtcInr <= 0) {
    throw new Error("Agreed CTC must be a positive INR amount");
  }
  const defaultPercent = params.planCode === "plan_a_refundable" ? 33 : 35;
  const tuitionPercent = params.customTuitionPercent ?? defaultPercent;
  const grossTuitionInclusive = roundInr((params.agreedCtcInr * tuitionPercent) / 100);
  return {
    planCode: params.planCode,
    agreedCtcInr: roundInr(params.agreedCtcInr),
    tuitionPercent,
    admissionDeductionInr: 0, // Never adjusted against admission fee
    breakdown: calculateGstInclusiveBreakdown(
      grossTuitionInclusive,
      params.gstRatePercent ?? DEFAULT_GST_RATE_PERCENT
    ),
  };
}

/**
 * Calculates employer hiring charge for a qualifying selection.
 * If employer has an active monthly subscription covering the selection date,
 * zero additional success-fee charge is generated.
 */
export function calculateEmployerSelectionCharge(params: {
  billingModel: EmployerBillingModel;
  agreedCtcInr: number;
  successFeePercent?: number;
  subscriptionActiveOnDate: boolean;
  gstRatePercent?: number;
}): {
  chargeable: boolean;
  waivedReason: string | null;
  appliedPercent: number;
  breakdown: GstBreakdown;
} {
  const gstRate = params.gstRatePercent ?? DEFAULT_GST_RATE_PERCENT;
  if (params.billingModel === "monthly_subscription" && params.subscriptionActiveOnDate) {
    return {
      chargeable: false,
      waivedReason: "Covered under active Monthly Unlimited Hiring Subscription (₹0 success fee)",
      appliedPercent: 0,
      breakdown: calculateGstExclusiveBreakdown(0, gstRate),
    };
  }
  if (!Number.isFinite(params.agreedCtcInr) || params.agreedCtcInr <= 0) {
    throw new Error("Agreed CTC must be positive for employer success-fee calculation");
  }
  const appliedPercent = params.successFeePercent ?? 8.33;
  const baseFee = roundInr((params.agreedCtcInr * appliedPercent) / 100);
  return {
    chargeable: true,
    waivedReason: null,
    appliedPercent,
    breakdown: calculateGstExclusiveBreakdown(baseFee, gstRate),
  };
}

export function calculateEmployerSubscriptionInvoice(
  monthlyFeeInr: number,
  gstRatePercent = DEFAULT_GST_RATE_PERCENT
): GstBreakdown {
  return calculateGstExclusiveBreakdown(monthlyFeeInr, gstRatePercent);
}

export type RefundEligibilityStatus =
  | "not_applicable_plan_b"
  | "awaiting_final_assessment_pass"
  | "window_active"
  | "eligible_for_refund"
  | "non_refundable_due_to_selection"
  | "refund_requested"
  | "refund_approved"
  | "refund_completed";

export interface RefundEvaluationResult {
  planCode: AdmissionPlanCode;
  refundablePlan: boolean;
  assessmentPassDate: string | null;
  refundDeadlineDate: string | null;
  daysRemainingInWindow: number | null;
  qualifyingSelectionOccurred: boolean;
  qualifyingSelectionDate: string | null;
  status: RefundEligibilityStatus;
  canRequestRefund: boolean;
  explanation: string;
}

/**
 * Authoritative backend evaluation of Admission Refund Lifecycle.
 * - Plan B is NEVER refundable.
 * - Plan A clock starts strictly at verified >=75% final assessment pass timestamp.
 * - Deadline = passDate + 120 calendar days.
 * - Qualifying selection BEFORE or ON deadline => non-refundable.
 * - No qualifying selection by deadline => eligible_for_refund (remains eligible even if a selection occurs AFTER deadline).
 * - Never marks an estimated/eligible refund as completed until backend payout status is 'completed'.
 */
export function evaluateAdmissionRefundLifecycle(params: {
  planCode: AdmissionPlanCode;
  finalAssessmentPassedAt: string | null;
  qualifyingSelectionAt: string | null;
  now?: Date;
  refundWindowDays?: number;
  existingRefundProcessingStatus?: "none" | "requested" | "approved" | "completed" | "rejected";
}): RefundEvaluationResult {
  const now = params.now ?? new Date();
  const windowDays = params.refundWindowDays ?? DEFAULT_PLAN_A_REFUND_WINDOW_DAYS;

  if (params.planCode === "plan_b_non_refundable") {
    return {
      planCode: params.planCode,
      refundablePlan: false,
      assessmentPassDate: params.finalAssessmentPassedAt,
      refundDeadlineDate: null,
      daysRemainingInWindow: null,
      qualifyingSelectionOccurred: Boolean(params.qualifyingSelectionAt),
      qualifyingSelectionDate: params.qualifyingSelectionAt,
      status: "not_applicable_plan_b",
      canRequestRefund: false,
      explanation: "Plan B admission fee is strictly non-refundable regardless of selection outcome.",
    };
  }

  if (!params.finalAssessmentPassedAt) {
    return {
      planCode: params.planCode,
      refundablePlan: true,
      assessmentPassDate: null,
      refundDeadlineDate: null,
      daysRemainingInWindow: null,
      qualifyingSelectionOccurred: Boolean(params.qualifyingSelectionAt),
      qualifyingSelectionDate: params.qualifyingSelectionAt,
      status: "awaiting_final_assessment_pass",
      canRequestRefund: false,
      explanation:
        "The 120-calendar-day refund clock starts once you pass the final assessment with at least 75% and complete mandatory course requirements.",
    };
  }

  const passDate = new Date(params.finalAssessmentPassedAt);
  const deadline = new Date(passDate.getTime() + windowDays * 24 * 60 * 60 * 1000);
  const deadlineIso = deadline.toISOString();

  // Check if a qualifying selection occurred BEFORE or ON the 120-day deadline
  if (params.qualifyingSelectionAt) {
    const selectionDate = new Date(params.qualifyingSelectionAt);
    if (selectionDate.getTime() <= deadline.getTime()) {
      return {
        planCode: params.planCode,
        refundablePlan: true,
        assessmentPassDate: passDate.toISOString(),
        refundDeadlineDate: deadlineIso,
        daysRemainingInWindow: 0,
        qualifyingSelectionOccurred: true,
        qualifyingSelectionDate: selectionDate.toISOString(),
        status: "non_refundable_due_to_selection",
        canRequestRefund: false,
        explanation:
          "A qualifying written offer was accepted within the 120-day window. Under the Plan A commercial agreement, the admission fee is now non-refundable.",
      };
    }
  }

  // Respect actual backend refund processing status (never fake completion)
  if (params.existingRefundProcessingStatus === "completed") {
    return {
      planCode: params.planCode,
      refundablePlan: true,
      assessmentPassDate: passDate.toISOString(),
      refundDeadlineDate: deadlineIso,
      daysRemainingInWindow: 0,
      qualifyingSelectionOccurred: Boolean(params.qualifyingSelectionAt),
      qualifyingSelectionDate: params.qualifyingSelectionAt,
      status: "refund_completed",
      canRequestRefund: false,
      explanation: "Your Plan A admission fee refund has been processed and completed.",
    };
  }
  if (params.existingRefundProcessingStatus === "approved") {
    return {
      planCode: params.planCode,
      refundablePlan: true,
      assessmentPassDate: passDate.toISOString(),
      refundDeadlineDate: deadlineIso,
      daysRemainingInWindow: 0,
      qualifyingSelectionOccurred: Boolean(params.qualifyingSelectionAt),
      qualifyingSelectionDate: params.qualifyingSelectionAt,
      status: "refund_approved",
      canRequestRefund: false,
      explanation: "Your refund request has been approved by Admin and is queued for bank settlement.",
    };
  }
  if (params.existingRefundProcessingStatus === "requested") {
    return {
      planCode: params.planCode,
      refundablePlan: true,
      assessmentPassDate: passDate.toISOString(),
      refundDeadlineDate: deadlineIso,
      daysRemainingInWindow: 0,
      qualifyingSelectionOccurred: Boolean(params.qualifyingSelectionAt),
      qualifyingSelectionDate: params.qualifyingSelectionAt,
      status: "refund_requested",
      canRequestRefund: false,
      explanation: "Your Plan A refund request has been submitted and is under Admin verification.",
    };
  }

  const msRemaining = deadline.getTime() - now.getTime();
  if (msRemaining > 0) {
    const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
    return {
      planCode: params.planCode,
      refundablePlan: true,
      assessmentPassDate: passDate.toISOString(),
      refundDeadlineDate: deadlineIso,
      daysRemainingInWindow: daysRemaining,
      qualifyingSelectionOccurred: false,
      qualifyingSelectionDate: null,
      status: "window_active",
      canRequestRefund: false,
      explanation: `Placement window active (${daysRemaining} calendar day${daysRemaining === 1 ? "" : "s"} remaining until ${deadlineIso.slice(0, 10)}). If no qualifying selection occurs by the deadline, you become eligible to request your Plan A admission refund.`,
    };
  }

  return {
    planCode: params.planCode,
    refundablePlan: true,
    assessmentPassDate: passDate.toISOString(),
    refundDeadlineDate: deadlineIso,
    daysRemainingInWindow: 0,
    qualifyingSelectionOccurred: Boolean(params.qualifyingSelectionAt),
    qualifyingSelectionDate: params.qualifyingSelectionAt,
    status: "eligible_for_refund",
    canRequestRefund: true,
    explanation:
      "120 calendar days have elapsed since your verified final-assessment pass with no qualifying selection within the window. You are eligible to submit a Plan A admission refund request.",
  };
}

/**
 * Runtime guard: prohibits mock/sandbox payment capture in Live Mode.
 */
export function resolveRuntimeMode(env: Record<string, string | undefined> = process.env): RuntimeMode {
  if (env.APP_MODE === "live" || env.NODE_ENV === "production") {
    return "live";
  }
  return "sandbox";
}

export function assertNoMockFinancialExecutionInLiveMode(
  mode: RuntimeMode,
  isSimulatedTransaction: boolean
): void {
  if (mode === "live" && isSimulatedTransaction) {
    throw new Error(
      "SECURITY_VIOLATION: Simulated or mock financial transactions are strictly prohibited in Live Mode."
    );
  }
}

export function isOfficialBusinessEmail(email: string): { valid: boolean; domain: string; reason?: string } {
  const normalized = email.trim().toLowerCase();
  const match = normalized.match(/^[^\s@]+@([a-z0-9.-]+\.[a-z]{2,})$/);
  if (!match) {
    return { valid: false, domain: "", reason: "Please enter a valid work email address." };
  }
  const domain = match[1];
  const blockedConsumerDomains = new Set([
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "yahoo.in",
    "yahoo.co.in",
    "hotmail.com",
    "outlook.com",
    "live.com",
    "msn.com",
    "icloud.com",
    "me.com",
    "rediffmail.com",
    "protonmail.com",
    "proton.me",
    "zoho.in",
    "mailinator.com",
    "tempmail.com",
    "guerrillamail.com",
    "yopmail.com",
  ]);
  if (blockedConsumerDomains.has(domain)) {
    return {
      valid: false,
      domain,
      reason: `Personal email domain (${domain}) is not allowed. Please use your official company email address.`,
    };
  }
  return { valid: true, domain };
}
