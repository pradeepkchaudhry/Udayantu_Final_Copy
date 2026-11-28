/**
 * Server-Side Final Assessment & 75% Qualification Engine.
 *
 * - Configurable sections: Domain Knowledge, Tools & Practical Skills, Aptitude,
 *   General Communication, plus any Admin-configured custom sections.
 * - Answer keys NEVER leave the server.
 * - Default passing threshold: 75% (74% fails, 75% meets the score threshold).
 * - Full qualification ALSO requires mandatory course module & assignment completion.
 */

import { DEFAULT_PASSING_THRESHOLD_PERCENT } from "./commercialEngine";
import type { CanonicalCareerTrackId } from "./psychometricEngine";

export type FinalAssessmentSectionId =
  | "domain_knowledge"
  | "tools_practical_skills"
  | "aptitude"
  | "general_communication"
  | string;

export interface FinalAssessmentQuestionRecord {
  id: string;
  sectionId: FinalAssessmentSectionId;
  sectionTitle: string;
  trackId: CanonicalCareerTrackId | "all";
  prompt: string;
  options: Array<{ id: string; label: string }>;
  correctOptionId: string; // STRICTLY SERVER-ONLY
  weight: number;
}

export interface PublicFinalAssessmentQuestion {
  id: string;
  sectionId: FinalAssessmentSectionId;
  sectionTitle: string;
  prompt: string;
  options: Array<{ id: string; label: string }>;
}

export interface SectionScoreBreakdown {
  sectionId: FinalAssessmentSectionId;
  sectionTitle: string;
  correctCount: number;
  totalCount: number;
  scorePercent: number;
}

export interface FinalAssessmentEvaluationResult {
  assessmentVersion: string;
  passingThresholdPercent: number;
  totalCorrect: number;
  totalQuestions: number;
  overallScorePercent: number;
  meetsScoreThreshold: boolean;
  mandatoryCourseworkComplete: boolean;
  qualified: boolean;
  sectionScores: SectionScoreBreakdown[];
  evaluatedAt: string;
  reason: string;
}

export const FINAL_ASSESSMENT_VERSION = "FINAL-EXAM-2026.1";

/**
 * Curated server-side question bank (Admin-extensible via API).
 * Answer keys are stripped before sending to any client.
 */
export const DEFAULT_FINAL_QUESTION_BANK: FinalAssessmentQuestionRecord[] = [
  // Section 1: Domain Knowledge
  {
    id: "fin_dom_1",
    sectionId: "domain_knowledge",
    sectionTitle: "Domain Knowledge",
    trackId: "all",
    prompt: "Before pitching a solution or recommending next steps to a client, what is the most critical discovery step?",
    options: [
      { id: "a", label: "Send pricing immediately without asking questions" },
      { id: "b", label: "Identify the customer's concrete pain point, timeline, and decision criteria" },
      { id: "c", label: "Share internal company policies first" },
      { id: "d", label: "Close the call within 60 seconds" },
    ],
    correctOptionId: "b",
    weight: 1,
  },
  {
    id: "fin_dom_2",
    sectionId: "domain_knowledge",
    sectionTitle: "Domain Knowledge",
    trackId: "all",
    prompt: "What does SLA (Service Level Agreement) primarily define in corporate operations and customer teams?",
    options: [
      { id: "a", label: "Annual employee leave allowance" },
      { id: "b", label: "Agreed response and resolution timeframes with measurable quality standards" },
      { id: "c", label: "Social media advertising budget" },
      { id: "d", label: "Software licensing cost only" },
    ],
    correctOptionId: "b",
    weight: 1,
  },
  {
    id: "fin_dom_3",
    sectionId: "domain_knowledge",
    sectionTitle: "Domain Knowledge",
    trackId: "all",
    prompt: "When a recurring workflow error impacts multiple stakeholders, what is the best professional action?",
    options: [
      { id: "a", label: "Ignore it unless a manager notices" },
      { id: "b", label: "Document the root cause, notify stakeholders clearly, and propose a process fix" },
      { id: "c", label: "Blame the previous shift in a group chat" },
      { id: "d", label: "Delete the historical error records" },
    ],
    correctOptionId: "b",
    weight: 1,
  },
  // Section 2: Tools & Practical Skills
  {
    id: "fin_tool_1",
    sectionId: "tools_practical_skills",
    sectionTitle: "Tools and Practical Skills",
    trackId: "all",
    prompt: "In Google Sheets / Excel, which feature lets you quickly summarize total enrollments grouped by career track?",
    options: [
      { id: "a", label: "Font Colour" },
      { id: "b", label: "Pivot Table (or SUMIF / COUNTIF)" },
      { id: "c", label: "Page Margins" },
      { id: "d", label: "Spell Check" },
    ],
    correctOptionId: "b",
    weight: 1,
  },
  {
    id: "fin_tool_2",
    sectionId: "tools_practical_skills",
    sectionTitle: "Tools and Practical Skills",
    trackId: "all",
    prompt: "Why is maintaining clean CRM or task-board notes immediately after every client/team call essential?",
    options: [
      { id: "a", label: "So any teammate can see accurate status, next steps, and deadlines without losing context" },
      { id: "b", label: "To increase the file size of the database" },
      { id: "c", label: "Only to count how many words were typed" },
      { id: "d", label: "It is optional and rarely used in corporate roles" },
    ],
    correctOptionId: "a",
    weight: 1,
  },
  // Section 3: Aptitude
  {
    id: "fin_apt_1",
    sectionId: "aptitude",
    sectionTitle: "Aptitude",
    trackId: "all",
    prompt: "A cohort has 80 enrolled students. 60 pass the final assessment on the first attempt. What is the pass percentage?",
    options: [
      { id: "a", label: "65%" },
      { id: "b", label: "70%" },
      { id: "c", label: "75%" },
      { id: "d", label: "80%" },
    ],
    correctOptionId: "c",
    weight: 1,
  },
  {
    id: "fin_apt_2",
    sectionId: "aptitude",
    sectionTitle: "Aptitude",
    trackId: "all",
    prompt: "If an employer offers ₹6,00,000 annual CTC and the monthly in-hand target ratio is evaluated across 12 months, what is the gross monthly equivalent?",
    options: [
      { id: "a", label: "₹45,000" },
      { id: "b", label: "₹50,000" },
      { id: "c", label: "₹55,000" },
      { id: "d", label: "₹60,000" },
    ],
    correctOptionId: "b",
    weight: 1,
  },
  // Section 4: General Communication
  {
    id: "fin_comm_1",
    sectionId: "general_communication",
    sectionTitle: "General Communication",
    trackId: "all",
    prompt: "Which subject line is clearest for an internal escalation email regarding a delayed client onboarding?",
    options: [
      { id: "a", label: "Hi" },
      { id: "b", label: "Urgent issue!!!" },
      { id: "c", label: "Action Needed: Acme Corp Onboarding Delay — Updated Timeline by 5 PM" },
      { id: "d", label: "Please read fast" },
    ],
    correctOptionId: "c",
    weight: 1,
  },
];

/**
 * Strips answer keys strictly before sending questions to client.
 */
export function stripFinalAssessmentAnswerKeys(
  questions: FinalAssessmentQuestionRecord[]
): PublicFinalAssessmentQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    sectionId: q.sectionId,
    sectionTitle: q.sectionTitle,
    prompt: q.prompt,
    options: q.options.map((opt) => ({ id: opt.id, label: opt.label })),
  }));
}

/**
 * Server-side grading & 75% qualification rule:
 * - 74% fails, 75% meets the score threshold.
 * - Mandatory coursework (modules & assignments) must ALSO be complete.
 */
export function evaluateFinalAssessmentSubmission(params: {
  questions: FinalAssessmentQuestionRecord[];
  answers: Record<string, string>;
  mandatoryCourseworkComplete: boolean;
  passingThresholdPercent?: number;
  assessmentVersion?: string;
  evaluatedAt?: string;
}): FinalAssessmentEvaluationResult {
  const threshold = params.passingThresholdPercent ?? DEFAULT_PASSING_THRESHOLD_PERCENT;
  const evaluatedAt = params.evaluatedAt ?? new Date().toISOString();

  if (params.questions.length === 0) {
    throw new Error("Final assessment question set cannot be empty");
  }

  const sectionTotals = new Map<
    string,
    { sectionTitle: string; correctCount: number; totalCount: number }
  >();

  let totalWeight = 0;
  let earnedWeight = 0;
  let totalCorrect = 0;

  for (const q of params.questions) {
    const entry = sectionTotals.get(q.sectionId) ?? {
      sectionTitle: q.sectionTitle,
      correctCount: 0,
      totalCount: 0,
    };
    entry.totalCount += 1;
    totalWeight += q.weight;

    const submitted = params.answers[q.id];
    if (submitted && submitted === q.correctOptionId) {
      entry.correctCount += 1;
      totalCorrect += 1;
      earnedWeight += q.weight;
    }
    sectionTotals.set(q.sectionId, entry);
  }

  // Floor/exact percentage check so 74.4% never rounds up falsely to 75%, while exact 75% passes.
  const exactPercent = (earnedWeight / totalWeight) * 100;
  const overallScorePercent = Math.floor(exactPercent * 100) / 100;
  const meetsScoreThreshold = overallScorePercent >= threshold;
  const qualified = meetsScoreThreshold && params.mandatoryCourseworkComplete;

  const sectionScores: SectionScoreBreakdown[] = Array.from(sectionTotals.entries()).map(
    ([sectionId, stats]) => ({
      sectionId,
      sectionTitle: stats.sectionTitle,
      correctCount: stats.correctCount,
      totalCount: stats.totalCount,
      scorePercent: Math.round((stats.correctCount / stats.totalCount) * 100),
    })
  );

  let reason = "Qualified: final assessment threshold met and mandatory coursework completed.";
  if (!meetsScoreThreshold) {
    reason = `Score ${overallScorePercent}% is below the mandatory ${threshold}% passing threshold.`;
  } else if (!params.mandatoryCourseworkComplete) {
    reason = `Score ${overallScorePercent}% meets the ${threshold}% threshold, but mandatory course modules and assignments must be completed before qualification is granted.`;
  }

  return {
    assessmentVersion: params.assessmentVersion ?? FINAL_ASSESSMENT_VERSION,
    passingThresholdPercent: threshold,
    totalCorrect,
    totalQuestions: params.questions.length,
    overallScorePercent,
    meetsScoreThreshold,
    mandatoryCourseworkComplete: params.mandatoryCourseworkComplete,
    qualified,
    sectionScores,
    evaluatedAt,
    reason,
  };
}
