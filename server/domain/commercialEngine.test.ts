import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  assertNoMockFinancialExecutionInLiveMode,
  calculateEmployerSelectionCharge,
  calculateEmployerSubscriptionInvoice,
  calculateGstExclusiveBreakdown,
  calculateGstInclusiveBreakdown,
  calculateStudentTuitionObligation,
  evaluateAdmissionRefundLifecycle,
  getDefaultEmployerPlans,
  getDefaultStudentPlans,
  isOfficialBusinessEmail,
  resolveRuntimeMode,
} from "./commercialEngine";

describe("UdaYantu Authoritative Commercial Engine", () => {
  it("exposes Plan A (₹9,999 GST incl, 33% CTC tuition, 120d refund) & Plan B (₹5,999 GST incl, 35% CTC tuition, non-refundable)", () => {
    const plans = getDefaultStudentPlans();
    assert.equal(plans.plan_a_refundable.priceInr, 9999);
    assert.equal(plans.plan_a_refundable.isGstInclusive, true);
    assert.equal(plans.plan_a_refundable.refundable, true);
    assert.equal(plans.plan_a_refundable.refundWindowCalendarDays, 120);
    assert.equal(plans.plan_a_refundable.tuitionCtcPercent, 33);
    assert.equal(plans.plan_a_refundable.admissionAdjustedAgainstTuition, false);

    assert.equal(plans.plan_b_non_refundable.priceInr, 5999);
    assert.equal(plans.plan_b_non_refundable.isGstInclusive, true);
    assert.equal(plans.plan_b_non_refundable.refundable, false);
    assert.equal(plans.plan_b_non_refundable.refundWindowCalendarDays, null);
    assert.equal(plans.plan_b_non_refundable.tuitionCtcPercent, 35);
    assert.equal(plans.plan_b_non_refundable.admissionAdjustedAgainstTuition, false);
  });

  it("calculates exact GST-inclusive breakdown for student admission fees", () => {
    const planAGst = calculateGstInclusiveBreakdown(9999, 18);
    assert.equal(planAGst.totalPayableInr, 9999);
    assert.equal(planAGst.taxableBaseInr, 8473.73);
    assert.equal(planAGst.gstAmountInr, 1525.27);
    assert.equal(Number((planAGst.taxableBaseInr + planAGst.gstAmountInr).toFixed(2)), 9999);

    const planBGst = calculateGstInclusiveBreakdown(5999, 18);
    assert.equal(planBGst.totalPayableInr, 5999);
    assert.equal(Number((planBGst.taxableBaseInr + planBGst.gstAmountInr).toFixed(2)), 5999);
  });

  it("computes student tuition obligation without ever adjusting admission fee against tuition", () => {
    const tuitionA = calculateStudentTuitionObligation({
      planCode: "plan_a_refundable",
      agreedCtcInr: 400000,
    });
    assert.equal(tuitionA.tuitionPercent, 33);
    assert.equal(tuitionA.admissionDeductionInr, 0);
    assert.equal(tuitionA.breakdown.isGstInclusive, true);
    assert.equal(tuitionA.breakdown.totalPayableInr, 132000);

    const tuitionB = calculateStudentTuitionObligation({
      planCode: "plan_b_non_refundable",
      agreedCtcInr: 400000,
    });
    assert.equal(tuitionB.tuitionPercent, 35);
    assert.equal(tuitionB.admissionDeductionInr, 0);
    assert.equal(tuitionB.breakdown.isGstInclusive, true);
    assert.equal(tuitionB.breakdown.totalPayableInr, 140000);
  });

  it("evaluates Plan A 120-calendar-day refund clock strictly from verified pass date & rejects Plan B", () => {
    const passDate = new Date("2026-01-01T00:00:00.000Z");

    // Plan B always non-refundable
    const planB = evaluateAdmissionRefundLifecycle({
      planCode: "plan_b_non_refundable",
      finalAssessmentPassedAt: passDate.toISOString(),
      qualifyingSelectionAt: null,
      now: new Date("2026-06-01T00:00:00.000Z"),
    });
    assert.equal(planB.status, "not_applicable_plan_b");
    assert.equal(planB.canRequestRefund, false);

    // Plan A before pass
    const prePass = evaluateAdmissionRefundLifecycle({
      planCode: "plan_a_refundable",
      finalAssessmentPassedAt: null,
      qualifyingSelectionAt: null,
      now: new Date("2026-06-01T00:00:00.000Z"),
    });
    assert.equal(prePass.status, "awaiting_final_assessment_pass");
    assert.equal(prePass.canRequestRefund, false);

    // Plan A at day 119 -> still active, cannot request yet
    const day119 = new Date(passDate.getTime() + 119 * 86400_000);
    const activeWindow = evaluateAdmissionRefundLifecycle({
      planCode: "plan_a_refundable",
      finalAssessmentPassedAt: passDate.toISOString(),
      qualifyingSelectionAt: null,
      now: day119,
    });
    assert.equal(activeWindow.status, "window_active");
    assert.equal(activeWindow.canRequestRefund, false);
    assert.equal(activeWindow.daysRemainingInWindow, 1);

    // Plan A at day 121 -> eligible for refund (never shown as completed!)
    const day121 = new Date(passDate.getTime() + 121 * 86400_000);
    const eligible = evaluateAdmissionRefundLifecycle({
      planCode: "plan_a_refundable",
      finalAssessmentPassedAt: passDate.toISOString(),
      qualifyingSelectionAt: null,
      now: day121,
    });
    assert.equal(eligible.status, "eligible_for_refund");
    assert.equal(eligible.canRequestRefund, true);

    // Plan A with qualifying selection on day 60 -> non-refundable
    const day60 = new Date(passDate.getTime() + 60 * 86400_000);
    const selectedWithinWindow = evaluateAdmissionRefundLifecycle({
      planCode: "plan_a_refundable",
      finalAssessmentPassedAt: passDate.toISOString(),
      qualifyingSelectionAt: day60.toISOString(),
      now: day121,
    });
    assert.equal(selectedWithinWindow.status, "non_refundable_due_to_selection");
    assert.equal(selectedWithinWindow.canRequestRefund, false);
  });

  it("computes Employer Success-Fee (8.33% + 18% GST separately) vs Monthly Subscription (₹4,999 + 18% GST, ₹0 extra success fee)", () => {
    const empPlans = getDefaultEmployerPlans();
    assert.equal(empPlans.success_fee.successFeeCtcPercent, 8.33);
    assert.equal(empPlans.success_fee.gstAddedSeparately, true);
    assert.equal(empPlans.monthly_subscription.monthlyFeeInr, 4999);
    assert.equal(empPlans.monthly_subscription.unlimitedHiresWhileActive, true);

    const successCharge = calculateEmployerSelectionCharge({
      billingModel: "success_fee",
      agreedCtcInr: 600000,
      subscriptionActiveOnDate: false,
    });
    assert.equal(successCharge.chargeable, true);
    assert.equal(successCharge.breakdown.isGstInclusive, false);
    assert.equal(successCharge.breakdown.taxableBaseInr, 49980);
    assert.equal(successCharge.breakdown.gstAmountInr, 8996.4);
    assert.equal(successCharge.breakdown.totalPayableInr, 58976.4);

    // Active monthly subscription waives additional 8.33% fee completely
    const subCharge = calculateEmployerSelectionCharge({
      billingModel: "monthly_subscription",
      agreedCtcInr: 600000,
      subscriptionActiveOnDate: true,
    });
    assert.equal(subCharge.chargeable, false);
    assert.equal(subCharge.appliedPercent, 0);
    assert.equal(subCharge.breakdown.totalPayableInr, 0);

    const monthlyInvoice = calculateEmployerSubscriptionInvoice(4999, 18);
    assert.equal(monthlyInvoice.taxableBaseInr, 4999);
    assert.equal(monthlyInvoice.gstAmountInr, 899.82);
    assert.equal(monthlyInvoice.totalPayableInr, 5898.82);

    const excl = calculateGstExclusiveBreakdown(1000, 18);
    assert.equal(excl.totalPayableInr, 1180);
  });

  it("prohibits mock financial execution in Live Mode and enforces corporate emails for Employers", () => {
    assert.equal(resolveRuntimeMode({ APP_MODE: "live" }), "live");
    assert.equal(resolveRuntimeMode({ NODE_ENV: "production" }), "live");
    assert.equal(resolveRuntimeMode({ NODE_ENV: "development" }), "sandbox");

    assert.throws(
      () => assertNoMockFinancialExecutionInLiveMode("live", true),
      /SECURITY_VIOLATION/
    );
    assert.doesNotThrow(() => assertNoMockFinancialExecutionInLiveMode("sandbox", true));

    assert.equal(isOfficialBusinessEmail("founder@gmail.com").valid, false);
    assert.equal(isOfficialBusinessEmail("hr@yahoo.co.in").valid, false);
    assert.equal(isOfficialBusinessEmail("talent@outlook.com").valid, false);
    assert.equal(isOfficialBusinessEmail("hiring@acmecorp.in").valid, true);
  });

  it("enforces exact integer paise math, zero raw BigInt in JSON, and Day-120 vested refund preservation", () => {
    const planAGst = calculateGstInclusiveBreakdown(9999);
    assert.equal(planAGst.totalPayablePaise, "999900");
    assert.equal(planAGst.taxableBasePaise, "847373");
    assert.equal(planAGst.gstAmountPaise, "152527");
    assert.equal(BigInt(planAGst.taxableBasePaise) + BigInt(planAGst.gstAmountPaise), 999900n);
    assert.doesNotThrow(() => JSON.stringify(planAGst));

    const passDate = new Date("2026-01-01T00:00:00.000Z");
    const exactDay120 = new Date(passDate.getTime() + 120 * 86400_000);
    const day121 = new Date(passDate.getTime() + 121 * 86400_000);
    const day125 = new Date(passDate.getTime() + 125 * 86400_000);

    // At exact Day-120 cutoff timestamp (now === deadline), window is still active
    const atCutoff = evaluateAdmissionRefundLifecycle({
      planCode: "plan_a_refundable",
      finalAssessmentPassedAt: passDate.toISOString(),
      qualifyingSelectionAt: null,
      now: exactDay120,
    });
    assert.equal(atCutoff.status, "window_active");
    assert.equal(atCutoff.canRequestRefund, false);

    // Selection ON exact Day-120 cutoff -> non-refundable
    const selectedOnCutoff = evaluateAdmissionRefundLifecycle({
      planCode: "plan_a_refundable",
      finalAssessmentPassedAt: passDate.toISOString(),
      qualifyingSelectionAt: exactDay120.toISOString(),
      now: day121,
    });
    assert.equal(selectedOnCutoff.status, "non_refundable_due_to_selection");
    assert.equal(selectedOnCutoff.entitlementVestedAtCutoff, false);

    // Selection AFTER Day-120 cutoff (Day 125) MUST NOT erase vested refund entitlement!
    const selectedAfterCutoff = evaluateAdmissionRefundLifecycle({
      planCode: "plan_a_refundable",
      finalAssessmentPassedAt: passDate.toISOString(),
      qualifyingSelectionAt: day125.toISOString(),
      now: day125,
    });
    assert.equal(selectedAfterCutoff.status, "eligible_for_refund");
    assert.equal(selectedAfterCutoff.entitlementVestedAtCutoff, true);
    assert.equal(selectedAfterCutoff.canRequestRefund, true);
  });

  it("blocks silent fallback to Plan A 8.33% when Employer subscription is past_due or expired unless explicit agreement accepted", () => {
    assert.throws(
      () =>
        calculateEmployerSelectionCharge({
          billingModel: "monthly_subscription",
          agreedCtcInr: 600000,
          subscriptionActiveOnDate: false,
          subscriptionStatus: "past_due",
        }),
      /SUBSCRIPTION_INACTIVE_NO_SILENT_FALLBACK/
    );

    assert.throws(
      () =>
        calculateEmployerSelectionCharge({
          billingModel: "monthly_subscription",
          agreedCtcInr: 600000,
          subscriptionActiveOnDate: false,
          subscriptionStatus: "expired",
          explicitPlanAFallbackAgreementAccepted: false,
        }),
      /SUBSCRIPTION_INACTIVE_NO_SILENT_FALLBACK/
    );

    // Only when explicit Plan A commercial fallback agreement is accepted does Plan A apply
    const explicitFallback = calculateEmployerSelectionCharge({
      billingModel: "monthly_subscription",
      agreedCtcInr: 600000,
      subscriptionActiveOnDate: false,
      subscriptionStatus: "expired",
      explicitPlanAFallbackAgreementAccepted: true,
    });
    assert.equal(explicitFallback.chargeable, true);
    assert.equal(explicitFallback.appliedPercent, 8.33);
    assert.equal(explicitFallback.breakdown.totalPayablePaise, "5897640");
  });

  it("enforces CA tax rule & commercial decision register governance gate in Live Mode", async () => {
    const mod = await import("./commercialEngine");
    const taxRules = mod.getDefaultTaxRules();
    const decisions = mod.getDefaultCommercialDecisionRegister();

    assert.equal(decisions.length, 7);
    assert.equal(taxRules.student_training_admission.approvalStatus, "PENDING_ACCOUNTANT_REVIEW");

    // Sandbox allows controlled testing
    assert.doesNotThrow(() =>
      mod.assertLiveBillingGovernanceApproved({
        mode: "sandbox",
        taxRule: taxRules.student_training_admission,
        decisions,
      })
    );

    // Live Mode blocks unapproved tax rule
    assert.throws(
      () =>
        mod.assertLiveBillingGovernanceApproved({
          mode: "live",
          taxRule: taxRules.student_training_admission,
          decisions,
        }),
      /LIVE_INVOICING_BLOCKED_TAX_UNAPPROVED/
    );

    // Live Mode blocks pending commercial decisions even after CA approves tax rule
    const approvedTaxRule = {
      ...taxRules.student_training_admission,
      approvalStatus: "APPROVED_FOR_LIVE_INVOICING" as const,
      reviewedByCaName: "CA Rajesh Kulkarni, FCA",
      reviewedAt: new Date().toISOString(),
    };
    assert.throws(
      () =>
        mod.assertLiveBillingGovernanceApproved({
          mode: "live",
          taxRule: approvedTaxRule,
          decisions,
        }),
      /LIVE_BILLING_BLOCKED_DECISIONS_PENDING/
    );

    // Live Mode permits billing once both CA tax rule and all blocking decisions are approved
    const approvedDecisions = decisions.map((d) => ({
      ...d,
      status: "APPROVED" as const,
      approvedBy: "Founder + CA",
      approvedAt: new Date().toISOString(),
    }));
    assert.doesNotThrow(() =>
      mod.assertLiveBillingGovernanceApproved({
        mode: "live",
        taxRule: approvedTaxRule,
        decisions: approvedDecisions,
      })
    );
  });
});
