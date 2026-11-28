/**
 * Single Verified Source of Truth for UdaYantu Business Facts,
 * Policies, Editorial Standards, and Program Guardrails.
 *
 * Aligned with the revised 90-day cohort, Plan A / Plan B admission lifecycle,
 * 75% final assessment qualification rule, 120-calendar-day Plan A refund clock,
 * and transparent non-guarantee positioning.
 */

export const SITE_CONFIG = {
  brandName: "UdaYantu",
  tagline: "Rise Up Together",
  canonicalOrigin: "https://udayantu.com",
  defaultOgImage: "https://udayantu.com/favicon.png",
  supportEmail: "support@udayantu.com",
  whatsappUrl: "https://wa.me/message/3ZRKURYKBYOPE1",
  twitterHandle: "@UdaYantu",
  serviceArea: "Pan-India (Online & Regional Support for Rural, Tier 2, Tier 3 & Tier 4 Graduates)",
  positioning:
    "Discover the career direction that matches your strengths. Build the skills employers need and prepare for opportunities aligned with your interests.",
} as const;

export const VERIFIED_PROGRAM_FACTS = {
  totalCareerTracks: 8,
  standardDurationDays: 90,
  standardDurationWeeks: 13,
  standardDurationLabel: "90 Days",
  passingThresholdPercent: 75,
  eligibleDegrees: [
    "BA",
    "B.Com",
    "B.Sc",
    "BBA",
    "BCA",
    "MA",
    "M.Com",
    "M.Sc",
  ] as const,
  /**
   * Authoritative commercial lifecycle rules (exact plan prices are always
   * fetched live from /v1/public/commercial-plans).
   */
  placementWindowDays: 120,
  placementWindowLabel: "120 calendar days after passing the final assessment (≥75%)",
  minimumAttendancePercent: 90,
  refundPolicySummary:
    "Plan A (Refundable Admission) students who complete their 90-day cohort, pass the final assessment with at least 75%, and receive no qualifying written job selection within 120 calendar days of their verified pass date are eligible to request an admission fee refund. Plan B (Non-Refundable Admission) is strictly non-refundable regardless of selection outcome. Admission fees are never adjusted against tuition fees.",
  feeModelSummary:
    "UdaYantu offers two transparent admission plans (Plan A Refundable and Plan B Non-Refundable, both GST inclusive) covering 90-day cohort training and mentorship. Post-selection tuition applies strictly upon formal student acceptance of a written employer offer (Plan A: 33% of agreed CTC GST inclusive; Plan B: 35% of agreed CTC GST inclusive), and the admission fee is never adjusted against tuition.",
  curriculumBoundaries: {
    teachesCodingOrSoftwareDev: false,
    teachesTallyGstOrAccounting: false,
    teachesMedicalOrLabCertifications: false,
    issuesGovernmentDegree: false,
  },
} as const;

export interface EditorialProfile {
  id: string;
  name: string;
  role: string;
  credentials: string;
  bio: string;
  profileUrl: string;
}

export const EDITORIAL_TEAM: Record<"author" | "reviewer", EditorialProfile> = {
  author: {
    id: "udayantu-career-editorial",
    name: "UdaYantu Career Research Team",
    role: "Graduate Employability & Curriculum Specialists",
    credentials:
      "Specialists in non-technical fresher hiring, Tier 2–4 campus-to-corporate readiness, and entry-level corporate role mapping across India.",
    bio: "The UdaYantu Career Research Team analyses fresher hiring expectations across Indian startups, BPO/KPO, SaaS, retail, and enterprise operations to create practical, jargon-free career guides for rural and small-town graduates.",
    profileUrl: `${SITE_CONFIG.canonicalOrigin}/about`,
  },
  reviewer: {
    id: "udayantu-placement-cell",
    name: "UdaYantu Academic & Placement Review Board",
    role: "Curriculum Accuracy & Placement Policy Reviewers",
    credentials:
      "Reviews every degree guide and programme page to ensure role requirements, tool expectations, qualification boundaries, and refund policies reflect actual hiring reality.",
    bio: "Reviews all published guidance quarterly against employer interview rubrics and current curriculum modules so students receive realistic, transparent advice.",
    profileUrl: `${SITE_CONFIG.canonicalOrigin}/placement-support`,
  },
};

export const EDITORIAL_METADATA = {
  lastReviewedDate: "2026-11-27",
  publishedDate: "2026-11-21",
  reviewCadence: "Quarterly",
  editorialPolicySummary:
    "UdaYantu publishes career guidance for educational clarity. Enrollment does not guarantee a job; career readiness depends on structured training, passing the 75% final assessment, and employer selection.",
} as const;

export const TRUSTWORTHY_EXTERNAL_REFERENCES = [
  {
    title: "National Career Service (NCS) — Ministry of Labour & Employment, Govt. of India",
    url: "https://www.ncs.gov.in/",
    description: "Official Government of India career portal for verified job search, career counselling, and employability resources.",
  },
  {
    title: "Skill India Digital Hub (NSDC) — Ministry of Skill Development & Entrepreneurship",
    url: "https://www.skillindiadigital.gov.in/",
    description: "National platform for recognised skill frameworks, occupational standards, and vocational courses.",
  },
  {
    title: "University Grants Commission (UGC) — Higher Education Guidelines",
    url: "https://www.ugc.gov.in/",
    description: "Official information on recognised Indian undergraduate and postgraduate degree frameworks.",
  },
  {
    title: "Ministry of Corporate Affairs / NASSCOM FutureSkills Insights",
    url: "https://futureskillsprime.in/",
    description: "Industry-backed digital fluency and workplace readiness reference for Indian graduates.",
  },
] as const;

export const VERIFIED_PLATFORM_PILLARS = [
  {
    metric: "8 Tracks",
    label: "Canonical Career Paths",
    detail: "Matched via free 11-dimension psychometric career discovery",
  },
  {
    metric: "90 Days",
    label: "Structured Training Cohort",
    detail: "Live Zoom/Meet classes, video modules, PDFs & assignments",
  },
  {
    metric: "≥75%",
    label: "Verified Readiness Benchmark",
    detail: "Objective final exam unlocking employer discovery with consent",
  },
  {
    metric: "120 Days",
    label: "Plan A Refund Protection",
    detail: "Post-qualification window tracked transparently in your dashboard",
  },
] as const;
