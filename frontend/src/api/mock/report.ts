import type { ResearchReport } from '@/types'

export const reportAst2026001: ResearchReport = {
  id: 'RPT-2026-001',
  analysisId: 'AST-2026-001',
  title: 'ASTROMORPH Research Report',
  subtitle: 'Montelukast → COPD · AI-assisted drug repurposing assessment',
  generatedAt: '2026-08-24T06:15:00Z',
  sections: [
    {
      id: 'sec-1',
      number: 1,
      title: 'Executive Summary',
      paragraphs: [
        'This report presents an AI-assisted synthesis of research evidence evaluating Montelukast — an approved leukotriene receptor antagonist — as a candidate for repurposing in Chronic Obstructive Pulmonary Disease (COPD). Across five weighted dimensions, ASTROMORPH computed a composite research-evidence score of 87/100, corresponding to Strong Evidence for further investigation.',
        'The hypothesis rests on a coherent mechanistic chain: cysteinyl leukotrienes are elevated in COPD airways; their receptor CysLT1 is expressed on inflammatory cells infiltrating COPD lung tissue; montelukast antagonizes CysLT1 with high affinity; and preclinical smoke-exposure models show reduced neutrophilic inflammation with montelukast treatment. Clinical evidence, however, remains preliminary and does not establish efficacy.',
        'This document is a research decision-support artifact generated from public biomedical data sources. It does not constitute medical advice, diagnosis, or a clinical recommendation.',
      ],
      callout: {
        title: 'Research Evidence Score',
        text: '87/100 — Strong Evidence band. This score quantifies strength and convergence of research evidence only; it is not a prediction of clinical benefit.',
      },
    },
    {
      id: 'sec-2',
      number: 2,
      title: 'Drug Overview',
      paragraphs: [
        'Montelukast (Singulair; DrugBank DB00471; ATC R03DC03) is an orally bioavailable, selective cysteinyl leukotriene receptor antagonist approved since 1998 for asthma prophylaxis, exercise-induced bronchoconstriction, and allergic rhinitis. It is administered as a once-daily 10 mg dose, exhibits >99% protein binding, and is metabolized primarily via CYP2C8 and CYP3A4 with a terminal half-life of 2.7–5.5 hours.',
        'Two decades of post-marketing experience characterize montelukast as generally well tolerated, with headache (~18%) and abdominal pain (~8%) the most frequently reported adverse events. A 2020 FDA boxed warning highlights rare serious neuropsychiatric events, which becomes material for chronic-use indications such as COPD and is incorporated into the safety dimension of this assessment.',
      ],
    },
    {
      id: 'sec-3',
      number: 3,
      title: 'Disease Overview',
      paragraphs: [
        'COPD (ICD-10 J44) affects approximately 212 million people worldwide and is the third leading cause of global mortality. The disease is heterogeneous, encompassing emphysema, chronic bronchitis, and small-airway remodeling, unified by persistent airflow limitation and abnormal airway inflammation.',
        'Current maintenance therapy relies on bronchodilation (LAMA/LABA) with inhaled corticosteroids reserved largely for eosinophilic phenotypes. Neutrophilic inflammation — the dominant inflammatory pattern in many patients — responds poorly to existing anti-inflammatory options, leaving frequent exacerbators with substantial unmet need and motivating investigation of alternative anti-inflammatory mechanisms, including the leukotriene axis.',
      ],
    },
    {
      id: 'sec-4',
      number: 4,
      title: 'Repurposing Hypothesis',
      paragraphs: [
        'Hypothesis: Because cysteinyl leukotriene signaling contributes to neutrophilic airway inflammation in COPD, pharmacological blockade of CysLT1 with montelukast may reduce inflammatory activity and thereby slow disease progression or reduce exacerbation risk in inflammation-high patient subgroups.',
        'The hypothesis is grounded in observational human data (sputum cysLT elevation; receptor expression on airway leukocytes), genetic epidemiology (Mendelian randomization support for the leukotriene axis in airflow obstruction), and preclinical target-engagement data. It remains a research hypothesis and has not been validated in adequately powered clinical trials.',
      ],
      callout: {
        title: 'Status',
        text: 'Candidate for further investigation — Phase 2 feasibility study recommended before any broader evaluation.',
      },
    },
    {
      id: 'sec-5',
      number: 5,
      title: 'Biological Mechanism',
      paragraphs: [
        'The leukotriene pathway converts membrane arachidonic acid into pro-inflammatory lipid mediators through 5-lipoxygenase (ALOX5) and leukotriene C4 synthase (LTC4S). Downstream signaling via CysLT1 receptors promotes bronchoconstriction, plasma extravasation, mucus secretion, and — critically for COPD — neutrophil chemotaxis.',
        'In COPD, sputum LTE4 and LTB4 concentrations correlate with symptom burden, exacerbation frequency, and neutrophil counts. Montelukast engages the pathway at the receptor level; in vitro studies additionally demonstrate downregulation of TGF-β1–driven remodeling markers in bronchial epithelial cells, suggesting possible activity on small-airway structural change beyond acute inflammation.',
      ],
    },
    {
      id: 'sec-6',
      number: 6,
      title: 'Literature Evidence',
      paragraphs: [
        'The Literature Retrieval Agent indexed 148 publications, of which 34 directly address leukotriene biology in COPD. Convergence across independent cohorts and methods is strong: meta-analysis of six randomized trials reports significant sputum LTB4 reduction without FEV1 benefit; two prospective cohorts link baseline LTB4 to exacerbation frequency; and Mendelian randomization provides genetic support for pathway causality.',
        'Publication quality is moderate-to-high (median journal impact factor 7.8 within the retrieved corpus), but effect sizes in interventional studies are small and heterogeneity across trials is substantial, tempering confidence in unstratified populations.',
      ],
    },
    {
      id: 'sec-7',
      number: 7,
      title: 'Clinical Trial Evidence',
      paragraphs: [
        'Twenty-three ClinicalTrials.gov records involving montelukast in respiratory disease were screened; six are COPD-specific. Three completed Phase 2 studies (combined n = 281) consistently demonstrate biomarker modulation (sputum LTB4 ↓22%) but no significant improvement in FEV1, CAT scores, or time-to-exacerbation. A Phase 4 add-on study terminated early due to slow enrollment without interim efficacy signal.',
        'No trial to date has stratified enrollment by baseline leukotriene levels — the design feature most likely to reveal benefit if the mechanistic hypothesis holds, and therefore the central recommendation of this report.',
      ],
      callout: {
        title: 'Key Trial Gap',
        text: 'Zero completed trials with biomarker-stratified enrollment. Existing negative results may reflect dilution of treatment effect across unselected populations.',
      },
    },
    {
      id: 'sec-8',
      number: 8,
      title: 'Safety Assessment',
      paragraphs: [
        'The Safety Analysis Agent reviewed 41 records spanning the FDA label, pooled RCT safety datasets, and FAERS disproportionality analyses. Overall tolerability is favorable relative to most repurposing candidates: long half-life-adjusted exposure data exist across pediatric and adult populations exceeding two decades of use.',
        'Principal concerns for a chronic COPD indication: (1) the boxed warning for serious neuropsychiatric events, with FAERS analyses showing elevated reporting odds ratios concentrated in the first 90 days; (2) rare Churg-Strauss syndrome reports, historically associated with corticosteroid withdrawal in asthmatic populations rather than direct toxicity; (3) CYP3A4 interactions relevant to polypharmacy in elderly COPD patients. None of these preclude clinical investigation under appropriate monitoring.',
      ],
    },
    {
      id: 'sec-9',
      number: 9,
      title: 'Knowledge Graph Findings',
      paragraphs: [
        'Mapping of extracted entities onto the ASTROMORPH biomedical knowledge graph added 112 relationship candidates connecting montelukast, CysLT1, ALOX5, LTC4S, TGF-β1, and COPD-associated processes. Graph topology confirms the leukotriene pathway as a bridging subnetwork between drug mechanism and multiple disease processes (neutrophilic inflammation, airway remodeling, FEV1 decline).',
        'Shortest-path analysis places montelukast three hops from COPD through CysLT1 → leukotriene pathway → neutrophilic inflammation, with each hop supported by ≥19 independent evidence items. No contradictory relationships were identified at the graph level.',
      ],
    },
    {
      id: 'sec-10',
      number: 10,
      title: 'Evidence Score',
      paragraphs: [
        'The composite research-evidence score integrates five weighted dimensions: Biological Plausibility (82%), Literature Evidence (91%), Clinical Evidence (76%), Safety Profile (89%), and Mechanism Relevance (88%). Weighting emphasizes literature convergence and biological plausibility for early-stage repurposing hypotheses, reflecting the exploratory nature of this analysis.',
        'Dimension-level detail, per-dimension source counts, and the full evidence table supporting each score are available in the interactive analysis workspace (analysis ID AST-2026-001).',
      ],
      callout: {
        title: 'Interpretation Guidance',
        text: 'Scores quantify research-evidence strength for prioritizing further study. They must not be interpreted as proof of clinical effectiveness or used to guide patient care.',
      },
    },
    {
      id: 'sec-11',
      number: 11,
      title: 'Research Gaps',
      paragraphs: [
        '(1) Absence of biomarker-stratified trials — no completed study enrolled by baseline sputum cysLT status. (2) Dose and duration uncertainty — existing trials used standard asthma dosing for ≤6 months; remodeling effects may require longer exposure. (3) Outcome misalignment — trials measured FEV1, whereas the hypothesized benefit targets exacerbation frequency and inflammatory activity. (4) Phenotype specificity — potential benefit may be confined to the neutrophilic/exacerbating subtype not yet studied in isolation.',
      ],
    },
    {
      id: 'sec-12',
      number: 12,
      title: 'Limitations',
      paragraphs: [
        'This assessment is limited by the quality and completeness of underlying public sources; publication bias favoring positive biomarker associations cannot be excluded. Evidence scoring weights are heuristic and configurable; alternative weightings may shift the composite score. Automated entity extraction, while validated against curated benchmarks (>96% precision), may omit relevant findings outside PubMed-indexed venues. All conclusions require expert human review before informing any research or regulatory decision-making.',
      ],
    },
    {
      id: 'sec-13',
      number: 13,
      title: 'References',
      paragraphs: [
        'A complete, deduplicated reference list follows. References are formatted in Vancouver style and cross-linked to source databases where available.',
      ],
    },
  ],
  references: [
    { id: 'ref-1', citation: 'Ramirez GA, et al. Leukotriene modifiers in COPD: systematic review and meta-analysis. Chest. 2021;159(4):1421–1434. PMID 33789456.' },
    { id: 'ref-2', citation: 'Profita M, et al. Cysteinyl leukotriene receptor expression in induced sputum of COPD patients. Thorax. 2019;74(8):776–783. PMID 31167832.' },
    { id: 'ref-3', citation: 'Chen Z, et al. Montelukast reduces neutrophilic airway inflammation in smoke-exposed mice. Am J Physiol Lung Cell Mol Physiol. 2020;318(5):L987–L999. PMID 32325019.' },
    { id: 'ref-4', citation: 'Bathoorn E, et al. Sputum LTB4 correlates with exacerbation frequency in COPD. Eur Respir J. 2018;52(2):1702471. PMID 29891245.' },
    { id: 'ref-5', citation: 'Kaur H, et al. Network pharmacology of leukotriene pathway modulation. Pharmacol Res. 2022;177:106121. PMID 35576891.' },
    { id: 'ref-6', citation: 'Osei ET, et al. Montelukast modulates TGF-β–mediated remodeling markers. Int Immunopharmacol. 2023;116:109752. PMID 36842317.' },
    { id: 'ref-7', citation: 'Faith A, et al. Effect of montelukast on sputum LTB4 in stable COPD. Respir Res. 2019;20:112. PMID 30877890.' },
    { id: 'ref-8', citation: 'Wain LV, et al. Leukotriene biosynthesis genes and COPD susceptibility: Mendelian randomization. Lancet Respir Med. 2017;5(10):779–790. PMID 28940021.' },
    { id: 'ref-9', citation: 'Alhawassi TM, et al. Neuropsychiatric events with leukotriene modifiers: FAERS analysis. Pharmacoepidemiol Drug Saf. 2022;31(6):664–671. PMID 37655210.' },
    { id: 'ref-10', citation: 'GOLD Science Committee. Global strategy for diagnosis, management and prevention of COPD (2024 Report). goldcopd.org.' },
    { id: 'ref-11', citation: 'FDA. Singulair (montelukast sodium) prescribing information, rev. 01/2020. NDA 020805.' },
    { id: 'ref-12', citation: 'ClinicalTrials.gov. NCT04635174; NCT03189866; NCT05211487; NCT05678901. Accessed Aug 2026.' },
  ],
}

export const savedItems = [
  { id: 'sv-1', kind: 'analysis' as const, title: 'Montelukast → COPD', meta: 'Analysis AST-2026-001 · Strong Evidence (87/100)', savedAt: '2026-08-22T10:14:00Z' },
  { id: 'sv-2', kind: 'paper' as const, title: 'Leukotriene modifiers in COPD: systematic review & meta-analysis', meta: 'Chest · 2021 · Meta-analysis · Relevance 94%', savedAt: '2026-08-23T09:02:00Z' },
  { id: 'sv-3', kind: 'trial' as const, title: 'NCT04635174 — MAAC Study', meta: 'Phase 2 · Completed · Helix Research Institute', savedAt: '2026-08-23T15:40:00Z' },
  { id: 'sv-4', kind: 'graph-view' as const, title: 'Leukotriene–COPD sub-network', meta: 'Knowledge graph view · 15 nodes · 18 relations', savedAt: '2026-08-24T07:31:00Z' },
]

export const notifications = [
  { id: 'nt-1', title: 'Report ready: Montelukast → COPD', detail: '13-section research report finalized for AST-2026-001.', time: '2026-08-24T06:16:00Z', unread: true, kind: 'analysis' as const },
  { id: 'nt-2', title: 'Safety flag requires review', detail: 'Boxed-warning signal attached to AST-2026-001 safety dimension.', time: '2026-08-24T06:04:00Z', unread: true, kind: 'evidence' as const },
  { id: 'nt-3', title: 'New team member joined workspace', detail: 'Dr. Marcus Webb joined Helix Research Institute.', time: '2026-08-23T11:26:00Z', unread: false, kind: 'team' as const },
  { id: 'nt-4', title: 'Scheduled maintenance', detail: 'Evidence connectors refresh Sunday 02:00–03:00 UTC.', time: '2026-08-22T08:00:00Z', unread: false, kind: 'system' as const },
]

export const kpiStats = [
  { id: 'kpi-1', label: 'Active Analyses', value: '7', delta: '+2 this week', deltaTone: 'up' as const, hint: 'Agent pipelines currently running or queued' },
  { id: 'kpi-2', label: 'Evidence Sources', value: '214', delta: '+18 this week', deltaTone: 'up' as const, hint: 'Connected databases and curated feeds' },
  { id: 'kpi-3', label: 'Research Papers', value: '3,482', delta: '+146 this week', deltaTone: 'up' as const, hint: 'Publications indexed across all analyses' },
  { id: 'kpi-4', label: 'Clinical Trials', value: '618', delta: '+9 this week', deltaTone: 'up' as const, hint: 'Screened ClinicalTrials.gov records' },
  { id: 'kpi-5', label: 'High-Confidence Candidates', value: '12', delta: '+1 this week', deltaTone: 'up' as const, hint: 'Candidates scoring ≥80 (Strong band)' },
]
