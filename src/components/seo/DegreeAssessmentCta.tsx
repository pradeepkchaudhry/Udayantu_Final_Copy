import { Link } from "react-router-dom";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DegreeSlug } from "@/data/careerPrograms";
import { trackSeoConversion } from "@/lib/seoAnalytics";

interface DegreeAssessmentCtaProps {
  degreeSlug?: DegreeSlug;
  degreeLabel?: string;
  primaryLabel: string;
  secondaryLabel?: string;
  secondaryPath?: string;
  description?: string;
  sourcePage: string;
}

export const DegreeAssessmentCta = ({
  degreeSlug,
  degreeLabel,
  primaryLabel,
  secondaryLabel = "Explore All 8 Career Tracks",
  secondaryPath = "/career-paths",
  description = "Answer 5 quick questions about your degree, communication comfort, and work style to get your top 3 realistic corporate career matches.",
  sourcePage,
}: DegreeAssessmentCtaProps) => {
  const assessmentHref = degreeSlug
    ? `/career-assessment?degree=${degreeSlug}`
    : "/career-assessment";

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 shadow-sm">
      <CardContent className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary">
            <Compass className="w-4 h-4" />
            <span>
              {degreeLabel
                ? `${degreeLabel} Career Recommendation Tool`
                : "Personalised Career Assessment"}
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground">
            {degreeLabel
              ? `Confused which role fits your ${degreeLabel} background best?`
              : "Discover your top 3 realistic corporate career tracks"}
          </h3>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <Button
            asChild
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
          >
            <Link
              to={assessmentHref}
              onClick={() =>
                trackSeoConversion("assessment_started", {
                  degree: degreeSlug || "general",
                  source_page: sourcePage,
                })
              }
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {primaryLabel}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to={secondaryPath}>
              {secondaryLabel}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
