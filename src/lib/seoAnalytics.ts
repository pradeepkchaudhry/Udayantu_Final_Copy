/**
 * Privacy-Safe SEO & Conversion Event Tracker (Part 13)
 *
 * Strictly avoids logging passwords, OTPs, emails, phone numbers,
 * or raw assessment answers while capturing high-signal funnel actions.
 */

export type ConversionEventName =
  | "degree_page_visit"
  | "career_hub_visit"
  | "degree_selected"
  | "assessment_started"
  | "assessment_completed"
  | "career_recommendations_shown"
  | "programme_details_opened"
  | "registration_initiated"
  | "registration_completed"
  | "admission_completed";

const FORBIDDEN_KEYS = new Set([
  "password",
  "otp",
  "phone",
  "mobile",
  "email",
  "full_name",
  "fullName",
  "answers",
  "selectedAnswers",
  "token",
]);

export function sanitizeAnalyticsParams(
  params?: Record<string, string | number | boolean | undefined>
): Record<string, string | number | boolean> {
  const safe: Record<string, string | number | boolean> = {};
  if (!params) return safe;
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (FORBIDDEN_KEYS.has(key)) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      safe[key] = value;
    }
  }
  return safe;
}

export function trackSeoConversion(
  eventName: ConversionEventName,
  params?: Record<string, string | number | boolean | undefined>
): void {
  if (typeof window === "undefined") return;
  const safeParams = sanitizeAnalyticsParams(params);
  try {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === "function") {
      gtag("event", eventName, safeParams);
    }
  } catch {
    // Non-blocking analytics
  }
}
