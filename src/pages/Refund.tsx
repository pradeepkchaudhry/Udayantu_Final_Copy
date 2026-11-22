import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { EDITORIAL_METADATA, SITE_CONFIG, VERIFIED_PROGRAM_FACTS } from "@/data/businessTruth";
import { STATIC_PUBLIC_SEO_ROUTES } from "@/data/seoRoutes";
import { createBreadcrumbSchema } from "@/utils/seo";
import { Link } from "react-router-dom";

const Refund = () => {
  const routeMeta = STATIC_PUBLIC_SEO_ROUTES.find((r) => r.path === "/refund")!;
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Refund Policy", path: "/refund" },
  ];

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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Refund Policy</h1>

            <div className="prose prose-lg max-w-none space-y-6 text-foreground/90">
              <p className="text-base text-muted-foreground">
                Last Reviewed: {EDITORIAL_METADATA.lastReviewedDate}
              </p>

              <div className="bg-secondary/10 border-l-4 border-secondary p-6 rounded-r-lg">
                <p className="font-semibold text-base md:text-lg">
                  Transparent Placement-Support Refund Terms: Eligible students who complete all {VERIFIED_PROGRAM_FACTS.standardDurationLabel} programme requirements and remain unplaced after {VERIFIED_PROGRAM_FACTS.placementWindowLabel} qualify for a full refund of their cohort admission fee under the written terms below.
                </p>
              </div>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">
                  1. Post-Completion Placement-Support Refund Eligibility
                </h2>
                <p>
                  If you complete all 15-week programme requirements and remain unplaced within{" "}
                  <strong>{VERIFIED_PROGRAM_FACTS.placementWindowLabel}</strong>, you are eligible to request a full refund of your cohort admission fee.
                </p>
                <p className="font-semibold">Written eligibility criteria:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Completion of all 15-week coursework, practical assignments, and internal readiness assessments</li>
                  <li>Minimum {VERIFIED_PROGRAM_FACTS.minimumAttendancePercent}% attendance in scheduled training and mentorship sessions</li>
                  <li>Active participation in resume reviews, mock interviews, and employer interview drives</li>
                  <li>Professional conduct and timely response to placement coordinator communications</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">2. Early Withdrawal Refund Tiers</h2>
                <p>If you choose to withdraw before completing the programme:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Within 7 days of enrollment:</strong> 100% refund of cohort admission fee (minus payment gateway processing charges)
                  </li>
                  <li>
                    <strong>Within 14 days of enrollment:</strong> 75% refund of cohort admission fee
                  </li>
                  <li>
                    <strong>Within 30 days of enrollment:</strong> 50% refund of cohort admission fee
                  </li>
                  <li>
                    <strong>After 30 days of enrollment:</strong> Standard early withdrawal refunds do not apply (Section 1 post-completion eligibility still applies if you complete the full programme)
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">3. Pay-After-Placement Deferred Fees</h2>
                <p>
                  {VERIFIED_PROGRAM_FACTS.feeModelSummary}
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">4. Non-Refundable Third-Party &amp; Optional Items</h2>
                <p>
                  Except in the event of programme cancellation by UdaYantu (Section 6), the following third-party or optional administrative fees (where separately itemised on your receipt) are non-refundable:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Third-party payment gateway processing fees</li>
                  <li>Optional standalone external assessment or re-issuance fees (if separately purchased)</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">5. Refund Request Process</h2>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>
                    Email your refund request to{" "}
                    <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="text-primary hover:underline">
                      {SITE_CONFIG.supportEmail}
                    </a>
                  </li>
                  <li>Include your registered email, enrollment receipt, and cohort details</li>
                  <li>Our review board verifies attendance and eligibility within 7–14 business days</li>
                  <li>Approved refunds are credited back to the original payment method</li>
                </ol>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">6. Program Cancellation by UdaYantu</h2>
                <p>
                  If UdaYantu cancels a scheduled cohort for any reason, enrolled students receive a 100% refund of all fees paid to UdaYantu.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">7. Questions &amp; Placement Details</h2>
                <p>
                  Read our full{" "}
                  <Link to="/placement-support" className="text-primary hover:underline">
                    Placement Support &amp; Process Guide
                  </Link>{" "}
                  or email{" "}
                  <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="text-primary hover:underline">
                    {SITE_CONFIG.supportEmail}
                  </a>{" "}
                  before paying any fee.
                </p>
              </section>
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
