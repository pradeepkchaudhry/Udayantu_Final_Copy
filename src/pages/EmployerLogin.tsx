import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
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
  setAuthToken,
  type EmployerBillingModel,
  type EmployerCommercialPlanDto,
} from "@/lib/platformApi";

const BLOCKED_PERSONAL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.in",
  "yahoo.co.in",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "rediffmail.com",
  "protonmail.com",
]);

const EmployerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { platformUser, refreshSession } = useAuth();

  const [mode, setMode] = useState<"login" | "register">(
    location.pathname.includes("register") ? "register" : "login"
  );
  const [plans, setPlans] = useState<EmployerCommercialPlanDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Registration fields
  const [fullName, setFullName] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [registrationId, setRegistrationId] = useState("");
  const [industry, setIndustry] = useState("Technology & Services");
  const [city, setCity] = useState("Bengaluru");
  const [billingModel, setBillingModel] = useState<EmployerBillingModel>("success_fee");

  useEffect(() => {
    if (
      platformUser?.role === "employer_admin" ||
      platformUser?.role === "employer_recruiter"
    ) {
      navigate("/employer/dashboard", { replace: true });
    }
  }, [platformUser, navigate]);

  useEffect(() => {
    platformApi
      .getCommercialPlans()
      .then((res) => setPlans(res.employerPlans))
      .catch(() => {
        // non-blocking
      });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await platformApi.login({
        emailOrPhone: loginEmail.trim(),
        password: loginPassword,
        expectedPortal: "employer",
      });
      setAuthToken(res.token);
      await refreshSession();
      navigate("/employer/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Employer sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const domain = officialEmail.trim().toLowerCase().split("@")[1] || "";
    if (BLOCKED_PERSONAL_DOMAINS.has(domain)) {
      setError(
        `Personal email domain (${domain}) is not allowed. Please register using your official company email address.`
      );
      return;
    }

    setLoading(true);
    try {
      const res = await platformApi.registerEmployer({
        fullName,
        officialEmail,
        password,
        companyName,
        registrationId,
        industry,
        city,
        billingModel,
      });
      setAuthToken(res.token);
      if (res.sandboxEmailCodeHint) {
        sessionStorage.setItem("udayantu_email_verify_hint", res.sandboxEmailCodeHint);
      }
      await refreshSession();
      navigate("/employer/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Employer registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Employer Portal Sign In & Registration | UdaYantu"
        description="Register with your official company email on udayantu.com to hire verified career-ready Indian graduates who passed UdaYantu's 75% assessment."
        canonicalPath="/employer/login"
        noIndex={true}
      />

      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />

        <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 flex items-center justify-center">
          <div className="w-full max-w-xl space-y-5">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  UdaYantu Employer Portal • udayantu.com/employer
                </p>
                <CardTitle className="text-2xl">
                  {mode === "login" ? "Employer Sign In" : "Register Your Company"}
                </CardTitle>
                <CardDescription>
                  {mode === "login"
                    ? "Sign in with your verified company email to manage jobs, consented candidates, interviews, and offers."
                    : "Official corporate email required. Admin approval verifies company identity before unlocking candidate discovery."}
                </CardDescription>

                <div className="grid grid-cols-2 gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    className={`rounded-lg py-2.5 text-sm font-semibold border transition-colors min-h-[44px] ${
                      mode === "login"
                        ? "bg-primary text-white border-primary"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <KeyRound className="w-4 h-4 inline mr-1.5" />
                    Employer Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError(null);
                    }}
                    className={`rounded-lg py-2.5 text-sm font-semibold border transition-colors min-h-[44px] ${
                      mode === "register"
                        ? "bg-primary text-white border-primary"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Building2 className="w-4 h-4 inline mr-1.5" />
                    Company Registration
                  </button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {mode === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="emp-login-email">Official Work Email</Label>
                      <Input
                        id="emp-login-email"
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="hiring@yourcompany.in"
                        className="min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="emp-login-pw">Password</Label>
                      <Input
                        id="emp-login-pw"
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="min-h-[44px]"
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full min-h-[48px] font-semibold">
                      {loading ? "Signing In..." : "Sign In to Employer Dashboard"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <Label htmlFor="emp-name">Your Full Name</Label>
                        <Input
                          id="emp-name"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Rakesh Gupta"
                          className="min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="emp-email">Official Work Email</Label>
                        <Input
                          id="emp-email"
                          type="email"
                          required
                          value={officialEmail}
                          onChange={(e) => setOfficialEmail(e.target.value)}
                          placeholder="hr@companydomain.in"
                          className="min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <Label htmlFor="emp-company">Legal Company Name</Label>
                        <Input
                          id="emp-company"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Acme Solutions Pvt Ltd"
                          className="min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="emp-cin">CIN / GSTIN / Registration ID</Label>
                        <Input
                          id="emp-cin"
                          required
                          value={registrationId}
                          onChange={(e) => setRegistrationId(e.target.value)}
                          placeholder="U72900KA2021PTC..."
                          className="min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <Label htmlFor="emp-industry">Industry</Label>
                        <Input
                          id="emp-industry"
                          required
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="emp-city">Headquarters City</Label>
                        <Input
                          id="emp-city"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Preferred Commercial Hiring Model (18% GST added separately)</Label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {plans.map((p) => {
                          const selected = billingModel === p.model;
                          return (
                            <button
                              key={p.model}
                              type="button"
                              onClick={() => setBillingModel(p.model)}
                              className={`text-left rounded-xl border p-3.5 transition-colors ${
                                selected
                                  ? "border-primary bg-primary/[0.05] ring-1 ring-primary"
                                  : "border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-bold text-slate-900">{p.name}</span>
                                {selected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                              </div>
                              <p className="text-xs font-semibold text-primary mt-1">
                                {p.model === "success_fee"
                                  ? `${p.successFeeCtcPercent}% agreed CTC + ${p.gstRatePercent}% GST`
                                  : `₹${p.monthlyFeeInr?.toLocaleString("en-IN")}/month + ${p.gstRatePercent}% GST`}
                              </p>
                              <p className="text-xs text-slate-600 mt-1">{p.tagline}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="emp-pw">Create Password (min 8 characters)</Label>
                      <Input
                        id="emp-pw"
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="min-h-[44px]"
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full min-h-[48px] font-semibold">
                      {loading ? "Registering Company..." : "Register Employer Account"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                )}

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Corporate Domain &amp; Admin KYC Gate
                  </span>
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    Student Portal Login →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default EmployerLogin;
