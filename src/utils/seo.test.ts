import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  getCanonicalUrl,
  createArticleSchema,
  createBreadcrumbSchema,
  createCourseSchema,
  createFAQSchema,
  organizationSchema,
} from "./seo";
import {
  ALL_PUBLIC_SEO_ROUTES,
  PRIVATE_NOINDEX_PATHS,
  generateSitemapXml,
} from "../data/seoRoutes";
import { DEGREE_GUIDES } from "../data/degreeGuides";
import { CAREER_PROGRAMS } from "../data/careerPrograms";
import { sanitizeAnalyticsParams } from "../lib/seoAnalytics";

describe("SEO Architecture, Metadata, Sitemap & Privacy Guardrails", () => {
  it("normalizes canonical URLs to https://udayantu.com without trailing slashes or query params", () => {
    assert.equal(getCanonicalUrl("/"), "https://udayantu.com/");
    assert.equal(getCanonicalUrl("/jobs-after-ba/"), "https://udayantu.com/jobs-after-ba");
    assert.equal(
      getCanonicalUrl("/career-assessment?degree=bcom#top"),
      "https://udayantu.com/career-assessment"
    );
    assert.equal(
      getCanonicalUrl("career-paths/business-development"),
      "https://udayantu.com/career-paths/business-development"
    );
  });

  it("ensures every public SEO route has unique path, title, meta description, and H1", () => {
    const paths = new Set<string>();
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    const h1s = new Set<string>();

    assert.equal(DEGREE_GUIDES.length, 8, "Expected 8 degree guides (5 UG + 3 PG)");
    assert.equal(CAREER_PROGRAMS.length, 8, "Expected 8 verified career tracks");

    for (const route of ALL_PUBLIC_SEO_ROUTES) {
      assert.ok(!paths.has(route.path), `Duplicate path: ${route.path}`);
      assert.ok(!titles.has(route.seoTitle), `Duplicate SEO title: ${route.seoTitle}`);
      assert.ok(
        !descriptions.has(route.metaDescription),
        `Duplicate meta description on ${route.path}`
      );
      assert.ok(!h1s.has(route.h1), `Duplicate H1 on ${route.path}`);
      assert.ok(route.seoTitle.length >= 20, `SEO title too short on ${route.path}`);
      assert.ok(
        route.metaDescription.length >= 60,
        `Meta description too short on ${route.path}`
      );

      paths.add(route.path);
      titles.add(route.seoTitle);
      descriptions.add(route.metaDescription);
      h1s.add(route.h1);
    }
  });

  it("public/sitemap.xml matches generateSitemapXml() and excludes all private/404 paths", () => {
    const sitemapPath = path.resolve(process.cwd(), "public/sitemap.xml");
    const fileContent = fs.readFileSync(sitemapPath, "utf8");
    const generated = generateSitemapXml();

    assert.equal(fileContent.trim(), generated.trim());
    assert.ok(!fileContent.includes("<mobile:mobile/>"), "Deprecated mobile tag must be removed");
    assert.ok(!fileContent.includes("/programs</loc>"), "Legacy 404 /programs must not be in sitemap");
    assert.ok(
      !fileContent.includes("/blog/career-development"),
      "Non-existent placeholder blog slug must not be in sitemap"
    );

    for (const privatePath of PRIVATE_NOINDEX_PATHS) {
      assert.ok(
        !fileContent.includes(`<loc>https://udayantu.com${privatePath}</loc>`),
        `Private route ${privatePath} must never appear in sitemap.xml`
      );
    }
  });

  it("public/robots.txt blocks private paths and declares canonical Sitemap", () => {
    const robotsPath = path.resolve(process.cwd(), "public/robots.txt");
    const robotsContent = fs.readFileSync(robotsPath, "utf8");

    assert.ok(robotsContent.includes("Sitemap: https://udayantu.com/sitemap.xml"));
    for (const blocked of ["/admin", "/dashboard", "/auth", "/payment", "/employer-dashboard"]) {
      assert.ok(
        robotsContent.includes(`Disallow: ${blocked}`),
        `robots.txt should disallow ${blocked}`
      );
    }
  });

  it("generates valid JSON-LD schemas without JobPosting misuse or placeholder phone numbers", () => {
    assert.equal(organizationSchema["@type"], "Organization");
    assert.ok(!JSON.stringify(organizationSchema).includes("+91-8800-8800-88"));

    const courseSchema = createCourseSchema({
      name: "UdaYantu Business Development",
      description: "15-week track",
      path: "/career-paths/business-development",
      durationWeeks: 15,
      skills: ["Consultative Selling"],
    });
    assert.equal(courseSchema["@type"], "Course");
    assert.notEqual(courseSchema["@type"], "JobPosting");

    const articleSchema = createArticleSchema({
      headline: "Jobs After BA",
      description: "Complete guide",
      path: "/jobs-after-ba",
      datePublished: "2026-11-21",
      dateModified: "2026-11-21",
    });
    assert.equal(articleSchema["@type"], "Article");
    assert.ok(articleSchema.author);
    assert.ok(articleSchema.reviewedBy);

    const faqSchema = createFAQSchema([{ question: "Q1?", answer: "A1." }]);
    assert.equal(faqSchema["@type"], "FAQPage");

    const crumbSchema = createBreadcrumbSchema([{ name: "Home", path: "/" }]);
    assert.equal(crumbSchema["@type"], "BreadcrumbList");
  });

  it("strips forbidden PII keys in privacy-safe SEO conversion analytics", () => {
    const sanitized = sanitizeAnalyticsParams({
      degree: "ba",
      source_page: "/jobs-after-ba",
      email: "student@example.com",
      phone: "9876543210",
      password: "secret",
      otp: "123456",
      fullName: "Ravi Kumar",
    });

    assert.deepEqual(sanitized, {
      degree: "ba",
      source_page: "/jobs-after-ba",
    });
  });
});
