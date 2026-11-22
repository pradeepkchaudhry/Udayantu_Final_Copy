import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  ExternalLink,
  FileText,
  GraduationCap,
  MapPin,
  MessageSquare,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { EditorialTrustBar } from "@/components/seo/EditorialTrustBar";
import { DegreeAssessmentCta } from "@/components/seo/DegreeAssessmentCta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DEGREE_GUIDES,
  DEGREE_GUIDE_BY_SLUG,
} from "@/data/degreeGuides";
import {
  CAREER_PROGRAM_BY_SLUG,
  type DegreeSlug,
} from "@/data/careerPrograms";
import {
  EDITORIAL_METADATA,
  TRUSTWORTHY_EXTERNAL_REFERENCES,
} from "@/data/businessTruth";
import {
  createArticleSchema,
  createBreadcrumbSchema,
  createFAQSchema,
} from "@/utils/seo";
import { trackSeoConversion } from "@/lib/seoAnalytics";

interface DegreeGuidePageProps {
  degreeSlug: DegreeSlug;
}

const BLOG_LINK_TITLES: Record<string, string> = {
  "tier-3-4-graduates-business-development-roles":
    "How Tier 3 & 4 Graduates Excel in Business Development Roles",
  "customer-success-101-empathy-and-clarity":
    "Customer Success 101: Turning Empathy and Clarity into a Corporate Career",
  "first-interview-to-offer-letter-mentorship":
    "From First Interview to Offer Letter: How 1:1 Mentorship Closes the Gap",
};

export default function DegreeGuidePage({ degreeSlug }: DegreeGuidePageProps) {
  const guide = DEGREE_GUIDE_BY_SLUG[degreeSlug];

  useEffect(() => {
    window.scrollTo({ top: 0 });
    trackSeoConversion("degree_page_visit", {
      degree: degreeSlug,
      path: guide.path,
    });
  }, [degreeSlug, guide.path]);

  const matchedPrograms = guide.matchedUdayantuTracks
    .map((id) => CAREER_PROGRAM_BY_SLUG[id])
    .filter(Boolean);

  const otherDegrees = DEGREE_GUIDES.filter((g) => g.slug !== degreeSlug);

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Careers After Graduation", path: "/careers-after-graduation" },
    { name: `Jobs After ${guide.degreeLabel}`, path: guide.path },
  ];

  const structuredData = [
    createBreadcrumbSchema(breadcrumbs),
    createArticleSchema({
      headline: guide.h1,
      description: guide.metaDescription,
      path: guide.path,
      datePublished: EDITORIAL_METADATA.publishedDate,
      dateModified: EDITORIAL_METADATA.lastReviewedDate,
      about: [guide.degreeFullName, guide.primaryKeyword, ...guide.secondaryKeywords.slice(0, 3)],
    }),
    createFAQSchema(guide.faqs),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <SEOHead
        title={guide.seoTitle}
        description={guide.metaDescription}
        keywords={[guide.primaryKeyword, ...guide.secondaryKeywords].join(", ")}
        canonicalPath={guide.path}
        ogType="article"
        structuredData={structuredData}
      />
      <Navbar />

      <main className="flex-1 pt-16 md:pt-20">
        {/* Hero Header */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 border-b border-border py-10 md:py-14">
          <div className="container mx-auto px-4 max-w-6xl space-y-6">
            <Breadcrumbs items={breadcrumbs} />

            <div className="space-y-4 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs font-semibold">
                  {guide.level} Career Guide
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {guide.degreeFullName}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  India • Hinglish + English
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {guide.h1}
              </h1>

              <p className="text-base md:text-lg font-medium text-primary">
                {guide.hindiSubtitle}
              </p>

              {/* Direct Answer Box */}
              <div className="rounded-xl border border-primary/20 bg-background/90 p-5 md:p-6 shadow-xs space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                  Direct Answer
                </p>
                <p className="text-sm md:text-base text-foreground leading-relaxed">
                  {guide.directAnswer}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {guide.hinglishContext}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <Button
                  asChild
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
                >
                  <Link
                    to={`/career-assessment?degree=${guide.slug}`}
                    onClick={() =>
                      trackSeoConversion("assessment_started", {
                        degree: guide.slug,
                        source_page: guide.path,
                      })
                    }
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {guide.primaryCtaLabel}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/career-paths">
                    {guide.secondaryCtaLabel}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            <EditorialTrustBar />
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-6xl py-10 md:py-14 space-y-14">
          {/* Quick Overview + Honest Boundary */}
          <section className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Quick Overview: {guide.degreeLabel} Graduates Ke Liye Key Takeaways
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {guide.quickOverviewPoints.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 text-sm md:text-base text-muted-foreground"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-amber-900 dark:text-amber-300">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  Honest Qualification Boundary
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-amber-950/85 dark:text-amber-200/90 leading-relaxed">
                {guide.honestBoundaryNotice}
              </CardContent>
            </Card>
          </section>

          {/* Role Comparison Table */}
          <section aria-labelledby="roles-heading" className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
                Realistic Entry-Level Roles
              </p>
              <h2
                id="roles-heading"
                className="text-2xl md:text-3xl font-bold text-foreground"
              >
                Best Private Career Options After {guide.degreeLabel}
              </h2>
              <p className="text-muted-foreground max-w-3xl">
                Compare daily responsibilities, communication expectations, tools, and whether additional qualifications are required before selecting your focus area.
              </p>
            </div>

            <div className="w-full max-w-full overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[640px] divide-y divide-border text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Entry Role
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Core Skills & Tools
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Communication Level
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Additional Qualification
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      UdaYantu Track
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {guide.roles.map((role) => {
                    const matchedTrack = role.matchedUdayantuTrack
                      ? CAREER_PROGRAM_BY_SLUG[role.matchedUdayantuTrack]
                      : undefined;
                    return (
                      <tr key={role.title} className="hover:bg-muted/30">
                        <td className="px-4 py-3.5 font-semibold text-foreground align-top">
                          {role.title}
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground align-top">
                          <div className="space-y-1">
                            <p>{role.requiredSkills.slice(0, 3).join(", ")}</p>
                            <p className="text-xs text-primary/80">
                              Tools: {role.typicalTools.slice(0, 3).join(", ")}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground align-top">
                          {role.communicationLevel}
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground align-top">
                          {role.additionalQualification}
                        </td>
                        <td className="px-4 py-3.5 align-top whitespace-nowrap">
                          {matchedTrack ? (
                            <Link
                              to={matchedTrack.path}
                              onClick={() =>
                                trackSeoConversion("programme_details_opened", {
                                  programme: matchedTrack.id,
                                  source_page: guide.path,
                                })
                              }
                              className="inline-flex items-center gap-1 font-semibold text-secondary hover:underline"
                            >
                              {matchedTrack.name}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Independent / Specialist Pathway
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Deep Role Breakdown Cards */}
            <div className="grid md:grid-cols-2 gap-6 pt-2">
              {guide.roles.map((role) => {
                const matchedTrack = role.matchedUdayantuTrack
                  ? CAREER_PROGRAM_BY_SLUG[role.matchedUdayantuTrack]
                  : undefined;
                return (
                  <Card key={role.title} className="border border-border flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg leading-snug">
                          {role.title}
                        </CardTitle>
                        <Briefcase className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <p className="text-muted-foreground leading-relaxed">
                          <strong className="text-foreground">What you do:</strong>{" "}
                          {role.whatItInvolves}
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          <strong className="text-foreground">
                            Why {guide.degreeLabel} fits:
                          </strong>{" "}
                          {role.whyDegreeFits}
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          <strong className="text-foreground">How to prepare:</strong>{" "}
                          {role.howToPrepare}
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          <strong className="text-foreground">Portfolio sample:</strong>{" "}
                          {role.portfolioExample}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong className="text-foreground">Where freshers apply:</strong>{" "}
                          {role.whereToFindVacancies}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {role.typicalTools.slice(0, 3).map((tool) => (
                            <Badge key={tool} variant="outline" className="text-xs font-normal">
                              <Wrench className="w-3 h-3 mr-1" />
                              {tool}
                            </Badge>
                          ))}
                        </div>
                        {matchedTrack && (
                          <Link
                            to={matchedTrack.path}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline"
                          >
                            Explore {matchedTrack.name} Track
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Subject / Specialization Breakdown */}
          <section aria-labelledby="specializations-heading" className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
                Subject-Wise Clarity
              </p>
              <h2
                id="specializations-heading"
                className="text-2xl md:text-3xl font-bold text-foreground"
              >
                {guide.degreeLabel} Subject & Specialization Pathways
              </h2>
              <p className="text-muted-foreground max-w-3xl">
                Har {guide.degreeLabel} student ka subject combination alag hota hai. Dekhiye aapka major subject kis corporate function mein aapko natural edge deta hai.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {guide.specializations.map((spec) => (
                <Card key={spec.name} className="border border-border">
                  <CardContent className="p-5 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{spec.name}</h3>
                      <p className="text-sm font-medium text-primary mt-0.5">
                        {spec.hinglishHook}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {spec.suitableRoles.map((r) => (
                        <Badge key={r} variant="secondary" className="text-xs font-normal">
                          {r}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">Your Edge:</strong> {spec.keyEdge}
                    </p>
                    <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 border border-border/60">
                      <strong className="text-foreground">Important Caveat:</strong>{" "}
                      {spec.honestCaveat}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 90-Day Preparation Roadmap */}
          <section aria-labelledby="roadmap-heading" className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
                Action Plan
              </p>
              <h2
                id="roadmap-heading"
                className="text-2xl md:text-3xl font-bold text-foreground"
              >
                90-Day Job-Readiness Roadmap After {guide.degreeLabel}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {guide.roadmap.map((step, index) => (
                <Card key={step.phase} className="border border-border">
                  <CardHeader className="pb-2">
                    <Badge variant="outline" className="w-fit mb-2 text-xs">
                      Phase {index + 1} • {step.phase}
                    </Badge>
                    <CardTitle className="text-lg">{step.focus}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5 text-sm text-muted-foreground">
                      {step.actions.map((action) => (
                        <li key={action} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Resume, Interview & Regional Insight */}
          <section className="grid md:grid-cols-2 gap-6">
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Resume Tips for {guide.degreeLabel} Freshers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {guide.resumeGuidance.map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <ClipboardCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-secondary" />
                  Interview Preparation Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {guide.interviewGuidance.map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-lg bg-primary/5 border border-primary/15 p-4 text-sm">
                  <p className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    Regional & Small-Town Insight (UP, Bihar, Tier 2–4)
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {guide.regionalInsight}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Matched UdaYantu Career Programmes */}
          <section aria-labelledby="matched-tracks-heading" className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
                Structured Practical Training
              </p>
              <h2
                id="matched-tracks-heading"
                className="text-2xl md:text-3xl font-bold text-foreground"
              >
                Recommended UdaYantu Career Tracks for {guide.degreeLabel} Graduates
              </h2>
              <p className="text-muted-foreground max-w-3xl">
                UdaYantu offers structured 15-week tracks with live assignments, communication coaching, 1:1 mentorship, mock interviews, and transparent placement-support terms.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {matchedPrograms.map((program) => (
                <Card
                  key={program.id}
                  className="border border-border hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {program.duration}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {program.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      <Link
                        to={program.path}
                        className="hover:text-primary transition-colors"
                      >
                        {program.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {program.tagline}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Entry roles: {program.entryJobTitles.slice(0, 2).join(", ")}
                    </p>
                  </CardContent>
                  <div className="px-5 pb-5">
                    <Button asChild variant="outline" className="w-full justify-between">
                      <Link
                        to={program.path}
                        onClick={() =>
                          trackSeoConversion("programme_details_opened", {
                            programme: program.id,
                            source_page: guide.path,
                          })
                        }
                      >
                        <span>View {program.name} Curriculum</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Conversion CTA */}
          <DegreeAssessmentCta
            degreeSlug={guide.slug}
            degreeLabel={guide.degreeLabel}
            primaryLabel={guide.primaryCtaLabel}
            secondaryLabel={guide.secondaryCtaLabel}
            secondaryPath="/career-paths"
            sourcePage={guide.path}
          />

          {/* FAQs */}
          <section aria-labelledby="faq-heading" className="space-y-4">
            <h2 id="faq-heading" className="text-2xl md:text-3xl font-bold text-foreground">
              Frequently Asked Questions — Jobs After {guide.degreeLabel}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {guide.faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`deg-faq-${idx}`}>
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

          {/* Related Blog Articles + Other Degree Guides + External References */}
          <section className="grid lg:grid-cols-3 gap-6 pt-4 border-t border-border">
            <div className="space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Related Career Articles
              </h3>
              <ul className="space-y-2 text-sm">
                {guide.relatedBlogSlugs.map((slug) => (
                  <li key={slug}>
                    <Link
                      to={`/blog/${slug}`}
                      className="text-primary hover:underline inline-flex items-start gap-1.5"
                    >
                      <ArrowRight className="w-3.5 h-3.5 mt-1 flex-shrink-0" />
                      <span>{BLOG_LINK_TITLES[slug] || slug}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/career-guidance"
                    className="text-secondary font-medium hover:underline inline-flex items-start gap-1.5"
                  >
                    <ArrowRight className="w-3.5 h-3.5 mt-1 flex-shrink-0" />
                    <span>Fresher Resume & Interview Guidance Hub</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Compass className="w-4 h-4 text-secondary" />
                Explore Other Degree Guides
              </h3>
              <div className="flex flex-wrap gap-2">
                {otherDegrees.map((other) => (
                  <Link
                    key={other.slug}
                    to={other.path}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    Jobs After {other.degreeLabel}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-primary" />
                Official Indian Career Portals
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {TRUSTWORTHY_EXTERNAL_REFERENCES.slice(0, 3).map((ref) => (
                  <li key={ref.url}>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      {ref.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
