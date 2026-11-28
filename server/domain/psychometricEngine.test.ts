import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CANONICAL_TRACK_PROFILES,
  PSYCHOMETRIC_ENGINE_VERSION,
  evaluatePsychometricAssessment,
  getPublicPsychometricQuestions,
} from "./psychometricEngine";

describe("UdaYantu 11-Dimension Psychometric & Career Recommendation Engine", () => {
  it("preserves all 8 canonical career tracks and covers all 11 dimensions with bilingual scenario questions", () => {
    const trackIds = Object.keys(CANONICAL_TRACK_PROFILES);
    assert.equal(trackIds.length, 8);
    assert.deepEqual(trackIds.sort(), [
      "business-development",
      "customer-success",
      "customer-support",
      "human-resources",
      "marketing-management",
      "operations-management",
      "product-management",
      "project-management",
    ]);

    const questions = getPublicPsychometricQuestions();
    assert.ok(questions.length >= 12, "Should provide comprehensive scenario-based questions");
    const coveredDimensions = new Set(questions.map((q) => q.primaryDimension));
    assert.equal(coveredDimensions.size, 11, "All 11 required assessment dimensions must be evaluated");

    for (const q of questions) {
      assert.ok(q.promptEn.length > 10);
      assert.ok(q.promptHi.length > 5);
      // Ensure no answer keys or internal weights leak to public question payload
      for (const opt of q.options) {
        assert.equal("isObjectiveCorrect" in opt, false);
        assert.equal("trackAffinities" in opt, false);
        assert.equal("dimensionContributions" in opt, false);
      }
    }
  });

  it("produces deterministic 20% preview and 100% full 3-track report with non-clinical tendency framing", () => {
    const questions = getPublicPsychometricQuestions();
    const answers: Record<string, string> = {};
    for (const q of questions) {
      answers[q.id] = q.options[0].id;
    }

    const run1 = evaluatePsychometricAssessment(answers);
    const run2 = evaluatePsychometricAssessment(answers);

    assert.equal(run1.fullReport.engineVersion, PSYCHOMETRIC_ENGINE_VERSION);
    assert.deepEqual(run1.fullReport.topTracks, run2.fullReport.topTracks, "Scoring must be deterministic");

    // 20% Preview checks
    assert.equal(run1.previewReport.previewSharePercent, 20);
    assert.equal(run1.previewReport.questionsAnswered, questions.length);
    assert.equal(run1.previewReport.totalQuestions, questions.length);
    assert.ok(run1.previewReport.keyBehaviouralInsights.length >= 2);
    assert.ok(run1.previewReport.primaryTrack.trackId);
    assert.ok(run1.previewReport.briefStrengthsSummary.length >= 1);
    assert.ok(run1.previewReport.developmentOpportunity.length > 10);
    assert.ok(run1.previewReport.fullReportIncludes.length >= 4);

    // 100% Full report checks
    assert.equal(run1.fullReport.topTracks.length, 3);
    assert.equal(run1.fullReport.topTracks[0].trackId, run1.previewReport.primaryTrack.trackId);
    assert.equal(run1.fullReport.dimensionProfiles.length, 11);
    assert.ok(run1.fullReport.workStylePreferences.length >= 2);
    assert.ok(run1.fullReport.topTracks[0].recommendedLearningPath.length >= 3);
    assert.ok(run1.fullReport.topTracks[0].jobAvailabilityContext.length > 5);

    // Non-clinical, non-permanent-label language verification
    const serialized = JSON.stringify(run1.fullReport).toLowerCase();
    assert.equal(serialized.includes("diagnosed"), false);
    assert.equal(serialized.includes("you are an introvert"), false);
    assert.equal(serialized.includes("you are an extrovert"), false);
    assert.equal(serialized.includes("job guarantee"), false);
  });
});
