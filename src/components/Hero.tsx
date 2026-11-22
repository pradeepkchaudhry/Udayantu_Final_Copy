import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  BookOpen,
  Users,
  Sparkles,
  Clock,
  Compass,
} from "lucide-react";
import { AuthModal } from "./AuthModal";
import heroImage from "@/assets/hero-students.jpg";
import { VERIFIED_PROGRAM_FACTS } from "@/data/businessTruth";
import { trackSeoConversion } from "@/lib/seoAnalytics";

const ValuePropCard = memo(
  ({
    icon: Icon,
    title,
    description,
  }: {
    icon: typeof CheckCircle2;
    title: string;
    description: string;
  }) => (
    <div className="flex items-start gap-3 md:gap-4 text-left bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-white/15 hover:bg-white/15 hover:border-white/25 transition-all duration-300 group">
      <div className="bg-secondary/25 p-2 rounded-lg flex-shrink-0 group-hover:bg-secondary/35 transition-colors">
        <Icon className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
      </div>
      <div>
        <h3 className="font-semibold text-base md:text-lg mb-0.5">{title}</h3>
        <p className="text-sm text-white/80">{description}</p>
      </div>
    </div>
  )
);

ValuePropCard.displayName = "ValuePropCard";

const TrustBadge = memo(
  ({
    icon: Icon,
    title,
    subtitle,
  }: {
    icon: typeof Shield;
    title: string;
    subtitle: string;
  }) => (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-5 text-center border border-white/15 hover:bg-white/15 hover:border-white/25 transition-all duration-300 group">
      <div className="bg-secondary/25 w-10 md:w-12 h-10 md:h-12 rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:bg-secondary/35 transition-colors">
        <Icon className="w-5 md:w-6 h-5 md:h-6 text-secondary" />
      </div>
      <p className="text-sm md:text-base font-semibold">{title}</p>
      <p className="text-xs text-white/70 mt-0.5">{subtitle}</p>
    </div>
  )
);

TrustBadge.displayName = "TrustBadge";

const valueProps = [
  {
    icon: Compass,
    title: "Personalised Career Assessment",
    description: "Match your BA, B.Com, B.Sc, BBA, or BCA degree to realistic corporate roles",
  },
  {
    icon: CheckCircle2,
    title: "Practical Skills & Assignments",
    description: `${VERIFIED_PROGRAM_FACTS.standardDurationLabel} of hands-on workplace projects and tool training`,
  },
  {
    icon: Users,
    title: "1:1 Personal Mentorship",
    description: "Resume reviews, spoken communication practice, and mock interviews",
  },
  {
    icon: Shield,
    title: "Transparent Placement & Refund Terms",
    description: "Clear eligibility criteria and written refund policy published upfront",
  },
];

const trustBadges = [
  {
    icon: BookOpen,
    title: `${VERIFIED_PROGRAM_FACTS.totalCareerTracks} Career Tracks`,
    subtitle: "Non-technical corporate roles",
  },
  {
    icon: Clock,
    title: VERIFIED_PROGRAM_FACTS.standardDurationLabel,
    subtitle: "Structured practical training",
  },
  {
    icon: Users,
    title: "1:1 Mentorship",
    subtitle: "Hindi & English guidance",
  },
  {
    icon: Shield,
    title: "Written Refund Policy",
    subtitle: "Transparent eligibility rules",
  },
];

export const Hero = memo(() => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden pt-24 sm:pt-28 pb-14">
      <img
        src={heroImage}
        alt=""
        role="presentation"
        width={1920}
        height={1080}
        loading="eager"
        decoding="async"
        className="absolute inset-0 z-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/90 via-primary/85 to-primary/80" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_20%,_hsl(var(--secondary)/0.14)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_70%_80%,_hsl(var(--primary-hover)/0.35)_0%,_transparent_50%)]" />

      <div className="container relative z-10 px-4 py-8 md:py-12 mx-auto">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="animate-fade-in">
            <Badge className="mb-5 bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xs sm:text-sm px-4 py-2 inline-flex items-center gap-2 shadow-lg shadow-secondary/30 border-0">
              <Compass className="w-4 h-4" />
              Career Guidance & Job-Readiness for Rural & Tier 2–4 Graduates
            </Badge>
          </div>

          <h1 className="mb-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading tracking-tight leading-[1.12] animate-fade-in animation-delay-100">
            Turn Your Graduation Degree into a Career with{" "}
            <span className="bg-gradient-to-r from-secondary via-amber-300 to-secondary bg-clip-text text-transparent">
              Practical Skills and Personal Mentorship.
            </span>
          </h1>

          <p className="mb-4 text-base sm:text-lg md:text-xl text-white/95 max-w-3xl mx-auto font-medium leading-relaxed animate-fade-in animation-delay-200">
            BA, B.Com, B.Sc, BBA, BCA, MA, M.Com, ya M.Sc ke baad confused hain ki private job kaise milegi? Sahi career direction, practical skills, aur 1:1 mentorship ke saath job-ready baniye.
          </p>

          <p className="mb-9 text-sm sm:text-base md:text-lg text-white/85 max-w-3xl mx-auto leading-relaxed animate-fade-in animation-delay-300">
            No hollow promises or coding requirements—structured 15-week corporate training, real assignments, mock interviews, and transparent placement-support terms.
          </p>

          {/* Value Props Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-9 md:mb-11 max-w-3xl mx-auto animate-fade-in animation-delay-400">
            {valueProps.map((prop) => (
              <ValuePropCard
                key={prop.title}
                icon={prop.icon}
                title={prop.title}
                description={prop.description}
              />
            ))}
          </div>

          {/* Distinct Primary & Crawlable Secondary CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-10 md:mb-14 animate-fade-in animation-delay-500">
            <Button
              asChild
              size="xl"
              variant="glow"
              className="text-base md:text-lg px-7 md:px-10 py-5 md:py-6 h-auto font-extrabold gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-2xl"
            >
              <Link
                to="/career-assessment"
                onClick={() =>
                  trackSeoConversion("assessment_started", {
                    source_page: "homepage_hero",
                  })
                }
              >
                <Sparkles className="w-5 h-5 text-amber-200" />
                Discover My Best Career
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>

            <Button
              asChild
              size="xl"
              variant="ghost"
              className="bg-white/10 text-white border-2 border-white/40 hover:bg-white/20 hover:border-white/60 backdrop-blur-sm text-base md:text-lg px-7 md:px-9 py-5 md:py-6 h-auto font-semibold"
            >
              <Link to="/careers-after-graduation">
                Explore Career Options After Graduation
              </Link>
            </Button>
          </div>

          {/* Verified Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto animate-fade-in animation-delay-600">
            {trustBadges.map((badge) => (
              <TrustBadge
                key={badge.title}
                icon={badge.icon}
                title={badge.title}
                subtitle={badge.subtitle}
              />
            ))}
          </div>
        </div>
      </div>

      <AuthModal
        open={isAuthOpen}
        onOpenChange={setIsAuthOpen}
        defaultTab="register"
      />
    </section>
  );
});

Hero.displayName = "Hero";
