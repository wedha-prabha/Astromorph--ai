import type {
  DrugSummary,
  DrugSummaryInput,
  PharmaceuticalIntelligenceReport,
} from '@/api/endpoints'
import type { ResearchReport } from '@/types'

export interface SavedAnalysisReport {
  id: string
  drugName: string
  diseaseName: string
  createdAt: string
  report: ResearchReport
}

function storageKey(userId: string) {
  return `astromorph.saved-reports.${userId}`
}

export function readSavedAnalysisReports(userId: string): SavedAnalysisReport[] {
  const raw = localStorage.getItem(storageKey(userId))
  if (!raw) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Saved reports contain invalid JSON. Existing data was left unchanged.')
  }
  if (!Array.isArray(parsed)) {
    throw new Error('Saved reports could not be read because the stored report list is invalid.')
  }
  if (!parsed.every(isSavedAnalysisReport)) {
    throw new Error('Saved reports could not be read because one or more stored reports are invalid. Existing data was left unchanged.')
  }
  return parsed
}

function isSavedAnalysisReport(value: unknown): value is SavedAnalysisReport {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<SavedAnalysisReport>
  const report = candidate.report
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.drugName === 'string' &&
    typeof candidate.diseaseName === 'string' &&
    typeof candidate.createdAt === 'string' &&
    !!report &&
    typeof report === 'object' &&
    typeof report.id === 'string' &&
    typeof report.analysisId === 'string' &&
    typeof report.title === 'string' &&
    typeof report.subtitle === 'string' &&
    typeof report.generatedAt === 'string' &&
    Array.isArray(report.sections) &&
    report.sections.every((section) =>
      !!section &&
      typeof section.id === 'string' &&
      typeof section.number === 'number' &&
      typeof section.title === 'string' &&
      Array.isArray(section.paragraphs) &&
      section.paragraphs.every((paragraph) => typeof paragraph === 'string'),
    ) &&
    Array.isArray(report.references) &&
    report.references.every((reference) =>
      !!reference && typeof reference.id === 'string' && typeof reference.citation === 'string',
    )
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function isPharmaceuticalReport(value: unknown): value is PharmaceuticalIntelligenceReport {
  if (!isRecord(value)) return false
  const report = value
  const query = report.query
  const suitability = report.suitability
  const validSource = (source: unknown) =>
    isRecord(source) &&
    typeof source.title === 'string' &&
    typeof source.publisher === 'string' &&
    typeof source.url === 'string'
  const validMedicine = (medicine: unknown) =>
    isRecord(medicine) &&
    (medicine.genericName === null || typeof medicine.genericName === 'string') &&
    (medicine.drugClass === null || typeof medicine.drugClass === 'string') &&
    Array.isArray(medicine.brandNames) &&
    medicine.brandNames.every((item) => typeof item === 'string') &&
    Array.isArray(medicine.activeIngredients) &&
    medicine.activeIngredients.every((item) => typeof item === 'string') &&
    Array.isArray(medicine.composition) &&
    medicine.composition.every((product) =>
      isRecord(product) &&
      (product.productName === null || typeof product.productName === 'string') &&
      typeof product.sourceUrl === 'string' &&
      typeof product.market === 'string' &&
      typeof product.listingNote === 'string' &&
      (product.dosageForm === null || typeof product.dosageForm === 'string') &&
      Array.isArray(product.activeIngredients) &&
      product.activeIngredients.every((ingredient) =>
        isRecord(ingredient) &&
        typeof ingredient.name === 'string' &&
        (ingredient.strength === null || typeof ingredient.strength === 'string'),
      ),
    ) &&
    (medicine.labelIndications === null || typeof medicine.labelIndications === 'string') &&
    Array.isArray(medicine.approvedIndications) && medicine.approvedIndications.every((item) => typeof item === 'string') &&
    Array.isArray(medicine.contraindications) && medicine.contraindications.every((item) => typeof item === 'string') &&
    Array.isArray(medicine.precautions) && medicine.precautions.every((item) => typeof item === 'string') &&
    Array.isArray(medicine.safetyInformation) && medicine.safetyInformation.every((item) => typeof item === 'string') &&
    isRecord(medicine.labelSections) && Object.values(medicine.labelSections).every((item) => typeof item === 'string') &&
    Array.isArray(medicine.sources) &&
    medicine.sources.every(validSource)
  const validInteraction = (interaction: unknown) =>
    isRecord(interaction) &&
    typeof interaction.medicineA === 'string' &&
    typeof interaction.medicineB === 'string' &&
    typeof interaction.severity === 'string' &&
    typeof interaction.interactionType === 'string' &&
    typeof interaction.clinicalConsequences === 'string' &&
    typeof interaction.mechanism === 'string' &&
    typeof interaction.recommendedReview === 'string' &&
    typeof interaction.verificationRequired === 'boolean' &&
    Array.isArray(interaction.riskFactors) && interaction.riskFactors.every((item) => typeof item === 'string') &&
    Array.isArray(interaction.sourceUrls) && interaction.sourceUrls.every((url) => typeof url === 'string')
  const validFinding = (finding: unknown) =>
    isRecord(finding) &&
    typeof finding.medicine === 'string' &&
    typeof finding.country === 'string' &&
    typeof finding.status === 'string' &&
    typeof finding.scope === 'string' &&
    typeof finding.verificationStatus === 'string' &&
    typeof finding.lastChecked === 'string'
  const validEvidence = (item: unknown) =>
    isRecord(item) &&
    typeof item.title === 'string' &&
    typeof item.evidenceType === 'string' &&
    typeof item.summary === 'string' &&
    typeof item.url === 'string' &&
    (item.publicationDate === null || typeof item.publicationDate === 'string')
  const validTrial = (item: unknown) =>
    isRecord(item) &&
    typeof item.title === 'string' &&
    typeof item.nctId === 'string' &&
    typeof item.phase === 'string' &&
    typeof item.status === 'string' &&
    typeof item.summary === 'string' &&
    typeof item.url === 'string' &&
    (item.lastUpdated === null || typeof item.lastUpdated === 'string')
  const validDisease = (item: unknown) =>
    isRecord(item) &&
    typeof item.name === 'string' &&
    typeof item.description === 'string' &&
    typeof item.sourceUrl === 'string'
  return Boolean(
    isRecord(query) && typeof query.original === 'string' &&
    Array.isArray(report.diseaseResearch) && report.diseaseResearch.every(validDisease) &&
    Array.isArray(report.medicines) && report.medicines.every(validMedicine) &&
    Array.isArray(report.interactions) && report.interactions.every(validInteraction) &&
    Array.isArray(report.regulatoryFindings) && report.regulatoryFindings.every(validFinding) &&
    Array.isArray(report.researchEvidence) && report.researchEvidence.every(validEvidence) &&
    Array.isArray(report.clinicalTrials) && report.clinicalTrials.every(validTrial) &&
    isRecord(report.patientRiskAssessment) &&
    Array.isArray(report.patientRiskAssessment.suppliedFactors) &&
    report.patientRiskAssessment.suppliedFactors.every((item) => typeof item === 'string') &&
    (report.patientRiskAssessment.status === 'not_assessed' || report.patientRiskAssessment.status === 'source_information_available') &&
    Array.isArray(report.patientRiskAssessment.notes) &&
    report.patientRiskAssessment.notes.every((item) => typeof item === 'string') &&
    Array.isArray(report.sources) && report.sources.every(validSource) &&
    Array.isArray(report.limitations) && report.limitations.every((item) => typeof item === 'string') &&
    isRecord(suitability) &&
    typeof suitability.classification === 'string' &&
    typeof suitability.finalAssessment === 'string' &&
    typeof suitability.evidenceCoverage === 'number' &&
    typeof suitability.evidenceConfidence === 'string' &&
    typeof suitability.safetyOverride === 'boolean' &&
    Array.isArray(suitability.limitations) &&
    suitability.limitations.every((item) => typeof item === 'string') &&
    (suitability.overallScore === null || (
      typeof suitability.overallScore === 'number' &&
      Number.isFinite(suitability.overallScore) &&
      suitability.overallScore >= 0 &&
      suitability.overallScore <= 100
    )) &&
    Array.isArray(suitability.scoreBreakdown) &&
    suitability.scoreBreakdown.every((item) =>
      isRecord(item) &&
      typeof item.name === 'string' &&
      typeof item.rationale === 'string' &&
      typeof item.weight === 'number' &&
      (item.score === null || (typeof item.score === 'number' && Number.isFinite(item.score))) &&
      Array.isArray(item.sourceUrls) &&
      item.sourceUrls.every((url) => typeof url === 'string'),
    ),
  )
}

function sourceLine(source: { title: string; publisher: string; url: string }) {
  return `${source.title} — ${source.publisher}. ${source.url}`
}

function buildDrugProfileSection(
  id: string,
  structured: PharmaceuticalIntelligenceReport | undefined,
) {
  const medicines = structured?.medicines ?? []
  const paragraphs = medicines.flatMap((medicine) => [
    `Generic name: ${medicine.genericName ?? 'Not verified in the available sources.'}.`,
    `Drug classification: ${medicine.drugClass ?? 'Not verified in the available sources.'}.`,
    `Brand names: ${medicine.brandNames.join(', ') || 'Not verified in the available sources.'}.`,
    `Active ingredients: ${medicine.activeIngredients.join(', ') || 'Not verified in the available sources.'}.`,
    `Mechanism of action: ${medicine.labelSections.mechanism_of_action ?? 'Not verified in the available sources.'}.`,
    `FDA label indication text: ${medicine.labelIndications ?? 'Not verified in the available sources.'}. This label text is not confirmation of approval in the selected jurisdiction.`,
    ...medicine.composition.map((product) => {
      const ingredients = product.activeIngredients
        .map((ingredient) => `${ingredient.name} (${ingredient.strength ?? 'strength not listed'})`)
        .join(', ') || 'Not verified'
      return `Composition/formulation: ${product.productName ?? 'Product name not listed'}; ${ingredients}; ${product.dosageForm ?? 'formulation not listed'}; ${product.market}. ${product.listingNote} Source: ${product.sourceUrl}`
    }),
    ...medicine.sources.map(sourceLine),
  ])
  return {
    id: `${id}-profile`,
    number: 2,
    title: 'Drug Profile and Composition',
    paragraphs: paragraphs.length
      ? paragraphs
      : ['Generic name, composition, strength, formulation, mechanism, and indication details were not returned by the available backend sources.'],
  }
}

function buildIndicationsSection(
  id: string,
  input: DrugSummaryInput,
  structured: PharmaceuticalIntelligenceReport | undefined,
) {
  const paragraphs = [
    `Target condition: ${input.diseaseName}.`,
    `Symptoms supplied: ${input.symptoms?.trim() || 'None supplied.'}`,
    'Symptoms do not establish a diagnosis.',
  ]
  if (structured?.medicines.length) {
    for (const medicine of structured.medicines) {
      paragraphs.push(
        `Jurisdiction-approved indications: ${medicine.approvedIndications.length
          ? medicine.approvedIndications.join('; ')
          : 'Not verified in the available sources.'}`,
        `FDA label indication text: ${medicine.labelIndications ?? 'Not verified in the available sources.'}`,
        'Other established uses and symptom-only benefits were not separately verified; no inference is made from the mechanism alone.',
      )
    }
    for (const disease of structured.diseaseResearch) {
      paragraphs.push(`Disease reference: ${disease.name}. ${disease.description} Source: ${disease.sourceUrl}`)
    }
    for (const trial of structured.clinicalTrials) {
      paragraphs.push(`Investigational record (not proof of efficacy): ${trial.title} (${trial.nctId}); ${trial.phase}; ${trial.status}. ${trial.url}`)
    }
  } else {
    paragraphs.push('Approved, off-label, investigational, and symptom-management uses were not returned as structured backend data.')
  }
  return {
    id: `${id}-relevance`,
    number: 3,
    title: 'Disease and Symptom Relevance',
    paragraphs,
  }
}

function getValidatedSuitabilityScore(
  assessment: PharmaceuticalIntelligenceReport['suitability'] | undefined,
) {
  const valid = typeof assessment?.overallScore === 'number'
    && Number.isFinite(assessment.overallScore)
    && assessment.overallScore >= 0
    && assessment.overallScore <= 100
    && assessment.scoreBreakdown.length === 5
    && assessment.evidenceCoverage === 100
    && assessment.scoreBreakdown.every((item) =>
      typeof item.score === 'number'
      && Number.isFinite(item.score)
      && item.score >= 0
      && item.score <= 100
      && item.rationale.trim().length > 0
      && item.sourceUrls.length > 0,
    )
  return valid ? assessment.overallScore : null
}

function getEvidenceScoringCoverage(
  assessment: PharmaceuticalIntelligenceReport['suitability'] | undefined,
) {
  const coverage = assessment?.evidenceCoverage
  return typeof coverage === 'number' && Number.isFinite(coverage) && coverage >= 0 && coverage <= 100
    ? Math.round(coverage)
    : 0
}

function buildSuitabilityScoreSection(
  id: string,
  structured: PharmaceuticalIntelligenceReport | undefined,
) {
  const assessment = structured?.suitability
  const score = getValidatedSuitabilityScore(assessment)
  const coverage = getEvidenceScoringCoverage(assessment)
  const paragraphs = [
    `Overall suitability score: ${score === null ? `Not calculable; ${coverage}% of scoring criteria assessed.` : `${Math.round(score)}%`}`,
    `Evidence confidence: ${assessment?.evidenceConfidence ?? 'Insufficient'}.`,
    `Evidence scoring coverage: ${coverage}% of criteria assessed. This measures completeness of the assessment, not the likelihood that the drug will work.`,
    `Research classification: ${assessment?.classification ?? 'Insufficient evidence to assess.'}`,
  ]
  if (score !== null && assessment) {
    paragraphs.push(...assessment.scoreBreakdown.map((item) =>
      `${item.name} (${Math.round(item.weight * 100)}% weight): ${item.score}%. ${item.rationale} Sources: ${item.sourceUrls.join(', ')}`,
    ))
    paragraphs.push(assessment.finalAssessment)
  } else {
    paragraphs.push(
      'The backend did not return a complete, source-cited score breakdown. An LLM summary or record count is not sufficient to calculate a suitability score.',
      ...(assessment?.limitations ?? []),
    )
  }
  if (assessment?.safetyOverride) {
    paragraphs.push('Safety override: a verified serious safety or regulatory concern blocks positive research classification and cannot be overridden by a score.')
  }
  if (assessment?.findingsAgree === false) paragraphs.push('The backend reports conflicting findings; these remain a material limitation.')
  return { id: `${id}-score`, number: 4, title: 'Drug Suitability Score', paragraphs }
}

function buildAlternativesSection(id: string) {
  return {
    id: `${id}-alternatives`,
    number: 5,
    title: 'Existing Medicines and Alternative Options',
    paragraphs: [
      'No structured alternatives search is available from the current report-generation response. The alternatives search was not completed.',
      'No alternative treatment is recommended or ranked.',
    ],
  }
}

function buildInteractionSection(
  id: string,
  input: DrugSummaryInput,
  structured: PharmaceuticalIntelligenceReport | undefined,
) {
  const interactions = structured?.interactions ?? []
  const paragraphs = interactions.map((item) =>
    `${item.medicineA} + ${item.medicineB}: ${item.severity}. ${item.interactionType}. ${item.clinicalConsequences} Mechanism: ${item.mechanism}. Review: ${item.recommendedReview} Sources: ${item.sourceUrls.join(', ') || 'No source returned.'}`,
  )
  if (!input.currentMedications?.length) {
    paragraphs.unshift('No current medications were supplied; pairwise interaction analysis was not performed.')
  } else if (!interactions.length) {
    paragraphs.push('No interaction findings were returned. This is not a negative interaction check and does not establish safety.')
  }
  if (!structured) paragraphs.push('Interaction verification is unavailable because no structured interaction assessment was returned by the backend.')
  if (structured && interactions.some((item) => item.severity === 'unknown' || item.verificationRequired)) {
    paragraphs.push('At least one interaction remains unknown or requires pharmacist/clinician verification. Do not start, stop, or combine medicines based only on this report.')
  }
  return { id: `${id}-interactions`, number: 6, title: 'Drug–Drug Interaction Report', paragraphs }
}

function buildContraindicationsSection(
  id: string,
  structured: PharmaceuticalIntelligenceReport | undefined,
) {
  const paragraphs: string[] = []
  for (const medicine of structured?.medicines ?? []) {
    paragraphs.push(
      ...medicine.contraindications.map((item) => `Formal contraindication (label text): ${item}`),
      ...medicine.precautions.map((item) => `Precaution (label text; not necessarily a contraindication): ${item}`),
      ...Object.entries(medicine.labelSections)
        .filter(([key]) => [
          'use_in_specific_populations', 'pregnancy', 'lactation', 'pediatric_use',
          'geriatric_use', 'renal_impairment', 'hepatic_impairment',
        ].includes(key))
        .map(([key, text]) => `${key.replace(/_/g, ' ')} (label text): ${text}`),
    )
  }
  const risk = structured?.patientRiskAssessment
  paragraphs.push(
    `Patient-specific risk assessment: ${risk?.status === 'source_information_available' ? 'Not performed; label information is available but was not matched to an individual.' : 'Not assessed.'}`,
    `Risk factors supplied: ${risk?.suppliedFactors.join(', ') || 'None supplied.'}`,
    ...(risk?.notes ?? []),
  )
  if (!paragraphs.some((item) => /contraindication|precaution|\(label text\)/i.test(item))) {
    paragraphs.unshift('Contraindications and precautions were not verified in the available sources.')
  }
  return { id: `${id}-contraindications`, number: 7, title: 'Contraindications and Patient Risk Factors', paragraphs }
}

function buildAdverseEffectsSection(
  id: string,
  structured: PharmaceuticalIntelligenceReport | undefined,
) {
  const paragraphs = (structured?.medicines ?? []).flatMap((medicine) => [
    ...medicine.safetyInformation.map((item) => `Label safety/adverse-effect text: ${item}`),
    ...Object.entries(medicine.labelSections)
      .filter(([key]) => ['warnings_and_cautions', 'laboratory_tests', 'patient_counseling_information'].includes(key))
      .map(([key, text]) => `${key.replace(/_/g, ' ')}: ${text}`),
    ...medicine.sources.map(sourceLine),
  ])
  return {
    id: `${id}-adverse-effects`,
    number: 8,
    title: 'Adverse Effects and Monitoring',
    paragraphs: paragraphs.length
      ? paragraphs
      : ['Adverse effects and monitoring requirements were not verified in the available sources.'],
  }
}

function buildRegulatorySection(
  id: string,
  input: DrugSummaryInput,
  structured: PharmaceuticalIntelligenceReport | undefined,
) {
  const findings = structured?.regulatoryFindings ?? []
  const paragraphs = findings.map((item) =>
    `${item.medicine} — ${item.country}: ${item.status}; verification: ${item.verificationStatus}. Scope: ${item.scope}. Reason: ${item.reason ?? 'Not verified.'} Effective date: ${item.effectiveDate ?? 'Not available.'} Authority: ${item.authority ?? 'Not identified.'} Source: ${item.sourceUrl ?? 'Not available.'} Checked: ${item.lastChecked}.`,
  )
  if (!input.country?.trim()) paragraphs.unshift('No jurisdiction was selected; regulatory status was not assessed.')
  else if (!findings.length) paragraphs.push(`Status for ${input.country} could not be verified from authoritative regulatory records. Absence of a restriction record does not establish approval or legality.`)
  return { id: `${id}-regulatory`, number: 9, title: 'Banned, Restricted, or Withdrawn Status', paragraphs }
}

function buildLifestyleSection(
  id: string,
  structured: PharmaceuticalIntelligenceReport | undefined,
) {
  const paragraphs = (structured?.medicines ?? []).flatMap((medicine) =>
    ['food_effect', 'alcohol'].flatMap((key) => {
      const text = medicine.labelSections[key]
      return text ? [`${key === 'food_effect' ? 'Food' : 'Alcohol'} (label text): ${text}`, ...medicine.sources.map(sourceLine)] : []
    }),
  )
  if (!paragraphs.length) paragraphs.push('Food, alcohol, supplement, herbal-product, and lifestyle interactions were not verified in the available sources. Missing information is not proof of no interaction.')
  return { id: `${id}-lifestyle`, number: 10, title: 'Food, Alcohol, and Lifestyle Interactions', paragraphs }
}

function buildEvidenceSection(
  id: string,
  result: DrugSummary,
  structured: PharmaceuticalIntelligenceReport | undefined,
) {
  const paragraphs = [
    ...(result.analysisProcess ?? []),
    `AI/source summary (${result.summarySource ?? 'source not specified'}): ${result.summary}`,
    ...(structured?.researchEvidence.map((item) =>
      `${item.title}; ${item.evidenceType}; ${item.publicationDate ?? 'date not listed'}. ${item.summary} Source: ${item.url}`,
    ) ?? []),
    ...(structured?.clinicalTrials.map((item) =>
      `${item.title} (${item.nctId}); ${item.phase}; ${item.status}; updated ${item.lastUpdated ?? 'date not listed'}. ${item.summary} Source: ${item.url}`,
    ) ?? []),
  ]
  if (!structured?.researchEvidence.length) paragraphs.push('No structured publication records were returned.')
  if (!structured?.clinicalTrials.length) paragraphs.push('No structured clinical trial records were returned.')
  if (structured?.synthesisStatus === 'unavailable') paragraphs.push(`AI synthesis unavailable: ${structured.synthesisError ?? 'see retrieved source records.'}`)
  if (structured?.limitations.length) paragraphs.push(...structured.limitations.map((item) => `Limitation: ${item}`))
  return { id: `${id}-evidence`, number: 11, title: 'Evidence Summary', paragraphs }
}

function collectReportSources(
  result: DrugSummary,
  structured: PharmaceuticalIntelligenceReport | undefined,
) {
  const citedSources = [
    ...(structured?.diseaseResearch.map((item) => ({
      title: item.name,
      publisher: 'EBI Disease Ontology',
      url: item.sourceUrl,
    })) ?? []),
    ...(structured?.researchEvidence.map((item) => ({
      title: item.title,
      publisher: 'PubMed',
      url: item.url,
    })) ?? []),
    ...(structured?.clinicalTrials.map((item) => ({
      title: item.title,
      publisher: 'ClinicalTrials.gov',
      url: item.url,
    })) ?? []),
    ...(structured?.medicines.flatMap((medicine) => medicine.composition.map((product) => ({
      title: product.productName ?? 'Drug product listing',
      publisher: 'U.S. Food and Drug Administration',
      url: product.sourceUrl,
    }))) ?? []),
    ...(structured?.interactions.flatMap((item) => item.sourceUrls.map((url) => ({
      title: `Interaction evidence: ${item.medicineA} and ${item.medicineB}`,
      publisher: 'Source cited by backend',
      url,
    }))) ?? []),
    ...(structured?.regulatoryFindings.flatMap((item) => item.sourceUrl ? [{
      title: `Regulatory status: ${item.medicine} — ${item.country}`,
      publisher: item.authority ?? 'Regulatory authority',
      url: item.sourceUrl,
    }] : []) ?? []),
    ...(structured?.suitability.scoreBreakdown.flatMap((item) => item.sourceUrls.map((url) => ({
      title: `Suitability evidence: ${item.name}`,
      publisher: 'Source cited by backend',
      url,
    }))) ?? []),
  ]
  const sources = [...(result.sources ?? []), ...(structured?.sources ?? []), ...citedSources]
  return [...new Map(
    sources
      .filter((source) => source && typeof source.title === 'string' && typeof source.publisher === 'string' && /^https?:\/\//i.test(source.url))
      .map((source) => [source.url, source]),
  ).values()]
}

function buildFinalAssessmentSection(
  id: string,
  structured: PharmaceuticalIntelligenceReport | undefined,
) {
  const assessment = structured?.suitability
  return {
    id: `${id}-assessment`,
    number: 12,
    title: 'Final Research Assessment',
    paragraphs: [
      assessment?.finalAssessment ?? 'Insufficient evidence to assess from the information returned by this workflow.',
      `Research classification: ${assessment?.classification ?? 'Insufficient evidence to assess.'}`,
      `Evidence confidence: ${assessment?.evidenceConfidence ?? 'Insufficient'}; coverage: ${assessment ? `${assessment.evidenceCoverage}%` : 'not assessed'}.`,
      assessment?.safetyOverride
        ? 'A verified serious safety or regulatory concern blocks positive classification.'
        : 'No conclusion about individual safety is made.',
      'This is a research summary, not diagnosis, medical advice, or a recommendation to start, stop, or change medication.',
    ],
  }
}

function buildReferencesSection(
  id: string,
  result: DrugSummary,
  structured: PharmaceuticalIntelligenceReport | undefined,
) {
  const unique = collectReportSources(result, structured)
  return {
    id: `${id}-references`,
    number: 13,
    title: 'Sources and References',
    paragraphs: unique.length
      ? unique.map((source) => `${source.title} — ${source.publisher}. ${source.url}`)
      : ['No source references with valid HTTP(S) URLs were returned.'],
  }
}

export function getSavedAnalysisReport(userId: string, reportId: string): SavedAnalysisReport | null {
  return readSavedAnalysisReports(userId).find((savedReport) => savedReport.id === reportId) ?? null
}

export function createDrugResearchReport(
  userId: string,
  input: DrugSummaryInput,
  result: DrugSummary,
  structuredReport?: PharmaceuticalIntelligenceReport,
): SavedAnalysisReport {
  if (!result || typeof result.summary !== 'string' || !result.summary.trim()) {
    throw new Error('The drug research summary is missing or invalid.')
  }
  if (structuredReport && !isPharmaceuticalReport(structuredReport)) {
    throw new Error('Structured drug analysis data is invalid; the report was not saved.')
  }
  const createdAt = new Date().toISOString()
  const id = `live-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const suitability = structuredReport?.suitability
  const suitabilityScore = getValidatedSuitabilityScore(suitability)
  const evidenceScoringCoverage = getEvidenceScoringCoverage(suitability)
  const scoreReason = suitabilityScore === null
    ? `A drug suitability score cannot be calculated because the backend returned only ${evidenceScoringCoverage}% scoring coverage and did not provide a complete, source-cited assessment of all five criteria.`
    : suitability?.scoreBreakdown.map((item) => `${item.name}: ${item.rationale}`).join(' ')
      ?? 'A complete source-cited suitability assessment was returned.'
  const sections = [
    {
      id: `${id}-overview`,
      number: 1,
      title: 'Report Overview',
      paragraphs: [
        `Research suitability score (not a measure of clinical efficacy or individual safety): ${suitabilityScore === null ? `Not calculable; evidence scoring coverage is ${evidenceScoringCoverage}%.` : `${Math.round(suitabilityScore)}%`}`,
        `Reason: ${scoreReason}`,
        `Report generated: ${new Date(createdAt).toLocaleString()}.`,
        `Drug name: ${input.drugName}.`,
        `Generic name: ${structuredReport?.medicines[0]?.genericName ?? 'Not verified in the available sources.'}.`,
        `Active ingredient: ${structuredReport?.medicines[0]?.activeIngredients.join(', ') || 'Not verified in the available sources.'}.`,
        `Target condition: ${input.diseaseName}.`,
        `Symptoms supplied: ${input.symptoms?.trim() || 'None supplied.'}.`,
        `Country/regulatory jurisdiction: ${input.country?.trim() || 'None supplied.'}.`,
        `Research question: assess the available evidence for ${input.drugName} in relation to ${input.diseaseName}.`,
        ...(input.objective?.trim() ? [`Research objective: ${input.objective.trim()}`] : []),
        `Current medicines supplied: ${input.currentMedications?.join(', ') || 'None supplied.'}.`,
      ],
    },
    buildDrugProfileSection(id, structuredReport),
    buildIndicationsSection(id, input, structuredReport),
    buildSuitabilityScoreSection(id, structuredReport),
    buildAlternativesSection(id),
    buildInteractionSection(id, input, structuredReport),
    buildContraindicationsSection(id, structuredReport),
    buildAdverseEffectsSection(id, structuredReport),
    buildRegulatorySection(id, input, structuredReport),
    buildLifestyleSection(id, structuredReport),
    buildEvidenceSection(id, result, structuredReport),
    buildFinalAssessmentSection(id, structuredReport),
    buildReferencesSection(id, result, structuredReport),
  ]
  const uniqueSources = collectReportSources(result, structuredReport)
  const report: ResearchReport = {
    id,
    analysisId: id,
    title: `Drug and condition research: ${input.drugName} and ${input.diseaseName}`,
    subtitle: 'Plain-language live research report',
    generatedAt: createdAt,
    sections,
    references: uniqueSources.map((source, index) => ({
      id: `${id}-source-${index + 1}`,
      citation: sourceLine(source),
    })),
  }
  const saved: SavedAnalysisReport = {
    id,
    drugName: input.drugName,
    diseaseName: input.diseaseName,
    createdAt,
    report,
  }
  const reports = readSavedAnalysisReports(userId)
  localStorage.setItem(storageKey(userId), JSON.stringify([saved, ...reports].slice(0, 50)))
  return saved
}
