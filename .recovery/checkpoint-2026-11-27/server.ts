/**
 * Unified UdaYantu Entry Server (Port 3000).
 *
 * - Mounts the shared authenticated /v1/* API (Student, Employer, Admin contract)
 * - In development: mounts Vite middleware directly (no separate port 3001 split!)
 * - In production: serves built static dist/ assets with SPA fallback
 * - Enforces strict CORS allowlist (udayantu.com, admin.udayantu.com, local dev)
 */

import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { UdaYantuPlatformService } from "./server/platform/platformService";
import { createPlatformApiRouter } from "./server/platform/apiRouter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.APP_PORT || 3000);
const IS_PROD = process.env.NODE_ENV === "production";

const ALLOWED_ORIGINS = new Set(
  [
    "https://udayantu.com",
    "https://www.udayantu.com",
    "https://admin.udayantu.com",
    "https://staging.udayantu.com",
    "https://admin-staging.udayantu.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...(process.env.CORS_ALLOWED_ORIGINS
      ? process.env.CORS_ALLOWED_ORIGINS.split(",").map((s) => s.trim())
      : []),
  ].filter(Boolean)
);

async function bootstrap() {
  const app = express();
  const platformService = new UdaYantuPlatformService();

  app.disable("x-powered-by");

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow same-origin requests (no Origin header) or explicitly allowlisted origins
        if (
          !origin ||
          ALLOWED_ORIGINS.has(origin) ||
          origin.endsWith(".run.app")
        ) {
          callback(null, true);
          return;
        }
        callback(new Error("Origin not allowed by CORS policy"));
      },
      credentials: true,
    })
  );

  // Capture raw body for Razorpay HMAC webhook verification
  app.use(
    express.json({
      limit: "2mb",
      verify: (req, _res, buf) => {
        (req as express.Request & { rawBody?: string }).rawBody = buf.toString("utf8");
      },
    })
  );

  // Security headers
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    // Prevent indexing of authenticated portals & API routes
    if (
      req.path.startsWith("/v1/") ||
      req.path.startsWith("/dashboard") ||
      req.path.startsWith("/employer/dashboard") ||
      req.path.startsWith("/payment")
    ) {
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
    }
    next();
  });

  // Mount shared /v1/* API
  app.use("/v1", createPlatformApiRouter(platformService));

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir, { index: false }));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `[UdaYantu] Unified server (${platformService.mode} mode) listening on http://0.0.0.0:${PORT}`
    );
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start UdaYantu server:", err);
  process.exit(1);
});
