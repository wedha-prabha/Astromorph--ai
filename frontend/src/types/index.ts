export type ID = string

export interface User {
  id: ID
  name: string
  email: string
  role: string
  organization: string
  initials: string
}

export interface AnalysisSummary {
  id: ID
  drugName: string
  diseaseName: string
  confidence: number | null
  evidenceBand: string | null
  status: 'Completed' | 'Processing' | 'Queued' | 'Failed'
  updatedAt: string
  createdAt: string
}

export type AgentStatus = 'completed' | 'processing' | 'waiting' | 'error'

export interface AgentRun {
  id: ID
  name: string
  shortName: string
  order: number
  status: AgentStatus
  durationSec: number | null
  sources: number | null
  activity: string
  detail?: string
}

export interface EvidenceDimension {
  id: ID
  key: string
  label: string
  score: number
  sources: number
  description: string
}

export interface Analysis {
  id: ID
  title: string
  drugId: ID
  diseaseId: ID
  drugName: string
  diseaseName: string
  objective: string
  status: 'Completed' | 'Processing' | 'Queued' | 'Failed'
  overallScore: number
  evidenceBand: string
  dimensions: EvidenceDimension[]
  agents: AgentRun[]
  summaryOverview: string[]
  keyFinding: string
  evidenceStrength: string
  researchGap: string
  nextInvestigation: string[]
  createdAt: string
  updatedAt: string
}

export interface ActivityEvent {
  id: ID
  kind: 'literature' | 'trial' | 'graph' | 'safety' | 'report' | 'analysis'
  label: string
  detail: string
  timestamp: string
}

export type SourceType = 'Literature' | 'Clinical Trial' | 'Safety' | 'Molecular' | 'Guideline'

export interface EvidenceSource {
  id: ID
  analysisId: ID
  title: string
  database: string
  type: SourceType
  year: number
  relevance: number
  evidenceLevel: string
  citation: string
}

export type KgNodeType =
  | 'drug'
  | 'disease'
  | 'protein'
  | 'gene'
  | 'pathway'
  | 'process'
  | 'trial'
  | 'paper'
  | 'adverse'

export interface KgNode {
  id: ID
  label: string
  type: KgNodeType
  evidenceCount: number
  description: string
}

export interface KgEdge {
  id: ID
  source: ID
  target: ID
  relation: string
  evidenceCount: number
}

export interface KnowledgeGraphData {
  analysisId: ID
  nodes: KgNode[]
  edges: KgEdge[]
}

export interface DrugTarget {
  name: string
  kind: string
  affinity: string
  role: string
}

export interface RepurposingCandidate {
  disease: string
  score: number
  band: string
  status: string
  analysisId: ID | null
}

export interface AdverseEventEntry {
  event: string
  frequency: string
  severity: 'common' | 'rare' | 'serious' | 'not-classified'
}

export interface Drug {
  id: ID
  name: string
  brandNames: string[]
  drugClass: string
  atcCode: string
  approvalYear: number
  description: string
  mechanism: string
  targets: DrugTarget[]
  indications: { indication: string; status: string }[]
  pharmacokinetics: { label: string; value: string }[]
  boxedWarning: string | null
  commonAdverseEvents: AdverseEventEntry[]
  contraindications: string[]
  repurposingCandidates: RepurposingCandidate[]
  stats: { trials: number; publications: number; pathways: number; targets: number }
  detailed: boolean
  sourceUrl?: string
  effectiveDate?: string
}

export interface DiseaseTreatment {
  name: string
  drugClass: string
  line: string
}

export interface Disease {
  id: ID
  name: string
  icd10: string
  category: string
  prevalence: string
  mortality: string
  description: string
  symptoms: string[]
  pathways: { name: string; role: string }[]
  genes: { symbol: string; name: string; association: string }[]
  proteinTargets: { name: string; kind: string; note: string }[]
  treatments: DiseaseTreatment[]
  unmetNeed: string
  candidates: RepurposingCandidate[]
  stats: { trials: number; publications: number; pathways: number; targets: number }
  detailed: boolean
  sourceUrl?: string
}

export interface ClinicalTrial {
  id: ID
  nctId: string
  title: string
  drug: string
  condition: string
  phase: 'Phase 1' | 'Phase 2' | 'Phase 3' | 'Phase 4' | 'N/A'
  status: string
  sponsor: string
  startDate: string
  enrollment: number
  locations: { city: string; country: string }[]
  summary: string
  primaryOutcome: string
}

export interface Paper {
  id: ID
  pmid: string
  title: string
  authors: string
  journal: string
  year: number
  publicationDate?: string
  abstractSnippet: string
  relevanceScore: number
  evidenceLevel: string
  studyType: string
  drugIds: ID[]
  diseaseIds: ID[]
}

export interface ReportSection {
  id: ID
  number: number
  title: string
  paragraphs: string[]
  callout?: { title: string; text: string }
}

export interface ResearchReport {
  id: ID
  analysisId: ID
  title: string
  subtitle: string
  generatedAt: string
  sections: ReportSection[]
  references: { id: ID; citation: string }[]
}

export interface SavedItem {
  id: ID
  kind: 'analysis' | 'paper' | 'trial' | 'graph-view'
  title: string
  meta: string
  savedAt: string
}

export interface NotificationItem {
  id: ID
  title: string
  detail: string
  time: string
  unread: boolean
  kind: 'analysis' | 'evidence' | 'system' | 'team'
}

export interface KpiStat {
  id: ID
  label: string
  value: string
  delta: string
  deltaTone: 'up' | 'down' | 'neutral'
  hint: string
}
