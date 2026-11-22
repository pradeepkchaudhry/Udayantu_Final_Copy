import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeDegreeInput,
  recommendCareerTracks,
  type StudentAssessmentProfile,
} from "./careerRecommendationEngine";
import { CAREER_PROGRAMS, type DegreeSlug } from "../data/careerPrograms";

const VALID_TRACK_IDS = new Set(CAREER_PROGRAMS.map((p) => p.id));

function makeBaseProfile(degree: DegreeSlug | "other"): StudentAssessmentProfile {
  return {
    degree,
    communicationComfort: 3,
    analyticalComfort: 3,
    structuredWorkPreference: 3,
    peopleEmpathy: 3,
    persuasionInterest: 3,
    creativeInterest: 3,
    technicalComfort: 3,
  };
}

describe("careerRecommendationEngine", () => {
  it("normalizes common degree inputs accurately", () => {
    assert.equal(normalizeDegreeInput("B.A."), "ba");
    assert.equal(normalizeDegreeInput("Bachelor of Commerce"), "bcom");
    assert.equal(normalizeDegreeInput("B.Sc (Maths)"), "bsc");
    assert.equal(normalizeDegreeInput("BBA"), "bba");
    assert.equal(normalizeDegreeInput("BCA"), "bca");
    assert.equal(normalizeDegreeInput("M.A."), "ma");
    assert.equal(normalizeDegreeInput("M.Com"), "mcom");
    assert.equal(normalizeDegreeInput("M.Sc"), "msc");
    assert.equal(normalizeDegreeInput("Diploma"), "other");
    assert.equal(normalizeDegreeInput(undefined), "other");
  });

  it("always returns 3 distinct verified UdaYantu career tracks for every UG & PG degree", () => {
    const degrees: Array<DegreeSlug | "other"> = [
      "ba",
      "bcom",
      "bsc",
      "bba",
      "bca",
      "ma",
      "mcom",
      "msc",
      "other",
    ];

    for (const degree of degrees) {
      const recs = recommendCareerTracks(makeBaseProfile(degree), 3);
      assert.equal(recs.length, 3, `Expected 3 tracks for ${degree}`);
      const ids = new Set(recs.map((r) => r.program.id));
      assert.equal(ids.size, 3, `Expected 3 distinct tracks for ${degree}`);
      for (const rec of recs) {
        assert.ok(VALID_TRACK_IDS.has(rec.program.id), `Track ${rec.program.id} must be valid`);
        assert.ok(rec.matchScore >= 58 && rec.matchScore <= 95);
        assert.ok(rec.keySkillsToBuild.length === 3);
      }
    }
  });

  it("prioritizes technical/product tracks for BCA students with high technical comfort", () => {
    const recs = recommendCareerTracks({
      ...makeBaseProfile("bca"),
      specialization: "Computer Applications",
      technicalComfort: 5,
      analyticalComfort: 5,
      preferredWorkStyle: "support-problem-solving",
    });

    const topIds = recs.map((r) => r.program.id);
    assert.ok(
      topIds.includes("customer-support") || topIds.includes("product-management"),
      `Expected support or product track for BCA, got ${topIds.join(", ")}`
    );
  });

  it("prioritizes HR or Customer Success for BA Psychology graduates with strong empathy", () => {
    const recs = recommendCareerTracks({
      ...makeBaseProfile("ba"),
      specialization: "Psychology",
      peopleEmpathy: 5,
      communicationComfort: 5,
      preferredWorkStyle: "creative-growth",
    });

    const topIds = recs.map((r) => r.program.id);
    assert.ok(
      topIds.includes("human-resources") || topIds.includes("customer-success"),
      `Expected HR or Customer Success for BA Psychology, got ${topIds.join(", ")}`
    );
  });

  it("prioritizes Operations Management for B.Com graduates who prefer process & data", () => {
    const recs = recommendCareerTracks({
      ...makeBaseProfile("bcom"),
      specialization: "Commerce & Accounting",
      analyticalComfort: 5,
      structuredWorkPreference: 5,
      preferredWorkStyle: "process-data",
    });

    assert.equal(recs[0].program.id, "operations-management");
  });
});
