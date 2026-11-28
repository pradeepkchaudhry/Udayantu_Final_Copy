/**
 * Standalone Portable `udayantu-api` Service Entrypoint.
 *
 * Completely decoupled from Vite and frontend bundles so it deploys identically as an OCI
 * container to Cloud Run, GKE, ECS, AKS, or local Docker Compose.
 *
 * Serves BOTH:
 * - `udayantu-web` (https://udayantu.com — Student + Employer)
 * - `udayantu-admin` (https://admin.udayantu.com — Independent Admin)
 */

import express from "express";
import cors from "cors";
import { UdaYantuPlatformService } from "./platform/platformService";
import { createPlatformApiRouter } from "./platform/apiRouter";
import { otelRequestMiddleware, structuredLog } from "./domain/telemetry";

const API_PORT = Number(process.env.API_PORT || process.env.PORT || 4000);

const ALLOWED_ORIGINS = new Set(
  [
    "https://udayantu.com",
    "https://www.udayantu.com",
    "https://admin.udayantu.com",
    "https://staging.udayantu.com",
    "https://admin-staging.udayantu.com",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    ...(process.env.CORS_ALLOWED_ORIGINS
      ? process.env.CORS_ALLOWED_ORIGINS.split(",").map((s) => s.trim())
      : []),
  ].filter(Boolean)
);

export function createStandaloneApiApp(service = new UdaYantuPlatformService()) {
  const app = express();
  app.disable("x-powered-by");

  app.use(otelRequestMiddleware);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.has(origin) || origin.endsWith(".run.app")) {
          callback(null, true);
          return;
        }
        callback(new Error("Origin not allowed by CORS policy"));
      },
      credentials: true,
    })
  );

  // Capture raw body for Razorpay webhook HMAC-SHA256 verification
  app.use(
    express.json({
      limit: "2mb",
      verify: (req, _res, buf) => {
        (req as express.Request & { rawBody?: string }).rawBody = buf.toString("utf8");
      },
    })
  );

  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    next();
  });

  app.get("/healthz", (_req, res) => {
    res.json({
      service: "udayantu-api",
      status: "ok",
      mode: service.mode,
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/readyz", (_req, res) => {
    res.json({
      service: "udayantu-api",
      ready: true,
      databaseConfigured: Boolean(process.env.DATABASE_URL),
      mode: service.mode,
    });
  });

  app.use("/v1", createPlatformApiRouter(service));

  return { app, service };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { app, service } = createStandaloneApiApp();
  app.listen(API_PORT, "0.0.0.0", () => {
    structuredLog("INFO", "udayantu_api_started", {
      port: API_PORT,
      mode: service.mode,
      databaseConfigured: Boolean(process.env.DATABASE_URL),
    });
  });
}
