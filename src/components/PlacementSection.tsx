import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Phone,
  Briefcase,
  MapPin,
  RefreshCw,
  Users,
  ArrowRight,
} from "lucide-react";
import { memo } from "react";
import { Link } from "react-router-dom";
import { VERIFIED_PROGRAM_FACTS } from "@/data/businessTruth";

const placementFeatures = [
  {
    icon: CheckCircle2,
    title: "1:1 Personal Mentorship",
    description:
      "Structured resume audits, communication coaching, and mock interviews tailored to your target track.",
  },
  {
    icon: Briefcase,
    title: "Employer Connections",
    description:
      "Access curated hiring opportunities shared by verified employer partners as roles open.",
  },
  {
    icon: MapPin,
    title: "Real-World Portfolio Projects",
    description:
      "Graduate with practical assignments that prove job readiness even without prior work experience.",
  },
  {
    icon: Users,
    title: "Remote, Hybrid & Metro Readiness",
    description:
      "Prepare for distributed teams and metro-hub opportunities without leaving your town during training.",
  },
  {
    icon: Phone,
    title: "Dedicated Student Support",
    description:
      "Responsive guidance via email, WhatsApp, and scheduled mentor check-ins throughout your cohort.",
  },
  {
    icon: RefreshCw,
    title: "Written Refund Policy",
    description: `Eligible graduates unplaced within ${VERIFIED_PROGRAM_FACTS.placementWindowLabel} qualify for a written refund review.`,
  },
];

const FeatureCard = memo(
  ({ feature }: { feature: (typeof placementFeatures)[0] }) => (
    <Card className="bg-white/10 border-white/15 backdrop-blur-sm h-full hover:bg-white/15 hover:border-white/25 transition-all duration-300 group">
      <CardContent className="pt-6 pb-5">
        <div className="flex items-start gap-4">
          <div className="bg-secondary/25 p-2.5 rounded-xl flex-shrink-0 group-hover:bg-secondary/35 transition-colors">
            <feature.icon className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1.5 text-white">
              {feature.title}
            </h3>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              {feature.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
);

FeatureCard.displayName = "FeatureCard";

export const PlacementSection = memo(() => {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--secondary)/0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,hsl(var(--primary-hover)/0.3),transparent_50%)] pointer-events-none" />

      <div className="container px-4 mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-5 md:mb-6 leading-tight">
            Structured Placement Support &amp;
            <br className="hidden sm:block" /> Transparent Written Refund Terms
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/85 max-w-3xl mx-auto leading-relaxed">
            Every student who completes their {VERIFIED_PROGRAM_FACTS.standardDurationLabel} curriculum, maintains {VERIFIED_PROGRAM_FACTS.minimumAttendancePercent}% attendance, and participates actively in interviews receives dedicated placement support.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-12 md:mb-16">
          {placementFeatures.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>

        <div className="bg-secondary text-secondary-foreground rounded-2xl p-6 md:p-8 lg:p-10 text-center shadow-xl shadow-secondary/30 space-y-4">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold font-heading">
            Clear Eligibility Rules — Published in Writing Before Enrollment
          </p>
          <p className="text-sm md:text-base max-w-3xl mx-auto opacity-95">
            {VERIFIED_PROGRAM_FACTS.refundPolicySummary}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button
              asChild
              variant="outline"
              className="bg-white/15 border-white/40 text-white hover:bg-white/25"
            >
              <Link to="/placement-support">
                How Placement Support Works
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="bg-white text-primary hover:bg-white/90 border-white font-semibold"
            >
              <Link to="/refund">Read Full Refund Policy</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
});

PlacementSection.displayName = "PlacementSection";
