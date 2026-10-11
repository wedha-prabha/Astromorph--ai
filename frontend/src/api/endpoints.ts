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
  // analyses
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
  getStats: () => apiRequest<Record<string, never>[]>('/api/stats'),

  // intelligence
  listDrugs: () => apiRequest<Drug[]>('/api/drugs'),
  getDrug: (id: string) => apiRequest<Drug>(`/api/drugs/${id}`),
  listDiseases: () => apiRequest<Disease[]>('/api/diseases'),
  getDisease: (id: string) => apiRequest<Disease>(`/api/diseases/${id}`),

  // explorers
  listTrials: (filters?: TrialFilters) => apiRequest<ClinicalTrial[]>(withQ('/api/clinical-trials', filters)),
  listLiterature: (filters?: LiteratureFilters) => apiRequest<Paper[]>(withQ('/api/literature', filters)),

  // workspace
  listSaved: () => apiRequest<SavedItem[]>('/api/saved'),
  listNotifications: () => apiRequest<NotificationItem[]>('/api/notifications'),
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
