import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import {
  platformApi,
  type AdmissionPlanCode,
  type PublicCourseDto,
  type StudentAdmissionPlanDto,
} from "@/lib/platformApi";
import { trackFunnelStage } from "@/lib/funnelAnalytics";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { platformUser, loading: authLoading } = useAuth();

  const [plans, setPlans] = useState<StudentAdmissionPlanDto[]>([]);
  const [courses, setCourses] = useState<PublicCourseDto[]>([]);
  const [mode, setMode] = useState<"live" | "sandbox">("sandbox");
  const [selectedPlanCode, setSelectedPlanCode] = useState<AdmissionPlanCode>("plan_a_refundable");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(searchParams.get("courseId") || "");
  const [acceptedAgreement, setAcceptedAgreement] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingData(true);
      try {
        const [plansRes, coursesRes] = await Promise.all([
          platformApi.getCommercialPlans(),
          platformApi.getCourses(),
        ]);
        if (cancelled) return;
        setPlans(plansRes.studentPlans);
        setMode(plansRes.mode);
        setCourses(coursesRes.courses);

        // Pre-select course from query param, or student's recommended track if logged in, else first course
        const requestedCourse = searchParams.get("courseId");
        if (requestedCourse && coursesRes.courses.some((c) => c.id === requestedCourse)) {
          setSelectedCourseId(requestedCourse);
        } else if (platformUser?.role === "student") {
          try {
            const dash = await platformApi.getStudentDashboard();
            const topTrackId = dash.fullCareerReport?.topTracks[0]?.trackId;
            const matched = coursesRes.courses.find((c) => c.careerTrackId === topTrackId);
            setSelectedCourseId(matched?.id || coursesRes.courses[0]?.id || "");
          } catch {
            setSelectedCourseId(coursesRes.courses[0]?.id || "");
          }
        } else {
          setSelectedCourseId(coursesRes.courses[0]?.id || "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load current admission plans.");
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [platformUser?.role, searchParams]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.code === selectedPlanCode) ?? plans[0] ?? null,
    [plans, selectedPlanCode]
  );

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selectedCourseId) ?? courses[0] ?? null,
    [courses, selectedCourseId]
  );

  const handleSelectPlan = (code: AdmissionPlanCode) => {
    setSelectedPlanCode(code);
    setAcceptedAgreement(false);
    setError(null);
    trackFunnelStage("plan_a_or_b_selected");
  };

  const handleProceedPayment = async () => {
    setError(null);
    if (!platformUser) {
      navigate(`/register?returnTo=${encodeURIComponent(`/payment?courseId=${selectedCourseId}`)}`);
      return;
    }
    if (platformUser.role !== "student") {
      setError("Please sign in with a Student account to complete cohort admission.");
      return;
    }
    if (!selectedPlan || !selectedCourse) {
      setError("Please select a career course and admission plan.");
      return;
    }
    if (!acceptedAgreement) {
      setError(`Please accept Commercial Agreement ${selectedPlan.agreementVersion} before paying.`);
      return;
    }

    setProcessing(true);
    trackFunnelStage("payment_initiated");
    try {
      const initiated = await platformApi.createAdmissionPaymentOrder({
        courseId: selectedCourse.id,
        planCode: selectedPlan.code,
        acceptedAgreement: true,
        acceptedAgreementVersion: selectedPlan.agreementVersion,
      });

      // Live Mode: strictly use Razorpay Checkout modal with server-generated orderId and server-side verification
      if (!initiated.order.isSandboxOrder && window.Razorpay) {
        const rzp = new window.Razorpay({
          key: initiated.order.keyId,
          amount: initiated.order.amountPaise,
          currency: initiated.order.currency,
          name: "UdaYantu",
          description: `${selectedCourse.titleEn} — ${selectedPlan.name}`,
          order_id: initiated.order.orderId,
          prefill: {
            name: platformUser.fullName,
            email: platformUser.email,
            contact: platformUser.phone10 ? `+91${platformUser.phone10}` : undefined,
          },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              await platformApi.verifyAdmissionPayment({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              });
              trackFunnelStage("admission_completed");
              navigate("/dashboard?enrolled=1", { replace: true });
            } catch (verifyErr) {
              setError(
                verifyErr instanceof Error
                  ? verifyErr.message
                  : "Payment signature verification failed."
              );
              setProcessing(false);
            }
          },
          modal: {
            ondismiss: () => setProcessing(false),
          },
        });
        rzp.open();
        return;
      }

      // Sandbox Mode ONLY (when backend mode === 'sandbox' and backend issued deterministic HMAC helper)
      if (mode === "sandbox" && initiated.sandboxCheckoutHelper) {
        await platformApi.verifyAdmissionPayment({
          orderId: initiated.order.orderId,
          paymentId: initiated.sandboxCheckoutHelper.paymentId,
          signature: initiated.sandboxCheckoutHelper.signature,
        });
        trackFunnelStage("admission_completed");
        navigate("/dashboard?enrolled=1", { replace: true });
        return;
      }

      throw new Error("Live payment gateway script is unavailable. Please refresh and try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete admission payment.");
      setProcessing(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Student Admission Plans (Plan A vs Plan B) | UdaYantu"
        description="Compare UdaYantu Plan A (Refundable Admission) and Plan B (Non-Refundable Admission) with transparent GST breakdown and 90-day cohort enrollment."
        canonicalPath="/payment"
        noIndex={true}
      />

      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />

        <main className="flex-1 pt-24 pb-16 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                90-Day Training Cohort Admission • Live Backend Pricing
              </p>
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-900">
                Choose Your Admission Plan
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
                Both plans unlock the exact same 90-day cohort, structured resources, live Zoom/Meet sessions, and mentorship. Review the GST breakdown and commercial agreement transparently before paying.
              </p>
            </div>

            {loadingData || authLoading ? (
              <Card className="border-slate-200 bg-white">
                <CardContent className="py-16 text-center text-sm text-slate-600">
                  Loading authoritative admission plans from server...
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Course selector */}
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">1. Select Your Career Track Course (90 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <select
                      aria-label="Select Career Track Course"
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm font-medium text-slate-900 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.titleEn} ({c.durationDays} Days • ≥{c.passingThresholdPercent}% Final Exam)
                        </option>
                      ))}
                    </select>
                    {selectedCourse?.activeCohort && (
                      <p className="mt-2 text-xs text-slate-600">
                        Active Cohort: <strong>{selectedCourse.activeCohort.name}</strong> • Mentor:{" "}
                        {selectedCourse.activeCohort.mentorName}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Plan A vs Plan B Cards */}
                <div className="grid md:grid-cols-2 gap-5">
                  {plans.map((plan) => {
                    const isSelected = selectedPlan?.code === plan.code;
                    return (
                      <button
                        key={plan.code}
                        type="button"
                        onClick={() => handleSelectPlan(plan.code)}
                        className={`text-left rounded-2xl border-2 p-6 transition-all bg-white ${
                          isSelected
                            ? "border-primary shadow-md"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                              {plan.refundable ? "Refund Protection Option" : "Lower Upfront Option"}
                            </p>
                            <h2 className="text-xl font-bold text-slate-900 mt-1">{plan.name}</h2>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-2xl font-bold text-slate-900">
                              ₹{plan.priceInr.toLocaleString("en-IN")}
                            </p>
                            <p className="text-xs text-slate-500">GST inclusive ({plan.gstRatePercent}%)</p>
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 mb-4">{plan.tagline}</p>

                        <ul className="space-y-2 text-sm text-slate-700 mb-4">
                          {plan.highlights.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700">
                          <strong>Refund &amp; Tuition Rule:</strong> {plan.refundPolicyNotice} Post-selection tuition is{" "}
                          <strong>{plan.tuitionCtcPercent}% of agreed CTC (GST inclusive)</strong>; admission fee is never adjusted against tuition.
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* GST Breakdown + Explicit Agreement + Checkout */}
                {selectedPlan && (
                  <Card className="border-slate-200 bg-white shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        2. Transparent GST Breakdown &amp; Commercial Agreement ({selectedPlan.agreementVersion})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid sm:grid-cols-3 gap-4 rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm">
                        <div>
                          <p className="text-xs text-slate-500">Taxable Base Amount</p>
                          <p className="text-base font-semibold text-slate-900">
                            ₹{selectedPlan.gstBreakdown.taxableBaseInr.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">
                            GST ({selectedPlan.gstBreakdown.gstRatePercent}% Included)
                          </p>
                          <p className="text-base font-semibold text-slate-900">
                            ₹{selectedPlan.gstBreakdown.gstAmountInr.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Total Payable Today (GST Inclusive)</p>
                          <p className="text-lg font-bold text-primary">
                            ₹{selectedPlan.gstBreakdown.totalPayableInr.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed bg-white">
                        <p className="font-semibold text-slate-900 mb-1">
                          Commercial Agreement Summary ({selectedPlan.agreementVersion})
                        </p>
                        <p>{selectedPlan.agreementSummary}</p>
                      </div>

                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={acceptedAgreement}
                          onChange={(e) => setAcceptedAgreement(e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-slate-700">
                          I have read and explicitly accept Commercial Agreement{" "}
                          <strong>{selectedPlan.agreementVersion}</strong>, understand that enrollment does
                          not guarantee a job, and acknowledge that the admission fee is never adjusted
                          against tuition fees.{" "}
                          <Link to="/refund" className="text-primary underline">
                            View full Refund Policy
                          </Link>
                        </span>
                      </label>

                      {error && (
                        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                          {error}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Server-generated order &amp; HMAC-SHA256 verified payment capture.
                            {mode === "sandbox" ? " (Sandbox verification active)" : ""}
                          </span>
                        </div>

                        <Button
                          size="lg"
                          disabled={processing || !acceptedAgreement}
                          onClick={handleProceedPayment}
                          className="w-full sm:w-auto min-h-[48px] px-7 font-semibold"
                        >
                          {!platformUser
                            ? "Register / Sign In to Enroll"
                            : processing
                            ? "Verifying Admission Payment..."
                            : `Pay ₹${selectedPlan.priceInr.toLocaleString("en-IN")} & Join 90-Day Cohort`}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                        <span>
                          Your selected plan fee and agreement version are permanently locked upon enrollment even if future cohort prices change.
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Payment;
