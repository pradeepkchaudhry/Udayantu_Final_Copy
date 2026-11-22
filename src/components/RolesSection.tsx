import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Users,
  ClipboardList,
  Settings,
  Package,
  UserCheck,
  TrendingUp,
  Headphones,
  Clock,
  Target,
  Award,
  Zap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { memo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { CAREER_PROGRAMS, type CareerTrackId } from "@/data/careerPrograms";
import { trackSeoConversion } from "@/lib/seoAnalytics";

const TRACK_ICONS: Record<CareerTrackId, typeof Briefcase> = {
  "business-development": Briefcase,
  "customer-success": Users,
  "project-management": ClipboardList,
  "operations-management": Settings,
  "product-management": Package,
  "human-resources": UserCheck,
  "marketing-management": TrendingUp,
  "customer-support": Headphones,
};

export const RolesSection = memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<"register" | "login">("register");

  return (
    <section
      id="roles"
      className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

      <div className="container px-4 mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <Badge variant="secondary" className="mb-4 text-sm font-semibold px-4 py-2">
            <Award className="w-4 h-4 mr-2" />
            8 Career Paths • 15 Weeks Each • Fresher-Friendly
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground leading-tight">
            Explore All 8 Structured{" "}
            <span className="text-primary">Career Tracks</span>
          </h2>
          <div className="bg-secondary/10 border-2 border-secondary/30 rounded-xl p-5 max-w-4xl mx-auto">
            <p className="text-base md:text-xl text-primary font-bold text-center leading-relaxed">
              Every programme is built for non-technical freshers—your degree is your foundation, and practical skills prepare you for interviews.
            </p>
          </div>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-3">
            Select a track below to preview modules, or open the dedicated curriculum page for full week-by-week details.
          </p>
        </div>

        <Tabs defaultValue="business-development" className="w-full">
          <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <TabsList className="inline-flex w-auto lg:grid lg:w-full lg:grid-cols-4 h-auto gap-2 md:gap-3 bg-transparent p-0 mb-8 md:mb-12">
              {CAREER_PROGRAMS.map((program) => {
                const Icon = TRACK_ICONS[program.id];
                return (
                  <TabsTrigger
                    key={program.id}
                    value={program.id}
                    className="flex flex-col items-center justify-center gap-2 p-4 md:p-5 min-h-[90px] md:min-h-[110px] min-w-[125px] md:min-w-[160px] rounded-xl border-2 border-border bg-card/80 hover:bg-card hover:border-primary/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-lg transition-all duration-200 group"
                  >
                    <Icon className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0 transition-transform group-hover:scale-110 group-data-[state=active]:scale-110" />
                    <span className="text-xs md:text-sm font-semibold text-center leading-tight">
                      {program.name}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {CAREER_PROGRAMS.map((program) => {
            const Icon = TRACK_ICONS[program.id];
            return (
              <TabsContent
                key={program.id}
                value={program.id}
                className="mt-0 animate-in fade-in-50 duration-300"
              >
                <Card className="border-2 border-border shadow-xl overflow-hidden bg-card">
                  <CardHeader className="bg-gradient-to-br from-muted/50 to-transparent space-y-5 pb-6">
                    <div className="flex flex-col md:flex-row items-start gap-4 md:gap-5">
                      <div className="bg-secondary text-secondary-foreground p-4 rounded-xl shadow-md">
                        <Icon className="w-7 h-7 md:w-8 md:h-8" />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
                          {program.name}
                        </CardTitle>
                        <CardDescription className="text-base md:text-lg font-medium text-primary flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          {program.tagline}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1.5">
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        {program.duration}
                      </Badge>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5">
                        <Target className="w-3.5 h-3.5 mr-1.5" />
                        {program.difficulty}
                      </Badge>
                      {program.coreSkills.slice(0, 2).map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="px-3 py-1.5 text-xs border-border bg-background"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1.5 text-primary" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6 space-y-6">
                    <div className="bg-muted/50 p-5 rounded-xl border border-border">
                      <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
                        {program.overview}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-base md:text-lg text-foreground flex items-center gap-2">
                        <div className="h-0.5 w-8 bg-primary rounded-full" />
                        Curriculum Modules ({program.duration})
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {program.modules.map((module, index) => (
                          <div
                            key={module.title}
                            className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="pt-0.5">
                              <p className="text-xs font-semibold text-primary">
                                {module.weekRange}
                              </p>
                              <p className="text-sm text-foreground/90 font-medium leading-relaxed">
                                {module.title}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                      <Link
                        to={program.path}
                        onClick={() =>
                          trackSeoConversion("programme_details_opened", {
                            programme: program.id,
                            source_page: "homepage_roles_section",
                          })
                        }
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                      >
                        View Full {program.name} Syllabus &amp; Assignments
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Button
                        size="lg"
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-6 shadow-md"
                        onClick={() => {
                          if (user) {
                            navigate("/payment");
                          } else {
                            setAuthDefaultTab("register");
                            setIsAuthOpen(true);
                          }
                        }}
                      >
                        Apply for This Track
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        <div className="text-center mt-8">
          <Link
            to="/career-paths"
            className="inline-flex items-center gap-2 text-sm md:text-base font-semibold text-primary hover:underline"
          >
            Compare All 8 Career Paths Side-by-Side
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <AuthModal
        open={isAuthOpen}
        onOpenChange={setIsAuthOpen}
        defaultTab={authDefaultTab}
      />
    </section>
  );
});

RolesSection.displayName = "RolesSection";
