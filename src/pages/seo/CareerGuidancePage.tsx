import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  MapPin,
  MessageSquare,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { STATIC_PUBLIC_SEO_ROUTES } from "@/data/seoRoutes";
import {
  EDITORIAL_METADATA,
  TRUSTWORTHY_EXTERNAL_REFERENCES,
} from "@/data/businessTruth";
import { DEGREE_GUIDES } from "@/data/degreeGuides";
import {
  createArticleSchema,
  createBreadcrumbSchema,
  createFAQSchema,
} from "@/utils/seo";

const GUIDANCE_FAQS = [
  {
    question: "Without experience private job ke liye resume mein kya likhein?",
    answer:
      "Fresher resume mein 1 page rakhein aur top par ek clear Target Role Headline dalein (e.g., 'BA Graduate | Aspiring Operations & MIS Executive'). Skills section mein Excel, Google Sheets, CRM/Email etiquette likhein, aur Experience ki jagah 'Practical Projects & Assignments' section mein 2–3 khud ke banaye sample assignments include karein.",
  },
  {
    question: "Agar English fluent nahi hai toh kya private job interview clear ho sakta hai?",
    answer:
      "Haan. Entry-level corporate hiring mein native-level accent nahi, balki simple, polite aur clear workplace communication dekha jata hai. Rozana 15 minute apna self-introduction, common interview answers, aur basic professional emails likhne ki practice karne se 60–90 din mein bada farq aata hai.",
  },
  {
    question: "UP, Bihar aur Tier 3–4 towns ke graduates kahan se genuine vacancies dhundhein?",
    answer:
      "Genuine openings ke liye National Career Service (ncs.gov.in), LinkedIn Jobs, Naukri.com, aur companies ke official Career pages use karein. Kabhi bhi aise agent ya portal ko paisa na dein jo bina interview ke confirmed job ka daava kare.",
  },
];

export default function CareerGuidancePage() {
  const routeMeta = STATIC_PUBLIC_SEO_ROUTES.find(
    (r) => r.path === "/career-guidance"
  )!;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Careers After Graduation", path: "/careers-after-graduation" },
    { name: "Fresher Career Guidance", path: "/career-guidance" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <SEOHead
        title={routeMeta.seoTitle}
        description={routeMeta.metaDescription}
        keywords={[routeMeta.primaryKeyword, ...routeMeta.secondaryKeywords].join(", ")}
        canonicalPath={routeMeta.path}
        ogType="article"
        structuredData={[
          createBreadcrumbSchema(breadcrumbs),
          createArticleSchema({
            headline: routeMeta.h1,
            description: routeMeta.metaDescription,
            path: routeMeta.path,
            datePublished: EDITORIAL_METADATA.publishedDate,
            dateModified: EDITORIAL_METADATA.lastReviewedDate,
          }),
          createFAQSchema(GUIDANCE_FAQS),
        ]}
      />
      <Navbar />

      <main className="flex-1 pt-16 md:pt-20">
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 border-b border-border py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl space-y-6">
            <Breadcrumbs items={breadcrumbs} />
            <div className="max-w-4xl space-y-4">
              <Badge variant="secondary" className="text-xs font-semibold">
                Practical Playbook • Hindi, Hinglish & English
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {routeMeta.h1}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Skills required for private jobs after graduation: ATS resume format, workplace English tips, Excel & digital tool basics, interview scripts, aur UP/Bihar & Tier 2–4 regional hiring guide.
              </p>
            </div>
            <EditorialTrustBar />
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-6xl py-12 space-y-12">
          {/* Core Playbook Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  1. 1-Page ATS Fresher Resume Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {[
                  "Avoid fancy graphics, two-column Canva templates, or personal details like father's name, religion, or full home address.",
                  "Put a clear Role Headline right under your name (e.g., 'B.Com Graduate | Entry-Level Operations & MIS Executive').",
                  "Replace generic 'Career Objective' paragraphs with a 2-line Skills Summary listing real tools (Excel, Google Sheets, CRM, Email Etiquette).",
                  "Add a 'Practical Assignments' section with 2–3 real work samples so recruiters see proof even without prior job experience.",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-secondary" />
                  2. Core Digital Skills Employers Test in 2026
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {[
                  "Microsoft Excel / Google Sheets: Sorting, filtering, XLOOKUP/VLOOKUP, Pivot Tables, and clean daily reporting.",
                  "Professional Email & Chat Writing: Clear subject lines, polite follow-ups, structured bullet points, and zero SMS slang.",
                  "Cloud & CRM Tools: Google Workspace, basic CRM pipeline logging (HubSpot/Zoho), or ticketing queues (Freshdesk).",
                  "Typing Speed & Accuracy: 30+ WPM with clean grammar for chat support, operations, HR, and coordination roles.",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  3. First-Interview Preparation & Communication Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {[
                  "Prepare a calm 60-second 'Tell me about yourself' covering Education -> Practical Skills -> Why this specific role.",
                  "Use simple, clear sentences instead of memorising difficult vocabulary—clarity beats speed in Indian corporate interviews.",
                  "Practice the STAR framework (Situation, Task, Action, Result) using college events, family business help, or self-made projects.",
                  "Always prepare 2 thoughtful questions to ask the interviewer about training and day-to-day responsibilities.",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-secondary" />
                  4. UP, Bihar & Tier 2–4 Regional Hiring Reality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Graduates from Lucknow, Gorakhpur, Varanasi, Prayagraj, Patna, Muzaffarpur, Darbhanga, Jaipur, Indore, and nearby rural districts frequently relocate to Noida, Gurugram, Delhi NCR, Jaipur, Pune, or Bengaluru—or start in remote SaaS/BPO/EdTech roles.
                </p>
                <p>
                  <strong>Safety Check:</strong> Genuine employers never charge a security deposit or registration bribe to issue an offer letter. Verify company domains, check NCS/LinkedIn/official websites, and keep written records of all interview communications.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Degree Guide Links */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Explore Degree-Specific Career Guides
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {DEGREE_GUIDES.map((g) => (
                <Link
                  key={g.slug}
                  to={g.path}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors"
                >
                  <div>
                    <p className="font-bold text-foreground">Jobs After {g.degreeLabel}</p>
                    <p className="text-xs text-muted-foreground">{g.level}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-secondary" />
                </Link>
              ))}
            </div>
          </section>

          <DegreeAssessmentCta
            primaryLabel="Take Free Career Assessment"
            secondaryLabel="Browse 8 Career Tracks"
            secondaryPath="/career-paths"
            sourcePage="/career-guidance"
          />

          {/* FAQs */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Frequently Asked Questions — Fresher Job Readiness
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {GUIDANCE_FAQS.map((faq, idx) => (
                <AccordionItem key={idx} value={`guide-faq-${idx}`}>
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

          {/* Official References */}
          <section className="rounded-xl border border-border bg-muted/20 p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Official Indian Career & Skill Portals
            </h2>
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
                    <span className="font-semibold text-sm text-primary">{ref.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">{ref.description}</p>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
