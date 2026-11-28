import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { AuthModal } from "./AuthModal";
import { MobileMenu } from "./MobileMenu";
import { UserMenu } from "./UserMenu";
import logoImage from "@/assets/udayantu-logo.svg";
import { LayoutDashboard, Building2, ChevronDown, Home, BookOpen, User, LogOut, Sparkles } from "lucide-react";

const CareerDiscoveryFlow = lazy(() =>
  import("./student/CareerDiscoveryFlow").then(m => ({ default: m.CareerDiscoveryFlow }))
);

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { isPaid, loading: paymentLoading } = usePaymentStatus();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<"register" | "login">("register");
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleOpenDiscovery = () => {
      setIsDiscoveryOpen(true);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("open-career-discovery", handleOpenDiscovery);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("open-career-discovery", handleOpenDiscovery);
    };
  }, []);

  useEffect(() => {
    const sections = ["roles", "placements", "faq"];
    
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    });

    // Set home as active when at top
    const handleTopScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection("home");
      }
    };
    window.addEventListener("scroll", handleTopScroll);

    return () => {
      sections.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) observer.unobserve(element);
      });
      window.removeEventListener("scroll", handleTopScroll);
    };
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  const handleDashboardClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the dashboard",
        variant: "destructive",
      });
      setAuthDefaultTab("login");
      setIsAuthOpen(true);
      return;
    }

    if (paymentLoading) {
      toast({
        title: "Loading",
        description: "Checking payment status...",
      });
      return;
    }

    if (!isPaid) {
      toast({
        title: "Payment Required",
        description: "Please complete your payment to access the dashboard",
        variant: "destructive",
      });
      navigate("/payment");
      return;
    }

    navigate("/dashboard");
  };

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { label: "Career Guides", to: "/careers-after-graduation", sectionId: "career-guides" },
    { label: "Career Paths", to: "/career-paths", sectionId: "career-paths" },
    { label: "Assessment", to: "/career-assessment", sectionId: "career-assessment" },
    { label: "Placement", to: "/placement-support", sectionId: "placement-support" },
    { label: "About", to: "/about", sectionId: "about" },
    { label: "Blog", to: "/blog", sectionId: "blog" },
  ];

  const isLinkActive = (sectionId: string) => {
    if (sectionId === "career-guides") {
      return (
        location.pathname === "/careers-after-graduation" ||
        location.pathname.startsWith("/jobs-after-") ||
        location.pathname === "/career-guidance"
      );
    }
    if (sectionId === "career-paths") {
      return location.pathname.startsWith("/career-paths");
    }
    if (sectionId === "career-assessment") {
      return location.pathname === "/career-assessment";
    }
    if (sectionId === "placement-support") {
      return (
        location.pathname === "/placement-support" ||
        location.pathname === "/student-success-stories"
      );
    }
    if (sectionId === "blog") {
      return location.pathname.startsWith("/blog");
    }
    if (sectionId === "about") {
      return location.pathname === "/about";
    }
    if (sectionId === "employers") {
      return location.pathname === "/employers";
    }
    return location.pathname === "/" && activeSection === sectionId;
  };

  return (
    <>
      <nav aria-label="Primary Navigation" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/98 backdrop-blur-xl shadow-lg shadow-foreground/5 border-b border-border/60" 
          : "bg-background/90 backdrop-blur-md border-b border-border/30"
      }`}>
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">
            {/* Logo — Crawlable Link */}
            <Link 
              to="/"
              className="hover:opacity-90 transition-all duration-300 hover:scale-[1.02] flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              aria-label="UdaYantu Home"
              data-testid="button-navbar-logo"
            >
              <img 
                src={logoImage} 
                alt="UdaYantu - Career Training for Graduates in India" 
                width={140}
                height={56}
                className="h-10 sm:h-11 md:h-12 lg:h-14 w-auto object-contain"
                data-testid="img-navbar-logo"
              />
            </Link>
            
            {/* Navigation Links - Crawlable Links on desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`font-medium text-sm px-3 py-2.5 rounded-lg transition-all duration-200 relative group whitespace-nowrap ${
                    isLinkActive(link.sectionId)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  data-testid={`button-navbar-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.label}
                  {isLinkActive(link.sectionId) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* For Employers CTA - Crawlable Link inside udayantu.com */}
              {!user && (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="hidden md:inline-flex border-secondary/50 text-secondary hover:bg-secondary hover:text-secondary-foreground font-medium text-sm px-3.5 gap-1.5 transition-all duration-200"
                  data-testid="button-navbar-for-employers"
                >
                  <Link to="/employer">
                    <Building2 className="w-4 h-4" />
                    <span className="hidden xl:inline">For Employers</span>
                    <span className="xl:hidden">Employers</span>
                  </Link>
                </Button>
              )}

              {/* Auth Buttons & User Menu */}
              {user ? (
                <>
                  <div className="hidden lg:flex items-center gap-2.5">
                    <Button
                      asChild
                      size="sm"
                      variant="default"
                      className="font-semibold text-xs gap-1.5 px-3.5"
                    >
                      <Link
                        to={
                          user.role === "employer_admin" || user.role === "employer_recruiter"
                            ? "/employer/dashboard"
                            : "/dashboard"
                        }
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 font-medium text-xs gap-1.5 px-3"
                      data-testid="button-navbar-logout"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </Button>
                  </div>
                  <div className="lg:hidden">
                    <MobileMenu navLinks={navLinks} isLinkActive={isLinkActive} />
                  </div>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hidden md:inline-flex font-medium text-sm"
                    data-testid="button-navbar-sign-in"
                  >
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="font-extrabold hidden sm:inline-flex shadow-md hover:shadow-lg transition-all duration-200 gap-1.5 bg-secondary text-secondary-foreground"
                    data-testid="button-navbar-find-career"
                  >
                    <Link to="/career-assessment">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Find My Best Career
                    </Link>
                  </Button>
                  <div className="lg:hidden">
                    <MobileMenu navLinks={navLinks} isLinkActive={isLinkActive} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
