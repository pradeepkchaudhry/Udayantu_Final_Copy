import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Languages,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import {
  getAnonymousAssessmentToken,
  platformApi,
  setAnonymousAssessmentToken,
  type FullPsychometricReportDto,
  type PreviewPsychometricReportDto,
  type PublicPsychometricQuestionDto,
} from "@/lib/platformApi";
import { trackFunnelStage } from "@/lib/funnelAnalytics";

type LangMode = "en" | "bilingual";

const CareerAssessmentPage = () => {
  const navigate = useNavigate();
  const { platformUser } = useAuth();

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [questions, setQuestions] = useState<PublicPsychometricQuestionDto[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [langMode, setLangMode] = useState<LangMode>("bilingual");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewPsychometricReportDto | null>(null);
  const [fullReport, setFullReport] = useState<FullPsychometricReportDto | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    trackFunnelStage("landing_page_viewed");
    let cancelled = false;

    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const existingToken = getAnonymousAssessmentToken();
        if (existingToken) {
          try {
            const existing = await platformApi.getAnonymousAssessment(existingToken);
            if (!cancelled) {
              setSessionToken(existing.sessionToken);
              setQuestions(existing.questions);
              setAnswers(existing.answers || {});
              if (existing.preview) {
                setPreview(existing.preview);
                setStarted(true);
                trackFunnelStage("preview_result_viewed");
              } else if (Object.keys(existing.answers || {}).length > 0) {
                setStarted(true);
                const firstUnanswered = existing.questions.findIndex((q) => !existing.answers?.[q.id]);
                setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
              }
              // If already signed in as student and preview exists, claim full report seamlessly
              if (platformUser?.role === "student" && existing.preview) {
                const claimed = await platformApi.claimAssessment(existing.sessionToken);
                if (!cancelled && claimed.report) {
                  setFullReport(claimed.report);
                }
              }
              setLoading(false);
              return;
            }
          } catch {
            // Session expired or not found on fresh server restart -> start clean
            setAnonymousAssessmentToken(null);
          }
        }

        const params = new URLSearchParams(window.location.search);
        const created = await platformApi.startAnonymousAssessment({
          utmSource: params.get("utm_source") || undefined,
          utmCampaign: params.get("utm_campaign") || undefined,
        });
        if (!cancelled) {
          setSessionToken(created.sessionToken);
          setAnonymousAssessmentToken(created.sessionToken);
          setQuestions(created.questions);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load the career assessment.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [platformUser?.role]);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const remainingMinutes = useMemo(() => {
    const remainingSeconds = questions
      .filter((q) => !answers[q.id])
      .reduce((acc, q) => acc + (q.estimatedSeconds || 25), 0);
    return Math.max(1, Math.ceil(remainingSeconds / 60));
  }, [questions, answers]);

  const currentQuestion = questions[currentIndex] ?? null;

  const handleStart = () => {
    setStarted(true);
    trackFunnelStage("free_assessment_started");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectOption = async (questionId: string, optionId: string) => {
    const nextAnswers = { ...answers, [questionId]: optionId };
    setAnswers(nextAnswers);
    setError(null);

    if (sessionToken) {
      platformApi.saveAnonymousAssessmentProgress(sessionToken, { [questionId]: optionId }).catch(() => {
        // Non-blocking auto-save
      });
    }

    // Smooth auto-advance on non-final questions
    if (currentIndex < questions.length - 1) {
      window.setTimeout(() => {
        setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 180);
    }
  };

  const handleSubmit = async () => {
    if (!sessionToken) return;
    if (answeredCount < totalQuestions) {
      const firstMissing = questions.findIndex((q) => !answers[q.id]);
      if (firstMissing >= 0) setCurrentIndex(firstMissing);
      setError("Please answer all scenario questions so your career fit preview is accurate.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await platformApi.submitAnonymousAssessment(sessionToken, answers);
      setPreview(res.preview);
      trackFunnelStage("free_assessment_completed");
      trackFunnelStage("preview_result_viewed");

      if (platformUser?.role === "student") {
        const claimed = await platformApi.claimAssessment(sessionToken);
        if (claimed.report) {
          setFullReport(claimed.report);
          trackFunnelStage("course_recommended");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlockFullReport = () => {
    trackFunnelStage("full_report_cta_clicked");
    if (platformUser?.role === "student") {
      navigate("/dashboard?tab=report");
    } else {
      navigate("/register?unlockReport=1&returnTo=/dashboard");
    }
  };

  const handleRestartFresh = async () => {
    setAnonymousAssessmentToken(null);
    setPreview(null);
    setFullReport(null);
    setAnswers({});
    setCurrentIndex(0);
    setLoading(true);
    try {
      const created = await platformApi.startAnonymousAssessment();
      setSessionToken(created.sessionToken);
      setAnonymousAssessmentToken(created.sessionToken);
      setQuestions(created.questions);
      setStarted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start a new session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Free Career Discovery & Psychometric Assessment | UdaYantu"
        description="Discover the career direction that matches your strengths with UdaYantu's free pre-login psychometric assessment for Indian graduates."
        canonicalPath="/career-assessment"
      />
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />

        <main className="flex-1 pt-24 pb-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            {loading ? (
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="py-16 text-center space-y-3">
                  <div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-sm text-slate-600">Preparing your career discovery scenarios...</p>
                </CardContent>
              </Card>
            ) : fullReport ? (
              /* ==================== 100% FULL AUTHENTICATED CAREER REPORT ==================== */
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                    Complete Career Discovery Report • Engine {fullReport.engineVersion}
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Your Top 3 Matched Career Directions
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-slate-600">
                    Ranked strictly by your work-style preferences, communication tendencies, problem-solving orientation, and foundational readiness across all 11 dimensions.
                  </p>
                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-5">
                    <div>
                      <p className="text-xs text-slate-500">Top Recommended Track</p>
                      <p className="text-base font-bold text-slate-900">{fullReport.topTracks[0].name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Practical Aptitude</p>
                      <p className="text-base font-bold text-slate-900">{fullReport.aptitudeScorePercent}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Foundational English</p>
                      <p className="text-base font-bold text-slate-900">{fullReport.englishScorePercent}%</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {fullReport.topTracks.map((track) => (
                    <Card
                      key={track.trackId}
                      className={
                        track.rank === 1
                          ? "border-2 border-primary bg-white shadow-sm"
                          : "border-slate-200 bg-white"
                      }
                    >
                      <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                              Recommendation #{track.rank}
                            </p>
                            <CardTitle className="text-xl mt-0.5">
                              {track.name}{" "}
                              <span className="text-sm font-normal text-slate-500">({track.hindiName})</span>
                            </CardTitle>
                          </div>
                          <span className="text-lg font-bold text-primary">
                            {track.alignmentPercent}% Fit
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm text-slate-700">
                        <p>{track.summary}</p>
                        <p className="text-slate-600">{track.whyItFits}</p>

                        <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                          <div>
                            <h3 className="font-semibold text-slate-900 mb-1.5">Key Skills You Will Build</h3>
                            <ul className="space-y-1 text-slate-600">
                              {track.relevantSkills.map((skill) => (
                                <li key={skill} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{skill}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 mb-1.5">Suitable Entry-Level Roles</h3>
                            <ul className="space-y-1 text-slate-600 list-disc pl-4">
                              {track.suitableJobFamilies.map((role) => (
                                <li key={role}>{role}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                          <h3 className="font-semibold text-slate-900 mb-1.5">Recommended 90-Day Learning Path</h3>
                          <ol className="space-y-1 text-slate-600 list-decimal pl-5">
                            {track.recommendedLearningPath.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ol>
                        </div>

                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
                          <strong className="text-slate-800">Market Hiring Context (Shown Separately from Fit):</strong>{" "}
                          {track.jobAvailabilityContext}
                        </div>

                        {track.rank === 1 && (
                          <div className="pt-2 flex flex-wrap gap-3">
                            <Button
                              size="lg"
                              className="w-full sm:w-auto min-h-[44px]"
                              onClick={() => navigate(`/payment?courseId=course-${track.trackId}`)}
                            >
                              Explore My Recommended Course
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button
                              variant="outline"
                              size="lg"
                              className="w-full sm:w-auto min-h-[44px]"
                              onClick={() => navigate("/dashboard")}
                            >
                              Go to Student Dashboard
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Strengths, Growth Areas &amp; Work-Style Tendencies</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 text-sm">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">Your Core Strengths</h3>
                        <ul className="space-y-2 text-slate-700">
                          {fullReport.strengths.map((s) => (
                            <li key={s} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">Development Opportunities</h3>
                        <ul className="space-y-2 text-slate-700">
                          {fullReport.developmentOpportunities.map((d) => (
                            <li key={d} className="flex items-start gap-2">
                              <Compass className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <h3 className="font-semibold text-slate-900 mb-3">11-Dimension Preference Profile</h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {fullReport.dimensionProfiles.map((dim) => (
                          <div key={dim.dimension} className="rounded-lg border border-slate-200 p-3">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-semibold text-slate-900 text-xs">{dim.label}</span>
                              <span className="text-xs font-medium text-primary">{dim.tendencyLabel}</span>
                            </div>
                            <Progress value={dim.scoreOutOf100} className="h-1.5 mb-2" />
                            <p className="text-xs text-slate-600 leading-relaxed">{dim.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 pt-3 border-t border-slate-100">
                      {fullReport.nonClinicalDisclaimer}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : preview ? (
              /* ==================== 20% FREE RESULT PREVIEW ==================== */
              <div className="space-y-6">
                <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="bg-slate-900 text-white px-6 py-6 sm:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 mb-2">
                      <span className="uppercase tracking-wider font-semibold">
                        Free {preview.previewSharePercent}% Career Preview Ready
                      </span>
                      <span>
                        {preview.questionsAnswered}/{preview.totalQuestions} Scenarios Completed
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold">
                      Primary Direction: {preview.primaryTrack.name}
                    </h1>
                    <p className="text-sm text-slate-300 mt-1">
                      {preview.primaryTrack.hindiName} • {preview.primaryTrack.alignmentPercent}% Career Alignment
                    </p>
                  </div>

                  <CardContent className="p-6 sm:p-8 space-y-6">
                    <p className="text-base text-slate-700 leading-relaxed">
                      {preview.primaryTrack.summary} {preview.primaryTrack.whyItFits}
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h2 className="text-sm font-semibold text-slate-900 mb-2">
                          Key Behavioural Tendencies
                        </h2>
                        <ul className="space-y-2 text-sm text-slate-700">
                          {preview.keyBehaviouralInsights.map((insight) => (
                            <li key={insight} className="flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                        <div>
                          <h2 className="text-sm font-semibold text-slate-900 mb-1.5">Strengths Snapshot</h2>
                          <ul className="space-y-1.5 text-sm text-slate-700">
                            {preview.briefStrengthsSummary.map((str) => (
                              <li key={str} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">
                            1 Development Opportunity
                          </h3>
                          <p className="text-sm text-slate-700">{preview.developmentOpportunity}</p>
                        </div>
                      </div>
                    </div>

                    {/* Transparent Unlock Box for remaining 80% */}
                    <div className="rounded-xl border-2 border-primary/25 bg-primary/[0.03] p-5 sm:p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <h2 className="text-lg font-bold text-slate-900">
                            Unlock Your Complete Career Report (Free Account Required)
                          </h2>
                          <p className="text-sm text-slate-600 mt-1">
                            Your completed answers are safely saved. Create a free student account or sign in to recover this session and view:
                          </p>
                        </div>
                      </div>

                      <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-700 pl-1">
                        {preview.fullReportIncludes.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        <Button
                          size="lg"
                          className="w-full sm:w-auto min-h-[48px] text-base font-semibold"
                          onClick={handleUnlockFullReport}
                        >
                          Unlock My Full Career Report
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full sm:w-auto min-h-[48px]"
                          onClick={() => navigate("/login?returnTo=/dashboard")}
                        >
                          Already Registered? Sign In
                        </Button>
                      </div>

                      <p className="text-xs text-slate-500">
                        Discover the career direction that matches your strengths. Build the skills employers need and prepare for opportunities aligned with your interests. Enrollment does not guarantee a job.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <span>{preview.nonClinicalDisclaimer}</span>
                      <button
                        type="button"
                        onClick={handleRestartFresh}
                        className="text-primary font-medium hover:underline"
                      >
                        Start a fresh attempt
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : !started ? (
              /* ==================== WELCOME SCREEN (PRE-LOGIN) ==================== */
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6 sm:p-10 space-y-6">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Free Pre-Login Career Discovery • No Account Needed
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
                      Discover the career direction that matches your strengths.
                    </h1>
                    <p className="text-base text-slate-600 leading-relaxed">
                      Designed for BA, B.Com, B.Sc, and graduate learners across India. Respond to{" "}
                      <strong>{totalQuestions} short real-world workplace scenarios</strong> (available in
                      simple English with Hindi guidance) to explore which of our 8 corporate career tracks
                      suits your work style.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 py-4 border-y border-slate-100 text-sm">
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900">~6 Minutes</p>
                        <p className="text-xs text-slate-600">Progress auto-saves safely</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Languages className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900">English + हिंदी</p>
                        <p className="text-xs text-slate-600">Accessible, jargon-free scenarios</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900">Not a School Exam</p>
                        <p className="text-xs text-slate-600">Shows tendencies, not fixed labels</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">What you receive immediately for free (20% Preview):</p>
                    <ul className="space-y-1.5 list-disc pl-5">
                      <li>Your primary recommended career track from UdaYantu&apos;s 8 canonical paths</li>
                      <li>Two key work-style &amp; communication tendency insights</li>
                      <li>Brief strengths summary and one actionable development opportunity</li>
                    </ul>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto min-h-[48px] px-8 text-base font-semibold"
                      onClick={handleStart}
                    >
                      Start Free Assessment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="ghost" size="lg" className="w-full sm:w-auto min-h-[48px]" asChild>
                      <Link to="/courses">Browse All 8 Career Tracks</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : currentQuestion ? (
              /* ==================== ACTIVE SCENARIO QUESTION FLOW ==================== */
              <div className="space-y-5">
                <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                    <span className="font-semibold text-slate-900">
                      Scenario {currentIndex + 1} of {totalQuestions}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <Clock className="w-3.5 h-3.5" />
                        ~{remainingMinutes} min left
                      </span>
                      <button
                        type="button"
                        onClick={() => setLangMode((m) => (m === "bilingual" ? "en" : "bilingual"))}
                        className="inline-flex items-center gap-1 text-primary font-medium hover:underline min-h-[32px]"
                      >
                        <Languages className="w-3.5 h-3.5" />
                        {langMode === "bilingual" ? "English + हिंदी" : "English Only"}
                      </button>
                    </div>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{currentQuestion.category}</span>
                    <span>{answeredCount} answered • auto-saved</span>
                  </div>
                </div>

                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-6 sm:p-8 space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                        {currentQuestion.promptEn}
                      </h2>
                      {langMode === "bilingual" && (
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                          {currentQuestion.promptHi}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {currentQuestion.options.map((opt) => {
                        const isSelected = answers[currentQuestion.id] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                            className={`w-full text-left rounded-xl border p-4 transition-all min-h-[56px] ${
                              isSelected
                                ? "border-primary bg-primary/[0.06] ring-1 ring-primary"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                                  isSelected
                                    ? "border-primary bg-primary text-white"
                                    : "border-slate-300 text-slate-500"
                                }`}
                              >
                                {isSelected ? "✓" : opt.id.toUpperCase()}
                              </span>
                              <div className="space-y-1">
                                <p className="text-sm sm:text-base font-medium text-slate-900 leading-snug">
                                  {opt.labelEn}
                                </p>
                                {langMode === "bilingual" && (
                                  <p className="text-xs sm:text-sm text-slate-600">{opt.labelHi}</p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {error && (
                      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <Button
                        variant="outline"
                        className="min-h-[44px]"
                        disabled={currentIndex === 0}
                        onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                      >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Previous
                      </Button>

                      {currentIndex < totalQuestions - 1 ? (
                        <Button
                          className="min-h-[44px]"
                          disabled={!answers[currentQuestion.id]}
                          onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
                        >
                          Next Scenario
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Button>
                      ) : (
                        <Button
                          className="min-h-[44px] px-6 font-semibold"
                          disabled={submitting || answeredCount < totalQuestions}
                          onClick={handleSubmit}
                        >
                          {submitting ? "Generating Preview..." : "See My Free 20% Preview"}
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CareerAssessmentPage;
