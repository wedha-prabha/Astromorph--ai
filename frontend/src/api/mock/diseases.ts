import type { Disease } from '@/types'

export const copd: Disease = {
  id: 'copd',
  name: 'Chronic Obstructive Pulmonary Disease (COPD)',
  icd10: 'J44',
  category: 'Respiratory · Chronic airway disease',
  prevalence: '~212 million cases worldwide',
  mortality: '3rd leading cause of death globally (~3.5M deaths/year)',
  description:
    "COPD is a progressive, heterogeneous lung disease characterized by persistent airflow limitation and abnormal inflammatory responses of the lungs to noxious particles or gases. It encompasses emphysema, chronic bronchitis, and small-airway remodeling. Despite bronchodilator therapy, many patients retain neutrophilic inflammation and suffer recurring exacerbations, highlighting major unmet therapeutic needs.",
  symptoms: [
    'Dyspnea on exertion',
    'Chronic productive cough',
    'Sputum production',
    'Wheezing and chest tightness',
    'Recurrent exacerbations',
    'Fatigue and exercise intolerance',
  ],
  pathways: [
    { name: 'Leukotriene signaling', role: 'Cysteinyl leukotrienes elevated in sputum; drives airway inflammation' },
    { name: 'NF-κB inflammatory axis', role: 'Master regulator of neutrophilic airway inflammation' },
    { name: 'Protease–antiprotease imbalance', role: 'MMP-9 mediated tissue destruction in emphysema' },
    { name: 'Oxidative stress response', role: 'Cigarette smoke-derived ROS amplify inflammation' },
    { name: 'IL-17 / Th17 immunity', role: 'Sustains neutrophilic inflammation and steroid resistance' },
  ],
  genes: [
    { symbol: 'SERPINA1', name: 'Alpha-1 antitrypsin', association: 'Deficiency causes early-onset emphysema' },
    { symbol: 'MMP12', name: 'Macrophage metalloelastase', association: 'Emphysema susceptibility locus' },
    { symbol: 'ALOX5', name: '5-lipoxygenase', association: 'Upstream leukotriene biosynthesis; candidate target' },
    { symbol: 'LTC4S', name: 'Leukotriene C4 synthase', association: 'Terminal enzyme in cysLT synthesis' },
    { symbol: 'CHRNA3', name: 'Nicotinic receptor subunit', association: 'GWAS locus for nicotine dependence & COPD risk' },
  ],
  proteinTargets: [
    { name: 'ADRB2', kind: 'Bronchodilator receptor', note: 'Target of LABA backbone therapy' },
    { name: 'M3 muscarinic receptor', kind: 'Bronchodilator receptor', note: 'Target of LAMA therapy' },
    { name: 'PDE4', kind: 'Anti-inflammatory enzyme', note: 'Roflumilast for severe COPD with chronic bronchitis' },
    { name: 'CysLT1', kind: 'Emerging anti-inflammatory target', note: 'Montelukast-relevant; expression shown in COPD airways' },
  ],
  treatments: [
    { name: 'Tiotropium / LAMA', drugClass: 'Long-acting muscarinic antagonist', line: 'Maintenance (GOLD A–E)' },
    { name: 'Salmeterol / LABA', drugClass: 'Long-acting β2 agonist', line: 'Maintenance combination therapy' },
    { name: 'ICS + LABA + LAMA triple therapy', drugClass: 'Inhaled corticosteroid combinations', line: 'Frequent exacerbators with eosinophilia' },
    { name: 'Roflumilast', drugClass: 'PDE4 inhibitor', line: 'Severe COPD with chronic bronchitis phenotype' },
    { name: 'Pulmonary rehabilitation', drugClass: 'Non-pharmacological', line: 'All stages' },
  ],
  unmetNeed:
    'Current anti-inflammatory options poorly suppress neutrophilic airway inflammation. Leukotriene pathway modulation is an investigational strategy for the subset of patients with persistent inflammation and frequent exacerbations.',
  candidates: [
    { disease: 'Montelukast', score: 87, band: 'Strong', status: 'Completed', analysisId: 'AST-2026-001' },
    { disease: 'Zileuton', score: 68, band: 'Moderate', status: 'Queued', analysisId: null },
    { disease: 'Metformin', score: 52, band: 'Preliminary', status: 'Queued', analysisId: null },
  ],
  stats: { trials: 234, publications: 1892, pathways: 11, targets: 9 },
  detailed: true,
}

export const otherDiseases: Disease[] = [
  {
    id: 'alzheimers',
    name: "Alzheimer's Disease",
    icd10: 'G30',
    category: 'Neurodegenerative disorder',
    prevalence: '~55 million worldwide',
    mortality: '7th leading cause of death (US)',
    description:
      "Progressive neurodegenerative disorder characterized by amyloid plaque accumulation, tau tangles, and synaptic loss.",
    symptoms: ['Memory impairment', 'Executive dysfunction', 'Behavioral changes'],
    pathways: [
      { name: 'Insulin signaling', role: 'Brain insulin resistance hypothesis' },
      { name: 'Amyloid processing', role: 'Aβ aggregation cascade' },
    ],
    genes: [{ symbol: 'APOE', name: 'Apolipoprotein E', association: 'Major genetic risk factor' }],
    proteinTargets: [{ name: 'BACE1', kind: 'Enzyme', note: 'Amyloidogenic pathway' }],
    treatments: [{ name: 'Donepezil', drugClass: 'Acetylcholinesterase inhibitor', line: 'Symptomatic' }],
    unmetNeed: 'Disease-modifying therapies remain limited.',
    candidates: [{ disease: 'Metformin', score: 64, band: 'Moderate', status: 'Completed', analysisId: 'AST-2026-002' }],
    stats: { trials: 187, publications: 2210, pathways: 14, targets: 12 },
    detailed: false,
  },
  {
    id: 'ipf',
    name: 'Idiopathic Pulmonary Fibrosis',
    icd10: 'J84.10',
    category: 'Interstitial lung disease',
    prevalence: '~5 million worldwide',
    mortality: 'Median survival 3–5 years untreated',
    description:
      'Chronic, progressive fibrosing interstitial pneumonia of unknown etiology characterized by usual interstitial pneumonia pattern.',
    symptoms: ['Progressive dyspnea', 'Dry cough', 'Clubbing'],
    pathways: [
      { name: 'TGF-β signaling', role: 'Central fibrotic mediator' },
      { name: 'PI3K/AKT/mTOR', role: 'Epithelial senescence and fibroblast activation' },
    ],
    genes: [{ symbol: 'MUC5B', name: 'Mucin 5B promoter variant', association: 'Strongest common risk allele' }],
    proteinTargets: [{ name: 'PDGFR', kind: 'Tyrosine kinase', note: 'Antifibrotic target (nintedanib)' }],
    treatments: [
      { name: 'Pirfenidone', drugClass: 'Antifibrotic', line: 'Approved' },
      { name: 'Nintedanib', drugClass: 'Multi-tyrosine kinase inhibitor', line: 'Approved' },
    ],
    unmetNeed: 'Reversal of established fibrosis remains unaddressed.',
    candidates: [{ disease: 'Montelukast', score: 62, band: 'Preliminary', status: 'Queued', analysisId: null }],
    stats: { trials: 96, publications: 1240, pathways: 9, targets: 8 },
    detailed: false,
  },
]

export const allDiseases: Disease[] = [copd, ...otherDiseases]
