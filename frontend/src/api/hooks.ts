import { useQuery } from '@tanstack/react-query'
import { endpoints, type DrugSummaryInput, type LiteratureFilters, type TrialFilters } from '@/api/endpoints'

export const queryKeys = {
  analyses: ['analyses'] as const,
  analysis: (id: string) => ['analysis', id] as const,
  agents: (id: string) => ['agents', id] as const,
  evidence: (id: string, type?: string) => ['evidence', id, type ?? 'all'] as const,
  graph: (id: string) => ['graph', id] as const,
  report: (id: string) => ['report', id] as const,
  activity: ['activity'] as const,
  drugs: (query: string) => ['drugs', query] as const,
  drug: (id: string) => ['drug', id] as const,
  diseases: (query: string) => ['diseases', query] as const,
  disease: (id: string) => ['disease', id] as const,
  trials: (f: TrialFilters) => ['trials', f] as const,
  literature: (f: LiteratureFilters) => ['literature', f] as const,
  saved: ['saved'] as const,
  notifications: ['notifications'] as const,
}

export function useAnalyses() {
  return useQuery({ queryKey: queryKeys.analyses, queryFn: endpoints.listAnalyses })
}

export function useDrugSummary(input: DrugSummaryInput | null) {
  return useQuery({
    queryKey: ['drug-summary', input?.drugName ?? '', input?.diseaseName ?? '', input?.objective ?? ''],
    queryFn: () => endpoints.summarizeDrug(input!),
    enabled: !!input,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  })
}

export function useAnalysis(id: string | undefined) {
  return useQuery({ queryKey: queryKeys.analysis(id ?? ''), queryFn: () => endpoints.getAnalysis(id!), enabled: !!id })
}

export function useAnalysisAgents(id: string | undefined) {
  return useQuery({ queryKey: queryKeys.agents(id ?? ''), queryFn: () => endpoints.getAnalysisAgents(id!), enabled: !!id })
}

export function useEvidence(id: string | undefined, type?: string) {
  return useQuery({
    queryKey: queryKeys.evidence(id ?? '', type),
    queryFn: () => endpoints.getAnalysisEvidence(id!, type),
    enabled: !!id,
  })
}

export function useKnowledgeGraph(id: string | undefined) {
  return useQuery({ queryKey: queryKeys.graph(id ?? ''), queryFn: () => endpoints.getKnowledgeGraph(id!), enabled: !!id })
}

export function useReport(id: string | undefined) {
  return useQuery({ queryKey: queryKeys.report(id ?? ''), queryFn: () => endpoints.getReport(id!), enabled: !!id })
}

export function useActivity() {
  return useQuery({ queryKey: queryKeys.activity, queryFn: endpoints.getActivity })
}

export function useStats() {
  return useQuery({ queryKey: ['stats'], queryFn: endpoints.getStats })
}

export function useDrugs(query = '') {
  return useQuery({
    queryKey: queryKeys.drugs(query),
    queryFn: () => endpoints.listDrugs(query),
    enabled: query.trim().length >= 2,
  })
}

export function useDrug(id: string | undefined) {
  return useQuery({ queryKey: queryKeys.drug(id ?? ''), queryFn: () => endpoints.getDrug(id!), enabled: !!id })
}

export function useDiseases(query = '') {
  return useQuery({
    queryKey: queryKeys.diseases(query),
    queryFn: () => endpoints.listDiseases(query),
    enabled: query.trim().length >= 2,
  })
}

export function useDisease(id: string | undefined) {
  return useQuery({ queryKey: queryKeys.disease(id ?? ''), queryFn: () => endpoints.getDisease(id!), enabled: !!id })
}

export function useTrials(filters: TrialFilters = {}) {
  return useQuery({ queryKey: queryKeys.trials(filters), queryFn: () => endpoints.listTrials(filters) })
}

export function useLiterature(filters: LiteratureFilters = {}) {
  return useQuery({ queryKey: queryKeys.literature(filters), queryFn: () => endpoints.listLiterature(filters) })
}

export function useSavedItems() {
  return useQuery({ queryKey: queryKeys.saved, queryFn: endpoints.listSaved })
}

export function useNotifications() {
  return useQuery({ queryKey: queryKeys.notifications, queryFn: endpoints.listNotifications })
}
