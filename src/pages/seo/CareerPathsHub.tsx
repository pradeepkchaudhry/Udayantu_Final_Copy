import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Compass,
  ShieldCheck,
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
import { CAREER_PROGRAMS } from "@/data/careerPrograms";
import { STATIC_PUBLIC_SEO_ROUTES } from "@/data/seoRoutes";
import { VERIFIED_PROGRAM_FACTS } from "@/data/businessTruth";
import { createBreadcrumbSchema } from "@/utils/seo";
import { trackSeoConversion } from "@/lib/seoAnalytics";

export default function CareerPathsHub() {
  const routeMeta = STATIC_PUBLIC_SEO_ROUTES.find(
    (r) => r.path === "/career-paths"
  )!;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Career Paths", path: "/career-paths" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <SEOHead
        title={routeMeta.seoTitle}
        description={routeMeta.metaDescription}
        keywords={[routeMeta.primaryKeyword, ...routeMeta.secondaryKeywords].join(", ")}
        canonicalPath={routeMeta.path}
        structuredData={createBreadcrumbSchema(breadcrumbs)}
      />
      <Navbar />

      <main className="flex-1 pt-16 md:pt-20">
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 border-b border-border py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl space-y-6">
            <Breadcrumbs items={breadcrumbs} />
            <div className="max-w-4xl space-y-4">
              <Badge variant="secondary" className="text-xs font-semibold">
                {VERIFIED_PROGRAM_FACTS.totalCareerTracks} Verified Career Programmes •{" "}
                {VERIFIED_PROGRAM_FACTS.standardDurationLabel} Each
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {routeMeta.h1}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Explore UdaYantu&apos;s eight structured, non-technical corporate training tracks built for BA, B.Com, B.Sc, BBA, BCA, MA, M.Com, and M.Sc graduates. Every track combines practical workplace assignments, communication coaching, 1:1 mentor reviews, and placement preparation.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button
                  asChild
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
                >
                  <Link
                    to="/career-assessment"
                    onClick={() =>
                      trackSeoConversion("assessment_started", {
                        source_page: "/career-paths",
                      })
                    }
                  >
                    <Compass className="w-4 h-4 mr-2" />
                    Not Sure Which Track? Take Assessment
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/placement-support">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Placement Support & Refund Policy
                  </Link>
                </Button>
              </div>
            </div>
            <EditorialTrustBar compact />
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl space-y-12">
            {/* Program Cards Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {CAREER_PROGRAMS.map((program) => (
                <Card
                  key={program.id}
                  className="border border-border hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {program.duration}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {program.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">
                      <Link
                        to={program.path}
                        onClick={() =>
                          trackSeoConversion("programme_details_opened", {
                            programme: program.id,
                            source_page: "/career-paths",
                          })
                        }
                        className="hover:text-primary transition-colors"
                      >
                        {program.name}
                      </Link>
                    </CardTitle>
                    <p className="text-xs font-medium text-primary">
                      {program.hindiName}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {program.overview}
                      </p>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-foreground mb-1.5">
                          Core Skills Covered
                        </p>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {program.coreSkills.slice(0, 3).map((skill) => (
                            <li key={skill} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span>{skill}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {program.toolsCovered.slice(0, 4).map((tool) => (
                          <Badge key={tool} variant="outline" className="text-[11px] font-normal">
                            <Wrench className="w-2.5 h-2.5 mr-1" />
                            {tool}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-xs text-muted-foreground pt-1">
                        <strong className="text-foreground">Commonly chosen by:</strong>{" "}
                        {program.bestForDegrees.map((slug, idx) => (
                          <span key={slug}>
                            <Link
                              to={`/jobs-after-${slug}`}
                              className="text-primary hover:underline font-medium"
                            >
                              {slug.toUpperCase()}
                            </Link>
                            {idx < program.bestForDegrees.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-primary" />
                        {program.entryJobTitles[0]}
                      </span>
                      <Button asChild size="sm" variant="outline">
                        <Link
                          to={program.path}
                          onClick={() =>
                            trackSeoConversion("programme_details_opened", {
                              programme: program.id,
                              source_page: "/career-paths",
                            })
                          }
                        >
                          View Curriculum
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <DegreeAssessmentCta
              primaryLabel="Match My Degree to the Right Track"
              secondaryLabel="Browse Degree Guides"
              secondaryPath="/careers-after-graduation"
              sourcePage="/career-paths"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
