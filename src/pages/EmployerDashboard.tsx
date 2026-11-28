import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileSignature,
  LogOut,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import {
  platformApi,
  type CanonicalCareerTrackId,
  type EligibleCandidateDto,
  type EmployerBillingModel,
  type EmployerWorkspaceDto,
} from "@/lib/platformApi";
import { trackFunnelStage } from "@/lib/funnelAnalytics";

type EmpTab = "overview" | "jobs" | "candidates" | "pipeline" | "billing";

const TRACK_OPTIONS: Array<{ id: CanonicalCareerTrackId; name: string }> = [
  { id: "business-development", name: "Business Development" },
  { id: "customer-success", name: "Customer Success" },
  { id: "project-management", name: "Project Management" },
  { id: "operations-management", name: "Operations Management" },
  { id: "product-management", name: "Product Management" },
  { id: "human-resources", name: "Human Resources" },
  { id: "marketing-management", name: "Marketing Management" },
  { id: "customer-support", name: "Customer Support" },
];

function tabFromPath(pathname: string): EmpTab {
  if (pathname.includes("/jobs")) return "jobs";
  if (pathname.includes("/candidates")) return "candidates";
  if (pathname.includes("/shortlists") || pathname.includes("/interviews") || pathname.includes("/offers")) {
    return "pipeline";
  }
  if (pathname.includes("/billing")) return "billing";
  return "overview";
}

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { platformUser, loading: authLoading, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<EmpTab>(() => tabFromPath(location.pathname));
  const [workspace, setWorkspace] = useState<EmployerWorkspaceDto | null>(null);
  const [candidates, setCandidates] = useState<EligibleCandidateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // Job creation state
  const [jobTitle, setJobTitle] = useState("");
  const [jobTrack, setJobTrack] = useState<CanonicalCareerTrackId>("operations-management");
  const [jobLocation, setJobLocation] = useState("Bengaluru / Hybrid");
  const [jobMinCtc, setJobMinCtc] = useState("360000");
  const [jobMaxCtc, setJobMaxCtc] = useState("480000");
  const [jobOpenings, setJobOpenings] = useState("2");

  // Candidate filter & action state
  const [filterTrack, setFilterTrack] = useState<string>("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [offerCtcInr, setOfferCtcInr] = useState("450000");
  const [offerJoiningDate, setOfferJoiningDate] = useState("2026-12-20");

  useEffect(() => {
    setActiveTab(tabFromPath(location.pathname));
  }, [location.pathname]);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ws = await platformApi.getEmployerWorkspace();
      setWorkspace(ws);
      if (ws.jobs.length > 0 && !selectedJobId) {
        setSelectedJobId(ws.jobs[0].id);
      }
      if (ws.employer.approvalStatus === "approved") {
        const candRes = await platformApi.searchCandidates(
          filterTrack ? { careerTrackId: filterTrack as CanonicalCareerTrackId } : undefined
        );
        setCandidates(candRes.candidates);
      } else {
        setCandidates([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load employer workspace.");
    } finally {
      setLoading(false);
    }
  }, [filterTrack, selectedJobId]);

  useEffect(() => {
    if (authLoading) return;
    if (!platformUser) {
      navigate("/employer/login", { replace: true });
      return;
    }
    if (
      platformUser.role !== "employer_admin" &&
      platformUser.role !== "employer_recruiter"
    ) {
      navigate("/dashboard", { replace: true });
      return;
    }
    loadWorkspace();
  }, [authLoading, platformUser, navigate, loadWorkspace]);

  const switchTab = (tab: EmpTab, route: string) => {
    setActiveTab(tab);
    setError(null);
    setNotice(null);
    navigate(route, { replace: true });
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("create-job");
    setError(null);
    try {
      const created = await platformApi.createEmployerJob({
        title: jobTitle,
        careerTrackId: jobTrack,
        location: jobLocation,
        minCtcInr: Number(jobMinCtc),
        maxCtcInr: Number(jobMaxCtc),
        openings: Number(jobOpenings),
        publishNow: true,
      });
      setSelectedJobId(created.id);
      setJobTitle("");
      setNotice(`Job "${created.title}" published successfully.`);
      await loadWorkspace();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create job posting.");
    } finally {
      setBusy(null);
    }
  };

  const handleShortlist = async (studentUserId: string) => {
    const jobId = selectedJobId || workspace?.jobs[0]?.id;
    if (!jobId) {
      setError("Please create and publish a job posting first before shortlisting candidates.");
      return;
    }
    setBusy(`shortlist-${studentUserId}`);
    setError(null);
    try {
      await platformApi.shortlistCandidate(jobId, studentUserId);
      trackFunnelStage("candidate_shortlisted");
      setNotice("Candidate shortlisted successfully.");
      await loadWorkspace();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not shortlist candidate.");
    } finally {
      setBusy(null);
    }
  };

  const handleScheduleInterview = async (studentUserId: string) => {
    const jobId = selectedJobId || workspace?.jobs[0]?.id;
    if (!jobId) {
      setError("Please create a job posting first.");
      return;
    }
    setBusy(`interview-${studentUserId}`);
    setError(null);
    try {
      await platformApi.scheduleInterview({
        jobId,
        studentUserId,
        scheduledAt: new Date(Date.now() + 48 * 3600_000).toISOString(),
        mode: "Google Meet",
        meetingLink: "https://meet.google.com/udy-employer-interview",
      });
      setNotice("Google Meet interview scheduled.");
      await loadWorkspace();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not schedule interview.");
    } finally {
      setBusy(null);
    }
  };

  const handleIssueOffer = async (cand: EligibleCandidateDto) => {
    const jobId = selectedJobId || workspace?.jobs[0]?.id;
    if (!jobId) {
      setError("Please create a job posting first before issuing a written offer.");
      return;
    }
    const job = workspace?.jobs.find((j) => j.id === jobId);
    setBusy(`offer-${cand.studentUserId}`);
    setError(null);
    try {
      await platformApi.issueWrittenOffer({
        jobId,
        studentUserId: cand.studentUserId,
        roleTitle: job?.title || `${cand.careerTrackName} Associate`,
        agreedCtcInr: Number(offerCtcInr),
        joiningDate: offerJoiningDate,
      });
      setNotice(
        `Written offer issued to ${cand.displayName}. Commercial billing triggers strictly once the candidate formally accepts the written offer.`
      );
      await loadWorkspace();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not issue written offer.");
    } finally {
      setBusy(null);
    }
  };

  const handleConfirmJoining = async (offerId: string) => {
    setBusy(`join-${offerId}`);
    setError(null);
    try {
      await platformApi.confirmJoining(offerId);
      trackFunnelStage("joining_confirmed");
      setNotice("Candidate joining confirmed.");
      await loadWorkspace();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm joining.");
    } finally {
      setBusy(null);
    }
  };

  const handleSelectBillingPlan = async (model: EmployerBillingModel) => {
    setBusy(`billing-${model}`);
    setError(null);
    try {
      await platformApi.selectEmployerBillingPlan(model);
      setNotice(
        model === "monthly_subscription"
          ? "Monthly Unlimited Hiring Subscription activated (18% GST added separately; zero additional 8.33% per-hire charges while active)."
          : "Switched to Success-Fee Hiring Plan (8.33% of agreed CTC + 18% GST added separately per qualifying selection)."
      );
      await loadWorkspace();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update commercial billing model.");
    } finally {
      setBusy(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/employer/login", { replace: true });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-600">Loading Employer Workspace...</p>
      </div>
    );
  }

  const isApproved = workspace?.employer.approvalStatus === "approved";

  return (
    <>
      <SEOHead
        title="Employer Hiring Workspace | UdaYantu"
        description="Manage company profile, job postings, verified career-ready candidates, interviews, written offers, and commercial billing on udayantu.com."
        canonicalPath="/employer/dashboard"
        noIndex={true}
      />

      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />

        <main className="flex-1 pt-24 pb-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Employer Header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Employer Workspace • {workspace?.employer.officialDomain}
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
                    {workspace?.employer.companyName}
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    {workspace?.user.fullName} ({workspace?.user.email}) • {workspace?.employer.industry} •{" "}
                    {workspace?.employer.city}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" className="min-h-[44px]" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-1.5" />
                    Sign Out
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Verification Status</p>
                  <p className={`font-bold text-base ${isApproved ? "text-emerald-700" : "text-amber-700"}`}>
                    {isApproved ? "Admin Approved" : "Pending Admin KYC"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Published Jobs</p>
                  <p className="font-bold text-slate-900 text-base">{workspace?.jobs.length ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Written Offers</p>
                  <p className="font-bold text-slate-900 text-base">{workspace?.offers.length ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Billing Model</p>
                  <p className="font-bold text-slate-900 text-base">
                    {workspace?.billing.billingModel === "monthly_subscription"
                      ? `Monthly Sub (₹${workspace.billing.monthlyFeeInr.toLocaleString("en-IN")} + GST)`
                      : `Success Fee (${workspace?.billing.successFeePercent}% + GST)`}
                  </p>
                </div>
              </div>
            </div>

            {!isApproved && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-3 text-sm text-amber-950">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Company Verification Pending Admin Approval</p>
                  <p className="text-xs mt-1">
                    You can configure your company profile, billing plan, and draft jobs now. Candidate discovery and outreach unlock strictly after UdaYantu Admin approves your company registration ({workspace?.employer.registrationId}).
                  </p>
                </div>
              </div>
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

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(
                [
                  { id: "overview", label: "Company & Team", route: "/employer/dashboard", icon: Building2 },
                  { id: "jobs", label: "Jobs", route: "/employer/jobs", icon: Briefcase },
                  { id: "candidates", label: "Eligible Candidates", route: "/employer/candidates", icon: Search },
                  { id: "pipeline", label: "Interviews & Offers", route: "/employer/offers", icon: FileSignature },
                  { id: "billing", label: "Billing & Invoices", route: "/employer/billing", icon: CreditCard },
                ] as const
              ).map(({ id, label, route, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => switchTab(id, route)}
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

            {/* ==================== TAB 1: COMPANY & TEAM ==================== */}
            {activeTab === "overview" && workspace && (
              <div className="grid md:grid-cols-2 gap-5">
                <Card className="border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Verified Company Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Legal Entity</span>
                      <span className="font-semibold text-slate-900">{workspace.employer.companyName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Official Domain</span>
                      <span className="font-semibold text-slate-900">{workspace.employer.officialDomain}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Registration ID / CIN</span>
                      <span className="font-mono text-slate-900">{workspace.employer.registrationId}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Agreement Version</span>
                      <span className="font-mono text-slate-900">
                        {workspace.employer.commercialAgreementVersion}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      Recruiter Team
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {workspace.employer.teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between text-sm"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{member.fullName}</p>
                          <p className="text-xs text-slate-600">{member.email}</p>
                        </div>
                        <span className="text-xs font-semibold text-primary uppercase">
                          {member.role.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ==================== TAB 2: JOB POSTINGS ==================== */}
            {activeTab === "jobs" && workspace && (
              <div className="grid lg:grid-cols-5 gap-5">
                <Card className="lg:col-span-2 border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Plus className="w-4 h-4 text-primary" />
                      Create &amp; Publish Job
                    </CardTitle>
                    <CardDescription>
                      Align openings to one of UdaYantu&apos;s 8 canonical career tracks.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateJob} className="space-y-3.5">
                      <div className="space-y-1">
                        <Label htmlFor="job-title">Role Title</Label>
                        <Input
                          id="job-title"
                          required
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="e.g. Junior Operations Coordinator"
                          className="min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="job-track">Canonical Career Track</Label>
                        <select
                          id="job-track"
                          value={jobTrack}
                          onChange={(e) => setJobTrack(e.target.value as CanonicalCareerTrackId)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm min-h-[44px]"
                        >
                          {TRACK_OPTIONS.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="job-loc">Location</Label>
                        <Input
                          id="job-loc"
                          required
                          value={jobLocation}
                          onChange={(e) => setJobLocation(e.target.value)}
                          className="min-h-[44px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="job-min">Min CTC (₹/yr)</Label>
                          <Input
                            id="job-min"
                            type="number"
                            required
                            value={jobMinCtc}
                            onChange={(e) => setJobMinCtc(e.target.value)}
                            className="min-h-[44px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="job-max">Max CTC (₹/yr)</Label>
                          <Input
                            id="job-max"
                            type="number"
                            required
                            value={jobMaxCtc}
                            onChange={(e) => setJobMaxCtc(e.target.value)}
                            className="min-h-[44px]"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="job-openings">Openings</Label>
                        <Input
                          id="job-openings"
                          type="number"
                          min={1}
                          required
                          value={jobOpenings}
                          onChange={(e) => setJobOpenings(e.target.value)}
                          className="min-h-[44px]"
                        />
                      </div>
                      <Button type="submit" disabled={busy === "create-job"} className="w-full min-h-[44px]">
                        Publish Job Opening
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Your Published Job Postings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!workspace.jobs.length ? (
                      <p className="text-sm text-slate-600">No job postings created yet.</p>
                    ) : (
                      workspace.jobs.map((job) => (
                        <div
                          key={job.id}
                          className="rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1 text-sm">
                            <p className="font-bold text-slate-900">{job.title}</p>
                            <p className="text-xs text-slate-600">
                              Track: {job.careerTrackId} • {job.location} • {job.openings} opening(s)
                            </p>
                            <p className="text-xs font-medium text-slate-700">
                              CTC Band: ₹{job.minCtcInr.toLocaleString("en-IN")} – ₹
                              {job.maxCtcInr.toLocaleString("en-IN")} / year
                            </p>
                          </div>
                          <span className="text-xs font-semibold uppercase text-emerald-700">
                            {job.status}
                          </span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ==================== TAB 3: ELIGIBLE & CONSENTED CANDIDATES ==================== */}
            {activeTab === "candidates" && workspace && (
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Verified Career-Ready Candidates (≥75% Passed &amp; Actively Consented)
                  </CardTitle>
                  <CardDescription>
                    Every candidate listed here has passed the server-graded 75% final assessment, completed mandatory coursework, and explicitly granted recruitment visibility consent.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {!isApproved ? (
                    <p className="text-sm text-amber-800">
                      Candidate search is locked until UdaYantu Admin approves your company account.
                    </p>
                  ) : (
                    <>
                      <div className="grid sm:grid-cols-4 gap-3 rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm">
                        <div className="space-y-1">
                          <Label className="text-xs">Filter by Career Track</Label>
                          <select
                            value={filterTrack}
                            onChange={(e) => setFilterTrack(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs min-h-[40px]"
                          >
                            <option value="">All 8 Canonical Tracks</option>
                            {TRACK_OPTIONS.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Active Job for Actions</Label>
                          <select
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs min-h-[40px]"
                          >
                            {workspace.jobs.length === 0 ? (
                              <option value="">Create a job first</option>
                            ) : (
                              workspace.jobs.map((j) => (
                                <option key={j.id} value={j.id}>
                                  {j.title}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Offer CTC (₹/yr)</Label>
                          <Input
                            type="number"
                            value={offerCtcInr}
                            onChange={(e) => setOfferCtcInr(e.target.value)}
                            className="min-h-[40px] text-xs bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Joining Date</Label>
                          <Input
                            type="date"
                            value={offerJoiningDate}
                            onChange={(e) => setOfferJoiningDate(e.target.value)}
                            className="min-h-[40px] text-xs bg-white"
                          />
                        </div>
                      </div>

                      {!candidates.length ? (
                        <p className="text-sm text-slate-600">
                          No matching verified &amp; consented candidates found for the current filter.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {candidates.map((cand) => (
                            <div
                              key={cand.studentUserId}
                              className="rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                              <div className="space-y-1 text-sm">
                                <p className="font-bold text-slate-900">{cand.displayName}</p>
                                <p className="text-xs text-slate-600">
                                  Track: <strong>{cand.careerTrackName}</strong> • Verified Final Exam:{" "}
                                  <strong className="text-emerald-700">{cand.finalScorePercent}%</strong> •
                                  Passed {new Date(cand.passedAt).toLocaleDateString("en-IN")}
                                </p>
                                <p className="text-xs text-emerald-700 flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  Active Recruitment Consent Verified
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={busy === `shortlist-${cand.studentUserId}`}
                                  onClick={() => handleShortlist(cand.studentUserId)}
                                  className="min-h-[40px]"
                                >
                                  Shortlist
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={busy === `interview-${cand.studentUserId}`}
                                  onClick={() => handleScheduleInterview(cand.studentUserId)}
                                  className="min-h-[40px]"
                                >
                                  <Calendar className="w-3.5 h-3.5 mr-1" />
                                  Interview
                                </Button>
                                <Button
                                  size="sm"
                                  disabled={busy === `offer-${cand.studentUserId}`}
                                  onClick={() => handleIssueOffer(cand)}
                                  className="min-h-[40px]"
                                >
                                  Issue Written Offer
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ==================== TAB 4: INTERVIEWS & WRITTEN OFFERS ==================== */}
            {activeTab === "pipeline" && workspace && (
              <div className="grid md:grid-cols-2 gap-5">
                <Card className="border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Scheduled Interviews</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {!workspace.interviews.length ? (
                      <p className="text-slate-600">No interviews scheduled yet.</p>
                    ) : (
                      workspace.interviews.map((iv) => (
                        <div key={iv.id} className="rounded-xl border border-slate-200 p-3.5 space-y-1">
                          <p className="font-semibold text-slate-900">
                            {iv.mode} Interview — {iv.status}
                          </p>
                          <p className="text-xs text-slate-600">
                            {new Date(iv.scheduledAt).toLocaleString("en-IN")}
                          </p>
                          <a
                            href={iv.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary underline"
                          >
                            {iv.meetingLink}
                          </a>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Written Offers &amp; Joining Confirmation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {!workspace.offers.length ? (
                      <p className="text-slate-600">No written offers issued yet.</p>
                    ) : (
                      workspace.offers.map((offer) => (
                        <div
                          key={offer.id}
                          className="rounded-xl border border-slate-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900">
                              {offer.studentName} — {offer.roleTitle}
                            </p>
                            <p className="text-xs text-slate-600">
                              Agreed CTC: ₹{offer.agreedCtcInr.toLocaleString("en-IN")} • Joining:{" "}
                              {offer.joiningDate}
                            </p>
                            <p className="text-xs font-semibold uppercase text-primary">
                              Status: {offer.status}
                            </p>
                          </div>
                          {offer.status === "accepted" && (
                            <Button
                              size="sm"
                              disabled={busy === `join-${offer.id}`}
                              onClick={() => handleConfirmJoining(offer.id)}
                              className="min-h-[40px]"
                            >
                              Confirm Joining
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ==================== TAB 5: COMMERCIAL BILLING & INVOICES ==================== */}
            {activeTab === "billing" && workspace && (
              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  {workspace.billing.availablePlans.map((plan) => {
                    const isCurrent = workspace.billing.billingModel === plan.model;
                    return (
                      <Card
                        key={plan.model}
                        className={
                          isCurrent ? "border-2 border-primary bg-white" : "border-slate-200 bg-white"
                        }
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                                {isCurrent ? "Active Commercial Plan" : "Available Option"}
                              </p>
                              <CardTitle className="text-xl mt-0.5">{plan.name}</CardTitle>
                            </div>
                            <span className="text-lg font-bold text-slate-900 text-right shrink-0">
                              {plan.model === "success_fee"
                                ? `${plan.successFeeCtcPercent}% CTC`
                                : `₹${plan.monthlyFeeInr?.toLocaleString("en-IN")}/mo`}
                            </span>
                          </div>
                          <CardDescription>{plan.tagline}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                          <p className="text-slate-700 leading-relaxed">{plan.termsSummary}</p>
                          <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <strong>GST Disclosure:</strong> {plan.gstRatePercent}% GST is added separately
                            on top of base commercial charges. Agreement: {plan.agreementVersion}.
                          </p>
                          <Button
                            variant={isCurrent ? "outline" : "default"}
                            disabled={isCurrent || busy === `billing-${plan.model}`}
                            onClick={() => handleSelectBillingPlan(plan.model)}
                            className="w-full min-h-[44px]"
                          >
                            {isCurrent ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                                Currently Active Plan
                              </>
                            ) : (
                              `Activate ${plan.name}`
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Card className="border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Commercial Invoices &amp; Selection Charges</CardTitle>
                    <CardDescription>
                      Active Monthly Subscription holders incur ₹0 additional 8.33% success-fee charges for qualifying hires during the subscription term.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!workspace.billing.invoices.length ? (
                      <p className="text-sm text-slate-600">No employer invoices generated yet.</p>
                    ) : (
                      workspace.billing.invoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                        >
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900">
                              {inv.invoiceNumber} — {inv.description}
                            </p>
                            <p className="text-xs text-slate-600">
                              Base: ₹{inv.breakdown.taxableBaseInr.toLocaleString("en-IN")} +{" "}
                              {inv.breakdown.gstRatePercent}% GST: ₹
                              {inv.breakdown.gstAmountInr.toLocaleString("en-IN")} ={" "}
                              <strong>₹{inv.breakdown.totalPayableInr.toLocaleString("en-IN")}</strong>
                            </p>
                          </div>
                          <span
                            className={`text-xs font-semibold uppercase ${
                              inv.status === "waived_by_subscription"
                                ? "text-emerald-700"
                                : "text-slate-700"
                            }`}
                          >
                            {inv.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default EmployerDashboard;
