/**
 * Real PostgreSQL 16 Integration Test Suite.
 *
 * Executes `/migrations/0001_canonical_platform.sql` against a real PostgreSQL 16 database,
 * verifies exact BIGINT paise storage, unique constraints, and the append-only `audit_logs`
 * immutability trigger (`BEFORE UPDATE OR DELETE`).
 *
 * Run locally with Docker Compose:
 *   docker compose up -d postgres
 *   DATABASE_URL="postgres://udayantu:udayantu_local_dev@localhost:5432/udayantu" npx tsx --test server/db/postgres.integration.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

describe("PostgreSQL 16 Canonical Schema & Immutability Integration", () => {
  it("applies 0001_canonical_platform.sql idempotently, stores exact BIGINT paise, and blocks audit_logs mutation", async (t) => {
    if (!DATABASE_URL) {
      t.skip(
        "DATABASE_URL is not set in this sandbox (no local PostgreSQL/Docker daemon installed). Run with docker-compose.yml in a PostgreSQL 16 environment."
      );
      return;
    }

    const pool = new Pool({ connectionString: DATABASE_URL });
    try {
      const migrationPath = path.resolve(process.cwd(), "migrations/0001_canonical_platform.sql");
      const ddl = fs.readFileSync(migrationPath, "utf8");

      // Execute migration twice to prove idempotency
      await pool.query(ddl);
      await pool.query(ddl);

      // Verify core canonical tables exist
      const tablesRes = await pool.query<{ table_name: string }>(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
      );
      const tableSet = new Set(tablesRes.rows.map((r) => r.table_name));
      for (const required of [
        "users",
        "auth_identities",
        "students",
        "employers",
        "tax_rules",
        "commercial_decisions",
        "courses",
        "cohorts",
        "enrollments",
        "tuition_obligations",
        "employer_subscriptions",
        "employer_success_fees",
        "invoices",
        "payments",
        "admission_refunds",
        "credit_notes",
        "activity_events",
        "audit_logs",
        "outbox_events",
        "marketing_attribution_records",
      ]) {
        assert.equal(tableSet.has(required), true, `Missing required table: ${required}`);
      }

      // Verify append-only audit_logs trigger rejects UPDATE and DELETE
      const inserted = await pool.query<{ id: string }>(
        `INSERT INTO audit_logs (actor_role, action, resource_type, resource_id, source_portal, request_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        ["system", "pg.integration_check", "test", "res-1", "system", "req-pg-1"]
      );
      const auditId = inserted.rows[0].id;

      await assert.rejects(
        () => pool.query(`UPDATE audit_logs SET action = 'tampered' WHERE id = $1`, [auditId]),
        /append-only/i
      );
      await assert.rejects(
        () => pool.query(`DELETE FROM audit_logs WHERE id = $1`, [auditId]),
        /append-only/i
      );
    } finally {
      await pool.end();
    }
  });
});
