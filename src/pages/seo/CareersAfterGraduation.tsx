import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Compass,
  ExternalLink,
  GraduationCap,
  MapPin,
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
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  EDITORIAL_METADATA,
  SITE_CONFIG,
  TRUSTWORTHY_EXTERNAL_REFERENCES,
  VERIFIED_PROGRAM_FACTS,
} from "@/data/businessTruth";
import { DEGREE_GUIDES } from "@/data/degreeGuides";
import { CAREER_PROGRAMS } from "@/data/careerPrograms";
import { STATIC_PUBLIC_SEO_ROUTES } from "@/data/seoRoutes";
import {
  createArticleSchema,
  createBreadcrumbSchema,
  createFAQSchema,
} from "@/utils/seo";
import { trackSeoConversion } from "@/lib/seoAnalytics";

const HUB_FAQS = [
  {
    question: "Graduation ke baad bina experience ke private job kaise milegi?",
    answer:
      "Private companies fresher hiring mein teen cheezein dekhti hain: clear spoken/written communication (Hindi + workplace English), basic computer/spreadsheet fluency, aur 2–3 practical portfolio assignments. Agar aap apni degree ke hisaab se ek specific track chunte hain aur 90 din tak structured practice karte hain, toh bina experience ke bhi corporate entry-level interviews clear kar sakte hain.",
  },
  {
    question: "Kya BA, B.Com ya B.Sc ke baad bina coding ke acchi corporate job mil sakti hai?",
    answer:
      "Haan. Business Development, Customer Success, Customer Support, Operations & MIS, HR Recruitment, Marketing Coordination, aur Project Coordination jaise corporate roles non-technical graduates ke liye open hote hain. Inmein coding ki zaroorat nahi hoti—communication, structured execution, CRM/Excel, aur problem solving zaroori hoti hai.",
  },
  {
    question: "Kya UdaYantu koi job portal hai ya career training platform?",
    answer:
      "UdaYantu ek career guidance, aptitude assessment, role-specific practical training, aur placement-support platform hai—generic job portal nahi. Hum verified employer vacancies ko tabhi share karte hain jab genuine hiring partners unhe provide karein, aur students ko 15-week practical training, mentorship, resume building, aur interview preparation ke through job-ready banate hain.",
  },
  {
    question: "UP, Bihar aur Tier 3–4 towns ke students metro cities ya remote roles mein kaise apply karein?",
    answer:
      "Online assessments, ATS-friendly 1-page resumes, structured mock interviews, aur National Career Service (NCS), LinkedIn, Naukri, aur verified employer referrals ke through aap Noida, Gurugram, Lucknow, Jaipur, Pune, Bengaluru ya remote roles mein apply kar sakte hain.",
  },
];

export default function CareersAfterGraduation() {
  const routeMeta = STATIC_PUBLIC_SEO_ROUTES.find(
    (r) => r.path === "/careers-after-graduation"
  )!;

  useEffect(() => {
    window.scrollTo({ top: 0 });
    trackSeoConversion("career_hub_visit", { page: "/careers-after-graduation" });
  }, []);

  const ugGuides = DEGREE_GUIDES.filter((g) => g.level === "Undergraduate");
  const pgGuides = DEGREE_GUIDES.filter((g) => g.level === "Postgraduate");

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Careers After Graduation", path: "/careers-after-graduation" },
  ];

  const structuredData = [
    createBreadcrumbSchema(breadcrumbs),
    createArticleSchema({
      headline: routeMeta.h1,
      description: routeMeta.metaDescription,
      path: routeMeta.path,
      datePublished: EDITORIAL_METADATA.publishedDate,
      dateModified: EDITORIAL_METADATA.lastReviewedDate,
      about: [
        "Career options after graduation in India",
        "BA, B.Com, B.Sc, BBA, BCA fresher jobs",
        "Non-technical corporate skills",
      ],
    }),
    createFAQSchema(HUB_FAQS),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <SEOHead
        title={routeMeta.seoTitle}
        description={routeMeta.metaDescription}
        keywords={[routeMeta.primaryKeyword, ...routeMeta.secondaryKeywords].join(", ")}
        canonicalPath={routeMeta.path}
        ogType="article"
        structuredData={structuredData}
      />
      <Navbar />

      <main className="flex-1 pt-16 md:pt-20">
        {/* Hero Header */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 border-b border-border py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl space-y-6">
            <Breadcrumbs items={breadcrumbs} />

            <div className="max-w-4xl space-y-4">
              <Badge variant="secondary" className="text-xs font-semibold">
                Graduate Career Hub • Hindi, Hinglish & English
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {routeMeta.h1}
              </h1>
              <p className="text-base md:text-lg text-primary font-medium">
                ग्रेजुएशन के बाद नौकरी कैसे मिलेगी? BA, B.Com, B.Sc, BBA, BCA, MA, M.Com aur M.Sc students ke liye degree-wise practical guide.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {SITE_CONFIG.positioning} Chahe aap village, kasbe, ya Tier 2–4 town se hon—sahi career direction, practical workplace skills, aur structured mentorship ke saath aap bina coding ya metro background ke bhi corporate entry-level career shuru kar sakte hain.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
                >
                  <Link
                    to="/career-assessment"
                    onClick={() =>
                      trackSeoConversion("assessment_started", {
                        source_page: "/careers-after-graduation",
                      })
                    }
                  >
                    <Compass className="w-4 h-4 mr-2" />
                    Take Free Career Assessment
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/career-paths">
                    Compare All 8 Career Tracks
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            <EditorialTrustBar />
          </div>
        </section>

        {/* Direct Answer Box */}
        <section className="py-10 md:py-12 border-b border-border/60">
          <div className="container mx-auto px-4 max-w-6xl">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6 md:p-8 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  Quick Answer: Graduation Ke Baad Private Job Pane Ka Sahi Tarika
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Sirf degree certificate par depend rehne se aaj fresher hiring mein interview calls kam aati hain. Companies aise graduates ko shortlist karti hain jo <strong>4 practical pillars</strong> dikha sakein: (1) apni strength ke hisaab se ek clear target role, (2) Google Workspace/Excel aur role-specific tools ka basic hands-on usage, (3) clear Hindi + professional English communication, aur (4) 2–3 sample assignments jo dikhayein ki aap real kaam kar sakte hain.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  {[
                    "1. Choose 1–2 realistic roles for your degree",
                    "2. Build hands-on Excel, CRM & communication fluency",
                    "3. Create a 1-page ATS resume + sample project proof",
                    "4. Practice mock interviews & apply via trusted channels",
                  ].map((step) => (
                    <div
                      key={step}
                      className="flex items-start gap-2 rounded-lg bg-background p-3 border border-border text-xs md:text-sm font-medium text-foreground"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Degree-Wise Undergraduate Guides */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
                Step 1 — Pick Your Undergraduate Degree
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Undergraduate Degree-Specific Career Guides (BA, B.Com, B.Sc, BBA, BCA)
              </h2>
              <p className="text-muted-foreground max-w-3xl">
                Har degree ka apna strength hota hai. Apni degree par click karein aur subject-wise roles, tools, honest qualification boundaries, aur 90-day preparation roadmap padhein.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ugGuides.map((guide) => (
                <Card
                  key={guide.slug}
                  className="border border-border hover:border-primary/40 hover:shadow-md transition-all flex flex-col"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {guide.degreeLabel} Guide
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {guide.roles.length} Roles • {guide.specializations.length} Subjects
                      </span>
                    </div>
                    <CardTitle className="text-xl leading-snug">
                      <Link
                        to={guide.path}
                        onClick={() =>
                          trackSeoConversion("degree_selected", {
                            degree: guide.slug,
                            source_page: "/careers-after-graduation",
                          })
                        }
                        className="hover:text-primary transition-colors"
                      >
                        Jobs After {guide.degreeLabel} ({guide.degreeFullName})
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {guide.directAnswer}
                    </p>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {guide.roles.slice(0, 3).map((r) => (
                          <Badge key={r.title} variant="secondary" className="text-xs font-normal">
                            {r.title.split("(")[0].trim()}
                          </Badge>
                        ))}
                      </div>
                      <Button asChild variant="outline" className="w-full justify-between">
                        <Link
                          to={guide.path}
                          onClick={() =>
                            trackSeoConversion("degree_selected", {
                              degree: guide.slug,
                              source_page: "/careers-after-graduation",
                            })
                          }
                        >
                          <span>Read Full {guide.degreeLabel} Career Guide</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Postgraduate Guides */}
            <div className="pt-6 space-y-4">
              <h3 className="text-xl md:text-2xl font-bold text-foreground">
                Postgraduate Career Guides (MA, M.Com, M.Sc)
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {pgGuides.map((guide) => (
                  <Card
                    key={guide.slug}
                    className="border border-border hover:border-primary/40 hover:shadow-md transition-all"
                  >
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/15">
                          Postgraduate
                        </Badge>
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <h4 className="text-lg font-bold text-foreground">
                        <Link
                          to={guide.path}
                          onClick={() =>
                            trackSeoConversion("degree_selected", {
                              degree: guide.slug,
                              source_page: "/careers-after-graduation",
                            })
                          }
                          className="hover:text-primary transition-colors"
                        >
                          Jobs After {guide.degreeLabel}
                        </Link>
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {guide.directAnswer}
                      </p>
                      <Link
                        to={guide.path}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
                      >
                        Explore {guide.degreeLabel} Options
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Degree-to-Role Comparison Matrix */}
        <section className="py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4 max-w-6xl space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
                Step 2 — Compare Structured Career Tracks
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                8 Verified UdaYantu Career Tracks ({VERIFIED_PROGRAM_FACTS.standardDurationLabel} Each)
              </h2>
              <p className="text-muted-foreground max-w-3xl">
                Har track mein practical assignments, workplace communication practice, 1:1 mentor reviews, aur structured interview readiness shamil hai. Hum sirf wahi tracks dikhate hain jo UdaYantu mein actually available hain.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CAREER_PROGRAMS.map((program) => (
                <Link
                  key={program.id}
                  to={program.path}
                  onClick={() =>
                    trackSeoConversion("programme_details_opened", {
                      programme: program.id,
                      source_page: "/careers-after-graduation",
                    })
                  }
                  className="group block rounded-xl"
                >
                  <Card className="h-full border border-border hover:border-primary/50 hover:shadow-md transition-all">
                    <CardContent className="p-5 flex flex-col h-full justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Briefcase className="w-5 h-5 text-primary" />
                          <Badge variant="outline" className="text-xs">
                            {program.duration}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {program.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {program.tagline}
                        </p>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-border/60">
                        <p className="text-[11px] text-muted-foreground">
                          Best for:{" "}
                          <span className="font-medium text-foreground">
                            {program.bestForDegrees
                              .slice(0, 4)
                              .map((d) => d.toUpperCase())
                              .join(", ")}
                          </span>
                        </p>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary">
                          View Curriculum
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Regional & Rural Reality + Helpful Resources */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl space-y-10">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border border-border">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <MapPin className="w-5 h-5" />
                    <h2 className="text-xl font-bold text-foreground">
                      Rural, Tier 2–4 & UP/Bihar Graduates Ke Liye Practical Reality
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Small-town aur rural colleges mein aksar campus placement drives nahi hoti, lekin Noida, Gurugram, Lucknow, Jaipur, Indore, Pune, aur remote SaaS/service teams har mahine freshers hire karti hain. Sabse bada gap talent ka nahi, balki <strong>corporate exposure, structured communication, aur resume-to-interview readiness</strong> ka hota hai.
                  </p>
                  <Link
                    to="/career-guidance"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    Read Resume, Interview & UP/Bihar Hiring Guide
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-5 h-5" />
                    <h2 className="text-xl font-bold text-foreground">
                      Transparent Placement Support & Written Refund Policy
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {VERIFIED_PROGRAM_FACTS.refundPolicySummary}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-1">
                    <Link
                      to="/placement-support"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      How Placement Support Works
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/refund"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
                    >
                      Read Written Refund Policy
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DegreeAssessmentCta
              primaryLabel="Discover My Best Career Track"
              secondaryLabel="Explore All 8 Programs"
              secondaryPath="/career-paths"
              sourcePage="/careers-after-graduation"
            />

            {/* FAQs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-secondary" />
                <h2 className="text-2xl font-bold text-foreground">
                  Frequently Asked Questions — Graduation Ke Baad Career
                </h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {HUB_FAQS.map((faq, idx) => (
                  <AccordionItem key={idx} value={`hub-faq-${idx}`}>
                    <AccordionTrigger className="text-left font-semibold">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Verified External Career References */}
            <div className="rounded-xl border border-border bg-muted/20 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">
                  Trusted Official Indian Career & Skill References
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {TRUSTWORTHY_EXTERNAL_REFERENCES.map((ref) => (
                  <a
                    key={ref.url}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-border bg-background p-4 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm text-primary">
                        {ref.title}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {ref.description}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
