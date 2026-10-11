import type { ActivityEvent, AgentRun, Analysis, AnalysisSummary, EvidenceDimension } from '@/types'

export const agents: AgentRun[] = [
  {
    id: 'agent-query-validation',
    name: 'Query Validation Agent',
    shortName: 'Query Validation',
    order: 1,
    status: 'completed',
    durationSec: 1.2,
    sources: 2,
    activity: 'Validated the drug–disease pair against UMLS ontology and internal research registries.',
  },
  {
    id: 'agent-literature-retrieval',
    name: 'Literature Retrieval Agent',
    shortName: 'Literature Retrieval',
    order: 2,
    status: 'completed',
    durationSec: 14.6,
    sources: 148,
    activity: 'Retrieved 148 relevant publications from biomedical sources.',
    detail: 'PubMed · Europe PMC · Semantic Scholar',
  },
  {
    id: 'agent-biomedical-nlp',
    name: 'Biomedical NLP Agent',
    shortName: 'Biomedical NLP',
    order: 3,
    status: 'processing',
    durationSec: 22.4,
    sources: null,
    activity: 'Extracting drug, target, and outcome entities from full-text literature.',
    detail: '3,214 entity mentions · 412 relationship candidates',
  },
  {
    id: 'agent-knowledge-graph',
    name: 'Knowledge Graph Agent',
    shortName: 'Knowledge Graph',
    order: 4,
    status: 'waiting',
    durationSec: 9.8,
    sources: 112,
    activity: 'Mapping extracted entities onto the biomedical knowledge graph.',
    detail: '112 new relationships proposed for review',
  },
  {
    id: 'agent-molecular-evidence',
    name: 'Molecular Evidence Agent',
    shortName: 'Molecular Evidence',
    order: 5,
    status: 'waiting',
    durationSec: 11.3,
    sources: 27,
    activity: 'Assessing pathway-level plausibility of leukotriene modulation in COPD.',
    detail: '27 pathway links evaluated across 6 pathways',
  },
  {
    id: 'agent-clinical-trial',
    name: 'Clinical Trial Agent',
    shortName: 'Clinical Trial',
    order: 6,
    status: 'waiting',
    durationSec: 13.1,
    sources: 23,
    activity: 'Screening ClinicalTrials.gov records for montelukast respiratory studies.',
    detail: '23 trials screened · 6 directly COPD-relevant',
  },
  {
    id: 'agent-safety-analysis',
    name: 'Safety Analysis Agent',
    shortName: 'Safety Analysis',
    order: 7,
    status: 'waiting',
    durationSec: 8.7,
    sources: 41,
    activity: 'Reviewing FDA label warnings and pharmacovigilance signals.',
    detail: '41 safety records reviewed · 1 boxed warning flagged',
  },
  {
    id: 'agent-evidence-scoring',
    name: 'Evidence Scoring Agent',
    shortName: 'Evidence Scoring',
    order: 8,
    status: 'waiting',
    durationSec: 4.2,
    sources: null,
    activity: 'Computing weighted evidence scores across five dimensions.',
    detail: 'Composite score 87 / 100 — Strong Evidence band',
  },
  {
    id: 'agent-report-generation',
    name: 'Report Generation Agent',
    shortName: 'Report Generation',
    order: 9,
    status: 'waiting',
    durationSec: 6.5,
    sources: null,
    activity: 'Composing the explainable research report with citations.',
    detail: '13 sections drafted from synthesized evidence',
  },
]

export const dimensions: EvidenceDimension[] = [
  {
    id: 'dim-biological-plausibility',
    key: 'biological',
    label: 'Biological Plausibility',
    score: 82,
    sources: 34,
    description:
      'Cysteinyl leukotrienes are elevated in COPD airways, and CysLT1 receptor expression is detectable in bronchial epithelium and sputum leukocytes of COPD patients, supporting a mechanistic rationale.',
  },
  {
    id: 'dim-literature-evidence',
    key: 'literature',
    label: 'Literature Evidence',
    score: 91,
    sources: 148,
    description:
      'A large body of peer-reviewed literature links leukotriene signaling to COPD pathophysiology, including systematic reviews of antileukotriene therapy and multiple observational cohorts.',
  },
  {
    id: 'dim-clinical-evidence',
    key: 'clinical',
    label: 'Clinical Evidence',
    score: 76,
    sources: 23,
    description:
      'Six small trials have evaluated montelukast in COPD populations. Results are mixed: modest effects on inflammatory biomarkers, but no consistent FEV1 improvement has been demonstrated.',
  },
  {
    id: 'dim-safety-profile',
    key: 'safety',
    label: 'Safety Profile',
    score: 89,
    sources: 41,
    description:
      'Montelukast is generally well tolerated after two decades of use. The neuropsychiatric boxed warning is relevant for long-term use but does not preclude further clinical investigation in COPD.',
  },
  {
    id: 'dim-mechanism-relevance',
    key: 'mechanism',
    label: 'Mechanism Relevance',
    score: 88,
    sources: 27,
    description:
      'Leukotriene-mediated neutrophil recruitment and airway inflammation align closely with the persistent-inflammatory phenotype of COPD that is poorly addressed by current therapies.',
  },
]

export const analysisAst2026001: Analysis = {
  id: 'AST-2026-001',
  title: 'Montelukast → COPD',
  drugId: 'montelukast',
  diseaseId: 'copd',
  drugName: 'Montelukast',
  diseaseName: 'COPD',
  objective:
    'Evaluate the potential of Montelukast for repurposing in COPD, focusing on leukotriene-mediated airway inflammation as a therapeutic mechanism.',
  status: 'Completed',
  overallScore: 87,
  evidenceBand: 'Strong Evidence',
  dimensions,
  agents,
  summaryOverview: [
    'ASTROMORPH identified multiple research relationships connecting leukotriene signaling, airway inflammation, and COPD-related mechanisms. Existing literature provides evidence supporting further investigation of Montelukast as a potential repurposing candidate. However, the current evidence does not establish clinical efficacy for COPD.',
    'Across 148 retrieved publications, cysteinyl leukotriene levels were consistently elevated in induced sputum, BAL fluid, and exhaled breath condensate of COPD patients relative to healthy controls. CysLT1 receptor expression was confirmed on airway epithelial cells and infiltrating leukocytes in COPD tissue samples, providing a plausible molecular interface for montelukast activity.',
    'Clinical evidence remains preliminary: six small randomized trials (total n = 412) reported modest reductions in sputum leukotriene B4 and IL-8, but no statistically significant improvement in forced expiratory volume (FEV1) or exacerbation frequency. The evidence base is insufficient to support off-label use and warrants larger, phenotype-stratified studies.',
  ],
  keyFinding:
    'Consistent molecular overlap between leukotriene signaling and neutrophilic airway inflammation in COPD — the strongest signal observed across all five evidence dimensions (mechanism relevance 88%).',
  evidenceStrength:
    'Strong research-evidence support (87/100), driven by high-quality literature convergence and biological plausibility; tempered by limited and heterogeneous clinical trial data.',
  researchGap:
    'No adequately powered randomized controlled trial has evaluated montelukast in a phenotyped COPD population (e.g., frequent exacerbators with elevated sputum cysLTs). Existing trials lack inflammatory-biomarker stratification.',
  nextInvestigation: [
    'Design a Phase 2 feasibility trial stratifying COPD patients by baseline sputum leukotriene levels.',
    'Commission a targeted meta-analysis of the six existing montelukast-COPD trials with individual-patient data where available.',
    'Validate CysLT1 expression quantitative thresholds as a patient-selection biomarker using retrospective biobank samples.',
  ],
  createdAt: '2026-08-21T08:42:00Z',
  updatedAt: '2026-08-24T06:15:00Z',
}

export const recentAnalyses: AnalysisSummary[] = [
  { id: 'AST-2026-001', drugName: 'Montelukast', diseaseName: 'COPD', confidence: 87, evidenceBand: 'Strong', status: 'Completed', updatedAt: '2026-08-24T06:15:00Z', createdAt: '2026-08-21T08:42:00Z' },
  { id: 'AST-2026-002', drugName: 'Metformin', diseaseName: "Alzheimer's Disease", confidence: 64, evidenceBand: 'Moderate', status: 'Completed', updatedAt: '2026-08-23T14:20:00Z', createdAt: '2026-08-19T10:05:00Z' },
  { id: 'AST-2026-003', drugName: 'Sildenafil', diseaseName: 'Heart Failure (HFpEF)', confidence: 81, evidenceBand: 'Strong', status: 'Completed', updatedAt: '2026-08-22T09:48:00Z', createdAt: '2026-08-18T16:30:00Z' },
  { id: 'AST-2026-005', drugName: 'Famotidine', diseaseName: 'Colorectal Cancer', confidence: 42, evidenceBand: 'Weak', status: 'Completed', updatedAt: '2026-08-21T11:02:00Z', createdAt: '2026-08-17T13:12:00Z' },
  { id: 'AST-2026-007', drugName: 'Trazodone', diseaseName: 'Glioblastoma', confidence: null, evidenceBand: null, status: 'Processing', updatedAt: '2026-08-24T09:05:00Z', createdAt: '2026-08-24T09:01:00Z' },
  { id: 'AST-2026-008', drugName: 'Losartan', diseaseName: 'Abdominal Aortic Aneurysm', confidence: null, evidenceBand: null, status: 'Queued', updatedAt: '2026-08-24T09:12:00Z', createdAt: '2026-08-24T09:12:00Z' },
  { id: 'AST-2026-006', drugName: 'Amiodarone', diseaseName: "Graves' Ophthalmopathy", confidence: 51, evidenceBand: 'Preliminary', status: 'Failed', updatedAt: '2026-08-20T17:40:00Z', createdAt: '2026-08-16T08:55:00Z' },
]

export const activityTimeline: ActivityEvent[] = [
  { id: 'ev-1', kind: 'report', label: 'Research report generated', detail: 'AST-2026-001 · Montelukast → COPD report finalized with 13 sections and 24 references.', timestamp: '2026-08-24T06:15:00Z' },
  { id: 'ev-2', kind: 'analysis', label: 'Evidence scoring completed', detail: 'Composite research-evidence score computed: 87/100 (Strong Evidence).', timestamp: '2026-08-24T06:11:00Z' },
  { id: 'ev-3', kind: 'safety', label: 'Safety assessment completed', detail: '41 pharmacovigilance records reviewed. One boxed warning flagged for review.', timestamp: '2026-08-24T06:04:00Z' },
  { id: 'ev-4', kind: 'trial', label: 'Clinical trials analyzed', detail: '23 ClinicalTrials.gov records screened; 6 directly relevant to COPD selected.', timestamp: '2026-08-24T05:52:00Z' },
  { id: 'ev-5', kind: 'graph', label: 'Knowledge graph updated', detail: '112 relationships added linking Montelukast, CysLT1, and COPD sub-network.', timestamp: '2026-08-24T05:41:00Z' },
  { id: 'ev-6', kind: 'literature', label: 'Literature retrieved', detail: '148 publications indexed from PubMed, Europe PMC, and Semantic Scholar.', timestamp: '2026-08-24T05:22:00Z' },
]
