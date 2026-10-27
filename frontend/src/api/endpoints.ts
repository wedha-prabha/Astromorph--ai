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
  KnowledgeGraphData,
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
  listAnalyses: () => apiRequest<AnalysisSummary[]>('/api/analyses'),
  getAnalysis: (id: string) => apiRequest<Analysis>(`/api/analyses/${id}`),
  getAnalysisAgents: (id: string) => apiRequest<AgentRun[]>(`/api/analyses/${id}/agents`),
  getAnalysisEvidence: (id: string, type?: string) =>
    apiRequest<EvidenceSource[]>(withQ(`/api/analyses/${id}/evidence`, { type })),
  getKnowledgeGraph: (id: string) => apiRequest<KnowledgeGraphData>(`/api/analyses/${id}/knowledge-graph`),
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
}

export interface DrugSummary {
  summary: string
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
