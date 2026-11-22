/**
 * Single Verified Source of Truth for UdaYantu Business Facts,
 * Policies, Editorial Standards, and Program Guardrails.
 *
 * All public pages must reference this module instead of hardcoding
 * unverified statistics, conflicting durations, or contradictory refund windows.
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
    "Your degree is your foundation. Practical skills, career guidance and mentorship help you turn it into an employment opportunity.",
} as const;

export const VERIFIED_PROGRAM_FACTS = {
  totalCareerTracks: 8,
  standardDurationWeeks: 15,
  standardDurationLabel: "15 Weeks",
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
   * Reconciled policy terms matching the written Refund Policy (/refund)
   * and Terms of Service (/terms).
   */
  placementWindowDays: 90,
  placementWindowLabel: "90 days after program completion",
  minimumAttendancePercent: 90,
  refundPolicySummary:
    "Eligible students who complete all 15-week coursework, maintain at least 90% attendance, clear assessments, and actively participate in placement activities qualify for a written placement-support refund review if unplaced within 90 days of program completion. Early withdrawal tiers (7/14/30 days) and non-refundable processing items are disclosed in full on the Refund Policy page.",
  feeModelSummary:
    "Students pay an upfront cohort admission/registration fee as specified at enrollment, with pay-after-placement deferred training fee options available for eligible tracks. Exact fee schedules and refund eligibility conditions are shared in writing before payment.",
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
  lastReviewedDate: "2026-11-21",
  publishedDate: "2026-11-21",
  reviewCadence: "Quarterly",
  editorialPolicySummary:
    "UdaYantu publishes career guidance for educational clarity. Role descriptions reflect typical Indian entry-level corporate hiring practices; we do not list unverified vacancies, guarantee outcomes without written eligibility compliance, or claim certifications outside our actual curriculum.",
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

/**
 * Verified platform pillars replacing previously contradictory unverified numbers
 * (e.g., conflicting 98% vs 81%, 5,000+ vs 500+ vs 100+, 120 vs 180 vs 90 days).
 */
export const VERIFIED_PLATFORM_PILLARS = [
  {
    metric: "8 Tracks",
    label: "Role-Specific Career Programs",
    detail: "Structured 15-week corporate readiness curricula",
  },
  {
    metric: "15 Weeks",
    label: "Guided Practical Training",
    detail: "Weekly live projects, role-plays & mentor reviews",
  },
  {
    metric: "1:1",
    label: "Personal Mentorship",
    detail: "Resume audits, mock interviews & communication coaching",
  },
  {
    metric: "Written",
    label: "Transparent Refund Policy",
    detail: "Clear eligibility rules published before enrollment",
  },
] as const;
