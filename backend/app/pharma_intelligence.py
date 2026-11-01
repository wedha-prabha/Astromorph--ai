from datetime import datetime, timezone
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field, model_validator

from app.scoring import calculate_suitability, not_assessed_components


class QueryType(str, Enum):
    DISEASE = "disease"
    SYMPTOMS = "symptoms"
    DRUG = "drug"
    BRAND = "brand"
    COMBINED = "combined"
    UNKNOWN = "unknown"


class RegulatoryStatus(str, Enum):
    APPROVED = "approved"
    RESTRICTED = "restricted"
    SUSPENDED = "suspended"
    WITHDRAWN = "withdrawn"
    BANNED = "banned"
    NOT_APPROVED = "not_approved"
    UNKNOWN = "unknown"


class VerificationStatus(str, Enum):
    VERIFIED = "verified"
    PARTIALLY_VERIFIED = "partially_verified"
    CONFLICTING = "conflicting"
    UNVERIFIED = "unverified"


class PharmaIntelligenceRequest(BaseModel):
    query: str = Field(default="", max_length=500)
    disease_name: str = Field(default="", alias="diseaseName", max_length=160)
    symptoms: str = Field(default="", max_length=1000)
    drug_name: str = Field(default="", alias="drugName", max_length=160)
    brand_name: str = Field(default="", alias="brandName", max_length=160)
    country: str = Field(default="", max_length=80)
    research_focus: str = Field(default="", alias="researchFocus", max_length=1000)
    current_medications: list[str] = Field(default_factory=list, alias="currentMedications", max_length=20)
    patient_risk_factors: str = Field(default="", alias="patientRiskFactors", max_length=1000)

    @model_validator(mode="after")
    def validate_medications(self) -> "PharmaIntelligenceRequest":
        if any(not medication.strip() or len(medication) > 160 for medication in self.current_medications):
            raise ValueError("Current medication names must contain 1 to 160 characters.")
        return self

    @model_validator(mode="after")
    def require_research_input(self) -> "PharmaIntelligenceRequest":
        if not any((self.query.strip(), self.disease_name.strip(), self.symptoms.strip(), self.drug_name.strip(), self.brand_name.strip())):
            raise ValueError("Provide a disease, symptoms, drug name, brand name, or query.")
        return self


class NormalizedEntity(BaseModel):
    kind: str
    value: str


class QueryUnderstanding(BaseModel):
    original: str
    type: QueryType
    normalized_entities: list[NormalizedEntity] = Field(alias="normalizedEntities")
    ambiguities: list[str]


class SourceReference(BaseModel):
    title: str
    publisher: str
    url: str
    retrieved_at: datetime = Field(alias="retrievedAt")
    publication_date: str | None = Field(default=None, alias="publicationDate")
    retrieval_status: Literal["retrieved", "unavailable"] = Field(alias="retrievalStatus")


class ActiveIngredient(BaseModel):
    name: str
    strength: str | None = None


class ProductComposition(BaseModel):
    product_name: str | None = Field(alias="productName")
    active_ingredients: list[ActiveIngredient] = Field(alias="activeIngredients")
    excipients: list[str] = Field(default_factory=list)
    dosage_form: str | None = Field(alias="dosageForm")
    manufacturer: str | None
    market: str
    marketing_start_date: str | None = Field(default=None, alias="marketingStartDate")
    marketing_end_date: str | None = Field(default=None, alias="marketingEndDate")
    listing_expiration_date: str | None = Field(default=None, alias="listingExpirationDate")
    marketing_category: str | None = Field(default=None, alias="marketingCategory")
    source_url: str = Field(alias="sourceUrl")
    listing_note: str = Field(alias="listingNote")


class RegulatoryFinding(BaseModel):
    medicine: str
    country: str
    status: RegulatoryStatus
    restriction_type: str = Field(alias="restrictionType")
    effective_date: str | None = Field(default=None, alias="effectiveDate")
    reason: str | None
    scope: str
    authority: str | None
    source_url: str | None = Field(default=None, alias="sourceUrl")
    verification_status: VerificationStatus = Field(alias="verificationStatus")
    last_checked: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), alias="lastChecked")


class MedicineFinding(BaseModel):
    generic_name: str | None = Field(alias="genericName")
    drug_class: str | None = Field(default=None, alias="drugClass")
    brand_names: list[str] = Field(alias="brandNames")
    active_ingredients: list[str] = Field(alias="activeIngredients")
    composition: list[ProductComposition]
    label_indications: str | None = Field(default=None, alias="labelIndications")
    approved_indications: list[str] = Field(alias="approvedIndications")
    contraindications: list[str]
    precautions: list[str]
    safety_information: list[str] = Field(alias="safetyInformation")
    label_sections: dict[str, str] = Field(default_factory=dict, alias="labelSections")
    country_status: list[RegulatoryFinding] = Field(alias="countryStatus")
    sources: list[SourceReference]


class DiseaseResearch(BaseModel):
    name: str
    description: str
    source_url: str = Field(alias="sourceUrl")


class ResearchEvidence(BaseModel):
    title: str
    evidence_type: str = Field(alias="evidenceType")
    summary: str
    url: str
    publication_date: str | None = Field(default=None, alias="publicationDate")


class TrialEvidence(BaseModel):
    nct_id: str = Field(alias="nctId")
    title: str
    phase: str
    status: str
    summary: str
    url: str
    last_updated: str | None = Field(default=None, alias="lastUpdated")


class InteractionFinding(BaseModel):
    medicine_a: str = Field(alias="medicineA")
    medicine_b: str = Field(alias="medicineB")
    severity: Literal["contraindicated", "major", "moderate", "minor", "none_identified", "unknown"]
    interaction_type: str = Field(alias="interactionType")
    clinical_consequences: str = Field(alias="clinicalConsequences")
    mechanism: str
    risk_factors: list[str] = Field(alias="riskFactors")
    recommended_review: str = Field(alias="recommendedReview")
    source_urls: list[str] = Field(default_factory=list, alias="sourceUrls")
    verification_required: bool = Field(alias="verificationRequired")


class PatientRiskAssessment(BaseModel):
    status: Literal["not_assessed", "source_information_available"] = "not_assessed"
    supplied_factors: list[str] = Field(default_factory=list, alias="suppliedFactors")
    notes: list[str]


class ScoreComponentResult(BaseModel):
    name: str
    weight: float
    score: float | None
    rationale: str
    source_urls: list[str] = Field(default_factory=list, alias="sourceUrls")


class SuitabilityAssessment(BaseModel):
    overall_score: float | None = Field(alias="overallScore")
    classification: str
    evidence_confidence: Literal["High", "Moderate", "Low", "Insufficient"] = Field(alias="evidenceConfidence")
    evidence_coverage: int = Field(alias="evidenceCoverage")
    score_breakdown: list[ScoreComponentResult] = Field(alias="scoreBreakdown")
    relevant_studies_count: int | None = Field(alias="relevantStudiesCount")
    relevant_human_studies_count: int | None = Field(alias="relevantHumanStudiesCount")
    records_retrieved: int = Field(alias="recordsRetrieved")
    clinical_trials_count: int = Field(alias="clinicalTrialsCount")
    findings_agree: bool | None = Field(alias="findingsAgree")
    safety_information_unknown: bool = Field(alias="safetyInformationUnknown")
    safety_override: bool = Field(alias="safetyOverride")
    final_assessment: str = Field(alias="finalAssessment")
    limitations: list[str]


class PharmaceuticalIntelligenceResponse(BaseModel):
    query: QueryUnderstanding
    summary: str | None
    synthesis_status: Literal["available", "unavailable"] = Field(alias="synthesisStatus")
    synthesis_error: str | None = Field(default=None, alias="synthesisError")
    disease_research: list[DiseaseResearch] = Field(alias="diseaseResearch")
    medicines: list[MedicineFinding]
    regulatory_findings: list[RegulatoryFinding] = Field(alias="regulatoryFindings")
    research_evidence: list[ResearchEvidence] = Field(alias="researchEvidence")
    clinical_trials: list[TrialEvidence] = Field(alias="clinicalTrials")
    interactions: list[InteractionFinding]
    patient_risk_assessment: PatientRiskAssessment = Field(alias="patientRiskAssessment")
    suitability: SuitabilityAssessment
    sources: list[SourceReference]
    limitations: list[str]
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), alias="generatedAt")


def unassessed_suitability(
    *,
    publication_count: int,
    clinical_trial_count: int,
    safety_information_unknown: bool,
    safety_override: bool = False,
) -> SuitabilityAssessment:
    reason = (
        "retrieved records do not contain verified, systematically appraised outcome and mechanism "
        "assessments. Publication/trial counts alone cannot establish benefit or suitability."
    )
    components = not_assessed_components(reason)
    score = calculate_suitability(
        components,
        source_count=0,
        direct_human_evidence=False,
        findings_consistent=None,
    )
    weights = {
        "clinical_efficacy": 0.35,
        "evidence_quality": 0.25,
        "mechanistic_plausibility": 0.15,
        "consistency": 0.15,
        "human_evidence_relevance": 0.10,
    }
    return SuitabilityAssessment(
        overallScore=score.score,
        classification=score.classification,
        evidenceConfidence=score.confidence,
        evidenceCoverage=score.coverage,
        scoreBreakdown=[
            ScoreComponentResult(
                name=component.name,
                weight=weights[component.name],
                score=component.score,
                rationale=component.rationale,
                sourceUrls=list(component.source_urls),
            )
            for component in score.components
        ],
        relevantStudiesCount=None,
        relevantHumanStudiesCount=None,
        recordsRetrieved=publication_count + clinical_trial_count,
        clinicalTrialsCount=clinical_trial_count,
        findingsAgree=None,
        safetyInformationUnknown=safety_information_unknown,
        safetyOverride=safety_override,
        finalAssessment=(
            "A verified serious safety or regulatory concern blocks further positive research classification. "
            "Do not interpret any numerical score as overriding this concern."
            if safety_override else
            "Insufficient evidence to assess drug suitability. No treatment recommendation is made."
        ),
        limitations=[
            "The number of records retrieved is not a count of verified relevant studies.",
            "A clinical trial record does not establish positive results or efficacy.",
            "Suitability scores are provisional research tools and are not clinically validated.",
        ],
    )


def classify_query(request: PharmaIntelligenceRequest) -> QueryUnderstanding:
    disease = request.disease_name.strip()
    symptoms = request.symptoms.strip()
    drug = request.drug_name.strip()
    brand = request.brand_name.strip()
    entities = [
        NormalizedEntity(kind=kind, value=value)
        for kind, value in (
            ("disease", disease),
            ("symptoms", symptoms),
            ("drug", drug),
            ("brand", brand),
            *[("current_medication", medication.strip()) for medication in request.current_medications if medication.strip()],
            ("country", request.country.strip()),
        )
        if value
    ]
    kinds = len(entities)
    if kinds == 0:
        query_type = QueryType.UNKNOWN
    elif kinds > 1:
        query_type = QueryType.COMBINED
    elif brand:
        query_type = QueryType.BRAND
    elif drug:
        query_type = QueryType.DRUG
    elif symptoms:
        query_type = QueryType.SYMPTOMS
    else:
        query_type = QueryType.DISEASE

    original = request.query.strip() or "; ".join(f"{entity.kind}: {entity.value}" for entity in entities)
    ambiguities = []
    if symptoms:
        ambiguities.append("Symptoms are not a diagnosis; no disease has been inferred from them.")
    if brand:
        ambiguities.append("Brand names can refer to different products or formulations across markets.")
    if (drug or brand) and not request.country.strip():
        ambiguities.append("No country was selected; country-specific regulatory status was not assessed.")
    return QueryUnderstanding(
        original=original,
        type=query_type,
        normalizedEntities=entities,
        ambiguities=ambiguities,
    )
