import { SITE_CONFIG, EDITORIAL_METADATA } from "./businessTruth";
import { DEGREE_GUIDES } from "./degreeGuides";
import { CAREER_PROGRAMS } from "./careerPrograms";
import { getCanonicalUrl } from "@/utils/seo";

export interface SeoRouteEntry {
  path: string;
  purpose: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  seoTitle: string;
  metaDescription: string;
  h1: string;
  changefreq: "weekly" | "monthly" | "yearly";
  priority: string;
  indexable: boolean;
}

export const STATIC_PUBLIC_SEO_ROUTES: SeoRouteEntry[] = [
  {
    path: "/",
    purpose: "Homepage — graduate career guidance, degree routing, and job-readiness overview",
    primaryKeyword: "career training for graduates in India",
    secondaryKeywords: [
      "job oriented courses after graduation",
      "career guidance after graduation India",
      "skills required for private jobs after graduation",
    ],
    seoTitle: "Career Training for Graduates in India | UdaYantu",
    metaDescription:
      "Explore career guidance, aptitude assessments, practical skills training and personalised mentorship for BA, B.Com, B.Sc, BBA and other graduates.",
    h1: "Turn Your Graduation Degree into a Career with Practical Skills and Personal Mentorship.",
    changefreq: "weekly",
    priority: "1.0",
    indexable: true,
  },
  {
    path: "/careers-after-graduation",
    purpose: "Graduate Career Hub — degree selection and graduation-to-career roadmap",
    primaryKeyword: "graduation ke baad job kaise milegi",
    secondaryKeywords: [
      "graduation ke baad kya kare",
      "graduate fresher jobs in India",
      "non technical jobs for graduates",
      "private jobs after graduation",
    ],
    seoTitle: "Graduation Ke Baad Job Kaise Milegi? Career Hub | UdaYantu",
    metaDescription:
      "Graduation ke baad kya kare? Compare practical private career options after BA, B.Com, B.Sc, BBA, BCA, MA, M.Com & M.Sc with skills roadmaps and career assessments.",
    h1: "Graduation Ke Baad Job Kaise Milegi? Complete Degree-Wise Career Hub",
    changefreq: "weekly",
    priority: "0.95",
    indexable: true,
  },
  {
    path: "/career-paths",
    purpose: "Career Paths Hub — overview of UdaYantu's 8 verified 15-week career tracks",
    primaryKeyword: "job oriented courses after graduation India",
    secondaryKeywords: [
      "non technical career paths for freshers",
      "15 week career readiness programmes India",
    ],
    seoTitle: "8 Practical Career Paths for Freshers in India | UdaYantu",
    metaDescription:
      "Compare UdaYantu's 8 structured 15-week career programmes: Business Development, Customer Success, Operations, HR, Marketing, Project Coordination, Product & Support.",
    h1: "8 Practical Career Paths Designed for Indian Graduates",
    changefreq: "weekly",
    priority: "0.9",
    indexable: true,
  },
  {
    path: "/career-assessment",
    purpose: "Interactive Degree + Aptitude + Psychometric Career Recommendation Tool",
    primaryKeyword: "career assessment test after graduation India",
    secondaryKeywords: [
      "career discovery test for BA BCom BSc freshers",
      "which job is best after graduation",
    ],
    seoTitle: "Free Career Assessment for Indian Graduates | UdaYantu",
    metaDescription:
      "Take UdaYantu's degree-aware career and aptitude assessment to discover your top 3 realistic corporate career tracks based on skills, communication, and interests.",
    h1: "Discover Your Best-Fit Career After Graduation",
    changefreq: "monthly",
    priority: "0.9",
    indexable: true,
  },
  {
    path: "/placement-support",
    purpose: "Transparent Placement Assistance, Eligibility Conditions & Written Refund Terms",
    primaryKeyword: "placement support and refund policy UdaYantu",
    secondaryKeywords: [
      "pay after placement eligibility rules India",
      "graduate interview preparation and employer connections",
    ],
    seoTitle: "Placement Support, Eligibility & Refund Policy | UdaYantu",
    metaDescription:
      "Understand how UdaYantu's resume prep, mock interviews, employer connections, eligibility rules, and transparent written refund policy actually work.",
    h1: "How UdaYantu's Placement Support & Transparent Refund Policy Work",
    changefreq: "monthly",
    priority: "0.85",
    indexable: true,
  },
  {
    path: "/student-success-stories",
    purpose: "Transparent Student Journeys, Outcome Reporting Standards & Career Transitions",
    primaryKeyword: "UdaYantu student career transitions and reviews",
    secondaryKeywords: [
      "rural graduate corporate career stories India",
      "tier 3 graduate placement preparation",
    ],
    seoTitle: "Student Career Stories & Outcome Standards | UdaYantu",
    metaDescription:
      "Explore how graduates from rural and Tier 2–4 towns transition from BA, B.Com, B.Sc, BBA and BCA degrees into corporate roles—with transparent outcome reporting standards.",
    h1: "From Small-Town Degrees to Corporate Readiness",
    changefreq: "monthly",
    priority: "0.8",
    indexable: true,
  },
  {
    path: "/career-guidance",
    purpose: "Fresher Resume, Interview Prep, Hinglish Communication & Regional UP/Bihar Guide",
    primaryKeyword: "skills required for private jobs after graduation",
    secondaryKeywords: [
      "without experience private jobs for graduates",
      "fresher resume and interview guide India",
      "UP Bihar graduates private job guide",
    ],
    seoTitle: "Fresher Career Guidance: Resume, Skills & Interviews | UdaYantu",
    metaDescription:
      "Practical fresher career guidance for Indian graduates: ATS resume structure, first-interview scripts, workplace English tips, and UP/Bihar regional hiring insights.",
    h1: "Practical Career Guidance for Fresh Graduates in India",
    changefreq: "monthly",
    priority: "0.85",
    indexable: true,
  },
  {
    path: "/about",
    purpose: "About UdaYantu — Mission, Editorial Policy & Leadership Standards",
    primaryKeyword: "about UdaYantu rural graduate employability",
    secondaryKeywords: ["UdaYantu mission India", "tier 3 tier 4 career training platform"],
    seoTitle: "About UdaYantu — Empowering Rural & Tier 2–4 Graduates",
    metaDescription:
      "Learn about UdaYantu's mission to help BA, B.Com, B.Sc, BBA, and BCA graduates across rural and small-town India build practical skills and launch corporate careers.",
    h1: "About UdaYantu",
    changefreq: "monthly",
    priority: "0.8",
    indexable: true,
  },
  {
    path: "/employers",
    purpose: "Employers Page — Hire Pre-Trained Rural & Tier 2–4 Talent",
    primaryKeyword: "hire trained freshers from Tier 2 Tier 3 India",
    secondaryKeywords: ["pre-trained graduate hiring India", "entry level business development hiring"],
    seoTitle: "Hire Pre-Trained Rural & Tier 2–4 Talent | UdaYantu Employers",
    metaDescription:
      "Partner with UdaYantu to hire role-ready fresh graduates trained in Business Development, Customer Success, Operations, Support, HR, and Marketing.",
    h1: "Access Pre-Trained Rural Talent at Scale",
    changefreq: "monthly",
    priority: "0.8",
    indexable: true,
  },
  {
    path: "/blog",
    purpose: "Career Blog — Articles on fresher skills, role playbooks, and interview preparation",
    primaryKeyword: "graduate career advice blog India",
    secondaryKeywords: ["fresher job tips India", "non technical career articles"],
    seoTitle: "Blog - Career Insights & Fresher Guides | UdaYantu",
    metaDescription:
      "Read practical career advice, role playbooks, and interview preparation guides written for Indian graduates from Tier 2, Tier 3, and Tier 4 towns.",
    h1: "Blog",
    changefreq: "weekly",
    priority: "0.8",
    indexable: true,
  },
  {
    path: "/contact",
    purpose: "Contact UdaYantu Student & Employer Support",
    primaryKeyword: "contact UdaYantu career counselling",
    secondaryKeywords: ["UdaYantu support email", "career enquiry UdaYantu"],
    seoTitle: "Contact Us — Student & Employer Support | UdaYantu",
    metaDescription:
      "Have questions about degree pathways, career assessments, fees, or employer hiring? Reach out to the UdaYantu support team.",
    h1: "Contact Us",
    changefreq: "monthly",
    priority: "0.7",
    indexable: true,
  },
  {
    path: "/support",
    purpose: "Help & Student Support Center",
    primaryKeyword: "UdaYantu student help support",
    secondaryKeywords: ["UdaYantu FAQ support"],
    seoTitle: "Student Support & Help Center | UdaYantu",
    metaDescription:
      "Get help with UdaYantu assessments, enrollment, refund questions, and mentorship support.",
    h1: "Support",
    changefreq: "monthly",
    priority: "0.6",
    indexable: true,
  },
  {
    path: "/terms",
    purpose: "Terms of Service",
    primaryKeyword: "UdaYantu terms of service",
    secondaryKeywords: ["UdaYantu enrollment terms"],
    seoTitle: "Terms of Service | UdaYantu",
    metaDescription: "Read UdaYantu's Terms of Service governing platform access, training programmes, and student responsibilities.",
    h1: "Terms of Service",
    changefreq: "yearly",
    priority: "0.4",
    indexable: true,
  },
  {
    path: "/privacy",
    purpose: "Privacy Policy",
    primaryKeyword: "UdaYantu privacy policy",
    secondaryKeywords: ["UdaYantu student data protection"],
    seoTitle: "Privacy Policy | UdaYantu",
    metaDescription: "Learn how UdaYantu collects, protects, and manages student and employer data responsibly.",
    h1: "Privacy Policy",
    changefreq: "yearly",
    priority: "0.4",
    indexable: true,
  },
  {
    path: "/refund",
    purpose: "Written Refund Policy & Placement Eligibility Terms",
    primaryKeyword: "UdaYantu refund policy eligibility",
    secondaryKeywords: ["UdaYantu placement refund terms"],
    seoTitle: "Refund Policy & Eligibility Terms | UdaYantu",
    metaDescription:
      "Read UdaYantu's transparent written Refund Policy including 90-day post-completion placement-support refund eligibility, attendance criteria, and early withdrawal tiers.",
    h1: "Refund Policy",
    changefreq: "yearly",
    priority: "0.5",
    indexable: true,
  },
];

export const ALL_PUBLIC_SEO_ROUTES: SeoRouteEntry[] = [
  ...STATIC_PUBLIC_SEO_ROUTES,
  ...DEGREE_GUIDES.map(
    (g): SeoRouteEntry => ({
      path: g.path,
      purpose: `${g.degreeLabel} Degree Landing Page — search-intent guide for ${g.degreeFullName} graduates`,
      primaryKeyword: g.primaryKeyword,
      secondaryKeywords: g.secondaryKeywords,
      seoTitle: g.seoTitle,
      metaDescription: g.metaDescription,
      h1: g.h1,
      changefreq: "weekly",
      priority: g.level === "Undergraduate" ? "0.95" : "0.85",
      indexable: true,
    })
  ),
  ...CAREER_PROGRAMS.map(
    (p): SeoRouteEntry => ({
      path: p.path,
      purpose: `${p.name} Career Track Page — 15-week curriculum and fresher career overview`,
      primaryKeyword: p.primaryKeyword,
      secondaryKeywords: p.secondaryKeywords,
      seoTitle: p.seoTitle,
      metaDescription: p.metaDescription,
      h1: p.h1,
      changefreq: "monthly",
      priority: "0.85",
      indexable: true,
    })
  ),
];

export const PRIVATE_NOINDEX_PATHS = [
  "/admin",
  "/admin/compliance",
  "/dashboard",
  "/profile",
  "/settings",
  "/payment",
  "/auth",
  "/employer-login",
  "/employer-dashboard",
  "/employer/candidates",
  "/employer/offers",
  "/employer/analytics",
  "/employer/outcomes",
  "/employer/talent-pool",
  "/analytics",
  "/jobs",
  "/team",
  "/team-invite",
] as const;

/**
 * Generates a clean XML sitemap string containing ONLY canonical, indexable public URLs.
 */
export function generateSitemapXml(lastmod = EDITORIAL_METADATA.lastReviewedDate): string {
  const urls = ALL_PUBLIC_SEO_ROUTES.filter((r) => r.indexable)
    .map(
      (route) => `  <url>
    <loc>${getCanonicalUrl(route.path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export const CANONICAL_ORIGIN = SITE_CONFIG.canonicalOrigin;
