import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Clock,
  Compass,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { AuthModal } from "@/components/AuthModal";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { EditorialTrustBar } from "@/components/seo/EditorialTrustBar";
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
  CAREER_PROGRAMS,
  getCareerProgramBySlug,
} from "@/data/careerPrograms";
import { VERIFIED_PROGRAM_FACTS } from "@/data/businessTruth";
import {
  createBreadcrumbSchema,
  createCourseSchema,
  createFAQSchema,
} from "@/utils/seo";
import { trackSeoConversion } from "@/lib/seoAnalytics";
import NotFound from "@/pages/NotFound";

export default function CareerPathDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const program = slug ? getCareerProgramBySlug(slug) : undefined;
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (program) {
      trackSeoConversion("programme_details_opened", {
        programme: program.id,
        source_page: program.path,
      });
    }
  }, [program]);

  if (!program) {
    return <NotFound />;
  }

  const otherPrograms = CAREER_PROGRAMS.filter((p) => p.id !== program.id);

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Career Paths", path: "/career-paths" },
    { name: program.name, path: program.path },
  ];

  const structuredData = [
    createBreadcrumbSchema(breadcrumbs),
    createCourseSchema({
      name: `UdaYantu ${program.name} Career Readiness Programme`,
      description: program.metaDescription,
      path: program.path,
      durationWeeks: VERIFIED_PROGRAM_FACTS.standardDurationWeeks,
      skills: program.coreSkills,
    }),
    ...(program.faqs.length > 0 ? [createFAQSchema(program.faqs)] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <SEOHead
        title={program.seoTitle}
        description={program.metaDescription}
        keywords={[program.primaryKeyword, ...program.secondaryKeywords].join(", ")}
        canonicalPath={program.path}
        structuredData={structuredData}
      />
      <Navbar />

      <main className="flex-1 pt-16 md:pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 border-b border-border py-10 md:py-14">
          <div className="container mx-auto px-4 max-w-6xl space-y-6">
            <Breadcrumbs items={breadcrumbs} />

            <div className="max-w-4xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs font-semibold">
                  {program.duration} Practical Track
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {program.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  1:1 Personal Mentorship
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {program.h1}
              </h1>

              <p className="text-base md:text-lg font-medium text-primary">
                {program.hindiName} — {program.tagline}
              </p>

              <p className="text-base text-muted-foreground leading-relaxed">
                {program.overview}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold w-full sm:w-auto whitespace-normal h-auto py-3 text-center"
                  onClick={() => {
                    trackSeoConversion("registration_initiated", {
                      programme: program.id,
                      source_page: program.path,
                    });
                    setAuthModalOpen(true);
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>Apply for {program.name} Track</span>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link
                    to="/career-assessment"
                    onClick={() =>
                      trackSeoConversion("assessment_started", {
                        programme: program.id,
                        source_page: program.path,
                      })
                    }
                  >
                    <Compass className="w-4 h-4 mr-2" />
                    Check If This Track Fits You
                  </Link>
                </Button>
              </div>
            </div>

            <EditorialTrustBar compact />
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-6xl py-10 md:py-14 space-y-12">
          {/* What You Do Daily + Entry Job Titles */}
          <section className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  What Professionals in {program.name} Do Daily
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm md:text-base text-muted-foreground">
                  {program.whatYouDoDaily.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-secondary" />
                  Typical Entry-Level Titles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-foreground">
                  {program.entryJobTitles.map((title) => (
                    <li
                      key={title}
                      className="rounded-lg bg-muted/50 px-3 py-2 font-medium border border-border/60"
                    >
                      {title}
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-border/60 space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Ideal Degree Backgrounds
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {program.bestForDegrees.map((deg) => (
                      <Link
                        key={deg}
                        to={`/jobs-after-${deg}`}
                        className="px-2.5 py-1 rounded-md border border-border bg-background text-xs font-semibold text-primary hover:border-primary transition-colors"
                      >
                        Jobs After {deg.toUpperCase()}
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 15-Week Curriculum Modules */}
          <section aria-labelledby="curriculum-heading" className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
                Structured {program.duration} Syllabus
              </p>
              <h2
                id="curriculum-heading"
                className="text-2xl md:text-3xl font-bold text-foreground"
              >
                Week-by-Week Curriculum & Practical Assignments
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {program.modules.map((mod) => (
                <Card key={mod.weekRange} className="border border-border">
                  <CardHeader className="pb-2">
                    <Badge variant="outline" className="w-fit mb-1 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {mod.weekRange}
                    </Badge>
                    <CardTitle className="text-lg">{mod.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {mod.topics.map((topic) => (
                        <li key={topic} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Core Skills, Tools & Real Assignments */}
          <section className="grid md:grid-cols-3 gap-6">
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Core Skills You Build
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {program.coreSkills.map((skill) => (
                    <li key={skill} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-secondary" />
                  Practical Tools Covered
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {program.toolsCovered.map((tool) => (
                  <Badge key={tool} variant="secondary" className="text-xs font-normal py-1">
                    {tool}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  Portfolio Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {program.practicalAssignments.map((assignment) => (
                    <li key={assignment} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{assignment}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Honest Eligibility & Refund Policy Box */}
          <section className="grid md:grid-cols-2 gap-6">
            <Card className="border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-amber-900 dark:text-amber-300">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  Honest Eligibility & Career Reality
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-amber-950/85 dark:text-amber-200/90 leading-relaxed">
                {program.honestEligibilityNote}
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                  Placement Support & Refund Transparency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>{VERIFIED_PROGRAM_FACTS.refundPolicySummary}</p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/placement-support"
                    className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Placement Process
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/refund"
                    className="font-semibold text-secondary hover:underline inline-flex items-center gap-1"
                  >
                    Written Refund Policy
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FAQs */}
          {program.faqs.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                Frequently Asked Questions — {program.name}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {program.faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`prog-faq-${idx}`}>
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
          )}

          {/* Explore Other Career Paths */}
          <section className="pt-6 border-t border-border space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              Explore Other UdaYantu Career Tracks
            </h2>
            <div className="flex flex-wrap gap-2">
              {otherPrograms.map((other) => (
                <Link
                  key={other.id}
                  to={other.path}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <span>{other.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab="register"
      />
    </div>
  );
}
