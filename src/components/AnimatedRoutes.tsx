import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, memo, useState, useEffect, createContext, useContext } from "react";
import PageTransition from "./PageTransition";

const ReducedMotionContext = createContext(false);

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }

    const legacyQuery = mediaQuery as MediaQueryList & {
      addListener?: (cb: (e: MediaQueryListEvent) => void) => void;
      removeListener?: (cb: (e: MediaQueryListEvent) => void) => void;
    };
    if (typeof legacyQuery.addListener === "function") {
      legacyQuery.addListener(handler);
      return () => legacyQuery.removeListener?.(handler);
    }
  }, []);

  return prefersReducedMotion;
};

import Index from "../pages/Index";
const Auth = lazy(() => import("../pages/Auth"));

// Lazy-loaded Student & Employer pages (Admin is strictly excluded from udayantu.com bundle!)
const StudentDashboard = lazy(() => import("../pages/StudentDashboard"));
const Payment = lazy(() => import("../pages/Payment"));
const Profile = lazy(() => import("../pages/Profile"));
const Settings = lazy(() => import("../pages/Settings"));
const Support = lazy(() => import("../pages/Support"));
const Blog = lazy(() => import("../pages/Blog"));
const BlogPost = lazy(() => import("../pages/BlogPost"));
const About = lazy(() => import("../pages/About"));
const Employers = lazy(() => import("../pages/Employers"));
const ContactUs = lazy(() => import("../pages/ContactUs"));
const Terms = lazy(() => import("../pages/Terms"));
const Privacy = lazy(() => import("../pages/Privacy"));
const Refund = lazy(() => import("../pages/Refund"));
const EmployerLogin = lazy(() => import("../pages/EmployerLogin"));
const EmployerDashboard = lazy(() => import("../pages/EmployerDashboard"));
const TeamInviteAccept = lazy(() => import("../pages/TeamInviteAccept"));
const CareersAfterGraduation = lazy(() => import("../pages/seo/CareersAfterGraduation"));
const DegreeGuidePage = lazy(() => import("../pages/seo/DegreeGuidePage"));
const CareerPathsHub = lazy(() => import("../pages/seo/CareerPathsHub"));
const CareerPathDetailPage = lazy(() => import("../pages/seo/CareerPathDetailPage"));
const CareerAssessmentPage = lazy(() => import("../pages/seo/CareerAssessmentPage"));
const PlacementSupportPage = lazy(() => import("../pages/seo/PlacementSupportPage"));
const StudentSuccessStoriesPage = lazy(() => import("../pages/seo/StudentSuccessStoriesPage"));
const CareerGuidancePage = lazy(() => import("../pages/seo/CareerGuidancePage"));
const NotFound = lazy(() => import("../pages/NotFound"));

const PageLoader = memo(() => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
  </div>
));

/**
 * Independent Admin Boundary Notice.
 * Admin UI is strictly hosted as an independent application at https://admin.udayantu.com
 * and is NEVER bundled into the public udayantu.com JavaScript build.
 */
const IndependentAdminBoundaryNotice = () => (
  <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        Independent Admin Control Plane
      </p>
      <h1 className="text-2xl font-bold text-slate-900">
        UdaYantu Admin Is Hosted Separately
      </h1>
      <p className="text-sm text-slate-600 leading-relaxed">
        For security isolation, the UdaYantu Admin application is independently deployed with invite-only MFA login at{" "}
        <strong>https://admin.udayantu.com</strong> and is not bundled into udayantu.com.
      </p>
      <a
        href="https://admin.udayantu.com"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 min-h-[44px]"
      >
        Open admin.udayantu.com
      </a>
    </div>
  </main>
);

const WithTransition = memo(({ children }: { children: React.ReactNode }) => {
  const reducedMotion = useContext(ReducedMotionContext);
  if (reducedMotion) return <>{children}</>;
  return <PageTransition>{children}</PageTransition>;
});

const RoutesContent = memo(() => {
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <ReducedMotionContext.Provider value={prefersReducedMotion}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<WithTransition><Index /></WithTransition>} />

        {/* Student Auth & Portal */}
        <Route path="/auth" element={<Suspense fallback={<PageLoader />}><WithTransition><Auth /></WithTransition></Suspense>} />
        <Route path="/login" element={<Suspense fallback={<PageLoader />}><WithTransition><Auth /></WithTransition></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<PageLoader />}><WithTransition><Auth /></WithTransition></Suspense>} />
        <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><WithTransition><StudentDashboard /></WithTransition></Suspense>} />
        <Route path="/payment" element={<Suspense fallback={<PageLoader />}><WithTransition><Payment /></WithTransition></Suspense>} />
        <Route path="/profile" element={<Suspense fallback={<PageLoader />}><WithTransition><Profile /></WithTransition></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<PageLoader />}><WithTransition><Settings /></WithTransition></Suspense>} />
        <Route path="/support" element={<Suspense fallback={<PageLoader />}><WithTransition><Support /></WithTransition></Suspense>} />

        {/* Independent Admin Boundary (Admin code strictly NOT bundled here) */}
        <Route path="/admin/*" element={<IndependentAdminBoundaryNotice />} />
        <Route path="/admin" element={<IndependentAdminBoundaryNotice />} />

        {/* Employer Portal Inside udayantu.com/employer/* */}
        <Route path="/employer" element={<Suspense fallback={<PageLoader />}><WithTransition><Employers /></WithTransition></Suspense>} />
        <Route path="/employers" element={<Suspense fallback={<PageLoader />}><WithTransition><Employers /></WithTransition></Suspense>} />
        <Route path="/employer/login" element={<Suspense fallback={<PageLoader />}><WithTransition><EmployerLogin /></WithTransition></Suspense>} />
        <Route path="/employer/register" element={<Suspense fallback={<PageLoader />}><WithTransition><EmployerLogin /></WithTransition></Suspense>} />
        <Route path="/employer-login" element={<Navigate to="/employer/login" replace />} />
        <Route path="/employer-dashboard" element={<Navigate to="/employer/dashboard" replace />} />
        <Route path="/employer/dashboard" element={<Suspense fallback={<PageLoader />}><WithTransition><EmployerDashboard /></WithTransition></Suspense>} />
        <Route path="/employer/profile" element={<Suspense fallback={<PageLoader />}><WithTransition><EmployerDashboard /></WithTransition></Suspense>} />
        <Route path="/employer/jobs" element={<Suspense fallback={<PageLoader />}><WithTransition><EmployerDashboard /></WithTransition></Suspense>} />
        <Route path="/employer/candidates" element={<Suspense fallback={<PageLoader />}><WithTransition><EmployerDashboard /></WithTransition></Suspense>} />
        <Route path="/employer/shortlists" element={<Suspense fallback={<PageLoader />}><WithTransition><EmployerDashboard /></WithTransition></Suspense>} />
        <Route path="/employer/interviews" element={<Suspense fallback={<PageLoader />}><WithTransition><EmployerDashboard /></WithTransition></Suspense>} />
        <Route path="/employer/offers" element={<Suspense fallback={<PageLoader />}><WithTransition><EmployerDashboard /></WithTransition></Suspense>} />
        <Route path="/employer/team" element={<Suspense fallback={<PageLoader />}><WithTransition><EmployerDashboard /></WithTransition></Suspense>} />
        <Route path="/employer/billing" element={<Suspense fallback={<PageLoader />}><WithTransition><EmployerDashboard /></WithTransition></Suspense>} />
        <Route path="/team-invite/:token" element={<Suspense fallback={<PageLoader />}><WithTransition><TeamInviteAccept /></WithTransition></Suspense>} />

        {/* Public Content & Legal */}
        <Route path="/blog" element={<Suspense fallback={<PageLoader />}><WithTransition><Blog /></WithTransition></Suspense>} />
        <Route path="/blog/:slug" element={<Suspense fallback={<PageLoader />}><WithTransition><BlogPost /></WithTransition></Suspense>} />
        <Route path="/about" element={<Suspense fallback={<PageLoader />}><WithTransition><About /></WithTransition></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<PageLoader />}><WithTransition><ContactUs /></WithTransition></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<PageLoader />}><WithTransition><Terms /></WithTransition></Suspense>} />
        <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><WithTransition><Privacy /></WithTransition></Suspense>} />
        <Route path="/refund" element={<Suspense fallback={<PageLoader />}><WithTransition><Refund /></WithTransition></Suspense>} />

        {/* Public SEO Architecture — Graduate Hub, Degree Guides, Career Tracks & Free Psychometric Assessment */}
        <Route path="/careers-after-graduation" element={<Suspense fallback={<PageLoader />}><WithTransition><CareersAfterGraduation /></WithTransition></Suspense>} />
        <Route path="/jobs-after-ba" element={<Suspense fallback={<PageLoader />}><WithTransition><DegreeGuidePage degreeSlug="ba" /></WithTransition></Suspense>} />
        <Route path="/jobs-after-bcom" element={<Suspense fallback={<PageLoader />}><WithTransition><DegreeGuidePage degreeSlug="bcom" /></WithTransition></Suspense>} />
        <Route path="/jobs-after-bsc" element={<Suspense fallback={<PageLoader />}><WithTransition><DegreeGuidePage degreeSlug="bsc" /></WithTransition></Suspense>} />
        <Route path="/jobs-after-bba" element={<Suspense fallback={<PageLoader />}><WithTransition><DegreeGuidePage degreeSlug="bba" /></WithTransition></Suspense>} />
        <Route path="/jobs-after-bca" element={<Suspense fallback={<PageLoader />}><WithTransition><DegreeGuidePage degreeSlug="bca" /></WithTransition></Suspense>} />
        <Route path="/jobs-after-ma" element={<Suspense fallback={<PageLoader />}><WithTransition><DegreeGuidePage degreeSlug="ma" /></WithTransition></Suspense>} />
        <Route path="/jobs-after-mcom" element={<Suspense fallback={<PageLoader />}><WithTransition><DegreeGuidePage degreeSlug="mcom" /></WithTransition></Suspense>} />
        <Route path="/jobs-after-msc" element={<Suspense fallback={<PageLoader />}><WithTransition><DegreeGuidePage degreeSlug="msc" /></WithTransition></Suspense>} />
        <Route path="/career-paths" element={<Suspense fallback={<PageLoader />}><WithTransition><CareerPathsHub /></WithTransition></Suspense>} />
        <Route path="/career-paths/:slug" element={<Suspense fallback={<PageLoader />}><WithTransition><CareerPathDetailPage /></WithTransition></Suspense>} />
        <Route path="/courses" element={<Navigate to="/career-paths" replace />} />
        <Route path="/programs" element={<Navigate to="/career-paths" replace />} />
        <Route path="/career-assessment" element={<Suspense fallback={<PageLoader />}><WithTransition><CareerAssessmentPage /></WithTransition></Suspense>} />
        <Route path="/placement-support" element={<Suspense fallback={<PageLoader />}><WithTransition><PlacementSupportPage /></WithTransition></Suspense>} />
        <Route path="/student-success-stories" element={<Suspense fallback={<PageLoader />}><WithTransition><StudentSuccessStoriesPage /></WithTransition></Suspense>} />
        <Route path="/career-guidance" element={<Suspense fallback={<PageLoader />}><WithTransition><CareerGuidancePage /></WithTransition></Suspense>} />

        <Route path="*" element={<Suspense fallback={<PageLoader />}><WithTransition><NotFound /></WithTransition></Suspense>} />
      </Routes>
    </ReducedMotionContext.Provider>
  );
});

const AnimatedRoutes = () => {
  return <RoutesContent />;
};

export default AnimatedRoutes;
