import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  GraduationCap,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { EditorialTrustBar } from "@/components/seo/EditorialTrustBar";
import { DegreeAssessmentCta } from "@/components/seo/DegreeAssessmentCta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATIC_PUBLIC_SEO_ROUTES } from "@/data/seoRoutes";
import { EDITORIAL_METADATA } from "@/data/businessTruth";
import { createArticleSchema, createBreadcrumbSchema } from "@/utils/seo";

const TRANSITION_PATHWAYS = [
  {
    degree: "BA Graduate (Tier 3/4 Town)",
    degreePath: "/jobs-after-ba",
    targetTrack: "Business Development & Client Communication",
    trackPath: "/career-paths/business-development",
    startingGap:
      "Strong Hindi fluency and willingness to work hard, but unsure how corporate outreach, CRM tools, or English interviews work.",
    skillsBuilt: [
      "Structured 60-second English self-introduction and discovery call scripts",
      "HubSpot / Google Sheets prospect pipeline tracking",
      "5 mock HR and sales role-play interviews with 1:1 mentor feedback",
    ],
  },
  {
    degree: "B.Com Graduate (Small-Town College)",
    degreePath: "/jobs-after-bcom",
    targetTrack: "Operations & MIS Coordination",
    trackPath: "/career-paths/operations-management",
    startingGap:
      "Good theoretical commerce knowledge, but no practical exposure to corporate Excel Pivot Tables, SLA dashboards, or vendor escalation emails.",
    skillsBuilt: [
      "Daily operations MIS dashboard in Excel / Google Sheets",
      "SOP documentation and turnaround-time tracking exercises",
      "Case-based operations troubleshooting interviews",
    ],
  },
  {
    degree: "B.Sc / BCA Graduate (Non-Coding Focus)",
    degreePath: "/jobs-after-bsc",
    targetTrack: "Customer Support / Product Operations",
    trackPath: "/career-paths/customer-support",
    startingGap:
      "Analytical mindset and basic software familiarity, but hesitant about software engineering coding interviews.",
    skillsBuilt: [
      "Ticketing queue management (Freshdesk/Zendesk workflows) and SLA prioritisation",
      "Clear bug reproduction notes and customer escalation writing",
      "Live troubleshooting mock rounds for SaaS/IT service roles",
    ],
  },
  {
    degree: "BBA / MA Graduate",
    degreePath: "/jobs-after-bba",
    targetTrack: "Human Resources & Talent Coordination",
    trackPath: "/career-paths/human-resources",
    startingGap:
      "Interested in people management and corporate offices, but lacked practical experience in resume screening, ATS trackers, and interview scheduling.",
    skillsBuilt: [
      "End-to-end hiring pipeline tracker and JD breakdown assignments",
      "Structured candidate screening call simulations",
      "Onboarding checklist and professional HR email templates",
    ],
  },
];

export default function StudentSuccessStoriesPage() {
  const routeMeta = STATIC_PUBLIC_SEO_ROUTES.find(
    (r) => r.path === "/student-success-stories"
  )!;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Student Career Stories", path: "/student-success-stories" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <SEOHead
        title={routeMeta.seoTitle}
        description={routeMeta.metaDescription}
        keywords={[routeMeta.primaryKeyword, ...routeMeta.secondaryKeywords].join(", ")}
        canonicalPath={routeMeta.path}
        structuredData={[
          createBreadcrumbSchema(breadcrumbs),
          createArticleSchema({
            headline: routeMeta.h1,
            description: routeMeta.metaDescription,
            path: routeMeta.path,
            datePublished: EDITORIAL_METADATA.publishedDate,
            dateModified: EDITORIAL_METADATA.lastReviewedDate,
          }),
        ]}
      />
      <Navbar />

      <main className="flex-1 pt-16 md:pt-20">
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 border-b border-border py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl space-y-6">
            <Breadcrumbs items={breadcrumbs} />
            <div className="max-w-4xl space-y-4">
              <Badge variant="secondary" className="text-xs font-semibold">
                Transparent Career Transition Pathways
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {routeMeta.h1}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                See how graduates from villages and Tier 2–4 colleges close the gap between a traditional university degree and entry-level corporate hiring expectations—through structured skills, assignments, and 1:1 mentorship.
              </p>
            </div>
            <EditorialTrustBar />
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-6xl py-12 space-y-12">
          {/* Transparent Outcome Verification Policy */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 md:p-8 flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div className="space-y-2">
                <h2 className="text-lg md:text-xl font-bold text-foreground">
                  Our Commitment to Honest Outcome Reporting
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Unlike platforms that display inflated placement percentages or unverified salary banners, UdaYantu publishes only transparent programme structures and written eligibility policies. Individual compensation and placement timelines depend on a student&apos;s city, hiring market, English/communication progression, attendance, and interview performance. Below are representative degree-to-role transition journeys showing the exact skills students build across our 15-week tracks.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Representative Degree-to-Role Pathways */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                How Graduates Bridge the Campus-to-Corporate Gap
              </h2>
              <p className="text-muted-foreground">
                Illustrative transition blueprints across BA, B.Com, B.Sc, BCA, BBA, and MA backgrounds.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {TRANSITION_PATHWAYS.map((item) => (
                <Card key={item.degree} className="border border-border flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        {item.degree}
                      </Badge>
                      <Target className="w-4 h-4 text-secondary" />
                    </div>
                    <CardTitle className="text-lg">{item.targetTrack}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">Starting Challenge:</strong>{" "}
                        {item.startingGap}
                      </p>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-foreground mb-1.5">
                          Practical Milestones Built in 15 Weeks
                        </p>
                        <ul className="space-y-1.5 text-muted-foreground">
                          {item.skillsBuilt.map((skill) => (
                            <li key={skill} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span>{skill}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/60 flex flex-wrap gap-4 text-xs font-semibold">
                      <Link
                        to={item.degreePath}
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Read Degree Guide
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={item.trackPath}
                        className="text-secondary hover:underline inline-flex items-center gap-1"
                      >
                        Explore Track Syllabus
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <DegreeAssessmentCta
            primaryLabel="Build Your Own Career Transition Plan"
            secondaryLabel="Read Placement & Refund Policy"
            secondaryPath="/placement-support"
            sourcePage="/student-success-stories"
          />

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link
              to="/careers-after-graduation"
              className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline"
            >
              <Compass className="w-4 h-4" />
              Browse Degree Guides
            </Link>
            <Link
              to="/career-guidance"
              className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline"
            >
              Read Fresher Resume & Interview Tips
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
