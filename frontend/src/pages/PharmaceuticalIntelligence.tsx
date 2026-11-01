import { useState, type FormEvent, type ReactNode } from 'react'
import { AlertCircle, Download, ExternalLink, FileSearch, LoaderCircle, Printer, Search, ShieldAlert } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { endpoints, type PharmaceuticalIntelligenceReport, type PharmaceuticalIntelligenceRequest, type RegulatoryFinding } from '@/api/endpoints'
import { DisclaimerBanner, PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Select, Textarea } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'

const countries = ['India', 'United States', 'United Kingdom', 'European Union']

function statusVariant(status: string): 'emerald' | 'amber' | 'rose' | 'neutral' {
  if (status === 'approved' || status === 'verified') return 'emerald'
  if (status === 'restricted' || status === 'partially_verified' || status === 'conflicting') return 'amber'
  if (status === 'banned' || status === 'suspended' || status === 'withdrawn') return 'rose'
  return 'neutral'
}

function displayStatus(value: string) {
  return value.replace(/_/g, ' ')
}

function displayCriterion(value: string) {
  return value.replace(/_/g, ' ')
}

function reportFileName(report: PharmaceuticalIntelligenceReport) {
  const slug = report.query.original
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
  return `astromorph-pharmaceutical-report-${slug || 'research'}`
}

function createReportMarkdown(report: PharmaceuticalIntelligenceReport) {
  const primaryMedicine = report.medicines[0]
  const entity = (kind: string) => report.query.normalizedEntities
    .filter((item) => item.kind === kind)
    .map((item) => item.value)
    .join(', ') || 'Not supplied'
  const lines = [
    '# SECTION 1: REPORT OVERVIEW',
    '',
    '**ASTROMORPH Drug Evidence and Safety Research Report**',
    `- Generated: ${new Date(report.generatedAt).toLocaleString()}`,
    `- Drug: ${entity('drug') !== 'Not supplied' ? entity('drug') : entity('brand')}`,
    `- Generic name: ${primaryMedicine?.genericName ?? 'Not verified'}`,
    `- Active ingredient: ${primaryMedicine?.activeIngredients.join(', ') || 'Not verified'}`,
    `- Target condition: ${entity('disease')}`,
    `- Symptoms supplied: ${entity('symptoms')}`,
    `- Country: ${entity('country')}`,
    `- Current medicines: ${entity('current_medication')}`,
    `- Research question: ${report.query.original}`,
    '',
    '## SECTION 2: DRUG PROFILE',
    `- Drug classification: ${primaryMedicine?.drugClass ?? 'Not verified from label data'}`,
    `- Mechanism of action: ${primaryMedicine?.labelSections.mechanism_of_action ?? 'Not retrieved from current structured sources.'}`,
    `- FDA label indications text: ${primaryMedicine?.labelIndications ?? 'Not available'}`,
    '- Approved indications in the selected jurisdiction: Not verified; label text and product listings alone do not establish local approval.',
    '- Other established uses: Not assessed by current integrations.',
    '- Investigational uses: See registered trials in Section 11; registration is not evidence of efficacy.',
    `- Brand names: ${primaryMedicine?.brandNames.join(', ') || 'Not verified'}`,
    `- Verified ingredients: ${primaryMedicine?.activeIngredients.join(', ') || 'Not verified'}`,
    '',
    '| Product | Active ingredients / strength | Dosage form | Market | Source |',
    '|---|---|---|---|---|',
    ...(primaryMedicine?.composition.map((product) =>
      `| ${product.productName ?? 'Not listed'} | ${product.activeIngredients.map((item) => `${item.name} (${item.strength ?? 'strength not listed'})`).join('; ') || 'Not documented'} | ${product.dosageForm ?? 'Not listed'} | ${product.market} | ${product.sourceUrl} |`,
    ) ?? ['| No product formulation verified | — | — | — | — |']),
    '',
    '## SECTION 3: DISEASE AND SYMPTOM RELEVANCE',
    `- Target condition: ${entity('disease')}`,
    `- Symptoms supplied: ${entity('symptoms')}`,
    '- The system does not diagnose from symptoms.',
    '- Whether the drug treats the target disease or only manages symptoms: Not established by an evidence appraisal in the current integration.',
    ...(report.diseaseResearch.map((item) => `- Disease record: ${item.name} — ${item.description} Source: ${item.sourceUrl}`)),
    '',
    '## SECTION 4: DRUG SUITABILITY SCORE',
    `Score: ${report.suitability.overallScore === null ? 'Insufficient evidence; no numerical score assigned' : `${report.suitability.overallScore}/100`}`,
    `Classification: ${report.suitability.classification}`,
    `Evidence confidence: ${report.suitability.evidenceConfidence}`,
    `Evidence coverage: ${report.suitability.evidenceCoverage}%`,
    `Records retrieved: ${report.suitability.recordsRetrieved} (not all records are verified relevant studies)`,
    `Relevant studies: ${report.suitability.relevantStudiesCount ?? 'Not verified'}`,
    `Relevant human studies: ${report.suitability.relevantHumanStudiesCount ?? 'Not verified'}`,
    `Clinical trial records: ${report.suitability.clinicalTrialsCount}`,
    `Safety override: ${report.suitability.safetyOverride ? 'A verified serious concern blocks positive classification' : 'No verified serious concern identified'}`,
    '',
    ...report.suitability.scoreBreakdown.flatMap((component) => [
      `- ${displayCriterion(component.name)} (${Math.round(component.weight * 100)}%): ${component.score === null ? 'Not assessed' : `${component.score}/100`}. ${component.rationale}`,
      ...component.sourceUrls.map((url) => `  Source: ${url}`),
    ]),
    '',
    report.suitability.finalAssessment,
    ...report.suitability.limitations.map((limitation) => `- ${limitation}`),
    '',
    '## SECTION 5: EXISTING MEDICINES AND ALTERNATIVE OPTIONS',
    'Alternative medicines were not systematically retrieved or compared. No alternative is recommended by this report.',
    '',
    '## SECTION 6: DRUG INTERACTION REPORT',
    '| Medicine A | Medicine B | Severity | Documented interaction | Recommended clinical review |',
    '|---|---|---|---|---|',
    ...(report.interactions.map((interaction) =>
      `| ${interaction.medicineA} | ${interaction.medicineB} | ${displayStatus(interaction.severity)} | ${interaction.clinicalConsequences}; mechanism: ${interaction.mechanism} | ${interaction.recommendedReview} |`,
    ) ?? []),
    ...(report.interactions.length ? [] : ['No pairs were supplied for interaction analysis.']),
    'Unknown interaction status is not evidence of safety. No pairwise interaction database is currently configured.',
    '',
    '## SECTION 7: CONTRAINDICATIONS AND PATIENT RISK FACTORS',
    `Supplied risk factors: ${report.patientRiskAssessment.suppliedFactors.join(', ') || 'None supplied'}`,
    ...report.patientRiskAssessment.notes.map((note) => `- ${note}`),
    ...(primaryMedicine?.contraindications.map((item) => `- Formal contraindication (FDA label): ${item}`) ?? ['- No verified contraindication text retrieved.']),
    ...(primaryMedicine?.precautions.map((item) => `- Precaution (FDA label): ${item}`) ?? []),
    ...(Object.entries(primaryMedicine?.labelSections ?? {}).filter(([key]) =>
      ['use_in_specific_populations', 'pregnancy', 'lactation', 'pediatric_use', 'geriatric_use', 'renal_impairment', 'hepatic_impairment'].includes(key),
    ).map(([key, text]) => `- ${displayCriterion(key)} (FDA label): ${text}`)),
    '',
    '## SECTION 8: ADVERSE EFFECTS AND MONITORING',
    ...(primaryMedicine?.safetyInformation.map((item) => `- Adverse effects / warnings reported in retrieved label text (frequency/severity not independently classified): ${item}`) ?? ['- No verified label adverse-effect information retrieved.']),
    ...(primaryMedicine?.labelSections.warnings_and_cautions ? [`- Warnings and precautions (FDA label): ${primaryMedicine.labelSections.warnings_and_cautions}`] : []),
    '- Monitoring requirements were not independently assessed; consult the applicable product label and clinician.',
    '',
    '## SECTION 9: BANNED OR RESTRICTED STATUS',
    ...(report.regulatoryFindings.length
      ? report.regulatoryFindings.map((finding) => `- ${finding.medicine} — ${finding.country}: ${displayStatus(finding.status)}. ${finding.scope} Authority: ${finding.authority ?? 'Not identified'}. Source: ${finding.sourceUrl ?? 'Not available'}. Status check attempted: ${new Date(finding.lastChecked).toLocaleString()}; status remains unverified.`)
      : ['- No jurisdiction selected; regulatory status was not assessed.']),
    '',
    '## SECTION 10: FOOD, ALCOHOL, AND LIFESTYLE INTERACTIONS',
    ...(primaryMedicine?.labelSections.food_effect ? [`- Food effect information (FDA label): ${primaryMedicine.labelSections.food_effect}`] : []),
    ...(primaryMedicine?.labelSections.alcohol ? [`- Alcohol information (FDA label): ${primaryMedicine.labelSections.alcohol}`] : []),
    ...(!primaryMedicine?.labelSections.food_effect && !primaryMedicine?.labelSections.alcohol
      ? ['- No specific food/alcohol/lifestyle interaction was verified from the current sources. This is not proof that none exists.']
      : []),
    '',
    '## SECTION 11: EVIDENCE SUMMARY',
    report.summary ?? 'AI synthesis unavailable; consult retrieved source records below.',
    '',
    '### Clinical trials',
    ...(report.clinicalTrials.length ? report.clinicalTrials.flatMap((trial) => [
      `- ${trial.title} (${trial.nctId}); ${trial.phase}; ${trial.status}; last updated ${trial.lastUpdated ?? 'not listed'}. ${trial.summary} ${trial.url}`,
    ]) : ['- No matching trial records were retrieved.']),
    '',
    '### Publications',
    ...(report.researchEvidence.length ? report.researchEvidence.flatMap((paper) => [
      `- ${paper.title}; ${paper.evidenceType}; ${paper.publicationDate ?? 'date not listed'}. ${paper.summary} ${paper.url}`,
    ]) : ['- No matching PubMed records were retrieved.']),
    '',
    '## SECTION 12: FINAL RESEARCH ASSESSMENT',
    report.suitability.finalAssessment,
    `Evidence confidence: ${report.suitability.evidenceConfidence}; coverage: ${report.suitability.evidenceCoverage}%.`,
    `Safety override: ${report.suitability.safetyOverride ? 'A verified serious concern blocks positive classification.' : 'No verified safety override established.'}`,
    'This is a research assessment, not diagnosis, medical advice, or a recommendation to start, stop, or change medication.',
    '',
  ]

  lines.push('## SECTION 13: SOURCES AND REFERENCES', '')
  for (const source of report.sources) {
    lines.push(
      `- [${source.title}](${source.url}) — ${source.publisher}; ${source.retrievalStatus}; checked ${new Date(source.retrievedAt).toLocaleString()}`,
    )
  }
  lines.push('', '### Limitations', '')
  lines.push(...(report.limitations.length ? report.limitations.map((limitation) => `- ${limitation}`) : ['- No limitations reported.']))
  lines.push(
    '',
    '## Medical information disclaimer',
    '',
    'Research use only. This report is not medical advice, diagnosis, a prescription, or a substitute for clinical judgment or current official product information. Symptom searches do not establish a diagnosis. Regulatory status is country-specific; unknown or unverified does not mean approved or banned.',
    '',
  )
  return lines.join('\n')
}

function SourceLink({ title, url }: { title: string; url: string }) {
  return (
    <a
      className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 underline-offset-2 hover:underline"
      href={url}
      target="_blank"
      rel="noreferrer"
    >
      {title} <ExternalLink className="size-3.5" aria-hidden />
    </a>
  )
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function RegulatoryCard({ finding }: { finding: RegulatoryFinding }) {
  return (
    <article className="rounded-xl border border-line p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-navy-900">{finding.medicine} · {finding.country}</h3>
        <Badge variant={statusVariant(finding.status)}>{displayStatus(finding.status)}</Badge>
        <Badge variant={statusVariant(finding.verificationStatus)}>
          {displayStatus(finding.verificationStatus)}
        </Badge>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-mutedfg">{finding.scope}</p>
      {finding.reason && <p className="mt-2 text-sm"><strong>Reason:</strong> {finding.reason}</p>}
      {finding.effectiveDate && <p className="mt-1 text-sm"><strong>Effective date:</strong> {finding.effectiveDate}</p>}
      <p className="mt-2 text-xs text-mutedfg">
        {finding.authority ?? 'Regulatory authority not identified'}
        {finding.restrictionType ? ` · ${finding.restrictionType}` : ''}
      </p>
      <p className="mt-1 text-xs text-mutedfg">Status check attempted: {new Date(finding.lastChecked).toLocaleString()}</p>
      <p className="mt-2 text-xs font-medium text-amber-800">An unknown or unverified status does not mean approved, legal, or banned.</p>
      {finding.sourceUrl && <div className="mt-2"><SourceLink title="Regulator information" url={finding.sourceUrl} /></div>}
    </article>
  )
}

export function PharmaceuticalIntelligencePage() {
  const [diseaseName, setDiseaseName] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [drugName, setDrugName] = useState('')
  const [brandName, setBrandName] = useState('')
  const [country, setCountry] = useState('')
  const [researchFocus, setResearchFocus] = useState('')
  const [currentMedicationsText, setCurrentMedicationsText] = useState('')
  const [patientRiskFactors, setPatientRiskFactors] = useState('')
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const research = useMutation({ mutationFn: endpoints.getPharmaceuticalIntelligence })
  const suggestionQuery = drugName || brandName
  const suggestions = useQuery({
    queryKey: ['drug-suggestions', suggestionQuery],
    queryFn: () => endpoints.searchDrugSuggestions(suggestionQuery),
    enabled: suggestionQuery.trim().length >= 2,
    staleTime: 30_000,
  })
  const { toast } = useToast()
  const report = research.data

  function downloadReport() {
    if (!report) return
    const blob = new Blob([createReportMarkdown(report)], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${reportFileName(report)}.md`
    anchor.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Report downloaded', description: 'The Markdown report includes evidence links and limitations.' })
  }

  function downloadPdf() {
    window.print()
  }

  function submitResearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload: PharmaceuticalIntelligenceRequest = {
      diseaseName: diseaseName.trim(),
      symptoms: symptoms.trim(),
      drugName: drugName.trim(),
      brandName: brandName.trim(),
      country,
      researchFocus: researchFocus.trim(),
      currentMedications: currentMedicationsText.split(/[,;\n]+/).map((value) => value.trim()).filter(Boolean),
      patientRiskFactors: patientRiskFactors.trim(),
    }
    if (![payload.diseaseName, payload.symptoms, payload.drugName, payload.brandName].some(Boolean)) {
      setFormError('Enter a disease, symptoms, drug name, or medicine brand to search.')
      return
    }
    setFormError('')
    research.mutate(payload)
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Pharmaceutical intelligence"
        title="Pharmaceutical Intelligence & Drug Safety Explorer"
        subtitle="Search source-backed product, safety, regulatory, literature, and clinical-trial records. Missing evidence is reported as unknown, not guessed."
      />

      <Card>
        <CardHeader>
          <CardTitle>Research query</CardTitle>
          <CardDescription>Use any combination of fields. Symptom searches do not diagnose or infer a disease.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitResearch} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pharma-disease">Disease or condition</Label>
                <Input id="pharma-disease" maxLength={160} value={diseaseName} onChange={(event) => setDiseaseName(event.target.value)} placeholder="e.g., rheumatoid arthritis" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pharma-symptoms">Symptoms</Label>
                <Input id="pharma-symptoms" maxLength={1000} value={symptoms} onChange={(event) => setSymptoms(event.target.value)} placeholder="e.g., joint pain and morning stiffness" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pharma-drug">Generic drug or active ingredient</Label>
                <Input
                  id="pharma-drug"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={suggestionsOpen && Boolean(suggestions.data?.length)}
                  aria-controls="pharma-drug-suggestions"
                  maxLength={160}
                  value={drugName}
                  onChange={(event) => {
                    setDrugName(event.target.value)
                    setSuggestionsOpen(true)
                  }}
                  placeholder="Search FDA-listed drugs or enter manually"
                />
                {suggestionsOpen && !!suggestionQuery.trim() && suggestions.data && suggestions.data.length > 0 && (
                  <ul id="pharma-drug-suggestions" role="listbox" className="max-h-48 overflow-y-auto rounded-lg border border-line bg-white shadow-sm">
                    {suggestions.data.map((item) => {
                      const chooseSuggestion = () => {
                        setDrugName(item.genericName ?? item.activeIngredients[0]?.name ?? drugName)
                        if (item.brandName) setBrandName(item.brandName)
                        setSuggestionsOpen(false)
                      }
                      return (
                      <li
                        key={item.productNdc}
                        role="option"
                        aria-selected={false}
                        tabIndex={0}
                        className="cursor-pointer px-3 py-2 text-sm hover:bg-primary-50 focus:bg-primary-50 focus:outline-none"
                        onClick={chooseSuggestion}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            chooseSuggestion()
                          }
                        }}
                      >
                          <span className="block font-medium">{item.genericName ?? item.brandName ?? 'Unidentified product'}</span>
                          <span className="block text-xs text-mutedfg">
                            {item.brandName ?? 'No brand listed'} · {item.activeIngredients.map((ingredient) => `${ingredient.name}${ingredient.strength ? ` ${ingredient.strength}` : ''}`).join(', ') || 'Ingredients not listed'} · {item.dosageForm ?? 'form not listed'}
                          </span>
                      </li>
                      )
                    })}
                  </ul>
                )}
                {suggestionsOpen && suggestions.isError && <p className="text-xs text-amber-800">Live drug suggestions are unavailable. You can still enter the drug name manually; its identity may remain unverified.</p>}
                <p className="text-xs text-mutedfg">Suggestions come from FDA NDC product listings, which are not proof of approval. Manual entry is supported.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pharma-brand">Medicine brand</Label>
                <Input id="pharma-brand" maxLength={160} value={brandName} onChange={(event) => { setBrandName(event.target.value); setSuggestionsOpen(true) }} placeholder="Enter a brand name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pharma-country">Regulatory market (optional)</Label>
                <Select id="pharma-country" value={country} onChange={(event) => setCountry(event.target.value)}>
                  <option value="">Select a market</option>
                  {countries.map((market) => <option key={market} value={market}>{market}</option>)}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pharma-current-meds">Current medications (optional)</Label>
                <Textarea id="pharma-current-meds" maxLength={2000} value={currentMedicationsText} onChange={(event) => setCurrentMedicationsText(event.target.value)} placeholder="Enter medicine names separated by commas or new lines" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="pharma-focus">Research focus (optional)</Label>
                <Textarea id="pharma-focus" maxLength={1000} value={researchFocus} onChange={(event) => setResearchFocus(event.target.value)} placeholder="e.g., product composition, safety warnings, or repurposing evidence" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="pharma-risk-factors">Relevant risk factors (optional)</Label>
                <Textarea id="pharma-risk-factors" maxLength={1000} value={patientRiskFactors} onChange={(event) => setPatientRiskFactors(event.target.value)} placeholder="Optional, e.g., pregnancy, kidney impairment, allergy history. This is not a personalized clinical assessment." />
                <p className="text-xs text-mutedfg">Share only what is needed for research. This app does not clinically assess or infer personal conditions.</p>
              </div>
            </div>
            {formError && <p className="flex items-center gap-2 text-sm text-rose-700" role="alert"><AlertCircle className="size-4" aria-hidden />{formError}</p>}
            {research.isError && (
              <p className="flex items-center gap-2 text-sm text-rose-700" role="alert">
                <AlertCircle className="size-4 shrink-0" aria-hidden />
                {research.error instanceof Error ? research.error.message : 'Research could not be retrieved. Please try again.'}
              </p>
            )}
            <Button type="submit" size="lg" loading={research.isPending} disabled={research.isPending}>
              {research.isPending ? 'Searching evidence…' : <><Search aria-hidden /> Search pharmaceutical evidence</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {research.isPending && (
        <Card><CardContent className="flex items-center gap-3 py-6 text-sm text-mutedfg" role="status" aria-busy="true">
          <LoaderCircle className="size-5 animate-spin text-primary-600" aria-hidden />
          Searching public product, literature, disease, and trial records…
        </CardContent></Card>
      )}

      {report && !research.isPending && (
        <section className="space-y-4" aria-label="Pharmaceutical research results">
          <div className="flex flex-wrap justify-end gap-2 no-print">
            <Button type="button" variant="outline" onClick={downloadPdf}>
              <Printer aria-hidden /> Save as PDF
            </Button>
            <Button type="button" onClick={downloadReport}>
              <Download aria-hidden /> Download report (.md)
            </Button>
          </div>
          <DisclaimerBanner />
          {report.synthesisStatus === 'unavailable' && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {report.synthesisError ?? 'AI synthesis is unavailable. Retrieved evidence remains available below.'}
            </div>
          )}
          <Tabs defaultValue="overview">
            <TabsList className="flex h-auto max-w-full flex-wrap">
              <TabsTrigger value="overview">Research overview</TabsTrigger>
              <TabsTrigger value="medicines">Medicines & composition</TabsTrigger>
              <TabsTrigger value="regulatory">Regulatory status</TabsTrigger>
              <TabsTrigger value="safety">Safety</TabsTrigger>
              <TabsTrigger value="interactions">Drug interactions</TabsTrigger>
              <TabsTrigger value="evidence">Trials, publications & sources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <SectionCard title="Query understanding">
                <p className="text-sm"><strong>Query:</strong> {report.query.original}</p>
                <p className="mt-1 text-sm"><strong>Detected type:</strong> {displayStatus(report.query.type)}</p>
                {!!report.query.normalizedEntities.length && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {report.query.normalizedEntities.map((entity) => (
                      <li key={`${entity.kind}-${entity.value}`}><Badge variant="sky">{entity.kind}: {entity.value}</Badge></li>
                    ))}
                  </ul>
                )}
                {!!report.query.ambiguities.length && <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-800">{report.query.ambiguities.map((item) => <li key={item}>{item}</li>)}</ul>}
              </SectionCard>
              <SectionCard title="Drug suitability assessment">
                <div className="flex flex-wrap gap-3">
                  <Badge variant={report.suitability.overallScore === null ? 'amber' : 'sky'}>
                    {report.suitability.overallScore === null
                      ? 'Insufficient evidence — no score assigned'
                      : `${report.suitability.overallScore}/100`}
                  </Badge>
                  <Badge variant={statusVariant(report.suitability.evidenceConfidence.toLowerCase())}>
                    {report.suitability.evidenceConfidence} confidence
                  </Badge>
                  <Badge variant="neutral">{report.suitability.evidenceCoverage}% evidence coverage</Badge>
                </div>
                <p className="mt-3 text-sm font-medium">{report.suitability.classification}</p>
                <p className="mt-2 text-sm leading-relaxed text-mutedfg">{report.suitability.finalAssessment}</p>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div><dt className="inline font-medium">Records retrieved: </dt><dd className="inline">{report.suitability.recordsRetrieved} (not all verified relevant)</dd></div>
                  <div><dt className="inline font-medium">Relevant studies: </dt><dd className="inline">{report.suitability.relevantStudiesCount ?? 'Not verified'}</dd></div>
                  <div><dt className="inline font-medium">Relevant human studies: </dt><dd className="inline">{report.suitability.relevantHumanStudiesCount ?? 'Not verified'}</dd></div>
                  <div><dt className="inline font-medium">Clinical trial records: </dt><dd className="inline">{report.suitability.clinicalTrialsCount}</dd></div>
                </dl>
                <ul className="mt-4 space-y-3">
                  {report.suitability.scoreBreakdown.map((component) => (
                    <li key={component.name} className="rounded-lg border border-line p-3">
                      <div className="flex flex-wrap justify-between gap-2 text-sm">
                        <strong className="capitalize">{displayCriterion(component.name)} ({Math.round(component.weight * 100)}%)</strong>
                        <span>{component.score === null ? 'Not assessed' : `${component.score}/100`}</span>
                      </div>
                      <p className="mt-1 text-sm text-mutedfg">{component.rationale}</p>
                      {!!component.sourceUrls.length && (
                        <ul className="mt-2 flex flex-wrap gap-3">
                          {component.sourceUrls.map((url) => <li key={url}><SourceLink title="Scoring evidence" url={url} /></li>)}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-amber-800">
                  {report.suitability.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
                  {report.suitability.safetyInformationUnknown && <li>Important safety information remains unknown or unverified.</li>}
                  {report.suitability.safetyOverride && <li>A verified serious safety or regulatory concern blocks positive research classification.</li>}
                  {report.suitability.findingsAgree === false && <li>Retrieved findings conflict; this should be considered independently of any numerical score.</li>}
                </ul>
              </SectionCard>
              {report.summary && <SectionCard title="Evidence-constrained research summary"><p className="whitespace-pre-wrap text-sm leading-relaxed">{report.summary}</p></SectionCard>}
              {!!report.diseaseResearch.length && (
                <SectionCard title="Disease research">
                  <ul className="space-y-3">{report.diseaseResearch.map((item) => (
                    <li key={`${item.name}-${item.sourceUrl}`}><h3 className="font-semibold">{item.name}</h3><p className="mt-1 text-sm text-mutedfg">{item.description}</p><SourceLink title="Disease Ontology record" url={item.sourceUrl} /></li>
                  ))}</ul>
                </SectionCard>
              )}
              {report.query.type === 'symptoms' && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><ShieldAlert className="mr-2 inline size-4" aria-hidden />Symptoms are researched as entered; this report does not infer a diagnosis or recommend treatment.</p>}
              {!!report.limitations.length && <SectionCard title="Limitations"><ul className="list-disc space-y-1 pl-5 text-sm text-mutedfg">{report.limitations.map((item) => <li key={item}>{item}</li>)}</ul></SectionCard>}
            </TabsContent>

            <TabsContent value="medicines" className="space-y-4">
              {report.medicines.length ? report.medicines.map((medicine, index) => (
                <SectionCard key={`${medicine.genericName ?? 'medicine'}-${index}`} title={medicine.genericName ?? 'Medicine identity not verified'}>
                  <div className="space-y-4">
                    {!medicine.genericName && !medicine.activeIngredients.length && (
                      <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="status">
                        The entered name was not confidently matched to a verified ingredient. Confirm the generic name, brand, active ingredient, and formulation before relying on these results. Manual search terms are accepted but may remain unidentified.
                      </p>
                    )}
                    {!!medicine.brandNames.length && <p className="text-sm"><strong>Brand names reported by FDA records:</strong> {medicine.brandNames.join(', ')}</p>}
                    <p className="text-sm"><strong>Active ingredients:</strong> {medicine.activeIngredients.length ? medicine.activeIngredients.join(', ') : 'Not verified from available product records.'}</p>
                    {medicine.labelIndications && <p className="text-sm"><strong>FDA label indication text:</strong> {medicine.labelIndications}<span className="mt-1 block text-xs text-mutedfg">Label text is displayed as retrieved; local approval for this indication has not been independently verified.</span></p>}
                    {!!medicine.contraindications.length && <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-950"><strong>Formal contraindications in label:</strong><ul className="mt-1 list-disc space-y-1 pl-5">{medicine.contraindications.map((item) => <li key={item}>{item}</li>)}</ul></div>}
                    {!!medicine.precautions.length && <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><strong>Warnings and precautions in label:</strong><ul className="mt-1 list-disc space-y-1 pl-5">{medicine.precautions.map((item) => <li key={item}>{item}</li>)}</ul></div>}
                    <div className="rounded-lg border border-line bg-slate-50 p-3 text-sm">
                      <p><strong>Other established uses:</strong> Not assessed by current integrations.</p>
                      <p className="mt-1"><strong>Symptoms managed:</strong> Not assessed; symptom relief is not inferred from a disease indication.</p>
                      <p className="mt-1"><strong>Investigational uses:</strong> See trials; registry entries do not establish benefit or efficacy.</p>
                    </div>
                    {medicine.composition.length ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                          <thead><tr className="border-b border-line text-xs uppercase text-mutedfg"><th className="p-2">Product</th><th className="p-2">Active ingredients / strength</th><th className="p-2">Excipients</th><th className="p-2">Dosage form</th><th className="p-2">Manufacturer</th><th className="p-2">Market / listing dates</th></tr></thead>
                          <tbody>{medicine.composition.map((product) => (
                            <tr key={`${product.sourceUrl}-${product.productName}`} className="border-b border-line align-top">
                              <td className="p-2">{product.productName ?? 'Not listed'}</td>
                              <td className="p-2">{product.activeIngredients.length ? product.activeIngredients.map((ingredient) => <div key={`${ingredient.name}-${ingredient.strength}`}>{ingredient.name}: {ingredient.strength ?? 'strength not listed'}</div>) : 'Not documented'}</td>
                              <td className="p-2">{product.excipients.length ? product.excipients.join(', ') : 'Not documented in NDC listing'}</td>
                              <td className="p-2">{product.dosageForm ?? 'Not listed'}</td>
                              <td className="p-2">{product.manufacturer ?? 'Not listed'}</td>
                              <td className="p-2">{product.market}<div className="mt-1 text-xs text-mutedfg">{product.marketingStartDate ? `Start: ${product.marketingStartDate}` : 'Start date not listed'}{product.marketingEndDate ? ` · End: ${product.marketingEndDate}` : ''}{product.listingExpirationDate ? ` · Listing expires: ${product.listingExpirationDate}` : ''}{product.marketingCategory ? ` · ${product.marketingCategory}` : ''}</div></td>
                            </tr>
                          ))}</tbody>
                        </table>
                        <p className="mt-2 text-xs text-amber-800">{medicine.composition[0].listingNote}</p>
                      </div>
                    ) : <p className="text-sm text-amber-800">Composition is incomplete or unverified.</p>}
                    {!!medicine.sources.length && <ul className="flex flex-wrap gap-3">{medicine.sources.map((source) => <li key={source.url}><SourceLink title={source.title} url={source.url} /></li>)}</ul>}
                    {!!Object.entries(medicine.labelSections).length && (
                      <div className="space-y-2 border-t border-line pt-3">
                        <h3 className="text-sm font-semibold">Additional FDA label text</h3>
                        {Object.entries(medicine.labelSections).map(([section, text]) => (
                          <details key={section} className="rounded-lg border border-line p-3">
                            <summary className="cursor-pointer text-sm font-medium">{displayCriterion(section)}</summary>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-mutedfg">{text}</p>
                          </details>
                        ))}
                      </div>
                    )}
                  </div>
                </SectionCard>
              )) : <SectionCard title="Medicine records"><p className="text-sm text-mutedfg">No medicine was identified for this query.</p></SectionCard>}
            </TabsContent>

            <TabsContent value="regulatory" className="space-y-4">
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Regulatory status is never inferred from literature, an NDC listing, or absence of search results. An unknown result is not proof of approval or a ban.
              </p>
              {report.regulatoryFindings.length ? report.regulatoryFindings.map((finding, index) => <RegulatoryCard key={`${finding.country}-${finding.medicine}-${index}`} finding={finding} />) : (
                <SectionCard title="No jurisdiction assessed"><p className="text-sm text-mutedfg">Select a country and provide a medicine to request a jurisdiction-specific assessment.</p></SectionCard>
              )}
            </TabsContent>

            <TabsContent value="safety" className="space-y-4">
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Label information is source text, not a personalized contraindication determination. Confirm risks for the exact formulation with a clinician.
              </p>
              {report.medicines.map((medicine, index) => (
                <SectionCard key={`${medicine.genericName ?? 'safety'}-${index}`} title={`Safety information · ${medicine.genericName ?? 'Medicine'}`}>
                  {medicine.safetyInformation.length ? (
                    <ul className="list-disc space-y-2 pl-5 text-sm">{medicine.safetyInformation.map((item, itemIndex) => <li key={`${itemIndex}-${item.slice(0, 40)}`}>{item}</li>)}</ul>
                  ) : <p className="text-sm text-amber-800">No safety details were verified from a matching FDA label.</p>}
                  {!!medicine.contraindications.length && <div className="mt-3 rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-950"><strong>Formal contraindications (label text):</strong><ul className="mt-1 list-disc space-y-1 pl-5">{medicine.contraindications.map((item) => <li key={item}>{item}</li>)}</ul></div>}
                  {!!medicine.precautions.length && <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><strong>Precautions (label text):</strong><ul className="mt-1 list-disc space-y-1 pl-5">{medicine.precautions.map((item) => <li key={item}>{item}</li>)}</ul></div>}
                  {!!medicine.sources.length && <div className="mt-3"><SourceLink title="FDA label source" url={medicine.sources[0].url} /></div>}
                  {!!Object.entries(medicine.labelSections).length && (
                    <div className="mt-4 space-y-3">
                      {Object.entries(medicine.labelSections).map(([section, text]) => (
                        <div key={section} className="rounded-lg border border-line p-3">
                          <h3 className="text-sm font-semibold">{displayCriterion(section)}</h3>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-mutedfg">{text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              ))}
              {!report.medicines.length && <SectionCard title="Safety information"><p className="text-sm text-mutedfg">A medicine-specific safety assessment requires a drug name or brand.</p></SectionCard>}
              <SectionCard title="Contraindications and patient risk factors">
                <p className="text-sm"><strong>Provided factors:</strong> {report.patientRiskAssessment.suppliedFactors.join(', ') || 'None supplied'}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-mutedfg">{report.patientRiskAssessment.notes.map((note) => <li key={note}>{note}</li>)}</ul>
              </SectionCard>
            </TabsContent>

            <TabsContent value="interactions" className="space-y-4">
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                No authoritative pairwise interaction database is connected. Unknown results must not be interpreted as safe; ask a pharmacist or prescriber to review the exact products.
              </p>
              {report.interactions.length ? report.interactions.map((interaction, index) => (
                <SectionCard key={`${interaction.medicineA}-${interaction.medicineB}-${index}`} title={`${interaction.medicineA} + ${interaction.medicineB}`}>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={interaction.severity === 'unknown' ? 'amber' : statusVariant(interaction.severity)}>{displayStatus(interaction.severity)}</Badge>
                    <Badge variant="neutral">{interaction.interactionType}</Badge>
                    {interaction.verificationRequired && <Badge variant="rose">Clinician/pharmacist verification required</Badge>}
                  </div>
                  <p className="mt-3 text-sm">{interaction.clinicalConsequences}</p>
                  <p className="mt-2 text-sm"><strong>Mechanism:</strong> {interaction.mechanism}</p>
                  <p className="mt-2 text-sm"><strong>Review:</strong> {interaction.recommendedReview}</p>
                  {!!interaction.sourceUrls.length && <ul className="mt-3 flex flex-wrap gap-3">{interaction.sourceUrls.map((url) => <li key={url}><SourceLink title="FDA label (general text; not pair verification)" url={url} /></li>)}</ul>}
                </SectionCard>
              )) : (
                <SectionCard title="Interaction status"><p className="text-sm text-mutedfg">Enter the candidate medicine and current medications to list medicine pairs. No pairs were supplied; no safety conclusion can be drawn.</p></SectionCard>
              )}
            </TabsContent>

            <TabsContent value="evidence" className="space-y-4">
              <SectionCard title={`Clinical trials (${report.clinicalTrials.length})`}>
                {report.clinicalTrials.length ? <ul className="space-y-4">{report.clinicalTrials.map((trial) => (
                  <li key={trial.nctId} className="border-b border-line pb-3 last:border-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{trial.title}</h3><Badge variant="neutral">{trial.nctId}</Badge><Badge variant="sky">{trial.status}</Badge></div><p className="mt-1 text-sm text-mutedfg">{trial.phase} · Updated {trial.lastUpdated ?? 'date not listed'}</p><p className="mt-2 text-sm">{trial.summary}</p><SourceLink title="ClinicalTrials.gov record" url={trial.url} /></li>
                ))}</ul> : <p className="text-sm text-mutedfg">No matching trial records were retrieved.</p>}
              </SectionCard>
              <SectionCard title={`PubMed publications (${report.researchEvidence.length})`}>
                {report.researchEvidence.length ? <ul className="space-y-4">{report.researchEvidence.map((paper) => (
                  <li key={paper.url} className="border-b border-line pb-3 last:border-0"><h3 className="font-semibold">{paper.title}</h3><p className="mt-1 text-xs text-mutedfg">{paper.evidenceType}{paper.publicationDate ? ` · ${paper.publicationDate}` : ''}</p><p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-mutedfg">{paper.summary}</p><SourceLink title="PubMed record" url={paper.url} /></li>
                ))}</ul> : <p className="text-sm text-mutedfg">No matching publication records were retrieved.</p>}
              </SectionCard>
              <SectionCard title="Sources and retrieval status">
                {report.sources.length ? <ul className="space-y-3">{report.sources.map((source) => (
                  <li key={`${source.title}-${source.url}`} className="flex flex-wrap items-center gap-2"><SourceLink title={source.title} url={source.url} /><span className="text-xs text-mutedfg">{source.publisher} · checked {new Date(source.retrievedAt).toLocaleString()}</span><Badge variant={source.retrievalStatus === 'retrieved' ? 'emerald' : 'rose'}>{source.retrievalStatus}</Badge></li>
                ))}</ul> : <p className="text-sm text-mutedfg"><FileSearch className="mr-2 inline size-4" aria-hidden />No external source was queried.</p>}
              </SectionCard>
            </TabsContent>
          </Tabs>
          <p className="text-right text-xs text-mutedfg">Report generated {new Date(report.generatedAt).toLocaleString()}</p>
          <article className="report-print-only print-area">
            <header><h1>SECTION 1: REPORT OVERVIEW</h1>
              <p><strong>ASTROMORPH Drug Evidence and Safety Research Report</strong></p>
              <p>Generated: {new Date(report.generatedAt).toLocaleString()}</p>
              <p>Drug: {report.query.normalizedEntities.filter((item) => item.kind === 'drug' || item.kind === 'brand').map((item) => item.value).join(', ') || 'Not supplied'}</p>
              <p>Generic: {report.medicines[0]?.genericName ?? 'Not verified'} · Active ingredient: {report.medicines[0]?.activeIngredients.join(', ') || 'Not verified'}</p>
              <p>Target condition: {report.query.normalizedEntities.filter((item) => item.kind === 'disease').map((item) => item.value).join(', ') || 'Not supplied'}</p>
              <p>Symptoms: {report.query.normalizedEntities.filter((item) => item.kind === 'symptoms').map((item) => item.value).join(', ') || 'Not supplied'}</p>
              <p>Country: {report.query.normalizedEntities.filter((item) => item.kind === 'country').map((item) => item.value).join(', ') || 'Not supplied'}</p>
              <p>Research question: {report.query.original}</p>
            </header>
            <section>
              <h2>SECTION 2: DRUG PROFILE</h2>
              {report.medicines.map((medicine, index) => <div key={`${medicine.genericName}-${index}`}>
                <h3>{medicine.genericName ?? 'Medicine identity not verified'}</h3>
                <p>Drug classification: {medicine.drugClass ?? 'Not verified from label data'}</p>
                <p>Brands: {medicine.brandNames.join(', ') || 'Not verified'} · Active ingredients: {medicine.activeIngredients.join(', ') || 'Not verified'}</p>
                <p>FDA label indication text: {medicine.labelIndications ?? 'Not available; approval is not inferred.'}</p>
                <p>Mechanism: {medicine.labelSections.mechanism_of_action ?? 'Not retrieved from current structured sources.'}</p>
                <p>Other established uses: not assessed. Investigational uses: trial records in Section 11 are not proof of efficacy.</p>
                {medicine.composition.map((product) => <p key={`${product.sourceUrl}-${product.productName}`}>{product.productName ?? 'Product'}: {product.activeIngredients.map((item) => `${item.name} ${item.strength ?? ''}`).join('; ') || 'ingredients not documented'} · {product.dosageForm ?? 'form not listed'} · {product.market}. {product.listingNote} <SourceLink title="Product listing" url={product.sourceUrl} /></p>)}
              </div>)}
            </section>
            <section><h2>SECTION 3: DISEASE AND SYMPTOM RELEVANCE</h2>
              <p>Symptoms do not establish a diagnosis. Whether this drug treats the condition or only manages symptoms has not been established by an evidence appraisal.</p>
              {report.diseaseResearch.map((item) => <p key={item.sourceUrl}>{item.name}: {item.description} <SourceLink title="Disease Ontology record" url={item.sourceUrl} /></p>)}
            </section>
            <section>
              <h2>SECTION 4: DRUG SUITABILITY SCORE</h2>
              <p><strong>Score:</strong> {report.suitability.overallScore === null ? 'Insufficient evidence; no numerical score assigned' : `${report.suitability.overallScore}/100`}</p>
              <p><strong>Classification:</strong> {report.suitability.classification}</p>
              <p><strong>Evidence confidence / coverage:</strong> {report.suitability.evidenceConfidence} / {report.suitability.evidenceCoverage}%</p>
              {report.suitability.safetyOverride && <p><strong>Safety override:</strong> Verified serious concern blocks positive classification.</p>}
              <p><strong>Retrieved records:</strong> {report.suitability.recordsRetrieved}; relevant studies: {report.suitability.relevantStudiesCount ?? 'not verified'}; relevant human studies: {report.suitability.relevantHumanStudiesCount ?? 'not verified'}; clinical trial records: {report.suitability.clinicalTrialsCount}</p>
              <ul>{report.suitability.scoreBreakdown.map((component) => <li key={component.name}>{displayCriterion(component.name)} ({Math.round(component.weight * 100)}%): {component.score === null ? 'not assessed' : `${component.score}/100`} — {component.rationale} {component.sourceUrls.join(', ')}</li>)}</ul>
              <p>{report.suitability.finalAssessment}</p>
              <ul>{report.suitability.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
              {report.suitability.safetyInformationUnknown && <p>Important safety information remains unknown or unverified.</p>}
            </section>
            <section><h2>SECTION 5: EXISTING MEDICINES AND ALTERNATIVE OPTIONS</h2><p>Alternative medicines were not systematically retrieved or compared. No alternative is recommended.</p></section>
            <section><h2>SECTION 6: DRUG INTERACTION REPORT</h2>
              {report.interactions.length ? report.interactions.map((interaction, index) => <div key={`${interaction.medicineA}-${interaction.medicineB}-${index}`}>
                <h3>{interaction.medicineA} + {interaction.medicineB} · {displayStatus(interaction.severity)}</h3>
                <p>{interaction.clinicalConsequences} {interaction.mechanism}</p><p>{interaction.recommendedReview}</p>
                {interaction.sourceUrls.map((url) => <SourceLink key={url} title="Label source (not pair verification)" url={url} />)}
              </div>) : <p>No medicine pairs were supplied. No safety conclusion can be drawn.</p>}
              <p>No pairwise interaction database is configured; unknown is not safe.</p>
            </section>
            <section><h2>SECTION 7: CONTRAINDICATIONS AND PATIENT RISK FACTORS</h2>
              <p>Supplied risk factors: {report.patientRiskAssessment.suppliedFactors.join(', ') || 'None supplied'}; they were not matched to a personalized clinical assessment.</p>
              {report.medicines.flatMap((medicine) => medicine.safetyInformation.map((item) => <p key={`${medicine.genericName}-${item}`}>{item}</p>))}
              {report.patientRiskAssessment.notes.map((note) => <p key={note}>{note}</p>)}
            </section>
            <section><h2>SECTION 8: ADVERSE EFFECTS AND MONITORING</h2>
              {report.medicines.flatMap((medicine) => medicine.safetyInformation.map((item) => <p key={`safety-${medicine.genericName}-${item}`}>{item}</p>))}
              {report.medicines.flatMap((medicine) => medicine.contraindications.map((item) => <p key={`contra-${medicine.genericName}-${item}`}><strong>Formal contraindication:</strong> {item}</p>))}
              {report.medicines.flatMap((medicine) => medicine.precautions.map((item) => <p key={`precaution-${medicine.genericName}-${item}`}><strong>Precaution:</strong> {item}</p>))}
              {report.medicines.flatMap((medicine) => Object.entries(medicine.labelSections).map(([key, text]) => <p key={`${medicine.genericName}-${key}`}><strong>{displayCriterion(key)}:</strong> {text}</p>))}
              <p>Monitoring needs were not independently assessed; consult the applicable product label and clinician.</p>
            </section>
            <section><h2>SECTION 9: BANNED OR RESTRICTED STATUS</h2>
              {report.regulatoryFindings.length ? report.regulatoryFindings.map((finding, index) => <div key={`${finding.country}-${finding.medicine}-${index}`}>
                <h3>{finding.medicine} — {finding.country}: {displayStatus(finding.status)}</h3><p>{finding.scope}</p><p>{finding.authority ?? 'Authority not identified'} · status check attempted {new Date(finding.lastChecked).toLocaleString()}</p>
                {finding.sourceUrl && <SourceLink title="Regulatory authority" url={finding.sourceUrl} />}
              </div>) : <p>No jurisdiction assessed.</p>}
            </section>
            <section><h2>SECTION 10: FOOD, ALCOHOL, AND LIFESTYLE INTERACTIONS</h2>
              {report.medicines.map((medicine) => <div key={medicine.genericName}>
                {medicine.labelSections.food_effect && <p>Food: {medicine.labelSections.food_effect}</p>}
                {medicine.labelSections.alcohol && <p>Alcohol: {medicine.labelSections.alcohol}</p>}
                {!medicine.labelSections.food_effect && !medicine.labelSections.alcohol && <p>No specific interaction verified in current sources; this is not proof none exists.</p>}
              </div>)}
            </section>
            <section><h2>SECTION 11: EVIDENCE SUMMARY</h2><p>{report.summary ?? 'AI synthesis unavailable; evidence records follow.'}</p>
              {report.clinicalTrials.map((trial) => <div key={trial.nctId}><h3>{trial.title} ({trial.nctId})</h3><p>{trial.phase} · {trial.status} · {trial.summary}</p><SourceLink title="ClinicalTrials.gov" url={trial.url} /></div>)}
              {report.researchEvidence.map((paper) => <div key={paper.url}><h3>{paper.title}</h3><p>{paper.evidenceType} · {paper.publicationDate ?? 'Date not listed'} · {paper.summary}</p><SourceLink title="PubMed" url={paper.url} /></div>)}
            </section>
            <section><h2>SECTION 12: FINAL RESEARCH ASSESSMENT</h2>
              <p>{report.suitability.finalAssessment}</p><p>Confidence: {report.suitability.evidenceConfidence} · coverage: {report.suitability.evidenceCoverage}%</p>
              <p>Research use only; not diagnosis, medical advice, or a recommendation to start, stop, or modify medication.</p>
            </section>
            <section><h2>SECTION 13: SOURCES AND REFERENCES</h2>
              <ul>{report.sources.map((source) => <li key={`${source.title}-${source.url}`}><SourceLink title={source.title} url={source.url} /> — {source.publisher}; {source.retrievalStatus}; checked {new Date(source.retrievedAt).toLocaleString()}</li>)}</ul>
              <ul>{report.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
            </section>
          </article>
        </section>
      )}
    </div>
  )
}
