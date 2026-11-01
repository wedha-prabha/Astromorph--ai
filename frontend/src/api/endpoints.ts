import { apiRequest, type AnalysisInput } from './client'
import type {
  ActivityEvent,
  AgentRun,
  Analysis,
  AnalysisSummary,
  ClinicalTrial,
  Disease,
  Drug,
  EvidenceSource,
  KpiStat,
  NotificationItem,
  Paper,
  ResearchReport,
  SavedItem,
} from '@/types'

/**
 * Typed endpoint catalog. UI code consumes this service layer only —
 * no component imports mock data or calls fetch directly.
 */
export const endpoints = {
  // authentication
  getCurrentUser: () => apiRequest<FirebaseIdentity>('/api/auth/me'),

  // analyses
  summarizeDrug: (input: DrugSummaryInput) =>
    apiRequest<DrugSummary>('/api/analysis/drug-summary', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  getPharmaceuticalIntelligence: (input: PharmaceuticalIntelligenceRequest) =>
    apiRequest<PharmaceuticalIntelligenceReport>('/api/pharmaceutical-intelligence', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  searchDrugSuggestions: (query: string) =>
    apiRequest<DrugSuggestion[]>(withQ('/api/drug-suggestions', { query })),
  listAnalyses: () => apiRequest<AnalysisSummary[]>('/api/analyses'),
  getAnalysis: (id: string) => apiRequest<Analysis>(`/api/analyses/${id}`),
  getAnalysisAgents: (id: string) => apiRequest<AgentRun[]>(`/api/analyses/${id}/agents`),
  getAnalysisEvidence: (id: string, type?: string) =>
    apiRequest<EvidenceSource[]>(withQ(`/api/analyses/${id}/evidence`, { type })),
  getReport: (id: string) => apiRequest<ResearchReport>(`/api/analyses/${id}/report`),
  createAnalysis: (input: AnalysisInput) =>
    apiRequest<Analysis>('/api/analyses', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  // platform
  getActivity: () => apiRequest<ActivityEvent[]>('/api/activity'),
  getStats: () => apiRequest<KpiStat[]>('/api/stats'),

  // intelligence
  listDrugs: (query?: string) => apiRequest<Drug[]>(withQ('/api/drugs', { query })),
  getDrug: (id: string) => apiRequest<Drug>(`/api/drugs/${id}`),
  listDiseases: (query?: string) => apiRequest<Disease[]>(withQ('/api/diseases', { query })),
  getDisease: (id: string) => apiRequest<Disease>(`/api/diseases/${id}`),

  // explorers
  listTrials: (filters?: TrialFilters) => apiRequest<SearchResults<ClinicalTrial>>(withQ('/api/clinical-trials', filters)),
  listLiterature: (filters?: LiteratureFilters) => apiRequest<SearchResults<Paper>>(withQ('/api/literature', filters)),

  // workspace
  listSaved: () => apiRequest<SavedItem[]>('/api/saved'),
  listNotifications: () => apiRequest<NotificationItem[]>('/api/notifications'),
}

export interface DrugSummaryInput {
  drugName: string
  diseaseName: string
  objective?: string
  symptoms?: string
  country?: string
  currentMedications?: string[]
  patientRiskFactors?: string
}

export interface DrugSummary {
  summary: string
  summarySource?: 'gemini' | 'retrieved_evidence'
  analysisProcess?: string[]
  sources?: { title: string; publisher: string; url: string }[]
  generatedAt?: string
}

export interface PharmaceuticalIntelligenceRequest {
  query?: string
  diseaseName?: string
  symptoms?: string
  drugName?: string
  brandName?: string
  country?: string
  researchFocus?: string
  currentMedications?: string[]
  patientRiskFactors?: string
}

export interface DrugSuggestion {
  productNdc: string
  brandName: string | null
  genericName: string | null
  activeIngredients: { name: string; strength: string | null }[]
  dosageForm: string | null
  sourceUrl: string
  source: string
  limitation: string
}

export interface PharmaSource {
  title: string
  publisher: string
  url: string
  retrievedAt: string
  publicationDate: string | null
  retrievalStatus: 'retrieved' | 'unavailable'
}

export interface PharmaceuticalIntelligenceReport {
  query: {
    original: string
    type: 'disease' | 'symptoms' | 'drug' | 'brand' | 'combined' | 'unknown'
    normalizedEntities: { kind: string; value: string }[]
    ambiguities: string[]
  }
  summary: string | null
  synthesisStatus: 'available' | 'unavailable'
  synthesisError: string | null
  diseaseResearch: { name: string; description: string; sourceUrl: string }[]
  medicines: {
    genericName: string | null
    drugClass: string | null
    brandNames: string[]
    activeIngredients: string[]
    composition: {
      productName: string | null
      activeIngredients: { name: string; strength: string | null }[]
      excipients: string[]
      dosageForm: string | null
      manufacturer: string | null
      market: string
      marketingStartDate: string | null
      marketingEndDate: string | null
      listingExpirationDate: string | null
      marketingCategory: string | null
      sourceUrl: string
      listingNote: string
    }[]
    labelIndications: string | null
    approvedIndications: string[]
    contraindications: string[]
    precautions: string[]
    safetyInformation: string[]
    labelSections: Record<string, string>
    countryStatus: RegulatoryFinding[]
    sources: PharmaSource[]
  }[]
  interactions: {
    medicineA: string
    medicineB: string
    severity: 'contraindicated' | 'major' | 'moderate' | 'minor' | 'none_identified' | 'unknown'
    interactionType: string
    clinicalConsequences: string
    mechanism: string
    riskFactors: string[]
    recommendedReview: string
    sourceUrls: string[]
    verificationRequired: boolean
  }[]
  patientRiskAssessment: {
    status: 'not_assessed' | 'source_information_available'
    suppliedFactors: string[]
    notes: string[]
  }
  regulatoryFindings: RegulatoryFinding[]
  researchEvidence: {
    title: string
    evidenceType: string
    summary: string
    url: string
    publicationDate: string | null
  }[]
  clinicalTrials: {
    nctId: string
    title: string
    phase: string
    status: string
    summary: string
    url: string
    lastUpdated: string | null
  }[]
  suitability: {
    overallScore: number | null
    classification: string
    evidenceConfidence: 'High' | 'Moderate' | 'Low' | 'Insufficient'
    evidenceCoverage: number
    scoreBreakdown: {
      name: string
      weight: number
      score: number | null
      rationale: string
      sourceUrls: string[]
    }[]
    relevantStudiesCount: number | null
    relevantHumanStudiesCount: number | null
    recordsRetrieved: number
    clinicalTrialsCount: number
    findingsAgree: boolean | null
    safetyInformationUnknown: boolean
    safetyOverride: boolean
    finalAssessment: string
    limitations: string[]
  }
  sources: PharmaSource[]
  limitations: string[]
  generatedAt: string
}

export interface RegulatoryFinding {
  medicine: string
  country: string
  status: 'approved' | 'restricted' | 'suspended' | 'withdrawn' | 'banned' | 'not_approved' | 'unknown'
  restrictionType: string
  effectiveDate: string | null
  reason: string | null
  scope: string
  authority: string | null
  sourceUrl: string | null
  verificationStatus: 'verified' | 'partially_verified' | 'conflicting' | 'unverified'
  lastChecked: string
}

export interface SearchResults<T> {
  items: T[]
  total: number
}

export interface FirebaseIdentity {
  uid: string
  email: string | null
  name: string | null
  email_verified: boolean
  picture: string | null
}

export interface TrialFilters {
  drug?: string
  phase?: string
  status?: string
  country?: string
  sponsor?: string
  [key: string]: string | undefined
}

export interface LiteratureFilters {
  q?: string
  level?: string
  journal?: string
  studyType?: string
  yearFrom?: string
  [key: string]: string | undefined
}

function withQ(path: string, params?: Record<string, string | undefined>): string {
  if (!params) return path
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '' && v !== 'All')
    .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
    .join('&')
  return qs ? `${path}?${qs}` : path
}
