from dataclasses import dataclass
from typing import Literal


ScoreName = Literal[
    "clinical_efficacy",
    "evidence_quality",
    "mechanistic_plausibility",
    "consistency",
    "human_evidence_relevance",
]

WEIGHTS: dict[ScoreName, float] = {
    "clinical_efficacy": 0.35,
    "evidence_quality": 0.25,
    "mechanistic_plausibility": 0.15,
    "consistency": 0.15,
    "human_evidence_relevance": 0.10,
}

INTERPRETATIONS = (
    (80, "Strong evidence supporting further evaluation"),
    (60, "Promising evidence; important uncertainties remain"),
    (40, "Limited or mixed evidence"),
    (20, "Weak supporting evidence"),
    (0, "Very little supporting evidence identified"),
)


@dataclass(frozen=True)
class ScoreComponent:
    name: ScoreName
    score: float | None
    rationale: str
    source_urls: tuple[str, ...] = ()


@dataclass(frozen=True)
class SuitabilityScore:
    score: float | None
    classification: str
    confidence: str
    coverage: int
    components: tuple[ScoreComponent, ...]


def calculate_suitability(
    components: tuple[ScoreComponent, ...],
    *,
    source_count: int,
    direct_human_evidence: bool,
    findings_consistent: bool | None,
) -> SuitabilityScore:
    """Calculate a provisional research score only from fully sourced assessments."""
    by_name = {component.name: component for component in components}
    if len(by_name) != len(components):
        raise ValueError("Each suitability component may be provided only once")
    if source_count < 0:
        raise ValueError("source_count cannot be negative")
    complete = all(
        name in by_name
        and by_name[name].score is not None
        and bool(by_name[name].rationale.strip())
        and bool(by_name[name].source_urls)
        for name in WEIGHTS
    )
    coverage = round(sum(
        1 for name in WEIGHTS
        if name in by_name and by_name[name].score is not None
        and bool(by_name[name].rationale.strip())
        and bool(by_name[name].source_urls)
    ) / len(WEIGHTS) * 100)

    for component in components:
        if component.score is not None and not 0 <= component.score <= 100:
            raise ValueError(f"{component.name} score must be between 0 and 100")

    confidence = "Insufficient"
    if complete and source_count > 0 and direct_human_evidence and findings_consistent is not None:
        quality = by_name["evidence_quality"].score or 0
        relevance = by_name["human_evidence_relevance"].score or 0
        consistency = by_name["consistency"].score or 0
        if not findings_consistent:
            confidence = "Low"
        elif quality >= 80 and relevance >= 80 and consistency >= 80 and source_count >= 2:
            confidence = "High"
        elif quality >= 50 and relevance >= 50 and source_count >= 1:
            confidence = "Moderate"
        else:
            confidence = "Low"

    if not complete or confidence == "Insufficient":
        return SuitabilityScore(
            score=None,
            classification="Insufficient evidence to assess",
            confidence="Insufficient",
            coverage=coverage,
            components=components,
        )

    weighted_score = round(sum(
        (by_name[name].score or 0) * weight
        for name, weight in WEIGHTS.items()
    ))
    interpretation = next(label for threshold, label in INTERPRETATIONS if weighted_score >= threshold)
    if findings_consistent is False:
        interpretation += "; findings conflict"
    return SuitabilityScore(
        score=weighted_score,
        classification=interpretation,
        confidence=confidence,
        coverage=coverage,
        components=components,
    )


def not_assessed_components(reason: str) -> tuple[ScoreComponent, ...]:
    rationales = {
        "clinical_efficacy": f"Not scored: {reason}",
        "evidence_quality": f"Not scored: study-level quality has not been systematically appraised. {reason}",
        "mechanistic_plausibility": f"Not scored: no verified mechanism assessment is available. {reason}",
        "consistency": f"Not scored: study findings have not been systematically compared. {reason}",
        "human_evidence_relevance": f"Not scored: directness and applicability of human evidence have not been verified. {reason}",
    }
    return tuple(
        ScoreComponent(name=name, score=None, rationale=rationales[name])
        for name in WEIGHTS
    )
