import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Clock, BarChart, GraduationCap, ArrowRight, Wrench } from "lucide-react";
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { CAREER_PROGRAMS } from "@/data/careerPrograms";

export const ComparisonTable = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Compare <span className="text-primary">All 8 Career Tracks</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compare duration, eligible degrees, tools covered, and core skills across all structured UdaYantu programmes.
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="overflow-hidden border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Program</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Duration</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Level</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Best For Degrees</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Key Tools</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {CAREER_PROGRAMS.map((program) => (
                      <tr key={program.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={program.path}
                            className="font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {program.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" />
                            {program.duration}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="w-fit text-emerald-700 border-emerald-500/40">
                            <BarChart className="w-3 h-3 mr-1" />
                            {program.difficulty}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {program.bestForDegrees.slice(0, 4).map((deg) => (
                              <Link key={deg} to={`/jobs-after-${deg}`}>
                                <Badge variant="outline" className="text-xs hover:border-primary">
                                  {deg.toUpperCase()}
                                </Badge>
                              </Link>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-muted-foreground">
                            {program.toolsCovered.slice(0, 3).join(" • ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={program.path}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline"
                          >
                            Syllabus
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden grid gap-4">
            {CAREER_PROGRAMS.map((program) => (
              <Card key={program.id} className="border-2 border-border hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">
                    <Link to={program.path} className="hover:text-primary">
                      {program.name}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {program.duration}
                    </Badge>
                    <Badge variant="outline" className="text-emerald-700 border-emerald-500/40">
                      <BarChart className="w-3 h-3 mr-1" />
                      {program.difficulty}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-1.5 flex items-center gap-1">
                      <Wrench className="w-4 h-4" />
                      Tools Covered
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {program.toolsCovered.slice(0, 4).join(" • ")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-1.5 flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      Best For Degrees
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {program.bestForDegrees.slice(0, 4).map((deg) => (
                        <Link key={deg} to={`/jobs-after-${deg}`}>
                          <Badge variant="outline" className="text-xs">
                            {deg.toUpperCase()}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => {
                if (user) {
                  navigate("/payment");
                } else {
                  setIsAuthOpen(true);
                }
              }}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <Check className="mr-2 w-5 h-5" />
              Choose Your Program &amp; Register
            </Button>
          </div>
        </div>
      </section>

      <AuthModal
        open={isAuthOpen}
        onOpenChange={setIsAuthOpen}
        defaultTab="register"
      />
    </>
  );
};