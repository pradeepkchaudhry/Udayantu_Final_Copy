/**
 * Growth Funnel Analytics & UTM Attribution Helper.
 *
 * Tracks the 17 authoritative UdaYantu funnel stages from landing page through
 * joining confirmation without ever transmitting sensitive behavioural scores or PII.
 */

import { getAnonymousAssessmentToken } from "./platformApi";

export type FunnelStage =
  | "landing_page_viewed"
  | "free_assessment_started"
  | "free_assessment_completed"
  | "preview_result_viewed"
  | "full_report_cta_clicked"
  | "full_report_registered"
  | "course_recommended"
  | "plan_a_or_b_selected"
  | "payment_initiated"
  | "admission_completed"
  | "learning_started"
  | "final_assessment_attempted"
  | "final_assessment_passed"
  | "recruitment_consent_granted"
  | "candidate_shortlisted"
  | "offer_accepted"
  | "joining_confirmed";

const UTM_STORAGE_KEY = "udayantu_utm_attribution_v1";

export interface UtmAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
}

export function captureUtmAttribution(): UtmAttribution {
  try {
    const params = new URLSearchParams(window.location.search);
    const existingRaw = sessionStorage.getItem(UTM_STORAGE_KEY);
    const existing: UtmAttribution = existingRaw ? JSON.parse(existingRaw) : {};
    const updated: UtmAttribution = {
      utmSource: params.get("utm_source") || existing.utmSource,
      utmMedium: params.get("utm_medium") || existing.utmMedium,
      utmCampaign: params.get("utm_campaign") || existing.utmCampaign,
      referrer: document.referrer || existing.referrer,
    };
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return {};
  }
}

export function trackFunnelStage(stage: FunnelStage): void {
  const utm = captureUtmAttribution();
  const anonymousSessionToken = getAnonymousAssessmentToken() ?? undefined;

  // Dispatch to optional GA4 tag without sensitive behavioural data
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === "function") {
      w.gtag("event", stage, {
        utm_source: utm.utmSource,
        utm_medium: utm.utmMedium,
        utm_campaign: utm.utmCampaign,
      });
    }
  } catch {
    // ignore gtag failures
  }

  // Persist to authoritative backend funnel endpoint (fire-and-forget)
  fetch("/v1/public/analytics/funnel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      stage,
      anonymousSessionToken,
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
      referrer: utm.referrer,
    }),
    keepalive: true,
  }).catch(() => {
    // non-blocking telemetry
  });
}
