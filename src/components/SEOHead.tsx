import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { SITE_CONFIG } from "@/data/businessTruth";
import { getCanonicalUrl, type StructuredData } from "@/utils/seo";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  canonicalPath?: string;
  ogType?: "website" | "article";
  ogImage?: string | null;
  noIndex?: boolean;
  structuredData?: StructuredData | StructuredData[] | Record<string, unknown>;
}

export const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  canonicalPath,
  ogType = "website",
  ogImage,
  noIndex = false,
  structuredData,
}: SEOHeadProps) => {
  const resolvedCanonical = canonicalPath
    ? getCanonicalUrl(canonicalPath)
    : canonicalUrl
      ? canonicalUrl.startsWith("http")
        ? canonicalUrl.replace(/^https?:\/\/(www\.)?[^/]+/, SITE_CONFIG.canonicalOrigin)
        : getCanonicalUrl(canonicalUrl)
      : typeof window !== "undefined"
        ? getCanonicalUrl(window.location.pathname)
        : `${SITE_CONFIG.canonicalOrigin}/`;

  const imageUrl = ogImage || SITE_CONFIG.defaultOgImage;
  const schemas = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];

  const robotsContent = noIndex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Ensure zero duplicate canonical, description, or robots tags in <head>
    const canonicals = Array.from(document.querySelectorAll('link[rel="canonical"]'));
    if (noIndex) {
      canonicals.forEach((el) => el.remove());
    } else if (canonicals.length > 1) {
      canonicals.slice(0, -1).forEach((el) => el.remove());
      const active = canonicals[canonicals.length - 1];
      active.setAttribute("href", resolvedCanonical);
    } else if (canonicals.length === 1) {
      canonicals[0].setAttribute("href", resolvedCanonical);
    }

    const descriptions = Array.from(document.querySelectorAll('meta[name="description"]'));
    if (descriptions.length > 1) {
      descriptions.slice(0, -1).forEach((el) => el.remove());
    }
    const activeDesc = document.querySelector('meta[name="description"]');
    if (activeDesc) activeDesc.setAttribute("content", description);

    const robotsTags = Array.from(document.querySelectorAll('meta[name="robots"]'));
    if (robotsTags.length > 1) {
      robotsTags.slice(0, -1).forEach((el) => el.remove());
    }
    const activeRobots = document.querySelector('meta[name="robots"]');
    if (activeRobots) activeRobots.setAttribute("content", robotsContent);
  }, [description, noIndex, resolvedCanonical, robotsContent]);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robotsContent} />

      {/* Canonical URL */}
      {!noIndex && <link rel="canonical" href={resolvedCanonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={SITE_CONFIG.brandName} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={resolvedCanonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />

      {/* Structured Data (JSON-LD) */}
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
