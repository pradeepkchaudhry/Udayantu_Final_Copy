import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  GraduationCap,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STATIC_PUBLIC_SEO_ROUTES } from "@/data/seoRoutes";
import { type DegreeSlug } from "@/data/careerPrograms";
import {
  normalizeDegreeInput,
  recommendCareerTracks,
  type CareerRecommendation,
  type StudentAssessmentProfile,
} from "@/utils/careerRecommendationEngine";
import { createBreadcrumbSchema } from "@/utils/seo";
import { trackSeoConversion } from "@/lib/seoAnalytics";

const DEGREE_OPTIONS: Array<{ value: DegreeSlug | "other"; label: string }> = [
  { value: "ba", label: "BA (Bachelor of Arts)" },
  { value: "bcom", label: "B.Com (Bachelor of Commerce)" },
  { value: "bsc", label: "B.Sc (Bachelor of Science)" },
  { value: "bba", label: "BBA (Business Administration)" },
  { value: "bca", label: "BCA (Computer Applications)" },
  { value: "ma", label: "MA (Master of Arts)" },
  { value: "mcom", label: "M.Com (Master of Commerce)" },
  { value: "msc", label: "M.Sc (Master of Science)" },
  { value: "other", label: "Other Graduate Degree" },
];

const WORK_STYLE_OPTIONS: Array<{
  value: NonNullable<StudentAssessmentProfile["preferredWorkStyle"]>;
  title: string;
  desc: string;
}> = [
  {
    value: "client-facing",
    title: "Talking to Clients & Building Relationships",
    desc: "Calls, demos, onboarding, and persuasion",
  },
  {
    value: "process-data",
    title: "Spreadsheets, Tracking & Organising Processes",
    desc: "MIS reports, timelines, SLAs, and structured coordination",
  },
  {
    value: "support-problem-solving",
    title: "Helping Users Solve Problems & Troubleshooting",
    desc: "Support tickets, software workflows, and clear explanations",
  },
  {
    value: "creative-growth",
    title: "People, Campaigns & Creative Communication",
    desc: "Hiring coordination, content, digital campaigns, and branding",
  },
];

const SITUATIONAL_QUESTIONS = [
  {
    id: 1,
    question:
      "When working in a college or team project, which role do you naturally enjoy most?",
    options: [
      "Convincing others, presenting ideas, and bringing in external partners",
      "Analysing what went wrong and designing a better user experience",
      "Making the checklist, tracking deadlines, and keeping data accurate",
      "Listening to teammates, resolving confusion, and helping everyone succeed",
    ],
  },
  {
    id: 2,
    question: "If a customer is frustrated about a delayed service, what is your first instinct?",
    options: [
      "Reassure them confidently and turn the conversation into renewed trust",
      "Investigate the root cause in the workflow so it does not happen again",
      "Check the order/ticket logs step-by-step and give an accurate timeline",
      "Acknowledge their frustration calmly and guide them with clear next steps",
    ],
  },
  {
    id: 3,
    question: "Which daily task sounds most engaging to you for your first corporate job?",
    options: [
      "Speaking with 15–20 new business prospects and tracking a sales pipeline",
      "Reviewing user feedback, writing feature notes, and testing app flows",
      "Updating Excel trackers, verifying operations data, and hitting daily SLAs",
      "Screening candidates, onboarding clients, or guiding customers via chat/call",
    ],
  },
];

export default function CareerAssessmentPage() {
  const routeMeta = STATIC_PUBLIC_SEO_ROUTES.find(
    (r) => r.path === "/career-assessment"
  )!;
  const [searchParams] = useSearchParams();
  const initialDegree = normalizeDegreeInput(searchParams.get("degree"));

  const [degree, setDegree] = useState<DegreeSlug | "other">(
    initialDegree === "other" && !searchParams.get("degree") ? "ba" : initialDegree
  );
  const [specialization, setSpecialization] = useState("");
  const [preferredWorkStyle, setPreferredWorkStyle] =
    useState<NonNullable<StudentAssessmentProfile["preferredWorkStyle"]>>("client-facing");
  const [communicationComfort, setCommunicationComfort] = useState(3);
  const [analyticalComfort, setAnalyticalComfort] = useState(3);
  const [structuredWorkPreference, setStructuredWorkPreference] = useState(3);
  const [peopleEmpathy, setPeopleEmpathy] = useState(4);
  const [persuasionInterest, setPersuasionInterest] = useState(3);
  const [creativeInterest, setCreativeInterest] = useState(3);
  const [technicalComfort, setTechnicalComfort] = useState(3);
  const [psychometricAnswers, setPsychometricAnswers] = useState<Record<number, number>>({});
  const [recommendations, setRecommendations] = useState<CareerRecommendation[] | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    trackSeoConversion("assessment_started", {
      degree: initialDegree,
      source_page: "/career-assessment",
    });
  }, [initialDegree]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: StudentAssessmentProfile = {
      degree,
      specialization: specialization.trim() || undefined,
      communicationComfort,
      analyticalComfort,
      structuredWorkPreference,
      peopleEmpathy,
      persuasionInterest,
      creativeInterest,
      technicalComfort,
      preferredWorkStyle,
      psychometricAnswers,
    };

    const top3 = recommendCareerTracks(profile, 3);
    setRecommendations(top3);

    trackSeoConversion("assessment_completed", {
      degree,
      work_style: preferredWorkStyle,
    });
    trackSeoConversion("career_recommendations_shown", {
      degree,
      top_track: top3[0]?.program.id,
      second_track: top3[1]?.program.id,
      third_track: top3[2]?.program.id,
    });

    setTimeout(() => {
      document
        .getElementById("assessment-results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Careers After Graduation", path: "/careers-after-graduation" },
    { name: "Career Assessment", path: "/career-assessment" },
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
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 border-b border-border py-10 md:py-14">
          <div className="container mx-auto px-4 max-w-5xl space-y-5">
            <Breadcrumbs items={breadcrumbs} />
            <div className="space-y-3 max-w-3xl">
              <Badge variant="secondary" className="text-xs font-semibold">
                Free Interactive Tool • No Login Needed to Preview Results
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {routeMeta.h1}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Apni degree, subject specialization, communication comfort, aur kaam karne ke style ke basis par jaaniye UdaYantu ke 8 verified corporate tracks mein se aapke liye kaun-se top 3 tracks sabse practical hain.
              </p>
            </div>
            <EditorialTrustBar compact />
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 max-w-5xl space-y-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Degree & Specialization */}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Step 1: Your Degree & Subject Background
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="degree-select">Highest / Current Degree</Label>
                    <select
                      id="degree-select"
                      data-testid="assessment-degree-select"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value as DegreeSlug | "other")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {DEGREE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization-input">
                      Main Subject / Specialization (Optional)
                    </Label>
                    <Input
                      id="specialization-input"
                      data-testid="assessment-specialization-input"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g., English, Economics, Psychology, Maths, Computer Science"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Preferred Work Style */}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Compass className="w-5 h-5 text-secondary" />
                    Step 2: Which Daily Work Environment Fits You Best?
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-3">
                  {WORK_STYLE_OPTIONS.map((style) => {
                    const selected = preferredWorkStyle === style.value;
                    return (
                      <button
                        key={style.value}
                        type="button"
                        onClick={() => setPreferredWorkStyle(style.value)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40 bg-card"
                        }`}
                      >
                        <p className="font-semibold text-sm text-foreground">{style.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{style.desc}</p>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Step 3: Self-Rated Workplace Comfort */}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Step 3: Rate Your Comfort & Interest (1 = Low, 5 = High)
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-5">
                  {[
                    {
                      id: "comm",
                      label: "Spoken & Written Communication Comfort",
                      value: communicationComfort,
                      setter: setCommunicationComfort,
                    },
                    {
                      id: "ana",
                      label: "Numbers, Spreadsheets & Logical Analysis",
                      value: analyticalComfort,
                      setter: setAnalyticalComfort,
                    },
                    {
                      id: "struct",
                      label: "Structured Process, Checklists & Deadlines",
                      value: structuredWorkPreference,
                      setter: setStructuredWorkPreference,
                    },
                    {
                      id: "emp",
                      label: "Helping People & Patient Listening",
                      value: peopleEmpathy,
                      setter: setPeopleEmpathy,
                    },
                    {
                      id: "pers",
                      label: "Persuasion, Pitching & Achieving Targets",
                      value: persuasionInterest,
                      setter: setPersuasionInterest,
                    },
                    {
                      id: "creat",
                      label: "Content, Campaigns & Creative Ideas",
                      value: creativeInterest,
                      setter: setCreativeInterest,
                    },
                    {
                      id: "tech",
                      label: "Comfort Using Software Apps & Troubleshooting",
                      value: technicalComfort,
                      setter: setTechnicalComfort,
                    },
                  ].map((slider) => (
                    <div key={slider.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <Label htmlFor={`slider-${slider.id}`}>{slider.label}</Label>
                        <span className="font-bold text-primary">{slider.value}/5</span>
                      </div>
                      <input
                        id={`slider-${slider.id}`}
                        type="range"
                        min={1}
                        max={5}
                        value={slider.value}
                        onChange={(e) => slider.setter(Number(e.target.value))}
                        className="w-full accent-primary cursor-pointer"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Step 4: Quick Situational Psychometric */}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-secondary" />
                    Step 4: Quick Situational Aptitude (3 Questions)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {SITUATIONAL_QUESTIONS.map((q) => (
                    <div key={q.id} className="space-y-2.5">
                      <p className="font-semibold text-sm md:text-base text-foreground">
                        {q.id}. {q.question}
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt, idx) => {
                          const isSelected = psychometricAnswers[q.id] === idx;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() =>
                                setPsychometricAnswers((prev) => ({ ...prev, [q.id]: idx }))
                              }
                              className={`text-left text-xs md:text-sm p-3 rounded-lg border transition-all ${
                                isSelected
                                  ? "border-secondary bg-secondary/10 text-foreground font-medium"
                                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex flex-wrap items-center gap-4">
                <Button
                  type="submit"
                  size="lg"
                  data-testid="assessment-submit-btn"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-6 sm:px-8 w-full sm:w-auto whitespace-normal h-auto py-3.5 text-center"
                >
                  <Sparkles className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>Show My Top 3 Recommended Career Tracks</span>
                </Button>
                {recommendations && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setRecommendations(null);
                      setPsychometricAnswers({});
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Assessment
                  </Button>
                )}
              </div>
            </form>

            {/* Results Section */}
            {recommendations && (
              <section
                id="assessment-results"
                data-testid="assessment-results"
                className="space-y-6 pt-4 border-t border-border"
              >
                <div className="space-y-2">
                  <Badge className="bg-emerald-600 text-white">
                    Personalised Career Recommendation Report
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Your Top 3 Matched UdaYantu Career Tracks
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Based on your{" "}
                    <strong className="text-foreground">{degree.toUpperCase()}</strong>{" "}
                    {specialization ? `(${specialization}) ` : ""}
                    background and self-assessment, these three structured 15-week tracks offer the strongest practical alignment.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                  {recommendations.map((rec, index) => (
                    <Card
                      key={rec.program.id}
                      className={`border-2 flex flex-col justify-between ${
                        index === 0 ? "border-primary shadow-md" : "border-border"
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge
                            variant={index === 0 ? "default" : "secondary"}
                            className="text-xs"
                          >
                            #{index + 1} Best Fit
                          </Badge>
                          <span className="text-sm font-bold text-primary">
                            {rec.matchScore}% Fit Indicator
                          </span>
                        </div>
                        <CardTitle className="text-xl">{rec.program.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {rec.program.duration} • {rec.program.difficulty}
                        </p>
                      </CardHeader>

                      <CardContent className="space-y-4 flex-1 flex flex-col justify-between text-sm">
                        <div className="space-y-3">
                          <p className="text-muted-foreground leading-relaxed">
                            {rec.whyItFitsDegree}
                          </p>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-foreground mb-1.5">
                              Priority Skills to Build
                            </p>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                              {rec.keySkillsToBuild.map((skill) => (
                                <li key={skill} className="flex items-start gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                  <span>{skill}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <p className="text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg">
                            {rec.trainingNote}
                          </p>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-border/60">
                          <Button asChild variant="outline" className="w-full justify-between">
                            <Link
                              to={rec.program.path}
                              onClick={() =>
                                trackSeoConversion("programme_details_opened", {
                                  programme: rec.program.id,
                                  source_page: "/career-assessment",
                                })
                              }
                            >
                              <span>Explore Full Curriculum</span>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Next Step Conversion Card */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-bold text-lg text-foreground flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        Ready for a full aptitude evaluation & mentor review?
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Register your student account to access the full cohort onboarding, syllabus walkthrough, and written fee/refund details.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 flex-shrink-0">
                      <Button
                        size="lg"
                        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
                        onClick={() => {
                          trackSeoConversion("registration_initiated", {
                            degree,
                            top_track: recommendations[0]?.program.id,
                            source_page: "/career-assessment",
                          });
                          setAuthOpen(true);
                        }}
                      >
                        Register & Save Recommendations
                      </Button>
                      {degree !== "other" && (
                        <Button asChild size="lg" variant="outline">
                          <Link to={`/jobs-after-${degree}`}>
                            Read {degree.toUpperCase()} Career Guide
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultTab="register"
      />
    </div>
  );
}
