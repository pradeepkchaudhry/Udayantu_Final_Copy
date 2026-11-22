import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404: Non-existent route visited:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Page Not Found (404) | UdaYantu"
        description="The page you requested could not be found on UdaYantu. Explore our graduate career guides and career paths."
        noIndex={true}
      />
      <Navbar />
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center px-4">
        <div className="text-center max-w-lg space-y-5">
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary">
            Error 404
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Page Not Found
          </h1>
          <p className="text-muted-foreground">
            The link you opened does not exist or may have moved. Explore our graduate career guides or take the career assessment instead.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild size="lg" className="bg-primary text-primary-foreground">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Return to Home
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/careers-after-graduation">
                <Compass className="w-4 h-4 mr-2" />
                Explore Degree Guides
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
