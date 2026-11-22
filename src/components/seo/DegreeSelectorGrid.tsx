import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEGREE_GUIDES } from "@/data/degreeGuides";
import { trackSeoConversion } from "@/lib/seoAnalytics";

interface DegreeSelectorGridProps {
  heading?: string;
  subheading?: string;
  showPostgraduate?: boolean;
  sourcePage?: string;
}

export const DegreeSelectorGrid = ({
  heading = "Choose Your Graduation Degree to Explore Career Options",
  subheading = "Apni degree chuniye aur dekhiye kaun-se realistic corporate roles, skills, aur 90-day preparation plan aapke liye sabse sahi hain.",
  showPostgraduate = true,
  sourcePage = "homepage",
}: DegreeSelectorGridProps) => {
  const ugGuides = DEGREE_GUIDES.filter((g) => g.level === "Undergraduate");
  const pgGuides = DEGREE_GUIDES.filter((g) => g.level === "Postgraduate");

  return (
    <section
      id="degree-selector"
      className="py-16 md:py-20 bg-muted/30 border-y border-border/60"
      aria-labelledby="degree-selector-heading"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-secondary mb-2">
            Degree-Wise Career Roadmaps
          </p>
          <h2
            id="degree-selector-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3"
          >
            {heading}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            {subheading}
          </p>
        </div>

        {/* Undergraduate Core Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {ugGuides.map((guide) => (
            <Link
              key={guide.slug}
              to={guide.path}
              onClick={() =>
                trackSeoConversion("degree_selected", {
                  degree: guide.slug,
                  source_page: sourcePage,
                  level: "undergraduate",
                })
              }
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
            >
              <Card className="h-full border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-xs font-medium">
                      UG Guide
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                    Jobs After {guide.degreeLabel}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 flex-grow line-clamp-2">
                    {guide.degreeFullName} — {guide.roles.length} entry career tracks & 90-day roadmap
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary group-hover:gap-2 transition-all">
                    Explore {guide.degreeLabel} Guide
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Postgraduate Row */}
        {showPostgraduate && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {pgGuides.map((guide) => (
              <Link
                key={guide.slug}
                to={guide.path}
                onClick={() =>
                  trackSeoConversion("degree_selected", {
                    degree: guide.slug,
                    source_page: sourcePage,
                    level: "postgraduate",
                  })
                }
                className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
              >
                <Card className="h-full border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                          Jobs After {guide.degreeLabel}
                        </h3>
                        <Badge variant="secondary" className="text-[11px]">
                          PG Guide
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {guide.degreeFullName} corporate career options
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-secondary flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link
            to="/careers-after-graduation"
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
          >
            Compare All Graduation Career Options
            <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-muted-foreground" aria-hidden="true">
            •
          </span>
          <Link
            to="/career-assessment"
            className="inline-flex items-center gap-1.5 font-semibold text-secondary hover:underline"
          >
            Not sure? Take the Free Career Assessment
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
