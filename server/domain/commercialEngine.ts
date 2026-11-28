/**
 * Authoritative UdaYantu Commercial, Tax Governance, Refund & Financial Ledger Engine.
 *
 * SINGLE SOURCE OF TRUTH for udayantu-api, udayantu-web (Student + Employer),
 * and udayantu-admin (Admin control plane).
 *
 * Guarantees enforced:
 * - Exact integer paise arithmetic using BigInt internally (never floating-point rupee math).
 * - Safe JSON money serialization via MoneyAmount (paise as decimal string + display INR,
 *   never raw BigInt in JSON).
 * - Effective-dated GST/SAC tax rules with explicit PENDING_ACCOUNTANT_REVIEW vs
 *   APPROVED_FOR_LIVE_INVOICING governance (never hardcoded 18% in live billing).
 * - Unresolved Commercial Decision Register blocking Live Mode billing until owner/CA approval.
 * - Student Plan A (₹9,999 GST incl., 33% CTC tuition, 120-day post-pass refund protection;
 *   vested Day-120 refund entitlement is NEVER erased by a later selection).
 * - Student Plan B (₹5,999 GST incl., 35% CTC tuition, strictly non-refundable).
 * - Admission fee NEVER deducted or adjusted against tuition fees.
 * - Employer Plan A (8.33% CTC + separate GST) & Plan B (₹4,999/mo + separate GST,
 *   unlimited hires while active; past-due/expired subscriptions NEVER silently fall back
 *   to Plan A 8.33% without an explicitly accepted commercial agreement).
 */

export type AdmissionPlanCode = "plan_a_refundable" | "plan_b_non_refundable";
export type EmployerBillingModel = "success_fee" | "monthly_subscription";
export type RuntimeMode = "live" | "sandbox";
export type TaxApprovalStatus = "PENDING_ACCOUNTANT_REVIEW" | "APPROVED_FOR_LIVE_INVOICING";
export type CandidateSacCode = "999293" | "998512" | "998519";

/**
 * Explicitly documented money representation for JSON transport.
 * Raw BigInt is NEVER returned directly in API responses.
 */
export interface MoneyAmount {
  /** Authoritative exact amount in integer paise encoded as base-10 string */
  paise: string;
  /** Convenience display value in INR (exact paise / 100) */
  inr: number;
  currency: "INR";
}

export function paiseToMoney(paise: bigint): MoneyAmount {
  if (paise < 0n) {
    throw new Error("Money paise amount cannot be negative");
  }
  return {
    paise: paise.toString(),
    inr: Number(paise) / 100,
    currency: "INR",
  };
}

export function inrToPaise(inr: number): bigint {
  if (!Number.isFinite(inr) || inr < 0) {
    throw new Error("Invalid INR amount");
  }
  return BigInt(Math.round(inr * 100));
}

export function parsePaise(paiseStr: string): bigint {
  if (!/^\d+$/.test(paiseStr)) {
    throw new Error(`Invalid integer paise string: ${paiseStr}`);
  }
  return BigInt(paiseStr);
}

/**
 * Exact half-up BigInt division: round(numerator / denominator).
 */
export function divRoundHalfUp(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) throw new Error("Division by non-positive denominator");
  if (numerator < 0n) throw new Error("Negative numerator not supported for positive monetary rounding");
  return (numerator + denominator / 2n) / denominator;
}

/**
 * Converts a percentage (e.g. 18, 8.33, 33) into basis points in 1/100th percent (e.g. 833 = 8.33%).
 * 100% = 10000 bps.
 */
export function percentToBps(percent: number): bigint {
  if (!Number.isFinite(percent) || percent < 0) {
    throw new Error("Invalid percentage value");
  }
  return BigInt(Math.round(percent * 100));
}

export interface TaxRuleConfig {
  id: string;
  serviceCategory: "student_training_admission" | "student_tuition" | "employer_placement_services";
  candidateSacCode: CandidateSacCode;
  sacDescription: string;
  rateBps: number; // e.g. 1800 = 18.00%
  ratePercent: number;
  effectiveFrom: string;
  effectiveUntil: string | null;
  approvalStatus: TaxApprovalStatus;
  reviewedByCaName: string | null;
  reviewedAt: string | null;
  notes: string;
}

export interface CommercialDecisionItem {
  id: string;
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  title: string;
  status: "PENDING_OWNER_CA_APPROVAL" | "APPROVED";
  proposedDefault: string;
  approvedBy: string | null;
  approvedAt: string | null;
  blocksLiveBilling: boolean;
}

export function getDefaultTaxRules(): Record<TaxRuleConfig["serviceCategory"], TaxRuleConfig> {
  return {
    student_training_admission: {
      id: "tax-rule-student-admission-2026",
      serviceCategory: "student_training_admission",
      candidateSacCode: "999293",
      sacDescription: "Commercial training and coaching services (candidate — requires CA contract review)",
      rateBps: 1800,
      ratePercent: 18,
      effectiveFrom: "2026-01-01T00:00:00.000Z",
      effectiveUntil: null,
      approvalStatus: "PENDING_ACCOUNTANT_REVIEW",
      reviewedByCaName: null,
      reviewedAt: null,
      notes:
        "Illustrative 18% GST-inclusive test calculation. Must obtain Chartered Accountant sign-off on SAC 999293 and exemption eligibility before live invoicing.",
    },
    student_tuition: {
      id: "tax-rule-student-tuition-2026",
      serviceCategory: "student_tuition",
      candidateSacCode: "999293",
      sacDescription: "Commercial training and coaching services — deferred outcome tuition (requires CA review)",
      rateBps: 1800,
      ratePercent: 18,
      effectiveFrom: "2026-01-01T00:00:00.000Z",
      effectiveUntil: null,
      approvalStatus: "PENDING_ACCOUNTANT_REVIEW",
      reviewedByCaName: null,
      reviewedAt: null,
      notes:
        "Illustrative 18% GST-inclusive test calculation. Requires CA sign-off on deferred consideration and credit-note treatment before live invoicing.",
    },
    employer_placement_services: {
      id: "tax-rule-employer-placement-2026",
      serviceCategory: "employer_placement_services",
      candidateSacCode: "998512",
      sacDescription:
        "Permanent placement services other than executive search (compare against SAC 998519 during CA review)",
      rateBps: 1800,
      ratePercent: 18,
      effectiveFrom: "2026-01-01T00:00:00.000Z",
      effectiveUntil: null,
      approvalStatus: "PENDING_ACCOUNTANT_REVIEW",
      reviewedByCaName: null,
      reviewedAt: null,
      notes:
        "Illustrative 18% GST-exclusive test calculation (GST added separately). CA must confirm SAC 998512 vs 998519 before live employer invoicing.",
    },
  };
}

export function getDefaultCommercialDecisionRegister(): CommercialDecisionItem[] {
  return [
    {
      id: "dec-1-ctc-components",
      number: 1,
      title: "Exact CTC components included in fee base (Fixed vs Variable/Bonus/ESOP)",
      status: "PENDING_OWNER_CA_APPROVAL",
      proposedDefault: "Fixed annual gross CTC excluding discretionary bonuses and unvested ESOPs",
      approvedBy: null,
      approvedAt: null,
      blocksLiveBilling: true,
    },
    {
      id: "dec-2-multiple-offers",
      number: 2,
      title: "Multiple student offer policy",
      status: "PENDING_OWNER_CA_APPROVAL",
      proposedDefault: "One tuition obligation per student enrollment/placement outcome (first qualifying accepted written offer)",
      approvedBy: null,
      approvedAt: null,
      blocksLiveBilling: true,
    },
    {
      id: "dec-3-tuition-collection",
      number: 3,
      title: "Student tuition collection mode (lump sum vs instalments)",
      status: "PENDING_OWNER_CA_APPROVAL",
      proposedDefault: "Configurable per approved agreement (default lump sum or approved EMI schedule)",
      approvedBy: null,
      approvedAt: null,
      blocksLiveBilling: true,
    },
    {
      id: "dec-4-employer-trigger",
      number: 4,
      title: "Employer success-fee invoice trigger & payment terms",
      status: "PENDING_OWNER_CA_APPROVAL",
      proposedDefault: "One-time per qualifying selection (written offer accepted), net-15 invoice terms via versioned agreement",
      approvedBy: null,
      approvedAt: null,
      blocksLiveBilling: true,
    },
    {
      id: "dec-5-subscription-grace",
      number: 5,
      title: "Employer subscription grace period & expiry policy",
      status: "PENDING_OWNER_CA_APPROVAL",
      proposedDefault: "Strict active paid coverage check at selection timestamp; no silent fallback to 8.33% Plan A",
      approvedBy: null,
      approvedAt: null,
      blocksLiveBilling: true,
    },
    {
      id: "dec-6-credit-replacement",
      number: 6,
      title: "Employer credit or replacement terms for no-show / early attrition",
      status: "PENDING_OWNER_CA_APPROVAL",
      proposedDefault: "Defined explicitly in versioned employer commercial agreement",
      approvedBy: null,
      approvedAt: null,
      blocksLiveBilling: true,
    },
    {
      id: "dec-7-refund-credit-note",
      number: 7,
      title: "Student admission refund GST credit-note treatment (Section 34 CGST Act)",
      status: "PENDING_OWNER_CA_APPROVAL",
      proposedDefault: "Issue GST credit note referencing original tax invoice upon approved Plan A refund",
      approvedBy: null,
      approvedAt: null,
      blocksLiveBilling: true,
    },
  ];
}

/**
 * Enforces live-invoicing governance gate:
 * - In Sandbox mode: allows controlled test calculations while flagging approvalStatus.
 * - In Live mode: strictly blocks live invoicing if the effective tax rule is not
 *   APPROVED_FOR_LIVE_INVOICING or if any blocking Commercial Decision remains unapproved.
 */
export function assertLiveBillingGovernanceApproved(params: {
  mode: RuntimeMode;
  taxRule: TaxRuleConfig;
  decisions: CommercialDecisionItem[];
}): void {
  if (params.mode !== "live") return;

  if (params.taxRule.approvalStatus !== "APPROVED_FOR_LIVE_INVOICING") {
    throw new Error(
      `LIVE_INVOICING_BLOCKED_TAX_UNAPPROVED: Tax rule ${params.taxRule.id} (candidate SAC ${params.taxRule.candidateSacCode}) is in ${params.taxRule.approvalStatus}. Chartered Accountant approval is required before live invoicing.`
    );
  }

  const unapproved = params.decisions.filter(
    (d) => d.blocksLiveBilling && d.status !== "APPROVED"
  );
  if (unapproved.length > 0) {
    throw new Error(
      `LIVE_BILLING_BLOCKED_DECISIONS_PENDING: ${unapproved.length} material commercial decision(s) require owner/CA approval before live billing (${unapproved.map((d) => d.id).join(", ")}).`
    );
  }
}

export interface GstBreakdown {
  gstRatePercent: number;
  gstRateBps: number;
  isGstInclusive: boolean;
  taxRuleId: string;
  candidateSacCode: CandidateSacCode;
  taxApprovalStatus: TaxApprovalStatus;
  /** Exact integer paise strings (authoritative) */
  taxableBasePaise: string;
  gstAmountPaise: string;
  totalPayablePaise: string;
  /** Display INR numbers derived directly from exact paise */
  taxableBaseInr: number;
  gstAmountInr: number;
  totalPayableInr: number;
}

export interface StudentAdmissionPlanConfig {
  code: AdmissionPlanCode;
  name: string;
  tagline: string;
  pricePaise: string;
  priceInr: number; // GST inclusive
  gstRatePercent: number;
  isGstInclusive: true;
  cohortDurationDays: number;
  refundable: boolean;
  refundWindowCalendarDays: number | null;
  passingThresholdPercent: number;
  tuitionCtcPercent: number; // 33% Plan A, 35% Plan B (GST inclusive)
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
  monthlyFeePaise: string | null;
  monthlyFeeInr: number | null; // ₹4,999 default, Admin configurable
  gstRatePercent: number;
  gstAddedSeparately: true;
  unlimitedHiresWhileActive: boolean;
  agreementVersion: string;
  termsSummary: string;
}

export const DEFAULT_COHORT_DURATION_DAYS = 90;
export const DEFAULT_PASSING_THRESHOLD_PERCENT = 75;
export const DEFAULT_PLAN_A_REFUND_WINDOW_DAYS = 120;

export function getDefaultStudentPlans(
  taxRule: TaxRuleConfig = getDefaultTaxRules().student_training_admission
): Record<AdmissionPlanCode, StudentAdmissionPlanConfig> {
  return {
    plan_a_refundable: {
      code: "plan_a_refundable",
      name: "Plan A — Refundable Admission",
      tagline: "90-day training cohort with 120-day post-qualification admission refund protection",
      pricePaise: "999900",
      priceInr: 9999,
      gstRatePercent: taxRule.ratePercent,
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
        "Admission fee of ₹9,999 (GST inclusive) covers 90-day cohort enrollment, career-aligned training, assessments, and configured mentorship. Refundable if you pass the final assessment with at least 75% and receive no qualifying job selection within 120 calendar days of your verified pass date. Once refund eligibility vests at Day 120, a subsequent selection does not erase that vested refund entitlement. On a qualifying selection within the window (written offer accepted), the admission fee becomes non-refundable, is never adjusted against tuition fees, and tuition fee of 33% of agreed CTC (GST inclusive) applies.",
      highlights: [
        "90-day career-aligned training cohort & structured resources",
        "Assessments, assignments, mentorship & configured live Zoom/Meet sessions",
        "Eligible for admission refund if unselected within 120 calendar days after passing final assessment (≥75%)",
        "Tuition upon qualifying accepted written offer: 33% of agreed CTC (GST inclusive)",
        "Admission fee is never adjusted against tuition fees",
      ],
      refundPolicyNotice:
        "Refund clock starts strictly from your verified final-assessment pass date (≥75%). If a qualifying written offer is accepted on or before day 120, the admission fee becomes non-refundable. Once eligible after day 120, a later offer does not erase your vested refund entitlement.",
    },
    plan_b_non_refundable: {
      code: "plan_b_non_refundable",
      name: "Plan B — Non-Refundable Admission",
      tagline: "Lower upfront admission fee for the same 90-day training cohort and mentorship",
      pricePaise: "599900",
      priceInr: 5999,
      gstRatePercent: taxRule.ratePercent,
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
        "Admission fee of ₹5,999 (GST inclusive) covers 90-day cohort enrollment, career-aligned training, assessments, and configured mentorship. This admission fee is strictly non-refundable regardless of selection outcome and is never adjusted against tuition fees. Upon a qualifying selection (written offer accepted), a tuition fee of 35% of agreed CTC (GST inclusive) applies.",
      highlights: [
        "90-day career-aligned training cohort & structured resources",
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

export function getDefaultEmployerPlans(
  taxRule: TaxRuleConfig = getDefaultTaxRules().employer_placement_services
): Record<EmployerBillingModel, EmployerCommercialPlanConfig> {
  return {
    success_fee: {
      model: "success_fee",
      name: "Success-Fee Hiring Plan",
      tagline: "Pay per qualifying hire with Admin-configurable commercial terms",
      successFeeCtcPercent: 8.33,
      monthlyFeePaise: null,
      monthlyFeeInr: null,
      gstRatePercent: taxRule.ratePercent,
      gstAddedSeparately: true,
      unlimitedHiresWhileActive: false,
      agreementVersion: "EMP-SUCCESS-2026.1",
      termsSummary:
        "One-time fee of 8.33% of agreed annual CTC (negotiable and Admin configurable) billed per qualifying selection (written offer accepted by student) under a versioned employer agreement. Applicable GST is added separately.",
    },
    monthly_subscription: {
      model: "monthly_subscription",
      name: "Monthly Unlimited Hiring Subscription",
      tagline: "Unlimited qualifying hires while your paid subscription is active",
      successFeeCtcPercent: null,
      monthlyFeePaise: "499900",
      monthlyFeeInr: 4999,
      gstRatePercent: taxRule.ratePercent,
      gstAddedSeparately: true,
      unlimitedHiresWhileActive: true,
      agreementVersion: "EMP-SUB-2026.1",
      termsSummary:
        "Flat ₹4,999/month (Admin configurable) with applicable GST added separately. Covers unlimited qualifying hires during active paid subscription dates with zero additional 8.33% success-fee charges. Expired or past-due subscriptions are never silently billed under Plan A without an explicitly accepted agreement.",
    },
  };
}

/**
 * Exact BigInt paise GST-inclusive breakdown.
 * taxableBasePaise = roundHalfUp(totalPaise * 10000 / (10000 + rateBps))
 * gstAmountPaise = totalPaise - taxableBasePaise (exact reconciliation guaranteed!)
 */
export function calculateGstInclusiveBreakdownPaise(
  totalInclusivePaise: bigint,
  taxRule: TaxRuleConfig = getDefaultTaxRules().student_training_admission
): GstBreakdown {
  if (totalInclusivePaise < 0n) {
    throw new Error("Invalid GST-inclusive paise amount");
  }
  const rateBps = BigInt(taxRule.rateBps);
  const taxableBasePaise = divRoundHalfUp(totalInclusivePaise * 10000n, 10000n + rateBps);
  const gstAmountPaise = totalInclusivePaise - taxableBasePaise;

  return {
    gstRatePercent: taxRule.ratePercent,
    gstRateBps: taxRule.rateBps,
    isGstInclusive: true,
    taxRuleId: taxRule.id,
    candidateSacCode: taxRule.candidateSacCode,
    taxApprovalStatus: taxRule.approvalStatus,
    taxableBasePaise: taxableBasePaise.toString(),
    gstAmountPaise: gstAmountPaise.toString(),
    totalPayablePaise: totalInclusivePaise.toString(),
    taxableBaseInr: Number(taxableBasePaise) / 100,
    gstAmountInr: Number(gstAmountPaise) / 100,
    totalPayableInr: Number(totalInclusivePaise) / 100,
  };
}

/**
 * Backward-compatible INR entry wrapper delegating directly to exact BigInt paise math.
 */
export function calculateGstInclusiveBreakdown(
  totalInclusiveInr: number,
  gstRatePercent?: number,
  taxRule?: TaxRuleConfig
): GstBreakdown {
  const effectiveRule: TaxRuleConfig =
    taxRule ??
    (typeof gstRatePercent === "number"
      ? {
          ...getDefaultTaxRules().student_training_admission,
          ratePercent: gstRatePercent,
          rateBps: Number(percentToBps(gstRatePercent)),
        }
      : getDefaultTaxRules().student_training_admission);
  return calculateGstInclusiveBreakdownPaise(inrToPaise(totalInclusiveInr), effectiveRule);
}

/**
 * Exact BigInt paise GST-exclusive breakdown (GST added separately on top of base).
 * gstAmountPaise = roundHalfUp(basePaise * rateBps / 10000)
 * totalPayablePaise = basePaise + gstAmountPaise
 */
export function calculateGstExclusiveBreakdownPaise(
  baseExclusivePaise: bigint,
  taxRule: TaxRuleConfig = getDefaultTaxRules().employer_placement_services
): GstBreakdown {
  if (baseExclusivePaise < 0n) {
    throw new Error("Invalid GST-exclusive paise amount");
  }
  const rateBps = BigInt(taxRule.rateBps);
  const gstAmountPaise = divRoundHalfUp(baseExclusivePaise * rateBps, 10000n);
  const totalPayablePaise = baseExclusivePaise + gstAmountPaise;

  return {
    gstRatePercent: taxRule.ratePercent,
    gstRateBps: taxRule.rateBps,
    isGstInclusive: false,
    taxRuleId: taxRule.id,
    candidateSacCode: taxRule.candidateSacCode,
    taxApprovalStatus: taxRule.approvalStatus,
    taxableBasePaise: baseExclusivePaise.toString(),
    gstAmountPaise: gstAmountPaise.toString(),
    totalPayablePaise: totalPayablePaise.toString(),
    taxableBaseInr: Number(baseExclusivePaise) / 100,
    gstAmountInr: Number(gstAmountPaise) / 100,
    totalPayableInr: Number(totalPayablePaise) / 100,
  };
}

export function calculateGstExclusiveBreakdown(
  baseExclusiveInr: number,
  gstRatePercent?: number,
  taxRule?: TaxRuleConfig
): GstBreakdown {
  const effectiveRule: TaxRuleConfig =
    taxRule ??
    (typeof gstRatePercent === "number"
      ? {
          ...getDefaultTaxRules().employer_placement_services,
          ratePercent: gstRatePercent,
          rateBps: Number(percentToBps(gstRatePercent)),
        }
      : getDefaultTaxRules().employer_placement_services);
  return calculateGstExclusiveBreakdownPaise(inrToPaise(baseExclusiveInr), effectiveRule);
}

/**
 * Calculates student tuition obligation in exact integer paise upon qualifying accepted written offer.
 * Admission fee is NEVER deducted or adjusted against tuition fees.
 */
export function calculateStudentTuitionObligation(params: {
  planCode: AdmissionPlanCode;
  agreedCtcInr: number;
  customTuitionPercent?: number;
  gstRatePercent?: number;
  taxRule?: TaxRuleConfig;
}): {
  planCode: AdmissionPlanCode;
  agreedCtcPaise: string;
  agreedCtcInr: number;
  tuitionPercent: number;
  admissionDeductionPaise: "0";
  admissionDeductionInr: 0;
  breakdown: GstBreakdown;
} {
  if (!Number.isFinite(params.agreedCtcInr) || params.agreedCtcInr <= 0) {
    throw new Error("Agreed CTC must be a positive INR amount");
  }
  const ctcPaise = inrToPaise(params.agreedCtcInr);
  const defaultPercent = params.planCode === "plan_a_refundable" ? 33 : 35;
  const tuitionPercent = params.customTuitionPercent ?? defaultPercent;
  const tuitionBps = percentToBps(tuitionPercent);
  const grossTuitionInclusivePaise = divRoundHalfUp(ctcPaise * tuitionBps, 10000n);

  const effectiveRule: TaxRuleConfig =
    params.taxRule ??
    (typeof params.gstRatePercent === "number"
      ? {
          ...getDefaultTaxRules().student_tuition,
          ratePercent: params.gstRatePercent,
          rateBps: Number(percentToBps(params.gstRatePercent)),
        }
      : getDefaultTaxRules().student_tuition);

  return {
    planCode: params.planCode,
    agreedCtcPaise: ctcPaise.toString(),
    agreedCtcInr: Number(ctcPaise) / 100,
    tuitionPercent,
    admissionDeductionPaise: "0",
    admissionDeductionInr: 0,
    breakdown: calculateGstInclusiveBreakdownPaise(grossTuitionInclusivePaise, effectiveRule),
  };
}

export type EmployerSubscriptionStatus =
  | "none"
  | "active"
  | "past_due"
  | "expired"
  | "cancelled";

/**
 * Calculates employer hiring charge in exact integer paise for a qualifying selection.
 *
 * CRITICAL PHASE 3 RULES:
 * - Active paid Monthly Subscription at selection timestamp => ₹0 additional 8.33% fee.
 * - Past-due or expired Monthly Subscription => NEVER silently fall back to Plan A 8.33%
 *   unless `explicitPlanAFallbackAgreementAccepted === true`. Otherwise throws a clear
 *   billing hold error requiring subscription renewal or explicit Plan A agreement!
 * - Plan A Success-Fee => 8.33% (Admin configurable) of agreed CTC + separate GST.
 */
export function calculateEmployerSelectionCharge(params: {
  billingModel: EmployerBillingModel;
  agreedCtcInr: number;
  successFeePercent?: number;
  subscriptionActiveOnDate: boolean;
  subscriptionStatus?: EmployerSubscriptionStatus;
  explicitPlanAFallbackAgreementAccepted?: boolean;
  gstRatePercent?: number;
  taxRule?: TaxRuleConfig;
}): {
  chargeable: boolean;
  waivedReason: string | null;
  appliedPercent: number;
  breakdown: GstBreakdown;
} {
  const effectiveRule: TaxRuleConfig =
    params.taxRule ??
    (typeof params.gstRatePercent === "number"
      ? {
          ...getDefaultTaxRules().employer_placement_services,
          ratePercent: params.gstRatePercent,
          rateBps: Number(percentToBps(params.gstRatePercent)),
        }
      : getDefaultTaxRules().employer_placement_services);

  if (params.billingModel === "monthly_subscription") {
    if (params.subscriptionActiveOnDate && (params.subscriptionStatus ?? "active") === "active") {
      return {
        chargeable: false,
        waivedReason: "Covered under active paid Monthly Unlimited Hiring Subscription (₹0 success fee)",
        appliedPercent: 0,
        breakdown: calculateGstExclusiveBreakdownPaise(0n, effectiveRule),
      };
    }

    if (!params.explicitPlanAFallbackAgreementAccepted) {
      throw new Error(
        `SUBSCRIPTION_INACTIVE_NO_SILENT_FALLBACK: Employer Monthly Subscription is ${
          params.subscriptionStatus && params.subscriptionStatus !== "active"
            ? params.subscriptionStatus
            : "inactive/expired"
        } on the selection timestamp. Automatic fallback to Plan A success-fee pricing is prohibited without an explicitly accepted commercial agreement.`
      );
    }
  }

  if (!Number.isFinite(params.agreedCtcInr) || params.agreedCtcInr <= 0) {
    throw new Error("Agreed CTC must be positive for employer success-fee calculation");
  }
  const ctcPaise = inrToPaise(params.agreedCtcInr);
  const appliedPercent = params.successFeePercent ?? 8.33;
  const feeBps = percentToBps(appliedPercent);
  const baseFeePaise = divRoundHalfUp(ctcPaise * feeBps, 10000n);

  return {
    chargeable: true,
    waivedReason: null,
    appliedPercent,
    breakdown: calculateGstExclusiveBreakdownPaise(baseFeePaise, effectiveRule),
  };
}

export function calculateEmployerSubscriptionInvoice(
  monthlyFeeInr: number,
  gstRatePercent?: number,
  taxRule?: TaxRuleConfig
): GstBreakdown {
  return calculateGstExclusiveBreakdown(monthlyFeeInr, gstRatePercent, taxRule);
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
  entitlementVestedAtCutoff: boolean;
  status: RefundEligibilityStatus;
  canRequestRefund: boolean;
  explanation: string;
}

/**
 * Authoritative backend evaluation of Admission Refund Lifecycle.
 * - Plan B is NEVER refundable.
 * - Plan A clock starts strictly at verified >=75% final assessment pass timestamp.
 * - Cutoff deadline = passDate + 120 calendar days.
 * - Day 119 / Day 120 (before cutoff passes): window_active; cannot request refund yet.
 * - Qualifying selection ON or BEFORE Day-120 cutoff => non_refundable_due_to_selection.
 * - No qualifying selection by Day-120 cutoff => refund entitlement VESTS permanently
 *   (entitlementVestedAtCutoff = true). A later selection AFTER Day 120 MUST NOT erase
 *   this vested refund entitlement!
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
      entitlementVestedAtCutoff: false,
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
      entitlementVestedAtCutoff: false,
      status: "awaiting_final_assessment_pass",
      canRequestRefund: false,
      explanation:
        "The 120-calendar-day refund clock starts once you pass the final assessment with at least 75% and complete mandatory course requirements.",
    };
  }

  const passDate = new Date(params.finalAssessmentPassedAt);
  const deadline = new Date(passDate.getTime() + windowDays * 24 * 60 * 60 * 1000);
  const deadlineIso = deadline.toISOString();

  // Selection ON or BEFORE the Day-120 cutoff makes Plan A admission fee non-refundable
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
        entitlementVestedAtCutoff: false,
        status: "non_refundable_due_to_selection",
        canRequestRefund: false,
        explanation:
          "A qualifying written offer was accepted on or before the 120-calendar-day cutoff. Under the Plan A commercial agreement, the admission fee is now non-refundable.",
      };
    }
  }

  // Respect actual backend refund processing status (never fake completion)
  const cutoffElapsed = now.getTime() > deadline.getTime();
  if (params.existingRefundProcessingStatus === "completed") {
    return {
      planCode: params.planCode,
      refundablePlan: true,
      assessmentPassDate: passDate.toISOString(),
      refundDeadlineDate: deadlineIso,
      daysRemainingInWindow: 0,
      qualifyingSelectionOccurred: Boolean(params.qualifyingSelectionAt),
      qualifyingSelectionDate: params.qualifyingSelectionAt,
      entitlementVestedAtCutoff: true,
      status: "refund_completed",
      canRequestRefund: false,
      explanation: "Your Plan A admission fee refund has been processed and settled.",
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
      entitlementVestedAtCutoff: true,
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
      entitlementVestedAtCutoff: true,
      status: "refund_requested",
      canRequestRefund: false,
      explanation: "Your Plan A refund request has been submitted and is under Admin verification.",
    };
  }

  // Window remains active up to and including exact Day-120 cutoff timestamp (now <= deadline)
  if (!cutoffElapsed) {
    const msRemaining = Math.max(0, deadline.getTime() - now.getTime());
    const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
    return {
      planCode: params.planCode,
      refundablePlan: true,
      assessmentPassDate: passDate.toISOString(),
      refundDeadlineDate: deadlineIso,
      daysRemainingInWindow: daysRemaining,
      qualifyingSelectionOccurred: false,
      qualifyingSelectionDate: null,
      entitlementVestedAtCutoff: false,
      status: "window_active",
      canRequestRefund: false,
      explanation: `Placement window active (${daysRemaining} calendar day${daysRemaining === 1 ? "" : "s"} remaining until ${deadlineIso.slice(0, 10)}). If no qualifying selection occurs through the Day-120 cutoff, your Plan A refund entitlement vests automatically.`,
    };
  }

  // Cutoff elapsed with NO qualifying selection inside the window => refund entitlement VESTED!
  // Even if a qualifying selection occurred AFTER the Day-120 cutoff, the vested refund remains intact!
  const postCutoffSelectionNote = params.qualifyingSelectionAt
    ? " Although a subsequent job selection occurred after the Day-120 cutoff, your Plan A refund entitlement vested at cutoff and remains intact."
    : "";

  return {
    planCode: params.planCode,
    refundablePlan: true,
    assessmentPassDate: passDate.toISOString(),
    refundDeadlineDate: deadlineIso,
    daysRemainingInWindow: 0,
    qualifyingSelectionOccurred: Boolean(params.qualifyingSelectionAt),
    qualifyingSelectionDate: params.qualifyingSelectionAt,
    entitlementVestedAtCutoff: true,
    status: "eligible_for_refund",
    canRequestRefund: true,
    explanation: `120 calendar days elapsed since your verified final-assessment pass with no qualifying selection during the complete window. Your Plan A admission refund entitlement has vested.${postCutoffSelectionNote}`,
  };
}

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
