import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { UdaYantuPlatformService, PlatformError } from "./platformService";
import { DEFAULT_FINAL_QUESTION_BANK } from "../domain/finalAssessmentEngine";

async function registerAndVerifyStudent(
  service: UdaYantuPlatformService,
  opts: { email: string; phone10: string; fullName: string; anonToken?: string }
) {
  const otpRes = await service.requestIndianPhoneOtp(opts.phone10);
  assert.ok(otpRes.sandboxOtpHint, "Sandbox OTP should be returned in test mode");
  const reg = await service.registerStudent({
    fullName: opts.fullName,
    email: opts.email,
    phone10: opts.phone10,
    otpCode: otpRes.sandboxOtpHint!,
    password: "StrongPassword#2026",
    anonymousAssessmentToken: opts.anonToken,
  });
  return reg;
}

async function enrollStudent(
  service: UdaYantuPlatformService,
  studentId: string,
  courseId: string,
  planCode: "plan_a_refundable" | "plan_b_non_refundable"
) {
  const plans = service.getPublicCommercialPlans();
  const plan = plans.studentPlans.find((p) => p.code === planCode)!;
  const initiated = await service.initiateStudentAdmissionPayment({
    studentUserId: studentId,
    courseId,
    planCode,
    acceptedAgreement: true,
    acceptedAgreementVersion: plan.agreementVersion,
  });
  assert.ok(initiated.sandboxCheckoutHelper);
  const verified = service.verifyStudentAdmissionPayment({
    studentUserId: studentId,
    orderId: initiated.order.orderId,
    paymentId: initiated.sandboxCheckoutHelper!.paymentId,
    signature: initiated.sandboxCheckoutHelper!.signature,
  });
  return { initiated, verified };
}

function completeCoursework(service: UdaYantuPlatformService, studentId: string) {
  const dash = service.getStudentDashboard(studentId);
  assert.ok(dash.course);
  for (const mod of dash.course!.modules) {
    service.completeStudentModule(studentId, mod.id);
  }
  for (const asg of dash.course!.assignments) {
    service.submitStudentAssignment(studentId, asg.id, "Completed structured case study submission.");
  }
}

function buildFinalExamAnswers(targetCorrectCount: number): Record<string, string> {
  const answers: Record<string, string> = {};
  DEFAULT_FINAL_QUESTION_BANK.forEach((q, idx) => {
    if (idx < targetCorrectCount) {
      answers[q.id] = q.correctOptionId;
    } else {
      const wrongOpt = q.options.find((o) => o.id !== q.correctOptionId)!;
      answers[q.id] = wrongOpt.id;
    }
  });
  return answers;
}

describe("RCA-2 Adversarial Edge Cases & Full Lifecycle Integration Tests", () => {
  it("1. Anonymous pre-login psychometric assessment -> 20% preview -> registration claims full 100% report without data loss", async () => {
    const service = new UdaYantuPlatformService({ env: { NODE_ENV: "test" } });
    const started = service.startAnonymousAssessment({ utmSource: "instagram", utmCampaign: "grad-2026" });
    const answers: Record<string, string> = {};
    for (const q of started.questions) {
      answers[q.id] = q.options[1]?.id ?? q.options[0].id;
    }
    service.saveAnonymousAssessmentProgress(started.sessionToken, answers);
    const submitted = service.submitAnonymousAssessment(started.sessionToken, answers);
    assert.equal(submitted.preview.previewSharePercent, 20);
    assert.equal("fullReport" in submitted, false, "Full report must NOT leak before login");

    // Duplicate submission prevented idempotently
    const duplicateRes = service.submitAnonymousAssessment(started.sessionToken, answers);
    assert.equal(duplicateRes.duplicatePrevented, true);
    assert.deepEqual(duplicateRes.preview, submitted.preview);

    const reg = await registerAndVerifyStudent(service, {
      fullName: "Meera Nair",
      email: "meera.nair@example.org",
      phone10: "9811111111",
      anonToken: started.sessionToken,
    });
    assert.ok(reg.claimedReport, "Full report must be seamlessly recovered upon registration");
    assert.equal(reg.claimedReport!.topTracks.length, 3);
    assert.equal(
      reg.claimedReport!.topTracks[0].trackId,
      submitted.preview.primaryTrack.trackId
    );
  });

  it("2-4. Duplicate enrollment prevention, agreement gate, and locked enrollment price when Admin updates plan later", async () => {
    const service = new UdaYantuPlatformService({ env: { NODE_ENV: "test" } });
    const reg = await registerAndVerifyStudent(service, {
      fullName: "Karan Verma",
      email: "karan.verma@example.org",
      phone10: "9822222222",
    });

    // Reject payment without agreement acceptance
    await assert.rejects(
      () =>
        service.initiateStudentAdmissionPayment({
          studentUserId: reg.user.id,
          courseId: "course-business-development",
          planCode: "plan_a_refundable",
          acceptedAgreement: false,
          acceptedAgreementVersion: "STU-PLAN-A-2026.1",
        }),
      (err: unknown) => err instanceof PlatformError && err.code === "AGREEMENT_REQUIRED"
    );

    await enrollStudent(service, reg.user.id, "course-business-development", "plan_a_refundable");

    // Duplicate enrollment blocked
    await assert.rejects(
      () =>
        service.initiateStudentAdmissionPayment({
          studentUserId: reg.user.id,
          courseId: "course-business-development",
          planCode: "plan_a_refundable",
          acceptedAgreement: true,
          acceptedAgreementVersion: "STU-PLAN-A-2026.1",
        }),
      (err: unknown) => err instanceof PlatformError && err.code === "DUPLICATE_ENROLLMENT"
    );

    // Admin updates Plan A price to ₹12,999 after student enrolled -> student keeps locked ₹9,999!
    const adminId = "00000000-0000-4000-8000-000000000001";
    service.adminUpdateStudentPlanPricing(adminId, "plan_a_refundable", {
      priceInr: 12999,
      agreementVersion: "STU-PLAN-A-2026.2",
    });

    const dash = service.getStudentDashboard(reg.user.id);
    assert.equal(dash.enrollment?.lockedAdmissionFeeInr, 9999);
    assert.equal(dash.enrollment?.acceptedAgreementVersion, "STU-PLAN-A-2026.1");
    assert.equal(
      service.getPublicCommercialPlans().studentPlans.find((p) => p.code === "plan_a_refundable")?.priceInr,
      12999
    );
  });

  it("5-7. Final Assessment security: zero answer keys in client payload, 74% fails, 75% passes, repeated submission blocked post-qualification", async () => {
    const service = new UdaYantuPlatformService({ env: { NODE_ENV: "test" } });
    const reg = await registerAndVerifyStudent(service, {
      fullName: "Sneha Iyer",
      email: "sneha.iyer@example.org",
      phone10: "9833333333",
    });
    await enrollStudent(service, reg.user.id, "course-customer-success", "plan_a_refundable");
    completeCoursework(service, reg.user.id);

    const payload = service.getFinalAssessmentQuestionsForStudent(reg.user.id);
    assert.equal(payload.questions.length, DEFAULT_FINAL_QUESTION_BANK.length);
    for (const q of payload.questions) {
      assert.equal("correctOptionId" in q, false, "Answer keys must NEVER leave server");
    }

    // 70% (<75%) -> fails (exact 74% fails vs 75% passes also verified below)
    const totalQ = DEFAULT_FINAL_QUESTION_BANK.length;
    const below75Count = Math.floor(totalQ * 0.74);
    const atLeast75Count = Math.ceil(totalQ * 0.75);

    const failAttempt = service.submitFinalAssessment(reg.user.id, buildFinalExamAnswers(below75Count));
    assert.equal(failAttempt.result.meetsScoreThreshold, false);
    assert.equal(failAttempt.result.qualified, false);

    const passAttempt = service.submitFinalAssessment(reg.user.id, buildFinalExamAnswers(atLeast75Count));
    assert.ok(passAttempt.result.overallScorePercent >= 75);
    assert.equal(passAttempt.result.meetsScoreThreshold, true);
    assert.equal(passAttempt.result.qualified, true);

    // Repeated submission blocked once verified qualified
    assert.throws(
      () => service.submitFinalAssessment(reg.user.id, buildFinalExamAnswers(12)),
      (err: unknown) => err instanceof PlatformError && err.code === "ALREADY_QUALIFIED"
    );
  });

  it("8-9. Refund timing before/after 120-day deadline (Plan A) and strict Plan B refund rejection", async () => {
    const service = new UdaYantuPlatformService({ env: { NODE_ENV: "test" } });

    // Student A on Plan A
    const stuA = await registerAndVerifyStudent(service, {
      fullName: "Ritu Sharma",
      email: "ritu.sharma@example.org",
      phone10: "9844444444",
    });
    await enrollStudent(service, stuA.user.id, "course-human-resources", "plan_a_refundable");
    completeCoursework(service, stuA.user.id);
    const passTime = new Date("2026-01-10T00:00:00.000Z");
    service.submitFinalAssessment(stuA.user.id, buildFinalExamAnswers(10), passTime);

    // Day 119 -> cannot request refund
    const day119 = new Date(passTime.getTime() + 119 * 86400_000);
    assert.throws(
      () => service.requestAdmissionRefund(stuA.user.id, "Requesting early", day119),
      (err: unknown) => err instanceof PlatformError && err.code === "REFUND_NOT_ELIGIBLE"
    );

    // Day 121 -> eligible, request succeeds and status is 'requested' (NOT 'completed')
    const day121 = new Date(passTime.getTime() + 121 * 86400_000);
    const refundReq = service.requestAdmissionRefund(
      stuA.user.id,
      "120 days completed without qualifying selection",
      day121
    );
    assert.equal(refundReq.status, "requested");
    assert.equal(refundReq.amountInr, 9999);
    const dashA = service.getStudentDashboard(stuA.user.id, day121);
    assert.equal(dashA.refundLifecycle?.status, "refund_requested");

    // Student B on Plan B
    const stuB = await registerAndVerifyStudent(service, {
      fullName: "Nikhil Joshi",
      email: "nikhil.joshi@example.org",
      phone10: "9855555555",
    });
    await enrollStudent(service, stuB.user.id, "course-human-resources", "plan_b_non_refundable");
    completeCoursework(service, stuB.user.id);
    service.submitFinalAssessment(stuB.user.id, buildFinalExamAnswers(10), passTime);
    assert.throws(
      () => service.requestAdmissionRefund(stuB.user.id, "Want refund on Plan B", day121),
      (err: unknown) => err instanceof PlatformError && err.code === "PLAN_B_NON_REFUNDABLE"
    );
  });

  it("10-14. Employer approval gate, immediate consent revocation, single authoritative selection event, duplicate offer protection, and active monthly subscription ₹0 success-fee waiver", async () => {
    const service = new UdaYantuPlatformService({ env: { NODE_ENV: "test" } });
    const adminId = "00000000-0000-4000-8000-000000000001";

    // Block consumer email for Employer registration
    await assert.rejects(
      () =>
        service.registerEmployer({
          fullName: "Fake HR",
          officialEmail: "fakehr@gmail.com",
          password: "Password#2026",
          companyName: "Gmail Corp",
          registrationId: "U12345",
          industry: "Tech",
          city: "Pune",
          billingModel: "success_fee",
        }),
      (err: unknown) => err instanceof PlatformError && err.code === "INVALID_BUSINESS_EMAIL"
    );

    // Register real Employer -> pending Admin approval
    const emp = await service.registerEmployer({
      fullName: "Vikram Malhotra",
      officialEmail: "talent@induslogistics.in",
      password: "EmployerPass#2026",
      companyName: "Indus Logistics Pvt Ltd",
      registrationId: "U63000MH2020PTC334455",
      industry: "Supply Chain & Operations",
      city: "Mumbai",
      billingModel: "success_fee",
    });

    // Unapproved employer MUST NOT access candidate discovery
    assert.throws(
      () => service.searchEligibleConsentedCandidates(emp.user.id),
      (err: unknown) => err instanceof PlatformError && err.code === "EMPLOYER_NOT_APPROVED"
    );

    // Admin approves employer
    service.adminApproveEmployer(adminId, emp.employer.id, "approve", "CIN & domain verified");

    // Register, enroll (Plan A), qualify (>=75%) a fresh student
    const stu = await registerAndVerifyStudent(service, {
      fullName: "Divya Menon",
      email: "divya.menon@example.org",
      phone10: "9866666666",
    });
    await enrollStudent(service, stu.user.id, "course-operations-management", "plan_a_refundable");
    completeCoursework(service, stu.user.id);
    service.submitFinalAssessment(stu.user.id, buildFinalExamAnswers(11));

    // Before consent -> hidden from employer
    const beforeConsent = service.searchEligibleConsentedCandidates(emp.user.id);
    assert.equal(beforeConsent.some((c) => c.studentUserId === stu.user.id), false);

    // Grant consent -> immediately visible
    service.updateStudentRecruitmentConsent(stu.user.id, true);
    const afterConsent = service.searchEligibleConsentedCandidates(emp.user.id);
    assert.equal(afterConsent.some((c) => c.studentUserId === stu.user.id), true);

    // Revoke consent -> immediately hidden!
    service.updateStudentRecruitmentConsent(stu.user.id, false);
    const afterRevoke = service.searchEligibleConsentedCandidates(emp.user.id);
    assert.equal(afterRevoke.some((c) => c.studentUserId === stu.user.id), false);

    // Re-grant consent to proceed with hiring lifecycle
    service.updateStudentRecruitmentConsent(stu.user.id, true);

    // Switch employer to Monthly Subscription (₹4,999 + 18% GST) so qualifying selection incurs ₹0 additional 8.33% fee!
    const subSelection = service.selectEmployerBillingPlan(emp.user.id, "monthly_subscription");
    assert.equal(subSelection.subscriptionInvoice?.breakdown.totalPayableInr, 5898.82);

    const job = service.createEmployerJob(emp.user.id, {
      title: "Operations Associate",
      careerTrackId: "operations-management",
      location: "Mumbai",
      minCtcInr: 420000,
      maxCtcInr: 520000,
      openings: 3,
      publishNow: true,
    });

    // Shortlist & Interview NEVER generate tuition fees
    service.shortlistCandidate(emp.user.id, job.id, stu.user.id);
    service.scheduleInterview(emp.user.id, {
      jobId: job.id,
      studentUserId: stu.user.id,
      scheduledAt: new Date(Date.now() + 86400_000).toISOString(),
      mode: "Zoom",
      meetingLink: "https://zoom.us/j/123456789",
    });
    assert.equal(service.getStudentDashboard(stu.user.id).tuitionObligation, null);

    // Issue two offers; student accepts Offer 1 -> single tuition obligation (33% of 5L = ₹1,65,000 GST incl, ₹0 admission deduction) & ₹0 employer success fee (waived by active subscription)
    const offer1 = service.issueWrittenOffer(emp.user.id, {
      jobId: job.id,
      studentUserId: stu.user.id,
      roleTitle: "Operations Associate",
      agreedCtcInr: 500000,
      joiningDate: "2026-12-15",
    });
    const offer2 = service.issueWrittenOffer(emp.user.id, {
      jobId: job.id,
      studentUserId: stu.user.id,
      roleTitle: "Senior Operations Associate",
      agreedCtcInr: 600000,
      joiningDate: "2026-12-20",
    });

    const accepted = service.acceptWrittenOfferByStudent(stu.user.id, offer1.id);
    assert.equal(accepted.tuitionObligation.tuitionPercent, 33);
    assert.equal(accepted.tuitionObligation.admissionDeductionInr, 0);
    assert.equal(accepted.tuitionObligation.breakdown.totalPayableInr, 165000);
    assert.equal(accepted.employerInvoice.status, "waived_by_subscription");
    assert.equal(accepted.employerInvoice.breakdown.totalPayableInr, 0);

    // Plan A admission fee is now non-refundable due to qualifying selection!
    const dashPostOffer = service.getStudentDashboard(stu.user.id);
    assert.equal(dashPostOffer.refundLifecycle?.status, "non_refundable_due_to_selection");

    // Re-accepting the SAME offer is blocked (409 OFFER_ALREADY_PROCESSED)
    assert.throws(
      () => service.acceptWrittenOfferByStudent(stu.user.id, offer1.id),
      (err: unknown) => err instanceof PlatformError && err.code === "OFFER_ALREADY_PROCESSED"
    );

    // Accepting a second offer NEVER generates a duplicate student tuition charge (idempotent first-offer policy)
    const acceptedSecond = service.acceptWrittenOfferByStudent(stu.user.id, offer2.id);
    assert.equal(acceptedSecond.tuitionCreatedNow, false);
    assert.equal(acceptedSecond.tuitionObligation.id, accepted.tuitionObligation.id);
    assert.equal(acceptedSecond.tuitionObligation.offerId, offer1.id);
    assert.equal(acceptedSecond.tuitionObligation.breakdown.totalPayableInr, 165000);
  });

  it("15-16. Cohort disabling preserves student records in read-only mode, webhook idempotency, and redacted activity/audit logs", async () => {
    const webhookSecret = "whsec_test_999";
    const service = new UdaYantuPlatformService({
      env: { NODE_ENV: "test", RAZORPAY_WEBHOOK_SECRET: webhookSecret },
    });
    const adminId = "00000000-0000-4000-8000-000000000001";

    const stu = await registerAndVerifyStudent(service, {
      fullName: "Arjun Patel",
      email: "arjun.patel@example.org",
      phone10: "9877777777",
    });
    const plans = service.getPublicCommercialPlans();
    const planA = plans.studentPlans.find((p) => p.code === "plan_a_refundable")!;
    const init = await service.initiateStudentAdmissionPayment({
      studentUserId: stu.user.id,
      courseId: "course-project-management",
      planCode: "plan_a_refundable",
      acceptedAgreement: true,
      acceptedAgreementVersion: planA.agreementVersion,
    });

    // Deliver same Razorpay webhook TWICE -> second call is strictly idempotent
    const rawWebhook = JSON.stringify({
      id: "evt_rzp_duplicate_test_1",
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_rzp_real_001",
            order_id: init.order.orderId,
          },
        },
      },
    });
    const sig = crypto.createHmac("sha256", webhookSecret).update(rawWebhook).digest("hex");

    const first = service.handleRazorpayWebhook(rawWebhook, sig);
    assert.equal(first.idempotent, false);
    assert.ok(first.invoiceNumber);

    const second = service.handleRazorpayWebhook(rawWebhook, sig);
    assert.equal(second.idempotent, true);
    assert.equal(second.invoiceNumber, first.invoiceNumber);

    // Admin disables cohort -> enrollment is preserved with explicit read-only accessNotice
    const cohortId = "cohort-project-management-q4";
    service.adminSetCohortStatus(adminId, cohortId, "disabled");
    const dash = service.getStudentDashboard(stu.user.id);
    assert.ok(dash.enrollment, "Student enrollment must never be deleted when cohort is disabled");
    assert.match(dash.enrollment!.accessNotice ?? "", /read-only/i);

    // Central Activity Feed & Append-Only Audit Logs are populated and never leak secrets
    const feed = service.getAdminActivityFeed(adminId, { studentId: stu.user.id, limit: 50 });
    assert.ok(feed.data.length >= 3);
    const auditLogs = service.getAdminAuditLogs(adminId);
    assert.ok(auditLogs.length >= 2);
    const serializedAudit = JSON.stringify(auditLogs);
    assert.equal(serializedAudit.includes("StrongPassword#2026"), false);
  });

  it("17. Exact 74% fails and 75% passes boundary test (100-question calibrated bank)", async () => {
    const { evaluateFinalAssessmentSubmission } = await import("../domain/finalAssessmentEngine");
    const questions = Array.from({ length: 100 }, (_, i) => ({
      id: `q-${i + 1}`,
      sectionId: "domain_knowledge" as const,
      sectionTitle: "Domain Knowledge",
      trackId: "all" as const,
      prompt: `Question ${i + 1}`,
      options: [
        { id: "a", label: "Correct" },
        { id: "b", label: "Wrong" },
      ],
      correctOptionId: "a",
      weight: 1,
    }));

    const buildAnswers = (correct: number) =>
      Object.fromEntries(questions.map((q, idx) => [q.id, idx < correct ? "a" : "b"]));

    const res74 = evaluateFinalAssessmentSubmission({
      questions,
      answers: buildAnswers(74),
      mandatoryCourseworkComplete: true,
      passingThresholdPercent: 75,
    });
    assert.equal(res74.overallScorePercent, 74);
    assert.equal(res74.meetsScoreThreshold, false);
    assert.equal(res74.qualified, false);

    const res75 = evaluateFinalAssessmentSubmission({
      questions,
      answers: buildAnswers(75),
      mandatoryCourseworkComplete: true,
      passingThresholdPercent: 75,
    });
    assert.equal(res75.overallScorePercent, 75);
    assert.equal(res75.meetsScoreThreshold, true);
    assert.equal(res75.qualified, true);
  });

  it("18-21. Employer suspension blocks recruitment immediately, past-due subscription blocks silent fallback, CTC amendment recalculates obligations, course archive preserves enrollments, and separate Student/Employer exact-paise ledgers reconcile", async () => {
    const service = new UdaYantuPlatformService({ env: { NODE_ENV: "test" } });
    const adminId = "00000000-0000-4000-8000-000000000001";

    const emp = await service.registerEmployer({
      fullName: "Rohan Mehta",
      officialEmail: "hr@sahyadrisystems.in",
      password: "EmployerPass#2026",
      companyName: "Sahyadri Systems Pvt Ltd",
      registrationId: "U72200PN2022PTC209911",
      industry: "Enterprise Tech",
      city: "Pune",
      billingModel: "success_fee",
    });
    service.adminApproveEmployer(adminId, emp.employer.id, "approve", "KYC verified");

    const stu = await registerAndVerifyStudent(service, {
      fullName: "Anjali Rao",
      email: "anjali.rao@example.org",
      phone10: "9888888888",
    });
    await enrollStudent(service, stu.user.id, "course-product-management", "plan_a_refundable");
    completeCoursework(service, stu.user.id);
    service.submitFinalAssessment(stu.user.id, buildFinalExamAnswers(11));

    // Grant -> Revoke -> Grant consent and assert consentHistory records every state change
    service.updateStudentRecruitmentConsent(stu.user.id, true);
    service.updateStudentRecruitmentConsent(stu.user.id, false);
    service.updateStudentRecruitmentConsent(stu.user.id, true);
    const consentHist = service.getConsentHistoryForStudent(stu.user.id);
    assert.equal(consentHist.length, 3);
    assert.deepEqual(
      consentHist.map((h) => h.action),
      ["granted", "revoked", "granted"]
    );

    const job = service.createEmployerJob(emp.user.id, {
      title: "Associate Product Analyst",
      careerTrackId: "product-management",
      location: "Pune",
      minCtcInr: 450000,
      maxCtcInr: 600000,
      openings: 2,
      publishNow: true,
    });
    const shortlist = service.shortlistCandidate(emp.user.id, job.id, stu.user.id);
    const updatedApp = service.updateApplicationStage(emp.user.id, shortlist.id, "interviewing");
    assert.equal(updatedApp.stage, "interviewing");

    // Suspend employer -> immediately blocked from discovery & issuing offers
    service.adminApproveEmployer(adminId, emp.employer.id, "suspend", "Compliance review");
    assert.throws(
      () => service.searchEligibleConsentedCandidates(emp.user.id),
      (err: unknown) => err instanceof PlatformError && err.code === "EMPLOYER_NOT_APPROVED"
    );
    assert.throws(
      () =>
        service.issueWrittenOffer(emp.user.id, {
          jobId: job.id,
          studentUserId: stu.user.id,
          roleTitle: "Associate Product Analyst",
          agreedCtcInr: 500000,
          joiningDate: "2027-01-10",
        }),
      (err: unknown) => err instanceof PlatformError && err.code === "EMPLOYER_NOT_APPROVED"
    );

    // Re-approve employer
    service.adminApproveEmployer(adminId, emp.employer.id, "approve", "Compliance cleared");

    // Switch to monthly subscription, then mark past_due -> offer acceptance MUST fail (NO silent fallback to 8.33%!)
    service.selectEmployerBillingPlan(emp.user.id, "monthly_subscription");
    const offer = service.issueWrittenOffer(emp.user.id, {
      jobId: job.id,
      studentUserId: stu.user.id,
      roleTitle: "Associate Product Analyst",
      agreedCtcInr: 500000,
      joiningDate: "2027-01-10",
    });

    service.adminSetEmployerSubscriptionStatus(adminId, emp.employer.id, "past_due", false);
    assert.throws(
      () => service.acceptWrittenOfferByStudent(stu.user.id, offer.id),
      (err: unknown) => err instanceof PlatformError && err.code === "SUBSCRIPTION_INACTIVE_NO_SILENT_FALLBACK"
    );
    // Offer must have rolled back cleanly to 'issued'
    assert.equal(service.getStudentDashboard(stu.user.id).offers[0].status, "issued");

    // Switch explicitly back to success_fee plan and accept offer
    service.selectEmployerBillingPlan(emp.user.id, "success_fee");
    const accepted = service.acceptWrittenOfferByStudent(stu.user.id, offer.id);
    assert.equal(accepted.tuitionObligation.breakdown.totalPayablePaise, "16500000"); // ₹1,65,000.00
    assert.equal(accepted.employerInvoice.breakdown.taxableBasePaise, "4165000"); // 8.33% of 5L = ₹41,650.00

    // Amend CTC from ₹5,00,000 -> ₹6,00,000 fixed + ₹50,000 discretionary bonus -> tuition & employer invoice recalculate on ₹6,00,000 fixed fee base!
    const amended = service.amendOfferCtc(emp.user.id, offer.id, {
      fixedAnnualCtcInr: 600000,
      variableComponentInr: 50000,
      reason: "Revised fixed CTC per final compensation letter",
    });
    assert.equal(amended.snapshot.versionNumber, 2);
    assert.equal(amended.ctcHistory.length, 2);
    assert.equal(amended.updatedTuition?.breakdown.totalPayablePaise, "19800000"); // 33% of 6L = ₹1,98,000.00
    assert.equal(amended.updatedEmployerInvoice?.breakdown.taxableBasePaise, "4998000"); // 8.33% of 6L = ₹49,980.00

    // Course disable -> reactivate -> archive preserves existing enrollment safely
    service.adminSetCourseStatus(adminId, "course-product-management", "disabled");
    assert.match(service.getStudentDashboard(stu.user.id).enrollment?.accessNotice ?? "", /read-only/i);
    service.adminSetCourseStatus(adminId, "course-product-management", "published");
    assert.equal(service.getStudentDashboard(stu.user.id).enrollment?.accessNotice, null);
    service.adminSetCourseStatus(adminId, "course-product-management", "archived");
    assert.ok(service.getStudentDashboard(stu.user.id).enrollment);

    // Separate Student & Employer Financial Ledgers reconcile in exact paise
    const ledger = service.getAdminFinancialLedgerSummary(adminId);
    assert.equal(ledger.studentLedger.cashCollected.paise, "999900");
    assert.equal(ledger.studentLedger.tuitionObligated.paise, "19800000");
    assert.equal(ledger.employerLedger.earnedSuccessFees.paise, "5897640"); // 49980 + 18% GST = 58976.40
    assert.equal(ledger.employerLedger.subscriptionBilled.paise, "589882"); // 4999 + 18% GST = 5898.82

    // GTM Analytics & Outbox processing
    const gtm = service.getAdminGtmAnalytics(adminId);
    assert.ok(gtm.employerFunnel.offersAccepted >= 1);
    const outboxRes = await service.processOutbox(adminId);
    assert.ok(outboxRes.delivered >= 1);
  });
});
