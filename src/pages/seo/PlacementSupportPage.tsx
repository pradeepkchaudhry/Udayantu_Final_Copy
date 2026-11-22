import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Handshake,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { EditorialTrustBar } from "@/components/seo/EditorialTrustBar";
import { DegreeAssessmentCta } from "@/components/seo/DegreeAssessmentCta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { STATIC_PUBLIC_SEO_ROUTES } from "@/data/seoRoutes";
import {
  EDITORIAL_METADATA,
  VERIFIED_PROGRAM_FACTS,
} from "@/data/businessTruth";
import {
  createArticleSchema,
  createBreadcrumbSchema,
  createFAQSchema,
} from "@/utils/seo";

const PLACEMENT_FAQS = [
  {
    question: "Does UdaYantu guarantee a job to every applicant automatically?",
    answer:
      "No. Placement outcomes depend on active skill development, attendance, coursework quality, and interview participation. UdaYantu provides structured 15-week training, resume/interview preparation, employer connections, and a written placement-support refund policy for students who meet all published eligibility criteria.",
  },
  {
    question: "What are the eligibility requirements for the written placement-support refund review?",
    answer:
      "Students must complete all 15-week programme modules and assignments, maintain at least 90% attendance, clear internal readiness assessments, attend scheduled mock interviews, and participate in employer interviews during the 90-day post-completion placement window. Full terms are published transparently on the Refund Policy page.",
  },
  {
    question: "How are fees structured?",
    answer: VERIFIED_PROGRAM_FACTS.feeModelSummary,
  },
  {
    question: "Does UdaYantu list fake job openings?",
    answer:
      "No. UdaYantu is a career readiness and placement-support platform—not a generic job listing board. Opportunities are shared with enrolled students only when genuine employers communicate hiring requirements.",
  },
];

export default function PlacementSupportPage() {
  const routeMeta = STATIC_PUBLIC_SEO_ROUTES.find(
    (r) => r.path === "/placement-support"
  )!;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Placement Support", path: "/placement-support" },
  ];

  const structuredData = [
    createBreadcrumbSchema(breadcrumbs),
    createArticleSchema({
      headline: routeMeta.h1,
      description: routeMeta.metaDescription,
      path: routeMeta.path,
      datePublished: EDITORIAL_METADATA.publishedDate,
      dateModified: EDITORIAL_METADATA.lastReviewedDate,
    }),
    createFAQSchema(PLACEMENT_FAQS),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <SEOHead
        title={routeMeta.seoTitle}
        description={routeMeta.metaDescription}
        keywords={[routeMeta.primaryKeyword, ...routeMeta.secondaryKeywords].join(", ")}
        canonicalPath={routeMeta.path}
        structuredData={structuredData}
      />
      <Navbar />

      <main className="flex-1 pt-16 md:pt-20">
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 border-b border-border py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl space-y-6">
            <Breadcrumbs items={breadcrumbs} />
            <div className="max-w-4xl space-y-4">
              <Badge variant="secondary" className="text-xs font-semibold">
                Transparent Policy • Zero Hidden Clauses
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {routeMeta.h1}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Students and families from villages and Tier 2–4 towns deserve complete clarity before investing time or money. Here is exactly how UdaYantu&apos;s 15-week training, placement assistance, eligibility rules, and written refund policy work.
              </p>
            </div>
            <EditorialTrustBar />
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-6xl py-12 space-y-12">
          {/* 4-Stage Placement Process */}
          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              4-Stage Placement Preparation Workflow
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: ClipboardCheck,
                  step: "Stage 1 (Weeks 1–12)",
                  title: "Practical Skill & Assignment Mastery",
                  desc: "Complete weekly hands-on projects, workplace communication drills, and tool practice in your chosen track.",
                },
                {
                  icon: FileText,
                  step: "Stage 2 (Weeks 13–14)",
                  title: "ATS Resume & Portfolio Audit",
                  desc: "1:1 mentor review to convert your academic background and completed assignments into a clean corporate resume.",
                },
                {
                  icon: Users,
                  step: "Stage 3 (Week 15)",
                  title: "Mock Interviews & Readiness Sign-Off",
                  desc: "Practice HR, situational, and role-specific interview rounds with structured written feedback.",
                },
                {
                  icon: Handshake,
                  step: `Stage 4 (${VERIFIED_PROGRAM_FACTS.placementWindowLabel})`,
                  title: "Employer Connections & Interview Support",
                  desc: "Receive verified employer interview opportunities, interview prep coaching, and onboarding guidance.",
                },
              ].map((stage) => {
                const Icon = stage.icon;
                return (
                  <Card key={stage.title} className="border border-border">
                    <CardHeader className="pb-2">
                      <Icon className="w-6 h-6 text-primary mb-2" />
                      <Badge variant="outline" className="w-fit text-xs mb-1">
                        {stage.step}
                      </Badge>
                      <CardTitle className="text-base">{stage.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground leading-relaxed">
                      {stage.desc}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Written Eligibility & Fee Transparency */}
          <section className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Written Refund Policy & Eligibility Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>{VERIFIED_PROGRAM_FACTS.refundPolicySummary}</p>
                <ul className="space-y-2">
                  {[
                    `Programme duration: ${VERIFIED_PROGRAM_FACTS.standardDurationLabel}`,
                    `Minimum attendance: ${VERIFIED_PROGRAM_FACTS.minimumAttendancePercent}% across live/scheduled sessions`,
                    `Placement-support window: ${VERIFIED_PROGRAM_FACTS.placementWindowLabel}`,
                    "All assignments, readiness checks, and employer interview participation completed in good faith",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/refund"
                  className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                >
                  Read Complete Written Refund Policy
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2 text-amber-900 dark:text-amber-300">
                  <AlertCircle className="w-5 h-5" />
                  Fee Transparency & Realistic Expectations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-amber-950/90 dark:text-amber-200/90 leading-relaxed">
                <p>{VERIFIED_PROGRAM_FACTS.feeModelSummary}</p>
                <p>
                  We believe in honest communication: UdaYantu is a practical career-readiness platform, not a shortcut or paid job-buying agency. Your effort in weekly practice, English/Hindi workplace communication, and mock interviews directly shapes your interview conversion.
                </p>
                <div className="flex flex-wrap gap-4 pt-1">
                  <Link
                    to="/terms"
                    className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Terms of Service
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/contact"
                    className="font-semibold text-secondary hover:underline inline-flex items-center gap-1"
                  >
                    Ask a Fee Question
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          <DegreeAssessmentCta
            primaryLabel="Start Free Career Assessment"
            secondaryLabel="Compare All 8 Career Tracks"
            secondaryPath="/career-paths"
            sourcePage="/placement-support"
          />

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Frequently Asked Questions — Placement Support
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {PLACEMENT_FAQS.map((faq, idx) => (
                <AccordionItem key={idx} value={`place-faq-${idx}`}>
                  <AccordionTrigger className="text-left font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
