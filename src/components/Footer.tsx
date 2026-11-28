import {
  Linkedin,
  Phone,
  Mail,
  Facebook,
  MapPin,
  Shield,
  Users,
  BookOpen,
  Clock,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Heart,
  Instagram,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { SITE_CONFIG, VERIFIED_PLATFORM_PILLARS } from "@/data/businessTruth";

const PILLAR_ICONS = [BookOpen, Clock, Users, Shield];
const PILLAR_COLORS = ["text-emerald-400", "text-sky-400", "text-amber-400", "text-violet-400"];

export const Footer = memo(() => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success("Thank you for subscribing!", {
      description: "You'll receive fresher career guides and interview preparation tips.",
    });
    setEmail("");
    setIsSubmitting(false);
  };

  const degreeGuideLinks = [
    { to: "/careers-after-graduation", label: "Graduate Career Hub" },
    { to: "/jobs-after-ba", label: "Jobs After BA" },
    { to: "/jobs-after-bcom", label: "Jobs After B.Com" },
    { to: "/jobs-after-bsc", label: "Jobs After B.Sc" },
    { to: "/jobs-after-bba", label: "Jobs After BBA" },
    { to: "/jobs-after-bca", label: "Jobs After BCA" },
    { to: "/jobs-after-ma", label: "Jobs After MA" },
    { to: "/jobs-after-mcom", label: "Jobs After M.Com" },
    { to: "/jobs-after-msc", label: "Jobs After M.Sc" },
  ];

  const careerResourceLinks = [
    { to: "/career-paths", label: "All 8 Career Paths" },
    { to: "/career-assessment", label: "Free Career Assessment" },
    { to: "/placement-support", label: "Placement & Refund Policy" },
    { to: "/student-success-stories", label: "Student Career Stories" },
    { to: "/career-guidance", label: "Resume & Interview Guide" },
    { to: "/blog", label: "Blog & Career Articles" },
    { to: "/employer", label: "For Employers" },
    { to: "/about", label: "About UdaYantu" },
  ];

  const legalLinks = [
    { to: "/refund", label: "Refund Policy" },
    { to: "/terms", label: "Terms of Service" },
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/support", label: "Student Support" },
    { to: "/contact", label: "Contact Us" },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Newsletter Section */}
      <div className="relative bg-gradient-to-b from-background via-muted/50 to-[hsl(214,49%,22%)]">
        <div className="container px-4 mx-auto max-w-7xl py-12 lg:py-16">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-gradient-to-br from-[hsl(214,49%,26%)] to-[hsl(214,49%,18%)] rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl overflow-hidden">
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-secondary/15 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />

              <div className="relative text-center mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-medium mb-3 border border-secondary/25">
                  <Mail className="w-3.5 h-3.5" />
                  Career Insights Newsletter
                </span>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-white">
                  Practical career guides for Indian graduates
                </h3>
                <p className="text-white/70 text-sm max-w-md mx-auto">
                  Receive degree-wise roadmaps, fresher resume checklists, and interview preparation tips directly in your inbox.
                </p>
              </div>
              <form
                onSubmit={handleNewsletterSubmit}
                className="relative flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/15 text-white placeholder:text-white/40 focus-visible:ring-secondary/40 focus-visible:border-secondary/40 h-11 rounded-lg flex-1"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold h-11 px-5 rounded-lg shadow-md transition-all duration-200 group"
                >
                  {isSubmitting ? "..." : "Subscribe"}
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </form>
              <p className="relative text-xs text-white/45 text-center mt-3">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative bg-[hsl(214,49%,18%)]">
        <div className="relative container px-4 mx-auto max-w-7xl py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-4">
              <Link to="/" className="inline-block mb-6 group">
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover:text-secondary transition-colors duration-300">
                    Uda
                    <span className="text-secondary group-hover:text-white transition-colors duration-300">
                      Yantu
                    </span>
                  </span>
                  <span className="text-xs text-white/50 tracking-widest uppercase mt-0.5">
                    {SITE_CONFIG.tagline}
                  </span>
                </div>
              </Link>
              <p className="text-white/75 mb-6 text-sm leading-relaxed">
                {SITE_CONFIG.positioning} Built for students and graduates across rural India and Tier 2, Tier 3, and Tier 4 towns.
              </p>

              {/* Verified Trust Indicators */}
              <div className="space-y-3 mb-8">
                {[
                  "8 Structured 90-Day Career Tracks",
                  "1:1 Personal Mentorship & Mock Interviews",
                  "Written Placement-Support & Refund Policy",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm group">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-white/80 group-hover:text-white transition-colors">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex gap-2">
                {[
                  {
                    href: "https://www.linkedin.com/company/udayantu",
                    icon: Linkedin,
                    label: "LinkedIn",
                    hoverBg: "hover:bg-[#0A66C2]",
                  },
                  {
                    href: "https://www.facebook.com/udayantu",
                    icon: Facebook,
                    label: "Facebook",
                    hoverBg: "hover:bg-[#1877F2]",
                  },
                  {
                    href: "https://www.instagram.com/udayantu",
                    icon: Instagram,
                    label: "Instagram",
                    hoverBg:
                      "hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737]",
                  },
                  {
                    href: "https://www.youtube.com/@udayantu",
                    icon: Youtube,
                    label: "YouTube",
                    hoverBg: "hover:bg-[#FF0000]",
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 bg-white/10 ${social.hoverBg} rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group border border-white/10 hover:border-transparent`}
                    aria-label={`Follow UdaYantu on ${social.label}`}
                  >
                    <social.icon className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Degree Career Guides Column */}
            <div className="lg:col-span-2">
              <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-5">
                Degree Guides
              </h4>
              <nav aria-label="Degree Career Guides" className="space-y-2.5">
                {degreeGuideLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm text-white/65 hover:text-secondary transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-secondary transition-colors" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Career Resources Column */}
            <div className="lg:col-span-2">
              <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-5">
                Career Resources
              </h4>
              <nav aria-label="Career Resources" className="space-y-2.5">
                {careerResourceLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm text-white/65 hover:text-secondary transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-secondary transition-colors" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Support & Contact */}
            <div className="lg:col-span-4">
              <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-5">
                Get in Touch
              </h4>

              <div className="space-y-4 mb-6">
                <a
                  href={`mailto:${SITE_CONFIG.supportEmail}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-secondary/40 hover:bg-white/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0 border border-secondary/30">
                    <Mail className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <span className="text-xs text-white/50 block">Email us at</span>
                    <span className="text-sm text-white/90 group-hover:text-secondary transition-colors">
                      {SITE_CONFIG.supportEmail}
                    </span>
                  </div>
                </a>

                <a
                  href={SITE_CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                    <Phone className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs text-white/50 block">Chat with us on</span>
                    <span className="text-sm text-white/90 group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                      WhatsApp Support
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center flex-shrink-0 border border-sky-500/30">
                    <MapPin className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <span className="text-xs text-white/50 block">Service Area</span>
                    <span className="text-sm text-white/90">
                      Pan-India (Rural & Tier 2–4 Towns)
                    </span>
                  </div>
                </div>
              </div>

              {/* Legal Links */}
              <Separator className="bg-white/10 my-5" />
              <nav aria-label="Legal & Policies" className="flex flex-wrap gap-x-4 gap-y-2">
                {legalLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-xs text-white/55 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Verified Platform Pillars */}
          <div className="border-t border-b border-white/10 py-8 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {VERIFIED_PLATFORM_PILLARS.map((pillar, index) => {
                const Icon = PILLAR_ICONS[index % PILLAR_ICONS.length];
                const colorClass = PILLAR_COLORS[index % PILLAR_COLORS.length];
                return (
                  <div key={pillar.label} className="text-center">
                    <div className="flex justify-center mb-2">
                      <div className="w-11 h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${colorClass}`} />
                      </div>
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-white">
                      {pillar.metric}
                    </div>
                    <div className="text-xs text-white/60">{pillar.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
              <p className="text-white/60 text-xs md:text-sm">
                © {currentYear} {SITE_CONFIG.brandName}. All rights reserved.
              </p>
              <span className="hidden sm:inline text-white/30">•</span>
              <p className="text-white/60 text-xs md:text-sm flex items-center gap-1">
                Built with <Heart className="w-3 h-3 text-red-500 inline" /> for Indian
                graduates
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white/75">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Secure Student Data</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Written Refund Terms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";