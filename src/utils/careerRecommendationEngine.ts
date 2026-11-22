import { CAREER_PROGRAMS, type CareerProgram, type CareerTrackId, type DegreeSlug } from "@/data/careerPrograms";

export interface StudentAssessmentProfile {
  degree: DegreeSlug | "other";
  specialization?: string;
  communicationComfort: number; // 1-5
  analyticalComfort: number; // 1-5
  structuredWorkPreference: number; // 1-5
  peopleEmpathy: number; // 1-5
  persuasionInterest: number; // 1-5
  creativeInterest: number; // 1-5
  technicalComfort: number; // 1-5
  preferredWorkStyle?: "client-facing" | "process-data" | "support-problem-solving" | "creative-growth";
  psychometricAnswers?: Record<number, number>;
}

export interface CareerRecommendation {
  program: CareerProgram;
  matchScore: number; // 55-96 realistic fit indicator
  fitSummary: string;
  whyItFitsDegree: string;
  keySkillsToBuild: string[];
  trainingNote: string;
}

/**
 * Initial degree-to-track affinity priors (Part 7 hypothesis — weighted alongside
 * specialization, aptitude, psychometric traits, communication, and interests).
 */
const DEGREE_PRIORS: Record<DegreeSlug | "other", Partial<Record<CareerTrackId, number>>> = {
  ba: {
    "business-development": 10,
    "customer-support": 10,
    "customer-success": 9,
    "human-resources": 9,
    "marketing-management": 9,
    "operations-management": 8,
    "project-management": 6,
    "product-management": 5,
  },
  bcom: {
    "operations-management": 11,
    "business-development": 10,
    "customer-success": 9,
    "human-resources": 8,
    "project-management": 8,
    "customer-support": 8,
    "marketing-management": 7,
    "product-management": 6,
  },
  bsc: {
    "operations-management": 11,
    "customer-support": 10,
    "business-development": 8,
    "project-management": 8,
    "product-management": 8,
    "customer-success": 8,
    "marketing-management": 6,
    "human-resources": 6,
  },
  bba: {
    "business-development": 11,
    "marketing-management": 10,
    "human-resources": 10,
    "customer-success": 9,
    "operations-management": 9,
    "project-management": 9,
    "product-management": 7,
    "customer-support": 7,
  },
  bca: {
    "customer-support": 11,
    "product-management": 10,
    "operations-management": 10,
    "customer-success": 9,
    "project-management": 9,
    "business-development": 6,
    "marketing-management": 6,
    "human-resources": 5,
  },
  ma: {
    "human-resources": 10,
    "marketing-management": 10,
    "customer-success": 9,
    "business-development": 9,
    "customer-support": 9,
    "operations-management": 7,
    "project-management": 7,
    "product-management": 5,
  },
  mcom: {
    "operations-management": 11,
    "project-management": 9,
    "business-development": 9,
    "customer-success": 9,
    "human-resources": 8,
    "customer-support": 7,
    "marketing-management": 7,
    "product-management": 6,
  },
  msc: {
    "operations-management": 11,
    "product-management": 9,
    "project-management": 9,
    "customer-support": 9,
    "customer-success": 8,
    "business-development": 7,
    "marketing-management": 5,
    "human-resources": 5,
  },
  other: {
    "business-development": 8,
    "customer-support": 8,
    "customer-success": 8,
    "operations-management": 8,
    "human-resources": 7,
    "marketing-management": 7,
    "project-management": 7,
    "product-management": 6,
  },
};

function getSpecializationBoost(
  specialization: string | undefined,
  trackId: CareerTrackId
): number {
  if (!specialization) return 0;
  const spec = specialization.toLowerCase();

  if (spec.includes("english") || spec.includes("journalism") || spec.includes("mass")) {
    if (trackId === "marketing-management" || trackId === "customer-success") return 6;
    if (trackId === "human-resources" || trackId === "customer-support") return 4;
  }
  if (spec.includes("psychology") || spec.includes("sociology")) {
    if (trackId === "human-resources" || trackId === "customer-success") return 7;
    if (trackId === "marketing-management") return 4;
  }
  if (spec.includes("economics") || spec.includes("commerce") || spec.includes("finance") || spec.includes("account")) {
    if (trackId === "operations-management" || trackId === "business-development") return 6;
    if (trackId === "project-management") return 4;
  }
  if (spec.includes("math") || spec.includes("stat") || spec.includes("physics")) {
    if (trackId === "operations-management" || trackId === "product-management") return 7;
    if (trackId === "project-management") return 4;
  }
  if (spec.includes("computer") || spec.includes("it") || spec.includes("bca") || spec.includes("software")) {
    if (trackId === "customer-support" || trackId === "product-management") return 7;
    if (trackId === "operations-management" || trackId === "project-management") return 5;
  }
  if (spec.includes("chemistry") || spec.includes("biology") || spec.includes("life") || spec.includes("botany") || spec.includes("zoology")) {
    if (trackId === "operations-management" || trackId === "customer-support") return 5;
    if (trackId === "customer-success") return 4;
  }
  if (spec.includes("history") || spec.includes("political") || spec.includes("public")) {
    if (trackId === "business-development" || trackId === "customer-support" || trackId === "operations-management") return 4;
  }

  return 0;
}

function getWorkStyleBoost(
  workStyle: StudentAssessmentProfile["preferredWorkStyle"],
  trackId: CareerTrackId
): number {
  if (!workStyle) return 0;
  switch (workStyle) {
    case "client-facing":
      return trackId === "business-development" || trackId === "customer-success" ? 8 : 0;
    case "process-data":
      return trackId === "operations-management" || trackId === "project-management" ? 8 : 0;
    case "support-problem-solving":
      return trackId === "customer-support" || trackId === "product-management" ? 8 : 0;
    case "creative-growth":
      return trackId === "marketing-management" || trackId === "human-resources" ? 8 : 0;
    default:
      return 0;
  }
}

function getPsychometricBoost(
  answers: Record<number, number> | undefined,
  trackId: CareerTrackId
): number {
  if (!answers || Object.keys(answers).length === 0) return 0;
  let persuasion = 0;
  let analytical = 0;
  let structured = 0;
  let empathy = 0;

  Object.values(answers).forEach((optIdx) => {
    if (optIdx === 0) persuasion += 1;
    else if (optIdx === 1) analytical += 1;
    else if (optIdx === 2) structured += 1;
    else if (optIdx === 3) empathy += 1;
  });

  const total = Math.max(1, Object.keys(answers).length);
  const pRatio = persuasion / total;
  const aRatio = analytical / total;
  const sRatio = structured / total;
  const eRatio = empathy / total;

  switch (trackId) {
    case "business-development":
      return pRatio * 18 + eRatio * 4;
    case "marketing-management":
      return pRatio * 10 + aRatio * 8 + eRatio * 4;
    case "product-management":
      return aRatio * 18 + sRatio * 4;
    case "operations-management":
      return sRatio * 15 + aRatio * 7;
    case "project-management":
      return sRatio * 16 + pRatio * 4;
    case "customer-success":
      return eRatio * 14 + aRatio * 6;
    case "human-resources":
      return eRatio * 14 + sRatio * 6;
    case "customer-support":
      return eRatio * 12 + sRatio * 8;
    default:
      return 0;
  }
}

function clampTrait(val: number): number {
  return Math.max(1, Math.min(5, Number.isFinite(val) ? val : 3));
}

function buildDegreeReason(degree: DegreeSlug | "other", program: CareerProgram): string {
  const degreeLabel = degree === "other" ? "graduate" : degree.toUpperCase();
  if (degree === "bca" && (program.id === "customer-support" || program.id === "product-management")) {
    return `Your ${degreeLabel} computing familiarity gives you an advantage in technical/product support and structured workflows without needing software-engineering coding.`;
  }
  if (degree === "bcom" && program.id === "operations-management") {
    return `Your ${degreeLabel} comfort with structured records and numbers translates directly to Operations MIS, SLA reporting, and process coordination.`;
  }
  if (degree === "bsc" && (program.id === "operations-management" || program.id === "product-management")) {
    return `Your ${degreeLabel} analytical foundation pairs strongly with spreadsheet-driven operations, structured troubleshooting, and metrics-focused corporate roles.`;
  }
  return `Your ${degreeLabel} background combined with your assessment traits aligns well with the daily skills required in ${program.name}.`;
}

/**
 * Computes the top 3 most relevant available UdaYantu career tracks
 * based on degree, specialization, aptitude/traits, work style, and psychometric responses.
 */
export function recommendCareerTracks(
  profile: StudentAssessmentProfile,
  topN = 3
): CareerRecommendation[] {
  const traits = {
    communication: clampTrait(profile.communicationComfort) / 5,
    analytical: clampTrait(profile.analyticalComfort) / 5,
    structured: clampTrait(profile.structuredWorkPreference) / 5,
    empathy: clampTrait(profile.peopleEmpathy) / 5,
    persuasion: clampTrait(profile.persuasionInterest) / 5,
    creative: clampTrait(profile.creativeInterest) / 5,
    technicalAffinity: clampTrait(profile.technicalComfort) / 5,
  };

  const degreePriorMap = DEGREE_PRIORS[profile.degree] ?? DEGREE_PRIORS.other;

  const scored = CAREER_PROGRAMS.map((program) => {
    const w = program.traitWeights;
    const weightSum =
      w.communication +
      w.analytical +
      w.structured +
      w.empathy +
      w.persuasion +
      w.creative +
      w.technicalAffinity;

    const traitDot =
      traits.communication * w.communication +
      traits.analytical * w.analytical +
      traits.structured * w.structured +
      traits.empathy * w.empathy +
      traits.persuasion * w.persuasion +
      traits.creative * w.creative +
      traits.technicalAffinity * w.technicalAffinity;

    const normalizedTraitScore = (traitDot / weightSum) * 65; // up to 65 pts
    const degreePrior = degreePriorMap[program.id] ?? 6; // up to 11 pts
    const specBoost = getSpecializationBoost(profile.specialization, program.id); // up to 7 pts
    const styleBoost = getWorkStyleBoost(profile.preferredWorkStyle, program.id); // up to 8 pts
    const psychoBoost = getPsychometricBoost(profile.psychometricAnswers, program.id); // up to 22 pts

    const rawScore = normalizedTraitScore + degreePrior + specBoost + styleBoost + psychoBoost;
    const matchScore = Math.max(58, Math.min(95, Math.round(rawScore)));

    return {
      program,
      rawScore,
      matchScore,
    };
  });

  scored.sort((a, b) => b.rawScore - a.rawScore);

  return scored.slice(0, topN).map(({ program, matchScore }) => ({
    program,
    matchScore,
    fitSummary: program.tagline,
    whyItFitsDegree: buildDegreeReason(profile.degree, program),
    keySkillsToBuild: program.coreSkills.slice(0, 3),
    trainingNote: `Covered in UdaYantu's ${program.duration} ${program.name} curriculum with weekly assignments and 1:1 mentor feedback.`,
  }));
}

export function normalizeDegreeInput(raw: string | null | undefined): DegreeSlug | "other" {
  if (!raw) return "other";
  const dotStripped = raw.toLowerCase().replace(/\./g, " ").replace(/\s+/g, " ").trim();
  const compactTokens = raw.toLowerCase().replace(/\./g, "").replace(/[^a-z0-9]+/g, " ").trim();
  const tokens = new Set(compactTokens.split(" "));

  if (tokens.has("bcom") || dotStripped.includes("bachelor of commerce")) return "bcom";
  if (tokens.has("bsc") || dotStripped.includes("bachelor of science")) return "bsc";
  if (tokens.has("bba") || dotStripped.includes("business administration")) return "bba";
  if (tokens.has("bca") || dotStripped.includes("computer application")) return "bca";
  if (tokens.has("mcom") || dotStripped.includes("master of commerce")) return "mcom";
  if (tokens.has("msc") || dotStripped.includes("master of science")) return "msc";
  if (tokens.has("ba") || dotStripped.includes("bachelor of arts")) return "ba";
  if (tokens.has("ma") || dotStripped.includes("master of arts")) return "ma";
  return "other";
}

