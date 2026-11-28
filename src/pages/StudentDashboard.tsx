import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  ExternalLink,
  FileText,
  LogOut,
  Mail,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import {
  getAnonymousAssessmentToken,
  platformApi,
  type StudentDashboardDto,
} from "@/lib/platformApi";
import { trackFunnelStage } from "@/lib/funnelAnalytics";

type DashboardTab = "learning" | "report" | "exam" | "career" | "refund";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { platformUser, loading: authLoading, signOut } = useAuth();

  const initialTab = (searchParams.get("tab") as DashboardTab) || "learning";
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [data, setData] = useState<StudentDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  // Email verify state
  const [emailCode, setEmailCode] = useState(
    () => sessionStorage.getItem("udayantu_email_verify_hint") || ""
  );

  // Module video player & assignment note state
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState<Record<string, string>>({});

  // Final exam state
  const [examQuestions, setExamQuestions] = useState<
    Array<{
      id: string;
      sectionId: string;
      sectionTitle: string;
      prompt: string;
      options: Array<{ id: string; label: string }>;
    }>
  >([]);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [examLoaded, setExamLoaded] = useState(false);

  // Refund request reason
  const [refundReason, setRefundReason] = useState(
    "120 calendar days completed after final assessment pass without qualifying job selection."
  );

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Automatically claim saved anonymous psychometric session if present
      const anonToken = getAnonymousAssessmentToken();
      if (anonToken) {
        try {
          await platformApi.claimAssessment(anonToken);
        } catch {
          // already claimed or expired — safe to ignore
        }
      }
      const dash = await platformApi.getStudentDashboard();
      setData(dash);
      if (dash.course?.modules[0]?.youtubeUrl && !activeVideoUrl) {
        setActiveVideoUrl(dash.course.modules[0].youtubeUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your student dashboard.");
    } finally {
      setLoading(false);
    }
  }, [activeVideoUrl]);

  useEffect(() => {
    if (authLoading) return;
    if (!platformUser) {
      navigate("/login?returnTo=/dashboard", { replace: true });
      return;
    }
    if (platformUser.role !== "student") {
      navigate("/employer/dashboard", { replace: true });
      return;
    }
    loadDashboard();
  }, [authLoading, platformUser, navigate, loadDashboard]);

  const changeTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
    setNotice(null);
    setError(null);
  };

  const handleVerifyEmail = async () => {
    if (!emailCode.trim()) return;
    setBusyAction("verify-email");
    setError(null);
    try {
      await platformApi.verifyEmail(emailCode.trim());
      sessionStorage.removeItem("udayantu_email_verify_hint");
      setNotice("Email address verified successfully.");
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email verification code.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleCompleteModule = async (moduleId: string) => {
    setBusyAction(`mod-${moduleId}`);
    setError(null);
    try {
      await platformApi.completeModule(moduleId);
      trackFunnelStage("learning_started");
      setNotice("Module marked complete and saved to your cohort progress.");
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update module progress.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    const notes = (assignmentNotes[assignmentId] || "").trim();
    if (notes.length < 10) {
      setError("Please add a brief summary of your completed assignment (at least 10 characters).");
      return;
    }
    setBusyAction(`asg-${assignmentId}`);
    setError(null);
    try {
      await platformApi.submitAssignment(assignmentId, notes);
      setNotice("Assignment submitted successfully.");
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit assignment.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleAttendLiveClass = async (classId: string, joinUrl: string) => {
    setBusyAction(`live-${classId}`);
    try {
      await platformApi.attendLiveClass(classId);
      setNotice("Live class attendance recorded. Opening session link...");
      await loadDashboard();
      window.open(joinUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record attendance.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleLoadFinalExam = async () => {
    setBusyAction("load-exam");
    setError(null);
    try {
      const res = await platformApi.getFinalAssessmentQuestions();
      setExamQuestions(res.questions);
      setExamLoaded(true);
      trackFunnelStage("final_assessment_attempted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load final assessment questions.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleSubmitFinalExam = async () => {
    if (Object.keys(examAnswers).length < examQuestions.length) {
      setError("Please answer all final examination questions before submitting.");
      return;
    }
    setBusyAction("submit-exam");
    setError(null);
    try {
      const attempt = await platformApi.submitFinalAssessment(examAnswers);
      if (attempt.result.qualified) {
        trackFunnelStage("final_assessment_passed");
        setNotice(
          `Congratulations! You scored ${attempt.result.overallScorePercent}% and passed the Final Examination. Your 120-day Plan A refund clock (if applicable) and employer eligibility are now active.`
        );
      } else {
        setNotice(
          `Attempt #${attempt.attemptNumber} graded: ${attempt.result.overallScorePercent}%. ${attempt.result.reason}`
        );
      }
      setExamLoaded(false);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not grade final examination.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleToggleConsent = async (nextValue: boolean) => {
    setBusyAction("consent");
    setError(null);
    try {
      await platformApi.updateRecruitmentConsent(nextValue);
      if (nextValue) trackFunnelStage("recruitment_consent_granted");
      setNotice(
        nextValue
          ? "Recruitment visibility consent granted. Approved employers can now discover your verified profile."
          : "Recruitment visibility consent revoked immediately. Employers can no longer view your profile."
      );
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update recruitment consent.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    setBusyAction(`offer-${offerId}`);
    setError(null);
    try {
      const res = await platformApi.acceptWrittenOffer(offerId);
      trackFunnelStage("offer_accepted");
      setNotice(
        `Written offer accepted. Tuition obligation recorded (${res.tuitionObligation.tuitionPercent}% of CTC, GST inclusive; admission fee not adjusted).`
      );
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not accept written offer.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleRequestRefund = async () => {
    setBusyAction("refund");
    setError(null);
    try {
      await platformApi.requestAdmissionRefund(refundReason);
      setNotice("Plan A admission refund request submitted for Admin verification.");
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refund request could not be submitted.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-600">Loading your UdaYantu Student Dashboard...</p>
      </div>
    );
  }

  const topRecommendedTrack = data?.fullCareerReport?.topTracks[0] ?? null;

  return (
    <>
      <SEOHead
        title="Student Dashboard | UdaYantu"
        description="Manage your career report, 90-day cohort classes, final examination, recruitment consent, written offers, and admission refund lifecycle."
        canonicalPath="/dashboard"
        noIndex={true}
      />

      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />

        <main className="flex-1 pt-24 pb-16 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Minimal Student Header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Student Workspace
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
                    Welcome, {data?.student.fullName}
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    {data?.course
                      ? `${data.course.titleEn} • ${data.cohort?.name ?? "90-Day Cohort"}`
                      : topRecommendedTrack
                      ? `Recommended Track: ${topRecommendedTrack.name} (${topRecommendedTrack.alignmentPercent}% Fit)`
                      : "Start your free psychometric assessment or select a 90-day cohort."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!data?.enrollment && (
                    <Button
                      className="min-h-[44px]"
                      onClick={() =>
                        navigate(
                          topRecommendedTrack
                            ? `/payment?courseId=course-${topRecommendedTrack.trackId}`
                            : "/payment"
                        )
                      }
                    >
                      Explore My Recommended Course
                    </Button>
                  )}
                  <Button variant="outline" className="min-h-[44px]" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-1.5" />
                    Sign Out
                  </Button>
                </div>
              </div>

              {/* Quick KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Cohort Progress</p>
                  <p className="font-bold text-slate-900 text-base">
                    {data?.enrollment ? `${data.enrollment.learningProgressPercent}%` : "Not Enrolled"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Final Exam (≥75%)</p>
                  <p className="font-bold text-slate-900 text-base">
                    {data?.finalAssessment.qualified
                      ? `Qualified (${data.eligibility?.finalScorePercent}%)`
                      : data?.finalAssessment.attempts.length
                      ? `Last: ${data.finalAssessment.attempts[data.finalAssessment.attempts.length - 1].scorePercent}%`
                      : "Pending"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Recruitment Consent</p>
                  <p className="font-bold text-slate-900 text-base">
                    {data?.consent.employerVisibilityGranted ? "Visible to Employers" : "Private (Off)"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Admission Plan</p>
                  <p className="font-bold text-slate-900 text-base">
                    {data?.enrollment
                      ? data.enrollment.planCode === "plan_a_refundable"
                        ? "Plan A (Refundable)"
                        : "Plan B (Non-Refundable)"
                      : "Not Selected"}
                  </p>
                </div>
              </div>
            </div>

            {/* Cohort Disabled Read-Only Preservation Banner */}
            {data?.enrollment?.accessNotice && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                <strong>Cohort Read-Only Notice:</strong> {data.enrollment.accessNotice}
              </div>
            )}

            {/* Email verification prompt if unverified */}
            {data && !data.student.emailVerified && (
              <Card className="border-slate-200 bg-white">
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 text-sm">
                    <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">Verify Your Email Address</p>
                      <p className="text-xs text-slate-600">
                        Enter the 6-digit verification code sent to {data.student.email}.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={emailCode}
                      onChange={(e) => setEmailCode(e.target.value)}
                      placeholder="6-digit code"
                      className="w-36 min-h-[44px] font-mono"
                    />
                    <Button
                      onClick={handleVerifyEmail}
                      disabled={busyAction === "verify-email"}
                      className="min-h-[44px]"
                    >
                      Verify
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {notice && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
                {notice}
              </div>
            )}

            {/* Clean Mobile-Scrollable Tab Bar */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(
                [
                  { id: "learning", label: "Learning & Live Class", icon: BookOpen },
                  { id: "report", label: "Career Report", icon: Compass },
                  { id: "exam", label: "Final Exam (75%)", icon: Award },
                  { id: "career", label: "Consent & Offers", icon: ShieldCheck },
                  { id: "refund", label: "Admission & Refund", icon: Clock },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => changeTab(id)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold border transition-colors min-h-[44px] ${
                    activeTab === id
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* ==================== TAB 1: LEARNING & LIVE CLASS ==================== */}
            {activeTab === "learning" && (
              <div className="space-y-5">
                {!data?.enrollment || !data.course ? (
                  <Card className="border-slate-200 bg-white">
                    <CardContent className="p-6 sm:p-8 space-y-4">
                      <h2 className="text-xl font-bold text-slate-900">
                        Start Your 90-Day Career Readiness Cohort
                      </h2>
                      <p className="text-sm text-slate-600 max-w-2xl">
                        {topRecommendedTrack
                          ? `Based on your psychometric assessment, ${topRecommendedTrack.name} is your strongest career alignment. Compare Plan A (Refundable) and Plan B (Non-Refundable) to join the next 90-day cohort.`
                          : "Take the free psychometric career assessment first to discover your best-fit track, or explore our 8 canonical career courses directly."}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          className="min-h-[44px]"
                          onClick={() =>
                            navigate(
                              topRecommendedTrack
                                ? `/payment?courseId=course-${topRecommendedTrack.trackId}`
                                : "/payment"
                            )
                          }
                        >
                          Compare Plan A &amp; Plan B Admission
                        </Button>
                        {!data?.fullCareerReport && (
                          <Button variant="outline" className="min-h-[44px]" asChild>
                            <Link to="/career-assessment">Take Free Psychometric Assessment</Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Upcoming Live Class (Zoom / Google Meet) */}
                    {data.cohort?.upcomingLiveClass && (
                      <Card className="border-slate-200 bg-white">
                        <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                              <Video className="w-3.5 h-3.5" />
                              Upcoming Live Session ({data.cohort.upcomingLiveClass.platform})
                            </p>
                            <h2 className="text-lg font-bold text-slate-900">
                              {data.cohort.upcomingLiveClass.title}
                            </h2>
                            <p className="text-xs text-slate-600 flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(data.cohort.upcomingLiveClass.scheduledAt).toLocaleString("en-IN")} •
                              Mentor: {data.cohort.mentorName}
                            </p>
                          </div>
                          <Button
                            className="min-h-[44px] shrink-0"
                            disabled={busyAction === `live-${data.cohort.upcomingLiveClass.id}`}
                            onClick={() =>
                              handleAttendLiveClass(
                                data.cohort!.upcomingLiveClass.id,
                                data.cohort!.upcomingLiveClass.joinUrl
                              )
                            }
                          >
                            Join {data.cohort.upcomingLiveClass.platform}
                            <ExternalLink className="w-4 h-4 ml-1.5" />
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {/* Progress Bar */}
                    <Card className="border-slate-200 bg-white">
                      <CardContent className="p-5 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-slate-900">
                            90-Day Coursework Completion
                          </span>
                          <span className="font-bold text-primary">
                            {data.enrollment.learningProgressPercent}%
                          </span>
                        </div>
                        <Progress value={data.enrollment.learningProgressPercent} className="h-2" />
                        <p className="text-xs text-slate-600">
                          Complete all modules and assignments to unlock full Final Examination qualification.
                        </p>
                      </CardContent>
                    </Card>

                    {/* Recorded Video Player + Module List + Signed PDF Downloads */}
                    <div className="grid lg:grid-cols-5 gap-5">
                      <Card className="lg:col-span-3 border-slate-200 bg-white">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Recorded Video Lessons (YouTube)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {activeVideoUrl && (
                            <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                              <iframe
                                src={activeVideoUrl}
                                title="Recorded UdaYantu Training Lesson"
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )}

                          <div className="space-y-3">
                            {data.course.modules.map((mod, idx) => (
                              <div
                                key={mod.id}
                                className="rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                              >
                                <div className="space-y-1">
                                  <p className="text-sm font-semibold text-slate-900">
                                    Module {idx + 1}: {mod.title}
                                  </p>
                                  <p className="text-xs text-slate-500">{mod.durationMinutes} min video lesson</p>
                                  <div className="flex flex-wrap gap-3 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => setActiveVideoUrl(mod.youtubeUrl)}
                                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                    >
                                      <PlayCircle className="w-3.5 h-3.5" />
                                      Watch Lesson
                                    </button>
                                    <a
                                      href={mod.signedPdfUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:underline"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      {mod.pdfLabel}
                                    </a>
                                  </div>
                                </div>

                                <Button
                                  size="sm"
                                  variant={mod.completed ? "outline" : "default"}
                                  disabled={mod.completed || busyAction === `mod-${mod.id}`}
                                  onClick={() => handleCompleteModule(mod.id)}
                                  className="min-h-[40px] shrink-0"
                                >
                                  {mod.completed ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                                      Completed
                                    </>
                                  ) : (
                                    "Mark Complete"
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Assignments */}
                      <Card className="lg:col-span-2 border-slate-200 bg-white">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Mandatory Practical Assignments</CardTitle>
                          <CardDescription>
                            Required alongside the 75% final exam score for verified eligibility.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {data.course.assignments.map((asg) => (
                            <div key={asg.id} className="rounded-xl border border-slate-200 p-4 space-y-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-900">{asg.title}</p>
                                <span className="text-xs font-medium text-slate-500 shrink-0">
                                  Week {asg.dueWeek}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">{asg.brief}</p>
                              {asg.submitted ? (
                                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Submitted &amp; Recorded
                                </p>
                              ) : (
                                <div className="space-y-2 pt-1">
                                  <Input
                                    value={assignmentNotes[asg.id] || ""}
                                    onChange={(e) =>
                                      setAssignmentNotes((prev) => ({
                                        ...prev,
                                        [asg.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Paste summary or work link..."
                                    className="min-h-[40px] text-xs"
                                  />
                                  <Button
                                    size="sm"
                                    disabled={busyAction === `asg-${asg.id}`}
                                    onClick={() => handleSubmitAssignment(asg.id)}
                                    className="w-full min-h-[40px]"
                                  >
                                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                                    Submit Assignment
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ==================== TAB 2: FULL CAREER REPORT ==================== */}
            {activeTab === "report" && (
              <div className="space-y-5">
                {!data?.fullCareerReport ? (
                  <Card className="border-slate-200 bg-white">
                    <CardContent className="p-6 sm:p-8 space-y-4">
                      <h2 className="text-xl font-bold text-slate-900">
                        Complete Your Free Psychometric Career Assessment
                      </h2>
                      <p className="text-sm text-slate-600">
                        You have not claimed a psychometric assessment yet. Complete the 11-dimension scenario assessment to unlock your Top 3 canonical career tracks and 90-day learning roadmap.
                      </p>
                      <Button asChild className="min-h-[44px]">
                        <Link to="/career-assessment">Start Career Assessment</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="grid md:grid-cols-3 gap-4">
                      {data.fullCareerReport.topTracks.map((track) => (
                        <Card
                          key={track.trackId}
                          className={
                            track.rank === 1
                              ? "border-2 border-primary bg-white"
                              : "border-slate-200 bg-white"
                          }
                        >
                          <CardHeader className="pb-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                              Track #{track.rank} • {track.alignmentPercent}% Fit
                            </p>
                            <CardTitle className="text-lg">{track.name}</CardTitle>
                            <CardDescription>{track.hindiName}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3 text-xs text-slate-600">
                            <p className="text-slate-700">{track.summary}</p>
                            <div>
                              <p className="font-semibold text-slate-900 mb-1">Job Families</p>
                              <p>{track.suitableJobFamilies.join(", ")}</p>
                            </div>
                            <p className="text-[11px] bg-slate-50 border border-slate-200 rounded p-2">
                              <strong>Hiring Context:</strong> {track.jobAvailabilityContext}
                            </p>
                            {!data.enrollment && (
                              <Button
                                size="sm"
                                className="w-full min-h-[40px]"
                                onClick={() => navigate(`/payment?courseId=course-${track.trackId}`)}
                              >
                                Explore Recommended Course
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="border-slate-200 bg-white">
                      <CardHeader>
                        <CardTitle className="text-base">Strengths &amp; Development Opportunities</CardTitle>
                      </CardHeader>
                      <CardContent className="grid sm:grid-cols-2 gap-5 text-sm">
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-2">Core Strengths</h3>
                          <ul className="space-y-1.5 text-slate-700">
                            {data.fullCareerReport.strengths.map((s) => (
                              <li key={s} className="flex items-start gap-2">
                                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-2">Development Opportunities</h3>
                          <ul className="space-y-1.5 text-slate-700 list-disc pl-5">
                            {data.fullCareerReport.developmentOpportunities.map((d) => (
                              <li key={d}>{d}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )}

            {/* ==================== TAB 3: FINAL EXAMINATION (75% PASS) ==================== */}
            {activeTab === "exam" && (
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl">Final Career-Readiness Examination</CardTitle>
                  <CardDescription>
                    Server-graded assessment covering Domain Knowledge, Tools &amp; Practical Skills, Aptitude, and General Communication. Minimum passing score:{" "}
                    <strong>{data?.finalAssessment.passingThresholdPercent ?? 75}%</strong> plus completed mandatory coursework.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {!data?.enrollment ? (
                    <p className="text-sm text-slate-600">
                      Enroll in a 90-day cohort first to unlock the Final Examination.
                    </p>
                  ) : data.finalAssessment.qualified ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 space-y-2">
                      <p className="text-base font-bold text-emerald-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-700" />
                        Verified Qualification Achieved ({data.eligibility?.finalScorePercent}%)
                      </p>
                      <p className="text-sm text-emerald-800">
                        Verified pass date:{" "}
                        <strong>
                          {data.eligibility?.passedAt
                            ? new Date(data.eligibility.passedAt).toLocaleDateString("en-IN")
                            : "Recorded"}
                        </strong>
                        . You can now manage recruitment consent in the Consent &amp; Offers tab and track your refund timeline in Admission &amp; Refund.
                      </p>
                    </div>
                  ) : !examLoaded ? (
                    <div className="space-y-4">
                      {!data.finalAssessment.mandatoryCourseworkComplete && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
                          <strong>Coursework Check:</strong> You can preview and practice the final exam now,
                          but full verified qualification requires completing all modules and assignments on the
                          Learning tab alongside scoring at least 75%.
                        </div>
                      )}
                      <Button
                        size="lg"
                        disabled={busyAction === "load-exam"}
                        onClick={handleLoadFinalExam}
                        className="min-h-[46px]"
                      >
                        {busyAction === "load-exam" ? "Loading Questions..." : "Start Final Examination"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {examQuestions.map((q, idx) => (
                        <div key={q.id} className="rounded-xl border border-slate-200 p-4 space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                            Q{idx + 1} • {q.sectionTitle}
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-slate-900">{q.prompt}</p>
                          <div className="space-y-2">
                            {q.options.map((opt) => {
                              const selected = examAnswers[q.id] === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() =>
                                    setExamAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                                  }
                                  className={`w-full text-left rounded-lg border px-3.5 py-2.5 text-sm min-h-[44px] transition-colors ${
                                    selected
                                      ? "border-primary bg-primary/[0.06] font-medium text-slate-900"
                                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                                  }`}
                                >
                                  <span className="font-mono text-xs mr-2 uppercase">{opt.id}.</span>
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      <Button
                        size="lg"
                        disabled={busyAction === "submit-exam"}
                        onClick={handleSubmitFinalExam}
                        className="w-full sm:w-auto min-h-[48px] px-8 font-semibold"
                      >
                        {busyAction === "submit-exam"
                          ? "Grading on Server..."
                          : "Submit Final Examination for Grading"}
                      </Button>
                    </div>
                  )}

                  {/* Attempt History */}
                  {data && data.finalAssessment.attempts.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <h3 className="text-sm font-semibold text-slate-900">Graded Attempt History</h3>
                      {data.finalAssessment.attempts.map((att) => (
                        <div key={att.attemptNumber} className="rounded-lg border border-slate-200 p-3.5 text-sm space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900">
                              Attempt #{att.attemptNumber} — {att.scorePercent}%
                            </span>
                            <span
                              className={`text-xs font-semibold ${
                                att.passed ? "text-emerald-700" : "text-amber-700"
                              }`}
                            >
                              {att.passed ? "Qualified (≥75% + Coursework)" : "Not Yet Qualified"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">{att.reason}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                            {att.sectionScores.map((sec) => (
                              <div key={sec.sectionId} className="rounded bg-slate-50 p-2 border border-slate-100">
                                <p className="text-slate-500 truncate">{sec.sectionTitle}</p>
                                <p className="font-semibold text-slate-900">
                                  {sec.correctCount}/{sec.totalCount} ({sec.scorePercent}%)
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ==================== TAB 4: RECRUITMENT CONSENT & WRITTEN OFFERS ==================== */}
            {activeTab === "career" && (
              <div className="space-y-5">
                <Card className="border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Recruitment Visibility Consent</CardTitle>
                    <CardDescription>
                      You control whether Admin-approved employers on udayantu.com can discover your verified career-ready profile. Revoking consent hides your profile immediately.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-slate-900">
                        Employer Profile Visibility:{" "}
                        {data?.consent.employerVisibilityGranted ? "Enabled" : "Disabled"}
                      </p>
                      <p className="text-xs text-slate-600">
                        Policy {data?.consent.policyVersion} • Only students who pass the 75% Final Examination and enable consent appear in employer candidate searches.
                      </p>
                    </div>
                    <Switch
                      checked={Boolean(data?.consent.employerVisibilityGranted)}
                      disabled={busyAction === "consent"}
                      onCheckedChange={handleToggleConsent}
                      aria-label="Toggle employer recruitment visibility consent"
                    />
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Written Job Offers &amp; Tuition Obligation</CardTitle>
                    <CardDescription>
                      Shortlists and interviews never trigger tuition fees. A single tuition obligation is created only when you formally accept a written offer below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!data?.offers.length ? (
                      <p className="text-sm text-slate-600">
                        No written employer offers received yet. Once you pass the 75% final exam and grant recruitment consent, approved employers can invite you for interviews and issue written offers here.
                      </p>
                    ) : (
                      data.offers.map((offer) => (
                        <div
                          key={offer.id}
                          className="rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1 text-sm">
                            <p className="font-bold text-slate-900">
                              {offer.roleTitle} — {offer.employerName}
                            </p>
                            <p className="text-slate-700">
                              Agreed Annual CTC:{" "}
                              <strong>₹{offer.agreedCtcInr.toLocaleString("en-IN")}</strong> • Joining:{" "}
                              {offer.joiningDate}
                            </p>
                            <p className="text-xs text-slate-500 uppercase font-semibold">
                              Status: {offer.status}
                            </p>
                          </div>
                          {offer.status === "issued" && (
                            <Button
                              disabled={busyAction === `offer-${offer.id}`}
                              onClick={() => handleAcceptOffer(offer.id)}
                              className="min-h-[44px]"
                            >
                              Accept Written Offer
                            </Button>
                          )}
                        </div>
                      ))
                    )}

                    {data?.tuitionObligation && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm space-y-1.5">
                        <p className="font-bold text-slate-900">
                          Authoritative Tuition Obligation ({data.tuitionObligation.agreementVersion})
                        </p>
                        <p className="text-slate-700">
                          Rate: <strong>{data.tuitionObligation.tuitionPercent}% of ₹{data.tuitionObligation.agreedCtcInr.toLocaleString("en-IN")} CTC</strong>{" "}
                          = <strong>₹{data.tuitionObligation.breakdown.totalPayableInr.toLocaleString("en-IN")} (GST inclusive)</strong>
                        </p>
                        <p className="text-xs text-slate-600">
                          Taxable Base: ₹{data.tuitionObligation.breakdown.taxableBaseInr.toLocaleString("en-IN")} +{" "}
                          {data.tuitionObligation.breakdown.gstRatePercent}% GST: ₹
                          {data.tuitionObligation.breakdown.gstAmountInr.toLocaleString("en-IN")} • Admission fee deduction: ₹0 (never adjusted against tuition).
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ==================== TAB 5: ADMISSION & 120-DAY REFUND CLOCK ==================== */}
            {activeTab === "refund" && (
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Admission Plan &amp; Refund Lifecycle</CardTitle>
                  <CardDescription>
                    Tracked strictly from your server-verified enrollment and final assessment records. Estimated refunds are never shown as completed until bank settlement.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 text-sm">
                  {!data?.enrollment || !data.refundLifecycle ? (
                    <p className="text-slate-600">
                      No active admission record yet. Select Plan A or Plan B on the Admission Plans page to lock your fee and agreement terms.
                    </p>
                  ) : (
                    <>
                      <div className="grid sm:grid-cols-3 gap-4 rounded-xl bg-slate-50 border border-slate-200 p-4">
                        <div>
                          <p className="text-xs text-slate-500">Locked Admission Plan</p>
                          <p className="font-bold text-slate-900">{data.enrollment.planName}</p>
                          <p className="text-xs text-slate-600">
                            ₹{data.enrollment.lockedAdmissionFeeInr.toLocaleString("en-IN")} GST incl. ({data.enrollment.acceptedAgreementVersion})
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Verified Pass Date (≥75%)</p>
                          <p className="font-bold text-slate-900">
                            {data.refundLifecycle.assessmentPassDate
                              ? new Date(data.refundLifecycle.assessmentPassDate).toLocaleDateString("en-IN")
                              : "Pending Final Exam Pass"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">120-Day Refund Deadline</p>
                          <p className="font-bold text-slate-900">
                            {data.refundLifecycle.refundDeadlineDate
                              ? new Date(data.refundLifecycle.refundDeadlineDate).toLocaleDateString("en-IN")
                              : data.refundLifecycle.refundablePlan
                              ? "Starts upon ≥75% Pass"
                              : "Not Applicable (Plan B)"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                          Current Lifecycle Status: {data.refundLifecycle.status.replace(/_/g, " ")}
                        </p>
                        <p className="text-slate-700 leading-relaxed">{data.refundLifecycle.explanation}</p>
                      </div>

                      {data.refundLifecycle.canRequestRefund && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                          <p className="font-semibold text-emerald-900">
                            You are eligible to submit your Plan A Admission Refund Request
                          </p>
                          <Input
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                            className="bg-white min-h-[44px]"
                          />
                          <Button
                            disabled={busyAction === "refund"}
                            onClick={handleRequestRefund}
                            className="min-h-[44px]"
                          >
                            Submit Plan A Refund Request
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default StudentDashboard;
