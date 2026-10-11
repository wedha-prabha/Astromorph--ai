import { BookMarked, BookOpenText, Plus } from 'lucide-react'
import { useState } from 'react'
import { RelevanceMeter, EvidenceBadge } from '@/components/shared/evidence-badge'
import { PageHeader } from '@/components/shared/PageHeader'
import { ErrorState, LoadingState, NoResults } from '@/components/shared/states'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input, Label, Select } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { useLiterature } from '@/api/hooks'

const journals = ['All', 'Chest', 'Thorax', 'European Respiratory Journal', 'Respiratory Research', 'Pharmacological Research', 'International Immunopharmacology', 'Nature Reviews Drug Discovery', 'The Lancet Respiratory Medicine', 'Pharmacoepidemiology and Drug Safety', 'Am J Physiol Lung Cell Mol Physiol']
const levels = ['All', 'Meta-analysis', 'RCT', 'Observational', 'Preclinical', 'Review', 'Genetic'] as const
const studyTypes = ['All', 'Systematic review', 'Randomized controlled trial', 'Cross-sectional', 'Prospective cohort', 'Animal study', 'Cell culture', 'Review / in silico', 'Narrative review', 'Mendelian randomization', 'Spontaneous-report analysis']

export function LiteratureExplorerPage() {
  const [q, setQ] = useState('')
  const [level, setLevel] = useState('All')
  const [journal, setJournal] = useState('All')
  const [studyType, setStudyType] = useState('All')
  const [yearFrom, setYearFrom] = useState('')
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const filters = {
    q: q || undefined,
    level: level.startsWith('All') ? undefined : level,
    journal: journal === 'All' ? undefined : journal,
    studyType: studyType === 'All' ? undefined : studyType,
    yearFrom: yearFrom || undefined,
  }
  const { data: papers, isLoading, isError, refetch } = useLiterature(filters)

  function toggleSave(id: string, title: string) {
    setSaved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    toast({
      title: saved.has(id) ? 'Removed from research' : 'Added to saved research',
      description: title,
      tone: 'info',
    })
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Literature"
        title="Biomedical literature explorer"
        subtitle="Search the publications corpus retrieved by ASTROMORPH agents. Each result includes relevance scoring and study classification."
      />

      {/* Search + filters */}
      <Card className="mb-6">
        <CardContent className="space-y-4 p-4">
          <div className="relative">
            <BookOpenText className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder='Search biomedical research… try "leukotriene"'
              className="h-11 pl-10"
              aria-label="Search biomedical research"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="lit-journal" className="text-xs">Journal</Label>
              <Select id="lit-journal" value={journal} onChange={(e) => setJournal(e.target.value)}>
                {journals.map((j) => <option key={j}>{j}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="lit-type" className="text-xs">Study type</Label>
              <Select id="lit-type" value={studyType} onChange={(e) => setStudyType(e.target.value)}>
                {studyTypes.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="lit-level" className="text-xs">Evidence level</Label>
              <Select id="lit-level" value={level} onChange={(e) => setLevel(e.target.value)}>
                {levels.map((l) => <option key={l}>{l}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="lit-year" className="text-xs">Published after</Label>
              <Input id="lit-year" type="number" min={2000} max={2026} placeholder="e.g., 2019" value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingState rows={5} label="Searching literature corpus" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !papers || papers.length === 0 ? (
        <NoResults query={[q, level !== 'All' && level].filter(Boolean).join(', ')} onClear={() => { setQ(''); setLevel('All'); setJournal('All'); setStudyType('All'); setYearFrom('') }} />
      ) : (
        <>
          <p className="mb-3 text-xs font-medium text-slate-400" aria-live="polite">
            {papers.length} publication{papers.length === 1 ? '' : 's'} found
          </p>
          <div className="space-y-3">
            {papers.map((p) => (
              <Card key={p.id} className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-400">PMID {p.pmid}</span>
                        <Badge variant="outline">{p.studyType}</Badge>
                        <Badge variant="neutral">{p.evidenceLevel}</Badge>
                      </div>
                      <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-navy-900">{p.title}</h3>
                      <p className="mt-1 text-[13px] text-mutedfg">
                        {p.authors} · <span className="italic">{p.journal}</span> · {p.year}
                      </p>
                    </div>
                    <RelevanceMeter value={p.relevanceScore} />
                  </div>
                  <p className="mt-3 border-l-2 border-line pl-3 text-sm leading-relaxed text-mutedfg">
                    …{p.abstractSnippet}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3.5 no-print">
                    <EvidenceBadge band={p.relevanceScore >= 85 ? 'Strong' : p.relevanceScore >= 70 ? 'Moderate' : 'Preliminary'} score={undefined} />
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => window.open(`https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/`, '_blank')}>
                        View evidence
                      </Button>
                      <Button variant="soft" size="sm" onClick={() => toggleSave(p.id, p.title)}>
                        {saved.has(p.id) ? <BookMarked /> : <Plus />}
                        {saved.has(p.id) ? 'Saved' : 'Add to Research'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
