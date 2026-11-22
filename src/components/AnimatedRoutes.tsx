import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, memo, useState, useEffect, createContext, useContext } from "react";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";

const ReducedMotionContext = createContext(false);

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);

    // Safari < 14 uses addListener/removeListener instead of addEventListener/removeEventListener
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }

    if (typeof (mediaQuery as any).addListener === "function") {
      (mediaQuery as any).addListener(handler);
      return () => (mediaQuery as any).removeListener(handler);
    }
  }, []);

  return prefersReducedMotion;
};

import Index from "../pages/Index";
const Auth = lazy(() => import("../pages/Auth"));

// Lazy-loaded pages for code splitting
const StudentDashboard = lazy(() => import("../pages/StudentDashboard"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
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
const JobsManagement = lazy(() => import("../pages/JobsManagement"));
const TeamManagement = lazy(() => import("../pages/TeamManagement"));
const TeamInviteAccept = lazy(() => import("../pages/TeamInviteAccept"));
const CandidatesPage = lazy(() => import("../pages/employer/Candidates"));
const OfferManagement = lazy(() => import("../pages/employer/OfferManagement"));
const Analytics = lazy(() => import("../pages/employer/Analytics"));
const OutcomesDashboard = lazy(() => import("../pages/employer/OutcomesDashboard"));
const TalentPool = lazy(() => import("../pages/employer/TalentPool"));
const CompliancePanel = lazy(() => import("../pages/admin/CompliancePanel"));
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

const WithTransition = memo(({ children }: { children: React.ReactNode }) => {
  const reducedMotion = useContext(ReducedMotionContext);
  if (reducedMotion) return <>{children}</>;
  return <PageTransition>{children}</PageTransition>;
});

const RoutesContent = memo(() => {
  const location = useLocation();
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isAdminSubdomain = hostname.startsWith("admin.");
  
  return (
    <Routes location={location} key={location.pathname}>
      <Route 
        path="/" 
        element={
          isAdminSubdomain ? (
            <Suspense fallback={<PageLoader />}>
              <WithTransition>
                <AdminDashboard />
              </WithTransition>
            </Suspense>
          ) : (
            <WithTransition>
              <Index />
            </WithTransition>
          )
        } 
      />
      <Route path="/auth" element={<Suspense fallback={<PageLoader />}><WithTransition><Auth /></WithTransition></Suspense>} />
      <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><WithTransition><StudentDashboard /></WithTransition></Suspense>} />
      <Route path="/payment" element={<Suspense fallback={<PageLoader />}><WithTransition><Payment /></WithTransition></Suspense>} />
      <Route path="/profile" element={<Suspense fallback={<PageLoader />}><WithTransition><Profile /></WithTransition></Suspense>} />
      <Route path="/settings" element={<Suspense fallback={<PageLoader />}><WithTransition><Settings /></WithTransition></Suspense>} />
      <Route path="/support" element={<Suspense fallback={<PageLoader />}><WithTransition><Support /></WithTransition></Suspense>} />
      <Route path="/admin" element={<Suspense fallback={<PageLoader />}><WithTransition><AdminDashboard /></WithTransition></Suspense>} />
      <Route path="/admin/compliance" element={<Suspense fallback={<PageLoader />}><WithTransition><CompliancePanel /></WithTransition></Suspense>} />
      <Route path="/blog" element={<Suspense fallback={<PageLoader />}><WithTransition><Blog /></WithTransition></Suspense>} />
      <Route path="/blog/:slug" element={<Suspense fallback={<PageLoader />}><WithTransition><BlogPost /></WithTransition></Suspense>} />
      <Route path="/about" element={<Suspense fallback={<PageLoader />}><WithTransition><About /></WithTransition></Suspense>} />
      <Route path="/employers" element={<Suspense fallback={<PageLoader />}><WithTransition><Employers /></WithTransition></Suspense>} />
      <Route path="/contact" element={<Suspense fallback={<PageLoader />}><WithTransition><ContactUs /></WithTransition></Suspense>} />
      <Route path="/terms" element={<Suspense fallback={<PageLoader />}><WithTransition><Terms /></WithTransition></Suspense>} />
      <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><WithTransition><Privacy /></WithTransition></Suspense>} />
      <Route path="/refund" element={<Suspense fallback={<PageLoader />}><WithTransition><Refund /></WithTransition></Suspense>} />
      <Route path="/employer-login" element={<Suspense fallback={<PageLoader />}><WithTransition><EmployerLogin /></WithTransition></Suspense>} />
      <Route path="/employer-dashboard" element={<Suspense fallback={<PageLoader />}><WithTransition><EmployerDashboard /></WithTransition></Suspense>} />
      <Route path="/employer/candidates" element={<Suspense fallback={<PageLoader />}><WithTransition><CandidatesPage /></WithTransition></Suspense>} />
      <Route path="/employer/offers" element={<Suspense fallback={<PageLoader />}><WithTransition><OfferManagement /></WithTransition></Suspense>} />
      <Route path="/employer/analytics" element={<Suspense fallback={<PageLoader />}><WithTransition><Analytics /></WithTransition></Suspense>} />
      <Route path="/employer/outcomes" element={<Suspense fallback={<PageLoader />}><WithTransition><OutcomesDashboard /></WithTransition></Suspense>} />
      <Route path="/employer/talent-pool" element={<Suspense fallback={<PageLoader />}><WithTransition><TalentPool /></WithTransition></Suspense>} />
      <Route path="/analytics" element={<Suspense fallback={<PageLoader />}><WithTransition><Analytics /></WithTransition></Suspense>} />
      <Route path="/jobs" element={<Suspense fallback={<PageLoader />}><WithTransition><JobsManagement /></WithTransition></Suspense>} />
      <Route path="/team" element={<Suspense fallback={<PageLoader />}><WithTransition><TeamManagement /></WithTransition></Suspense>} />
      {/* Public SEO Architecture — Graduate Hub, Degree Guides, Career Tracks, Assessment & Trust Pages */}
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
      <Route path="/programs" element={<Navigate to="/career-paths" replace />} />
      <Route path="/career-assessment" element={<Suspense fallback={<PageLoader />}><WithTransition><CareerAssessmentPage /></WithTransition></Suspense>} />
      <Route path="/placement-support" element={<Suspense fallback={<PageLoader />}><WithTransition><PlacementSupportPage /></WithTransition></Suspense>} />
      <Route path="/student-success-stories" element={<Suspense fallback={<PageLoader />}><WithTransition><StudentSuccessStoriesPage /></WithTransition></Suspense>} />
      <Route path="/career-guidance" element={<Suspense fallback={<PageLoader />}><WithTransition><CareerGuidancePage /></WithTransition></Suspense>} />

      <Route path="/team-invite/:token" element={<Suspense fallback={<PageLoader />}><WithTransition><TeamInviteAccept /></WithTransition></Suspense>} />
      <Route path="*" element={<Suspense fallback={<PageLoader />}><WithTransition><NotFound /></WithTransition></Suspense>} />
    </Routes>
  );
});

const AnimatedRoutes = () => {
  return <RoutesContent />;
};

export default AnimatedRoutes;
