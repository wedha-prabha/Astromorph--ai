import unittest

from app.pharma_intelligence import unassessed_suitability
from app.scoring import ScoreComponent, calculate_suitability, not_assessed_components


class SuitabilityScoringTests(unittest.TestCase):
    def test_weighted_score_uses_documented_component_weights(self):
        components = (
            ScoreComponent("clinical_efficacy", 100, "Assessed from evidence.", ("https://example.test/1",)),
            ScoreComponent("evidence_quality", 80, "Assessed from evidence.", ("https://example.test/2",)),
            ScoreComponent("mechanistic_plausibility", 60, "Assessed from evidence.", ("https://example.test/3",)),
            ScoreComponent("consistency", 80, "Assessed from evidence.", ("https://example.test/4",)),
            ScoreComponent("human_evidence_relevance", 80, "Assessed from evidence.", ("https://example.test/5",)),
        )
        result = calculate_suitability(
            components,
            source_count=2,
            direct_human_evidence=True,
            findings_consistent=True,
        )
        self.assertEqual(result.score, 84)
        self.assertEqual(result.coverage, 100)
        self.assertEqual(result.confidence, "High")
        self.assertEqual(result.classification, "Strong evidence supporting further evaluation")

    def test_missing_component_returns_insufficient_instead_of_zero(self):
        result = calculate_suitability(
            not_assessed_components("No structured appraisal."),
            source_count=10,
            direct_human_evidence=True,
            findings_consistent=True,
        )
        self.assertIsNone(result.score)
        self.assertEqual(result.confidence, "Insufficient")
        self.assertEqual(result.coverage, 0)

    def test_unassessed_api_result_does_not_conflate_retrieval_with_relevance(self):
        result = unassessed_suitability(
            publication_count=8,
            clinical_trial_count=2,
            safety_information_unknown=True,
        )
        serialized = result.model_dump(by_alias=True)
        self.assertIsNone(serialized["overallScore"])
        self.assertIsNone(serialized["relevantStudiesCount"])
        self.assertIsNone(serialized["relevantHumanStudiesCount"])
        self.assertEqual(serialized["recordsRetrieved"], 10)
        self.assertEqual(serialized["clinicalTrialsCount"], 2)
        self.assertTrue(serialized["safetyInformationUnknown"])
        self.assertFalse(serialized["safetyOverride"])

    def test_safety_override_is_prominent_without_changing_score(self):
        result = unassessed_suitability(
            publication_count=2,
            clinical_trial_count=1,
            safety_information_unknown=False,
            safety_override=True,
        )
        serialized = result.model_dump(by_alias=True)
        self.assertTrue(serialized["safetyOverride"])
        self.assertIn("blocks further positive research", serialized["finalAssessment"])
        self.assertIsNone(serialized["overallScore"])

    def test_conflicting_findings_are_disclosed_in_classification(self):
        components = (
            ScoreComponent("clinical_efficacy", 70, "Assessed.", ("https://example.test/1",)),
            ScoreComponent("evidence_quality", 60, "Assessed.", ("https://example.test/2",)),
            ScoreComponent("mechanistic_plausibility", 60, "Assessed.", ("https://example.test/3",)),
            ScoreComponent("consistency", 40, "Assessed.", ("https://example.test/4",)),
            ScoreComponent("human_evidence_relevance", 60, "Assessed.", ("https://example.test/5",)),
        )
        result = calculate_suitability(
            components,
            source_count=2,
            direct_human_evidence=True,
            findings_consistent=False,
        )
        self.assertIsNotNone(result.score)
        self.assertIn("findings conflict", result.classification)
        self.assertEqual(result.confidence, "Low")


if __name__ == "__main__":
    unittest.main()
