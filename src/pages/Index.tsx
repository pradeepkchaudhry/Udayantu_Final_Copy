import { lazy, Suspense, memo } from "react";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { DegreeSelectorGrid } from "@/components/seo/DegreeSelectorGrid";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { STATIC_PUBLIC_SEO_ROUTES } from "@/data/seoRoutes";
import { webSiteSchema, createFAQSchema } from "@/utils/seo";

const StatsSection = lazy(() =>
  import("@/components/StatsSection").then((m) => ({ default: m.StatsSection }))
);
const StudentTrustBanner = lazy(() =>
  import("@/components/StudentTrustBanner").then((m) => ({
    default: m.StudentTrustBanner,
  }))
);
const HowItWorksSection = lazy(() =>
  import("@/components/HowItWorksSection").then((m) => ({
    default: m.HowItWorksSection,
  }))
);
const WhySection = lazy(() =>
  import("@/components/WhySection").then((m) => ({ default: m.WhySection }))
);
const RolesSection = lazy(() =>
  import("@/components/RolesSection").then((m) => ({ default: m.RolesSection }))
);
const PlacementSection = lazy(() =>
  import("@/components/PlacementSection").then((m) => ({
    default: m.PlacementSection,
  }))
);
const TestimonialsSection = lazy(() =>
  import("@/components/TestimonialsSection").then((m) => ({
    default: m.TestimonialsSection,
  }))
);
const RegistrationSection = lazy(() =>
  import("@/components/RegistrationSection").then((m) => ({
    default: m.RegistrationSection,
  }))
);
const FAQSection = lazy(() =>
  import("@/components/FAQSection").then((m) => ({ default: m.FAQSection }))
);
const BlogPreviewSection = lazy(() =>
  import("@/components/blog/BlogPreviewSection").then((m) => ({
    default: m.BlogPreviewSection,
  }))
);
const Footer = lazy(() =>
  import("@/components/Footer").then((m) => ({ default: m.Footer }))
);

const SectionLoader = memo(() => (
  <div className="py-16 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
));
SectionLoader.displayName = "SectionLoader";

const HOMEPAGE_FAQ_SCHEMA_ITEMS = [
  {
    question: "Who is eligible to apply for UdaYantu's career readiness programmes?",
    answer:
      "Graduates and postgraduates from BA, B.Com, B.Sc, BBA, BCA, MA, M.Com, M.Sc, and similar streams—especially from rural India and Tier 2, Tier 3, and Tier 4 towns—who are willing to complete 15 weeks of structured practical training.",
  },
  {
    question: "How long are UdaYantu's career tracks?",
    answer:
      "Each structured career programme runs for 15 weeks and includes weekly real-world assignments, communication practice, 1:1 personal mentorship, ATS resume preparation, and mock interviews.",
  },
  {
    question: "How does UdaYantu's written refund policy work?",
    answer:
      "Eligible students who complete all 15-week coursework, maintain at least 90% attendance, clear assessments, and participate actively in placement interviews qualify for a written placement-support refund review if unplaced within 90 days of program completion. Full terms are published on the Refund Policy page.",
  },
  {
    question: "Do I need to know coding or come from a metro city?",
    answer:
      "No. UdaYantu's 8 tracks focus on non-technical corporate functions such as Business Development, Customer Success, Operations, HR, Marketing, Project Coordination, Product Support, and Customer Support, delivered online with bilingual support.",
  },
];

const Index = () => {
  const homeMeta = STATIC_PUBLIC_SEO_ROUTES.find((r) => r.path === "/")!;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <SEOHead
        title={homeMeta.seoTitle}
        description={homeMeta.metaDescription}
        keywords={[homeMeta.primaryKeyword, ...homeMeta.secondaryKeywords].join(", ")}
        canonicalPath="/"
        structuredData={[
          webSiteSchema,
          createFAQSchema(HOMEPAGE_FAQ_SCHEMA_ITEMS),
        ]}
      />

      <main className="min-h-screen">
        <Navbar />
        <Hero />

        {/* Degree-Wise Career Discovery Section (Crawlable Internal Links to All 8 Degree Guides) */}
        <DegreeSelectorGrid sourcePage="homepage" />

        <Suspense fallback={<SectionLoader />}>
          <StudentTrustBanner
            onScrollToTestimonials={() => scrollToSection("testimonials")}
          />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <StatsSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <HowItWorksSection />
        </Suspense>

        <div id="why">
          <Suspense fallback={<SectionLoader />}>
            <WhySection />
          </Suspense>
        </div>

        <div id="roles">
          <Suspense fallback={<SectionLoader />}>
            <RolesSection />
          </Suspense>
        </div>

        <div id="placements">
          <Suspense fallback={<SectionLoader />}>
            <PlacementSection />
          </Suspense>
        </div>

        <div id="testimonials">
          <Suspense fallback={<SectionLoader />}>
            <TestimonialsSection />
          </Suspense>
        </div>

        <div id="register">
          <Suspense fallback={<SectionLoader />}>
            <RegistrationSection />
          </Suspense>
        </div>

        <Suspense fallback={<SectionLoader />}>
          <BlogPreviewSection />
        </Suspense>

        <div id="faq">
          <Suspense fallback={<SectionLoader />}>
            <FAQSection />
          </Suspense>
        </div>

        <Suspense fallback={<SectionLoader />}>
          <Footer />
        </Suspense>

        <WhatsAppButton />
      </main>
    </>
  );
};

export default Index;
