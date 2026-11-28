/**
 * Structured JSON Application Logging & OpenTelemetry-Compatible Trace Propagation.
 *
 * - Emits structured JSON logs with timestamp, severity, traceId, spanId, correlationId.
 * - Propagates W3C `traceparent` headers and `X-Correlation-Id`.
 * - Automatically strips sensitive keys (tokens, OTPs, passwords, secrets, raw answers).
 */

import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export type LogLevel = "INFO" | "WARN" | "ERROR";

const SENSITIVE_KEY_RE =
  /password|otp|token|secret|signature|authorization|cookie|answer_?key|correct_?option|aadhaar|\bpan\b|pan_?number/i;

export function redactForLog(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (SENSITIVE_KEY_RE.test(k)) {
      out[k] = "[REDACTED]";
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = redactForLog(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export interface TraceContext {
  traceId: string;
  spanId: string;
  correlationId: string;
  traceparent: string;
}

export function createTraceContext(headers?: Record<string, string | string[] | undefined>): TraceContext {
  const incomingTraceparent =
    typeof headers?.traceparent === "string" ? headers.traceparent.trim() : "";
  const match = incomingTraceparent.match(/^00-([0-9a-f]{32})-([0-9a-f]{16})-[0-9a-f]{2}$/);
  const traceId = match ? match[1] : crypto.randomBytes(16).toString("hex");
  const spanId = crypto.randomBytes(8).toString("hex");
  const incomingCorr =
    typeof headers?.["x-correlation-id"] === "string" ? headers["x-correlation-id"].trim() : "";
  const correlationId = incomingCorr || crypto.randomUUID();
  return {
    traceId,
    spanId,
    correlationId,
    traceparent: `00-${traceId}-${spanId}-01`,
  };
}

export function structuredLog(
  level: LogLevel,
  message: string,
  fields: Record<string, unknown> = {}
): void {
  if (process.env.NODE_ENV === "test") return;
  const entry = {
    severity: level,
    timestamp: new Date().toISOString(),
    service: "udayantu-api",
    message,
    ...redactForLog(fields),
  };
  const serialized = JSON.stringify(entry);
  if (level === "ERROR") {
    console.error(serialized);
  } else {
    console.log(serialized);
  }
}

export interface TracedRequest extends Request {
  traceContext?: TraceContext;
}

export function otelRequestMiddleware(req: TracedRequest, res: Response, next: NextFunction): void {
  const startedAt = Date.now();
  const ctx = createTraceContext(req.headers);
  req.traceContext = ctx;

  res.setHeader("X-Correlation-Id", ctx.correlationId);
  res.setHeader("traceparent", ctx.traceparent);

  res.on("finish", () => {
    structuredLog("INFO", "http_request_completed", {
      method: req.method,
      path: req.originalUrl.split("?")[0],
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      traceId: ctx.traceId,
      spanId: ctx.spanId,
      correlationId: ctx.correlationId,
    });
  });

  next();
}
