/**
 * SEO Utilities for Canonical URLs and Schema.org JSON-LD Structured Data.
 *
 * Rules enforced:
 * - Always normalize canonical URLs to https://udayantu.com
 * - Never apply JobPosting markup to course, guidance, or guarantee pages
 * - Never invent review ratings, unverified placement rates, or fake prices
 */

import { SITE_CONFIG, EDITORIAL_TEAM } from "@/data/businessTruth";

export interface StructuredData {
  "@context": string;
  "@type": string;
  [key: string]: unknown;
}

/**
 * Normalize a route path into a clean canonical URL on https://udayantu.com.
 * Removes trailing slashes (except root "/") and query strings/hashes.
 */
export function getCanonicalUrl(path: string): string {
  const origin = SITE_CONFIG.canonicalOrigin.replace(/\/$/, "");
  if (!path || path === "/") return `${origin}/`;
  const cleanPath = path.split("?")[0].split("#")[0].replace(/\/+$/, "");
  return `${origin}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}

/**
 * Organization Schema (Verified facts only — no placeholder phone numbers)
 */
export const organizationSchema: StructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_CONFIG.brandName,
  url: `${SITE_CONFIG.canonicalOrigin}/`,
  logo: SITE_CONFIG.defaultOgImage,
  description:
    "Career guidance, aptitude assessment, role-specific training, and mentorship platform for Indian graduates from rural, Tier 2, Tier 3, and Tier 4 towns.",
  sameAs: [
    "https://www.facebook.com/udayantu",
    "https://twitter.com/udayantu",
    "https://www.linkedin.com/company/udayantu",
    "https://www.instagram.com/udayantu",
    "https://www.youtube.com/@udayantu",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Student Support",
    email: SITE_CONFIG.supportEmail,
    availableLanguage: ["English", "Hindi"],
  },
  areaServed: {
    "@type": "Country",
    name: "India",
  },
};

/**
 * WebSite Schema
 */
export const webSiteSchema: StructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_CONFIG.brandName,
  url: `${SITE_CONFIG.canonicalOrigin}/`,
  inLanguage: "en-IN",
  description:
    "Degree-specific career guides, aptitude assessments, and practical job-readiness programmes for Indian graduates.",
};

/**
 * BreadcrumbList Schema
 */
export function createBreadcrumbSchema(
  items: Array<{ name: string; path: string }>
): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.path),
    })),
  };
}

/**
 * FAQPage Schema
 */
export function createFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Article Schema for Degree Guides & Career Guidance Resources (with Author & Reviewer)
 */
export function createArticleSchema(article: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
  image?: string;
  inLanguage?: string;
  about?: string[];
}): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": getCanonicalUrl(article.path),
    },
    image: article.image || SITE_CONFIG.defaultOgImage,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    inLanguage: article.inLanguage || "en-IN",
    author: {
      "@type": "Person",
      name: EDITORIAL_TEAM.author.name,
      jobTitle: EDITORIAL_TEAM.author.role,
      url: EDITORIAL_TEAM.author.profileUrl,
    },
    reviewedBy: {
      "@type": "Person",
      name: EDITORIAL_TEAM.reviewer.name,
      jobTitle: EDITORIAL_TEAM.reviewer.role,
      url: EDITORIAL_TEAM.reviewer.profileUrl,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.brandName,
      logo: {
        "@type": "ImageObject",
        url: SITE_CONFIG.defaultOgImage,
      },
    },
    ...(article.about && article.about.length > 0 ? { about: article.about } : {}),
  };
}

/**
 * Course Schema for verified UdaYantu 15-week career tracks
 * (Does not fabricate ratings, unverified placement rates, or JobPosting markup.)
 */
export function createCourseSchema(course: {
  name: string;
  description: string;
  path: string;
  durationWeeks: number;
  skills: string[];
}): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    description: course.description,
    url: getCanonicalUrl(course.path),
    provider: {
      "@type": "Organization",
      name: SITE_CONFIG.brandName,
      sameAs: `${SITE_CONFIG.canonicalOrigin}/`,
    },
    educationalLevel: "Undergraduate & Postgraduate Freshers",
    timeRequired: `P${course.durationWeeks}W`,
    teaches: course.skills,
    inLanguage: ["en-IN", "hi-IN"],
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `P${course.durationWeeks}W`,
    },
  };
}

/**
 * Blog Post Schema (preserved for existing BlogPost.tsx)
 */
export function createBlogPostSchema(post: {
  title: string;
  description: string;
  image?: string;
  publishDate: string;
  author?: string;
  content?: string;
}): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.image || SITE_CONFIG.defaultOgImage,
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    author: {
      "@type": "Person",
      name: post.author || EDITORIAL_TEAM.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.brandName,
      logo: {
        "@type": "ImageObject",
        url: SITE_CONFIG.defaultOgImage,
      },
    },
    ...(post.content ? { articleBody: post.content } : {}),
  };
}

/**
 * Non-destructive structured data injection (only appends org schema with dedicated ID
 * so it never overwrites route-specific Helmet JSON-LD blocks).
 */
export function injectStructuredData(schema: StructuredData, id = "udayantu-global-org-schema") {
  if (typeof document === "undefined") return;
  const existing = document.getElementById(id);
  if (existing) {
    existing.textContent = JSON.stringify(schema);
    return;
  }
  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
