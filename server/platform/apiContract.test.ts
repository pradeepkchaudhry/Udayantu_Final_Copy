/**
 * HTTP API Contract & Cross-Role Security Tests against Standalone `udayantu-api`.
 *
 * Verifies real Express HTTP serialization, W3C traceparent / X-Correlation-Id propagation,
 * Zod 400 validation errors, unauthenticated 401 & cross-role 403 isolation, and
 * Admin / Student / Employer endpoints over HTTP.
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { createStandaloneApiApp } from "../apiServer";
import { UdaYantuPlatformService } from "./platformService";

let server: Server;
let baseUrl: string;

before(async () => {
  const service = new UdaYantuPlatformService({ env: { NODE_ENV: "test" } });
  const { app } = createStandaloneApiApp(service);
  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", () => resolve());
  });
  const addr = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

async function apiJson(path: string, init: RequestInit = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = (await res.json()) as Record<string, unknown>;
  return { res, body };
}

describe("Standalone udayantu-api HTTP Contract & Cross-Role Security", () => {
  it("emits W3C traceparent & X-Correlation-Id headers on /healthz and /v1/public/commercial-plans", async () => {
    const { res, body } = await apiJson("/healthz");
    assert.equal(res.status, 200);
    assert.equal(body.service, "udayantu-api");
    assert.ok(res.headers.get("x-correlation-id"));
    assert.match(res.headers.get("traceparent") ?? "", /^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);

    const plansRes = await apiJson("/v1/public/commercial-plans");
    assert.equal(plansRes.res.status, 200);
    assert.equal(Array.isArray(plansRes.body.studentPlans), true);
    assert.equal(Array.isArray(plansRes.body.employerPlans), true);
  });

  it("enforces 401 on unauthenticated protected routes and 403 on cross-role escalation (Student -> Admin/Employer, Employer -> Admin/Student)", async () => {
    const unauth = await apiJson("/v1/admin/ledger/summary");
    assert.equal(unauth.res.status, 401);

    // Login as seeded Sandbox Student
    const stuLogin = await apiJson("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        emailOrPhone: "aarav.mishra@example.org",
        password: "StudentDemo#2026",
        expectedPortal: "student",
      }),
    });
    assert.equal(stuLogin.res.status, 200);
    const stuToken = String(stuLogin.body.token);

    // Student CANNOT access Admin ledger or Employer candidates
    const stuToAdmin = await apiJson("/v1/admin/ledger/summary", {
      headers: { Authorization: `Bearer ${stuToken}` },
    });
    assert.equal(stuToAdmin.res.status, 403);

    const stuToEmp = await apiJson("/v1/employer/candidates", {
      headers: { Authorization: `Bearer ${stuToken}` },
    });
    assert.equal(stuToEmp.res.status, 403);

    // Login as seeded Sandbox Employer
    const empLogin = await apiJson("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        emailOrPhone: "hiring@kaveritech.in",
        password: "EmployerDemo#2026",
        expectedPortal: "employer",
      }),
    });
    assert.equal(empLogin.res.status, 200);
    const empToken = String(empLogin.body.token);

    // Employer CANNOT access Student dashboard or Admin tax rules
    const empToStu = await apiJson("/v1/student/dashboard", {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    assert.equal(empToStu.res.status, 403);

    const empToAdmin = await apiJson("/v1/admin/tax-rules", {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    assert.equal(empToAdmin.res.status, 403);
  });

  it("serves Admin control plane contracts (tax rules, commercial decisions, separate ledgers, GTM analytics, outbox) and rejects malformed Zod payloads with 400", async () => {
    const adminLogin = await apiJson("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        emailOrPhone: "ops-admin@udayantu.com",
        password: "AdminSandbox#2026",
        expectedPortal: "admin",
        mfaCode: "123456",
      }),
    });
    assert.equal(adminLogin.res.status, 200);
    const adminHeaders = { Authorization: `Bearer ${String(adminLogin.body.token)}` };

    // Tax rules & CA approval
    const taxRulesRes = await apiJson("/v1/admin/tax-rules", { headers: adminHeaders });
    assert.equal(taxRulesRes.res.status, 200);
    assert.equal((taxRulesRes.body.data as unknown[]).length, 3);

    // Invalid Zod payload rejected with 400 VALIDATION_ERROR
    const badTaxApprove = await apiJson("/v1/admin/tax-rules/student_training_admission/approve", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ reviewedByCaName: "" }),
    });
    assert.equal(badTaxApprove.res.status, 400);
    assert.equal(badTaxApprove.body.code, "VALIDATION_ERROR");

    // Valid CA approval succeeds
    const goodTaxApprove = await apiJson("/v1/admin/tax-rules/student_training_admission/approve", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ reviewedByCaName: "CA Meenakshi Joshi, FCA", candidateSacCode: "999293", rateBps: 1800 }),
    });
    assert.equal(goodTaxApprove.res.status, 200);
    assert.equal(goodTaxApprove.body.approvalStatus, "APPROVED_FOR_LIVE_INVOICING");

    // Commercial decisions register (7 items)
    const decisionsRes = await apiJson("/v1/admin/commercial-decisions", { headers: adminHeaders });
    assert.equal(decisionsRes.res.status, 200);
    assert.equal((decisionsRes.body.data as unknown[]).length, 7);

    // Separate exact-paise financial ledgers
    const ledgerRes = await apiJson("/v1/admin/ledger/summary", { headers: adminHeaders });
    assert.equal(ledgerRes.res.status, 200);
    assert.equal(ledgerRes.body.currency, "INR");
    assert.ok(ledgerRes.body.studentLedger);
    assert.ok(ledgerRes.body.employerLedger);

    // GTM analytics
    const gtmRes = await apiJson("/v1/admin/analytics/gtm", { headers: adminHeaders });
    assert.equal(gtmRes.res.status, 200);
    assert.ok(gtmRes.body.employerFunnel);

    // Outbox batch processing endpoint
    const outboxRes = await apiJson("/v1/admin/outbox/process", {
      method: "POST",
      headers: adminHeaders,
    });
    assert.equal(outboxRes.res.status, 200);
    assert.equal(typeof outboxRes.body.delivered, "number");
  });
});
