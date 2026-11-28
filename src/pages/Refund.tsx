import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { EDITORIAL_METADATA, SITE_CONFIG, VERIFIED_PROGRAM_FACTS } from "@/data/businessTruth";
import { STATIC_PUBLIC_SEO_ROUTES } from "@/data/seoRoutes";
import { createBreadcrumbSchema } from "@/utils/seo";
import { platformApi, type StudentAdmissionPlanDto } from "@/lib/platformApi";

const Refund = () => {
  const routeMeta = STATIC_PUBLIC_SEO_ROUTES.find((r) => r.path === "/refund")!;
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Refund Policy", path: "/refund" },
  ];

  const [plans, setPlans] = useState<StudentAdmissionPlanDto[]>([]);

  useEffect(() => {
    platformApi
      .getCommercialPlans()
      .then((res) => setPlans(res.studentPlans))
      .catch(() => {
        // Policy prose remains completely readable even if live plans are momentarily unavailable
      });
  }, []);

  const planA = plans.find((p) => p.code === "plan_a_refundable");
  const planB = plans.find((p) => p.code === "plan_b_non_refundable");

  return (
    <>
      <SEOHead
        title={routeMeta.seoTitle}
        description={routeMeta.metaDescription}
        keywords={[routeMeta.primaryKeyword, ...routeMeta.secondaryKeywords].join(", ")}
        canonicalPath="/refund"
        structuredData={createBreadcrumbSchema(breadcrumbs)}
      />

      <main className="min-h-screen bg-background">
        <Navbar />

        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Admission, Tuition &amp; Refund Policy
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              Last Reviewed: {EDITORIAL_METADATA.lastReviewedDate}
            </p>

            <div className="space-y-8 text-foreground/90 leading-relaxed">
              <div className="bg-primary/5 border-l-4 border-primary p-5 md:p-6 rounded-r-lg">
                <p className="font-semibold text-base md:text-lg text-foreground">
                  Transparent Commercial Positioning: Enrollment in UdaYantu provides structured{" "}
                  {VERIFIED_PROGRAM_FACTS.standardDurationLabel} training, mentorship, and employer
                  discovery eligibility upon passing the {VERIFIED_PROGRAM_FACTS.passingThresholdPercent}%
                  final assessment. Enrollment does not guarantee a job; refund eligibility depends
                  strictly on the admission plan you choose and accept in writing prior to payment.
                </p>
              </div>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">
                  1. Plan A — Refundable Admission
                </h2>
                <p>
                  {planA ? (
                    <>
                      Current configured fee:{" "}
                      <strong>₹{planA.priceInr.toLocaleString("en-IN")} (GST inclusive)</strong>{" "}
                      — Taxable base ₹{planA.gstBreakdown.taxableBaseInr.toLocaleString("en-IN")} +{" "}
                      {planA.gstRatePercent}% GST ₹{planA.gstBreakdown.gstAmountInr.toLocaleString("en-IN")}.
                    </>
                  ) : (
                    "Current plan pricing (GST inclusive) is displayed live on the Admission Plan checkout screen before payment."
                  )}
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Covers 90-day training cohort enrollment, structured resources, assessments, and configured mentorship.</li>
                  <li>
                    <strong>120-Calendar-Day Refund Clock:</strong> Starts strictly on the date you pass the
                    server-graded final assessment with at least <strong>75%</strong> and complete all mandatory
                    course modules and assignments.
                  </li>
                  <li>
                    <strong>Refund Eligibility:</strong> If no qualifying written job selection occurs within
                    120 calendar days of your verified pass date, you may submit a Plan A admission refund
                    request directly from your Student Dashboard.
                  </li>
                  <li>
                    <strong>Effect of Qualifying Selection:</strong> Once you formally accept a written
                    employer offer within the 120-day window, the admission fee becomes non-refundable.
                  </li>
                  <li>
                    <strong>No Adjustment Against Tuition:</strong> The admission fee is never adjusted or
                    deducted against post-selection tuition fees (Plan A tuition: 33% of agreed annual CTC,
                    GST inclusive).
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">
                  2. Plan B — Non-Refundable Admission
                </h2>
                <p>
                  {planB ? (
                    <>
                      Current configured fee:{" "}
                      <strong>₹{planB.priceInr.toLocaleString("en-IN")} (GST inclusive)</strong>{" "}
                      — Taxable base ₹{planB.gstBreakdown.taxableBaseInr.toLocaleString("en-IN")} +{" "}
                      {planB.gstRatePercent}% GST ₹{planB.gstBreakdown.gstAmountInr.toLocaleString("en-IN")}.
                    </>
                  ) : (
                    "Current plan pricing (GST inclusive) is displayed live on the Admission Plan checkout screen before payment."
                  )}
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Covers the exact same 90-day training cohort, coursework, assessments, and mentorship.</li>
                  <li>
                    <strong>Strictly Non-Refundable:</strong> The Plan B admission fee is non-refundable
                    regardless of final assessment outcome or job selection status.
                  </li>
                  <li>
                    <strong>No Adjustment Against Tuition:</strong> The admission fee is never adjusted or
                    deducted against post-selection tuition fees (Plan B tuition: 35% of agreed annual CTC,
                    GST inclusive).
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">
                  3. Authoritative Selection Event &amp; Tuition Terms
                </h2>
                <p>
                  Shortlists, interviews, and employer profile views never create a tuition charge.
                  A single student tuition obligation is triggered solely when a student formally accepts
                  a qualifying written job offer from an employer. All student tuition fees are GST inclusive.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">
                  4. How Plan A Refunds Are Verified &amp; Processed
                </h2>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>
                    Track your live 120-calendar-day window directly inside your{" "}
                    <Link to="/dashboard" className="text-primary underline">
                      Student Dashboard
                    </Link>
                    .
                  </li>
                  <li>
                    Once eligible (day 120 elapsed with no qualifying written offer accepted), click
                    &ldquo;Request Admission Refund&rdquo; or email{" "}
                    <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="text-primary underline">
                      {SITE_CONFIG.supportEmail}
                    </a>
                    .
                  </li>
                  <li>
                    Admin verifies your final assessment pass record and selection status. Estimated
                    refunds are never displayed as completed until bank settlement is confirmed.
                  </li>
                  <li>Approved refunds are settled to your original payment method.</li>
                </ol>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">
                  5. Cohort Pause or Cancellation by UdaYantu
                </h2>
                <p>
                  If a cohort is paused or disabled by Admin, enrolled student records, progress,
                  and refund eligibility clocks are preserved safely in read-only mode. If UdaYantu
                  cancels a cohort prior to commencement without an equivalent schedule, paid admission
                  fees are refunded in full.
                </p>
              </section>

              <div className="pt-4 border-t border-border flex flex-wrap gap-4">
                <Link
                  to="/career-assessment"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Take Free Career Assessment
                </Link>
                <Link
                  to="/payment"
                  className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  Compare Admission Plans
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
        <WhatsAppButton />
      </main>
    </>
  );
};

export default Refund;
