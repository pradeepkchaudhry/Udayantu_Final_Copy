import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, KeyRound, Mail, Phone, ShieldCheck, UserPlus } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import {
  getAnonymousAssessmentToken,
  platformApi,
  setAuthToken,
} from "@/lib/platformApi";
import { trackFunnelStage } from "@/lib/funnelAnalytics";

type AuthMode = "register" | "login" | "recovery";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { platformUser, refreshSession } = useAuth();

  const initialMode: AuthMode =
    location.pathname === "/register" || searchParams.get("unlockReport") === "1"
      ? "register"
      : "login";

  const returnTo = searchParams.get("returnTo") || "/dashboard";
  const hasSavedAssessment = Boolean(getAnonymousAssessmentToken());

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Registration state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sandboxOtpHint, setSandboxOtpHint] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Recovery state
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryCodeSent, setRecoveryCodeSent] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryHint, setRecoveryHint] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (platformUser?.role === "student") {
      navigate(returnTo, { replace: true });
    } else if (
      platformUser?.role === "employer_admin" ||
      platformUser?.role === "employer_recruiter"
    ) {
      navigate("/employer/dashboard", { replace: true });
    }
  }, [platformUser, navigate, returnTo]);

  const handleRequestOtp = async () => {
    setError(null);
    setNotice(null);
    const cleaned = phone.replace(/\D/g, "").replace(/^91/, "");
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setError("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
      return;
    }
    setLoading(true);
    try {
      const res = await platformApi.requestOtp(cleaned);
      setOtpSent(true);
      setSandboxOtpHint(res.sandboxOtpHint ?? null);
      if (res.sandboxOtpHint) {
        setOtpCode(res.sandboxOtpHint);
      }
      setNotice(`Verification OTP sent to ${res.maskedPhone}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not dispatch OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!otpSent || otpCode.trim().length < 6) {
      setError("Please request and enter the 6-digit Indian mobile OTP first.");
      return;
    }
    setLoading(true);
    try {
      const anonToken = getAnonymousAssessmentToken();
      const res = await platformApi.registerStudent({
        fullName,
        email,
        phone,
        otpCode: otpCode.trim(),
        password,
        anonymousAssessmentToken: anonToken,
      });
      setAuthToken(res.token);
      if (res.sandboxEmailCodeHint) {
        sessionStorage.setItem("udayantu_email_verify_hint", res.sandboxEmailCodeHint);
      }
      trackFunnelStage("full_report_registered");
      await refreshSession();
      navigate(returnTo || res.redirectTo || "/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const anonToken = getAnonymousAssessmentToken();
      const res = await platformApi.login({
        emailOrPhone: loginIdentifier.trim(),
        password: loginPassword,
        expectedPortal: "student",
        anonymousAssessmentToken: anonToken,
      });
      setAuthToken(res.token);
      await refreshSession();
      navigate(returnTo || res.redirectTo || "/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Verify your email/phone and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const res = await platformApi.requestPasswordRecovery(recoveryEmail.trim());
      setRecoveryCodeSent(true);
      setRecoveryHint(res.sandboxResetCodeHint ?? null);
      if (res.sandboxResetCodeHint) {
        setRecoveryCode(res.sandboxResetCodeHint);
      }
      setNotice("If an account exists for this email, a password recovery code has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send recovery code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      await platformApi.resetPassword({
        email: recoveryEmail.trim(),
        code: recoveryCode.trim(),
        newPassword,
      });
      setNotice("Password updated successfully. You can now sign in with your new password.");
      setMode("login");
      setLoginIdentifier(recoveryEmail.trim());
      setLoginPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Student Sign In & Registration | UdaYantu"
        description="Register with Indian mobile OTP or sign in to your UdaYantu student dashboard to unlock your complete career report and 90-day cohort."
        canonicalPath="/login"
        noIndex={true}
      />

      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />

        <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 flex items-center justify-center">
          <div className="w-full max-w-md space-y-5">
            {hasSavedAssessment && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Your completed career assessment session is preserved and will unlock automatically inside your Student Dashboard.
                </span>
              </div>
            )}

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  UdaYantu Student Portal
                </p>
                <CardTitle className="text-2xl">
                  {mode === "register"
                    ? "Create Student Account"
                    : mode === "login"
                    ? "Student Sign In"
                    : "Recover Account Password"}
                </CardTitle>
                <CardDescription>
                  {mode === "register"
                    ? "Verify your Indian +91 mobile number to unlock your full 3-track career report."
                    : mode === "login"
                    ? "Sign in with your registered email or 10-digit Indian mobile number."
                    : "Reset your password securely using your registered email address."}
                </CardDescription>

                <div className="grid grid-cols-2 gap-2 pt-3">
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
                    <UserPlus className="w-4 h-4 inline mr-1.5" />
                    Register
                  </button>
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
                    Sign In
                  </button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700">
                    {error}
                  </div>
                )}
                {notice && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-sm text-emerald-800">
                    {notice}
                  </div>
                )}

                {mode === "register" && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="stu-fullname">Full Name</Label>
                      <Input
                        id="stu-fullname"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Anjali Kumari"
                        className="min-h-[44px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="stu-email">Email Address</Label>
                      <Input
                        id="stu-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="anjali@example.com"
                        className="min-h-[44px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="stu-phone">Indian Mobile Number (+91)</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                          <Input
                            id="stu-phone"
                            type="tel"
                            required
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            placeholder="10-digit mobile"
                            className="pl-9 min-h-[44px]"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRequestOtp}
                          disabled={loading}
                          className="min-h-[44px] shrink-0"
                        >
                          {otpSent ? "Resend OTP" : "Send OTP"}
                        </Button>
                      </div>
                    </div>

                    {otpSent && (
                      <div className="space-y-1.5">
                        <Label htmlFor="stu-otp">6-Digit Mobile OTP</Label>
                        <Input
                          id="stu-otp"
                          required
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="Enter 6-digit OTP"
                          className="min-h-[44px] tracking-widest font-mono"
                        />
                        {sandboxOtpHint && (
                          <p className="text-xs text-slate-500">
                            Sandbox verification OTP: <strong className="font-mono">{sandboxOtpHint}</strong>
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="stu-password">Create Password (min 8 characters)</Label>
                      <Input
                        id="stu-password"
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="min-h-[44px]"
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full min-h-[48px] font-semibold">
                      {loading ? "Creating Account..." : "Create Account & Open Dashboard"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                )}

                {mode === "login" && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="login-id">Email or 10-Digit Mobile Number</Label>
                      <Input
                        id="login-id"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="Email or 9876543210"
                        className="min-h-[44px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-pw">Password</Label>
                        <button
                          type="button"
                          onClick={() => {
                            setMode("recovery");
                            setError(null);
                            setNotice(null);
                          }}
                          className="text-xs text-primary font-medium hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <Input
                        id="login-pw"
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="min-h-[44px]"
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full min-h-[48px] font-semibold">
                      {loading ? "Signing In..." : "Sign In to My Dashboard"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                )}

                {mode === "recovery" && (
                  <div className="space-y-4">
                    {!recoveryCodeSent ? (
                      <form onSubmit={handleRequestRecovery} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="rec-email">Registered Email Address</Label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                            <Input
                              id="rec-email"
                              type="email"
                              required
                              value={recoveryEmail}
                              onChange={(e) => setRecoveryEmail(e.target.value)}
                              placeholder="you@example.com"
                              className="pl-9 min-h-[44px]"
                            />
                          </div>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full min-h-[44px]">
                          Send Recovery Code
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="rec-code">6-Digit Recovery Code</Label>
                          <Input
                            id="rec-code"
                            required
                            value={recoveryCode}
                            onChange={(e) => setRecoveryCode(e.target.value)}
                            className="min-h-[44px] font-mono"
                          />
                          {recoveryHint && (
                            <p className="text-xs text-slate-500">
                              Sandbox recovery code: <strong className="font-mono">{recoveryHint}</strong>
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="rec-pw">New Password</Label>
                          <Input
                            id="rec-pw"
                            type="password"
                            required
                            minLength={8}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="min-h-[44px]"
                          />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full min-h-[44px]">
                          Update Password
                        </Button>
                      </form>
                    )}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-xs text-slate-600 hover:underline w-full text-center"
                    >
                      Back to Sign In
                    </button>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Secure OTP &amp; Session
                  </span>
                  <Link to="/employer/login" className="text-primary font-medium hover:underline">
                    Hiring as an Employer? →
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

export default Auth;
