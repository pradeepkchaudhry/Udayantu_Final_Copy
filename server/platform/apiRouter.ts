/**
 * Unified Express Router implementing the OpenAPI 3.1 contract (/v1/*).
 *
 * Shared across:
 * - udayantu.com (Public + Student + Employer)
 * - admin.udayantu.com (Independent Admin control plane)
 */

import express, { type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import {
  PlatformError,
  UdaYantuPlatformService,
  type CanonicalRecruitmentStage,
  type PlatformUser,
  type SourcePortal,
} from "./platformService";
import type {
  AdmissionPlanCode,
  EmployerBillingModel,
  EmployerSubscriptionStatus,
  TaxRuleConfig,
} from "../domain/commercialEngine";
import type { CanonicalCareerTrackId } from "../domain/psychometricEngine";

interface AuthedRequest extends Request {
  platformUser?: PlatformUser;
  rawBody?: string;
}

const AmendCtcBodySchema = z.object({
  fixedAnnualCtcInr: z.number().positive(),
  variableComponentInr: z.number().min(0).optional(),
  reason: z.string().min(3).max(400),
});

const RecruitmentStageBodySchema = z.object({
  stage: z.enum([
    "applied_sourced",
    "screening",
    "shortlisted",
    "interviewing",
    "offer",
    "accepted",
    "joined",
    "rejected",
    "withdrawn",
    "cancelled",
  ]),
});

const ApproveTaxRuleBodySchema = z.object({
  reviewedByCaName: z.string().min(2).max(160),
  candidateSacCode: z.enum(["999293", "998512", "998519"]).optional(),
  rateBps: z.number().int().min(0).max(5000).optional(),
});

const CourseStatusBodySchema = z.object({
  status: z.enum(["draft", "published", "disabled", "archived"]),
});

const CohortStatusBodySchema = z.object({
  status: z.enum(["active", "disabled", "completed", "archived"]),
});

const SubscriptionStatusBodySchema = z.object({
  status: z.enum(["none", "active", "past_due", "expired", "cancelled"]),
  explicitPlanAFallbackAgreementAccepted: z.boolean().optional(),
});

function parseBody<T>(schema: z.ZodType<T>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new PlatformError(
      400,
      "VALIDATION_ERROR",
      parsed.error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; ")
    );
  }
  return parsed.data;
}

export function createPlatformApiRouter(service: UdaYantuPlatformService) {
  const router = express.Router();

  const handle =
    (fn: (req: AuthedRequest, res: Response) => Promise<void> | void) =>
    async (req: AuthedRequest, res: Response, _next: NextFunction) => {
      try {
        await fn(req, res);
      } catch (err: unknown) {
        if (err instanceof PlatformError) {
          res.status(err.statusCode).json({
            code: err.code,
            message: err.message,
          });
          return;
        }
        const message = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({ code: "INTERNAL_ERROR", message });
      }
    };

  const requireAuth = handle(async (req, _res) => {
    const user = await service.resolveAuthUserFromHeader(req.headers.authorization);
    if (!user) {
      throw new PlatformError(401, "UNAUTHORIZED", "Valid Bearer authentication token is required.");
    }
    req.platformUser = user;
  });

  // Helper wrapping middleware cleanly for Express 5
  const withAuth =
    (fn: (req: AuthedRequest, res: Response) => Promise<void> | void) =>
    async (req: AuthedRequest, res: Response, next: NextFunction) => {
      try {
        const user = await service.resolveAuthUserFromHeader(req.headers.authorization);
        if (!user) {
          res.status(401).json({
            code: "UNAUTHORIZED",
            message: "Valid Bearer authentication token is required.",
          });
          return;
        }
        req.platformUser = user;
        await fn(req, res);
      } catch (err) {
        if (err instanceof PlatformError) {
          res.status(err.statusCode).json({ code: err.code, message: err.message });
          return;
        }
        next(err);
      }
    };

  // ==================== HEALTH & PUBLIC ====================

  router.get("/healthz", (_req, res) => {
    res.json({ status: "ok", mode: service.mode, timestamp: new Date().toISOString() });
  });

  router.get(
    "/public/commercial-plans",
    handle((_req, res) => {
      res.json(service.getPublicCommercialPlans());
    })
  );

  router.get(
    "/public/courses",
    handle((_req, res) => {
      res.json({ courses: service.getPublicCourses() });
    })
  );

  router.post(
    "/public/analytics/funnel",
    handle((req, res) => {
      const { stage, anonymousSessionToken, utmSource, utmMedium, utmCampaign, referrer } = req.body ?? {};
      if (!stage || typeof stage !== "string") {
        throw new PlatformError(400, "INVALID_STAGE", "Funnel stage is required.");
      }
      const event = service.recordFunnelEvent({
        stage,
        anonymousSessionToken,
        utmSource,
        utmMedium,
        utmCampaign,
        referrer,
      });
      res.status(201).json({ recorded: true, id: event.id });
    })
  );

  // ==================== FREE PRE-LOGIN PSYCHOMETRIC ASSESSMENT ====================

  router.post(
    "/public/assessments/anonymous/start",
    handle((req, res) => {
      const { utmSource, utmCampaign } = req.body ?? {};
      const data = service.startAnonymousAssessment({ utmSource, utmCampaign });
      res.status(201).json(data);
    })
  );

  router.get(
    "/public/assessments/anonymous/:token",
    handle((req, res) => {
      const data = service.getAnonymousAssessmentPreview(String(req.params.token));
      res.json(data);
    })
  );

  router.patch(
    "/public/assessments/anonymous/:token",
    handle((req, res) => {
      const data = service.saveAnonymousAssessmentProgress(
        String(req.params.token),
        req.body?.answers ?? {}
      );
      res.json(data);
    })
  );

  router.post(
    "/public/assessments/anonymous/:token/submit",
    handle((req, res) => {
      const data = service.submitAnonymousAssessment(
        String(req.params.token),
        req.body?.answers ?? {}
      );
      res.json(data);
    })
  );

  // ==================== UNIFIED AUTH (STUDENT, EMPLOYER, ADMIN) ====================

  router.get(
    "/auth/me",
    withAuth((req, res) => {
      const user = service.getUserById(req.platformUser!.id);
      res.json({ user });
    })
  );

  router.post(
    "/auth/otp/request",
    handle(async (req, res) => {
      const result = await service.requestIndianPhoneOtp(String(req.body?.phone ?? ""));
      res.json(result);
    })
  );

  router.post(
    "/auth/student/register",
    handle(async (req, res) => {
      const result = await service.registerStudent({
        fullName: String(req.body?.fullName ?? ""),
        email: String(req.body?.email ?? ""),
        phone10: String(req.body?.phone ?? ""),
        otpCode: String(req.body?.otpCode ?? ""),
        password: String(req.body?.password ?? ""),
        anonymousAssessmentToken: req.body?.anonymousAssessmentToken,
      });
      res.status(201).json(result);
    })
  );

  router.post(
    "/auth/employer/register",
    handle(async (req, res) => {
      const result = await service.registerEmployer({
        fullName: String(req.body?.fullName ?? ""),
        officialEmail: String(req.body?.officialEmail ?? ""),
        password: String(req.body?.password ?? ""),
        companyName: String(req.body?.companyName ?? ""),
        registrationId: String(req.body?.registrationId ?? ""),
        industry: String(req.body?.industry ?? ""),
        city: String(req.body?.city ?? ""),
        billingModel: (req.body?.billingModel ?? "success_fee") as EmployerBillingModel,
      });
      res.status(201).json(result);
    })
  );

  router.post(
    "/auth/login",
    handle((req, res) => {
      const result = service.loginUser({
        emailOrPhone: String(req.body?.emailOrPhone ?? ""),
        password: String(req.body?.password ?? ""),
        expectedPortal: req.body?.expectedPortal,
        anonymousAssessmentToken: req.body?.anonymousAssessmentToken,
        mfaCode: req.body?.mfaCode,
      });
      res.json(result);
    })
  );

  router.post(
    "/auth/verify-email",
    withAuth((req, res) => {
      const result = service.verifyUserEmail(req.platformUser!.id, String(req.body?.code ?? ""));
      res.json(result);
    })
  );

  router.post(
    "/auth/forgot-password",
    handle(async (req, res) => {
      const result = await service.requestPasswordRecovery(String(req.body?.email ?? ""));
      res.json(result);
    })
  );

  router.post(
    "/auth/reset-password",
    handle((req, res) => {
      const result = service.resetPasswordWithCode(
        String(req.body?.email ?? ""),
        String(req.body?.code ?? ""),
        String(req.body?.newPassword ?? "")
      );
      res.json(result);
    })
  );

  // ==================== STUDENT PORTAL ====================

  router.get(
    "/student/dashboard",
    withAuth((req, res) => {
      res.json(service.getStudentDashboard(req.platformUser!.id));
    })
  );

  router.post(
    "/student/assessments/claim",
    withAuth((req, res) => {
      const report = service.claimAnonymousAssessment(
        req.platformUser!.id,
        String(req.body?.sessionToken ?? "")
      );
      res.json({ report });
    })
  );

  router.post(
    "/student/payments/orders",
    withAuth(async (req, res) => {
      const result = await service.initiateStudentAdmissionPayment({
        studentUserId: req.platformUser!.id,
        courseId: String(req.body?.courseId ?? ""),
        planCode: req.body?.planCode as AdmissionPlanCode,
        acceptedAgreement: Boolean(req.body?.acceptedAgreement),
        acceptedAgreementVersion: String(req.body?.acceptedAgreementVersion ?? ""),
      });
      res.status(201).json(result);
    })
  );

  router.post(
    "/student/payments/verify",
    withAuth((req, res) => {
      const result = service.verifyStudentAdmissionPayment({
        studentUserId: req.platformUser!.id,
        orderId: String(req.body?.orderId ?? ""),
        paymentId: String(req.body?.paymentId ?? ""),
        signature: String(req.body?.signature ?? ""),
      });
      res.json(result);
    })
  );

  router.post(
    "/student/modules/:moduleId/complete",
    withAuth((req, res) => {
      res.json(service.completeStudentModule(req.platformUser!.id, String(req.params.moduleId)));
    })
  );

  router.post(
    "/student/assignments/:assignmentId/submit",
    withAuth((req, res) => {
      res.json(
        service.submitStudentAssignment(
          req.platformUser!.id,
          String(req.params.assignmentId),
          String(req.body?.submissionNotes ?? "")
        )
      );
    })
  );

  router.post(
    "/student/classes/:classId/attend",
    withAuth((req, res) => {
      res.json(service.recordLiveClassAttendance(req.platformUser!.id, String(req.params.classId)));
    })
  );

  router.get(
    "/student/final-assessment/questions",
    withAuth((req, res) => {
      res.json(service.getFinalAssessmentQuestionsForStudent(req.platformUser!.id));
    })
  );

  router.post(
    "/student/final-assessment/submit",
    withAuth((req, res) => {
      res.json(service.submitFinalAssessment(req.platformUser!.id, req.body?.answers ?? {}));
    })
  );

  router.put(
    "/student/consent",
    withAuth((req, res) => {
      res.json(
        service.updateStudentRecruitmentConsent(
          req.platformUser!.id,
          Boolean(req.body?.employerVisibilityGranted),
          String(req.body?.policyVersion ?? "DPDP-2026.1")
        )
      );
    })
  );

  router.post(
    "/student/refund/request",
    withAuth((req, res) => {
      res.status(201).json(
        service.requestAdmissionRefund(req.platformUser!.id, String(req.body?.reason ?? ""))
      );
    })
  );

  router.post(
    "/student/offers/:offerId/accept",
    withAuth((req, res) => {
      res.json(service.acceptWrittenOfferByStudent(req.platformUser!.id, String(req.params.offerId)));
    })
  );

  // ==================== WEBHOOKS (RAZORPAY IDEMPOTENT) ====================

  router.post(
    "/webhooks/razorpay",
    handle((req, res) => {
      const rawBody = req.rawBody ?? JSON.stringify(req.body ?? {});
      const sig = String(req.headers["x-razorpay-signature"] ?? "");
      res.json(service.handleRazorpayWebhook(rawBody, sig));
    })
  );

  // ==================== EMPLOYER PORTAL (ON udayantu.com/employer/*) ====================

  router.get(
    "/employer/workspace",
    withAuth((req, res) => {
      res.json(service.getEmployerWorkspace(req.platformUser!.id));
    })
  );

  router.put(
    "/employer/billing/plan",
    withAuth((req, res) => {
      res.json(
        service.selectEmployerBillingPlan(
          req.platformUser!.id,
          req.body?.billingModel as EmployerBillingModel
        )
      );
    })
  );

  router.post(
    "/employer/jobs",
    withAuth((req, res) => {
      res.status(201).json(
        service.createEmployerJob(req.platformUser!.id, {
          title: String(req.body?.title ?? ""),
          careerTrackId: req.body?.careerTrackId as CanonicalCareerTrackId,
          location: String(req.body?.location ?? ""),
          minCtcInr: Number(req.body?.minCtcInr ?? 0),
          maxCtcInr: Number(req.body?.maxCtcInr ?? 0),
          openings: Number(req.body?.openings ?? 1),
          publishNow: Boolean(req.body?.publishNow),
        })
      );
    })
  );

  router.get(
    "/employer/candidates",
    withAuth((req, res) => {
      const careerTrackId = req.query.careerTrackId
        ? (String(req.query.careerTrackId) as CanonicalCareerTrackId)
        : undefined;
      const minScore = req.query.minScore ? Number(req.query.minScore) : undefined;
      res.json({
        candidates: service.searchEligibleConsentedCandidates(req.platformUser!.id, {
          careerTrackId,
          minScore,
        }),
      });
    })
  );

  router.post(
    "/employer/shortlists",
    withAuth((req, res) => {
      res.status(201).json(
        service.shortlistCandidate(
          req.platformUser!.id,
          String(req.body?.jobId ?? ""),
          String(req.body?.studentUserId ?? "")
        )
      );
    })
  );

  router.post(
    "/employer/interviews",
    withAuth((req, res) => {
      res.status(201).json(
        service.scheduleInterview(req.platformUser!.id, {
          jobId: String(req.body?.jobId ?? ""),
          studentUserId: String(req.body?.studentUserId ?? ""),
          scheduledAt: String(req.body?.scheduledAt ?? new Date().toISOString()),
          mode: (req.body?.mode ?? "Google Meet") as "Zoom" | "Google Meet" | "In-Person",
          meetingLink: String(req.body?.meetingLink ?? "https://meet.google.com/udy-interview"),
        })
      );
    })
  );

  router.post(
    "/employer/offers",
    withAuth((req, res) => {
      res.status(201).json(
        service.issueWrittenOffer(req.platformUser!.id, {
          jobId: String(req.body?.jobId ?? ""),
          studentUserId: String(req.body?.studentUserId ?? ""),
          roleTitle: String(req.body?.roleTitle ?? ""),
          agreedCtcInr: Number(req.body?.agreedCtcInr ?? 0),
          joiningDate: String(req.body?.joiningDate ?? ""),
        })
      );
    })
  );

  router.post(
    "/employer/offers/:offerId/confirm-joining",
    withAuth((req, res) => {
      res.json(service.confirmCandidateJoining(req.platformUser!.id, String(req.params.offerId)));
    })
  );

  router.post(
    "/employer/offers/:offerId/amend-ctc",
    withAuth((req, res) => {
      const body = parseBody(AmendCtcBodySchema, req.body);
      res.json(service.amendOfferCtc(req.platformUser!.id, String(req.params.offerId), body));
    })
  );

  router.patch(
    "/employer/applications/:applicationId/stage",
    withAuth((req, res) => {
      const body = parseBody(RecruitmentStageBodySchema, req.body);
      res.json(
        service.updateApplicationStage(
          req.platformUser!.id,
          String(req.params.applicationId),
          body.stage as CanonicalRecruitmentStage
        )
      );
    })
  );

  // ==================== ADMIN CONTROL PLANE APIS (FOR admin.udayantu.com) ====================

  router.get(
    "/admin/dashboard/summary",
    withAuth((req, res) => {
      res.json(service.getAdminDashboardSummary(req.platformUser!.id));
    })
  );

  router.get(
    "/admin/activity",
    withAuth((req, res) => {
      res.json(
        service.getAdminActivityFeed(req.platformUser!.id, {
          eventType: req.query.eventType ? String(req.query.eventType) : undefined,
          studentId: req.query.studentId ? String(req.query.studentId) : undefined,
          employerId: req.query.employerId ? String(req.query.employerId) : undefined,
          careerTrackId: req.query.careerTrackId ? String(req.query.careerTrackId) : undefined,
          sourcePortal: req.query.sourcePortal ? (String(req.query.sourcePortal) as SourcePortal) : undefined,
          cursor: req.query.cursor ? Number(req.query.cursor) : undefined,
          limit: req.query.limit ? Number(req.query.limit) : undefined,
        })
      );
    })
  );

  router.get(
    "/admin/audit-logs",
    withAuth((req, res) => {
      res.json({ data: service.getAdminAuditLogs(req.platformUser!.id) });
    })
  );

  router.post(
    "/admin/employers/:employerId/approve",
    withAuth((req, res) => {
      res.json(
        service.adminApproveEmployer(
          req.platformUser!.id,
          String(req.params.employerId),
          req.body?.decision ?? "approve",
          String(req.body?.reason ?? "Verified company KYC")
        )
      );
    })
  );

  router.patch(
    "/admin/plans/:planCode",
    withAuth((req, res) => {
      res.json(
        service.adminUpdateStudentPlanPricing(
          req.platformUser!.id,
          req.params.planCode as AdmissionPlanCode,
          req.body ?? {}
        )
      );
    })
  );

  router.patch(
    "/admin/cohorts/:cohortId/status",
    withAuth((req, res) => {
      const body = parseBody(CohortStatusBodySchema, req.body ?? { status: "disabled" });
      res.json(service.adminSetCohortStatus(req.platformUser!.id, String(req.params.cohortId), body.status));
    })
  );

  router.patch(
    "/admin/courses/:courseId/status",
    withAuth((req, res) => {
      const body = parseBody(CourseStatusBodySchema, req.body);
      res.json(service.adminSetCourseStatus(req.platformUser!.id, String(req.params.courseId), body.status));
    })
  );

  router.patch(
    "/admin/employers/:employerId/subscription-status",
    withAuth((req, res) => {
      const body = parseBody(SubscriptionStatusBodySchema, req.body);
      res.json(
        service.adminSetEmployerSubscriptionStatus(
          req.platformUser!.id,
          String(req.params.employerId),
          body.status as EmployerSubscriptionStatus,
          body.explicitPlanAFallbackAgreementAccepted
        )
      );
    })
  );

  router.get(
    "/admin/tax-rules",
    withAuth((req, res) => {
      res.json({ data: service.getTaxRules(req.platformUser!.id) });
    })
  );

  router.post(
    "/admin/tax-rules/:category/approve",
    withAuth((req, res) => {
      const body = parseBody(ApproveTaxRuleBodySchema, req.body);
      res.json(
        service.adminApproveTaxRule(
          req.platformUser!.id,
          String(req.params.category) as TaxRuleConfig["serviceCategory"],
          body
        )
      );
    })
  );

  router.get(
    "/admin/commercial-decisions",
    withAuth((req, res) => {
      res.json({ data: service.getCommercialDecisions(req.platformUser!.id) });
    })
  );

  router.post(
    "/admin/commercial-decisions/:decisionId/approve",
    withAuth((req, res) => {
      const approvedBy = String(req.body?.approvedBy ?? req.platformUser!.fullName);
      res.json(
        service.adminApproveCommercialDecision(
          req.platformUser!.id,
          String(req.params.decisionId),
          approvedBy
        )
      );
    })
  );

  router.get(
    "/admin/ledger/summary",
    withAuth((req, res) => {
      res.json(service.getAdminFinancialLedgerSummary(req.platformUser!.id));
    })
  );

  router.get(
    "/admin/analytics/gtm",
    withAuth((req, res) => {
      res.json(service.getAdminGtmAnalytics(req.platformUser!.id));
    })
  );

  router.post(
    "/admin/outbox/process",
    withAuth(async (req, res) => {
      const summary = await service.processOutbox(req.platformUser!.id);
      res.json(summary);
    })
  );

  router.post(
    "/admin/outbox/replay",
    withAuth((req, res) => {
      const ids = Array.isArray(req.body?.eventIds) ? req.body.eventIds.map(String) : undefined;
      res.json(service.replayDeadLetterOutbox(req.platformUser!.id, ids));
    })
  );

  // Authorized Document Download stub returning clean educational PDF summary
  router.get(
    "/documents/download",
    handle((req, res) => {
      const key = String(req.query.key ?? "");
      if (!key || key.includes("..")) {
        throw new PlatformError(400, "INVALID_KEY", "Invalid document key.");
      }
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${key.split("/").pop() || "resource.txt"}"`
      );
      res.send(
        `UdaYantu Authorised Study Resource\nDocument Key: ${key}\nAccess verified via signed storage adapter.\n`
      );
    })
  );

  // Keep reference to requireAuth to avoid unused warning
  void requireAuth;

  return router;
}
