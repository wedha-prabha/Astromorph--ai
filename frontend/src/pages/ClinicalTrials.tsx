import { FlaskConical, MapPin, Users } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { StatusPill } from '@/components/shared/evidence-badge'
import { PageHeader } from '@/components/shared/PageHeader'
import { ErrorState, LoadingState, NoResults } from '@/components/shared/states'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, DialogTitle } from '@/components/ui/dialog'
import { Input, Label, Select } from '@/components/ui/input'
import { Table, TableWrapper, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { useTrials } from '@/api/hooks'
import type { ClinicalTrial } from '@/types'
import { formatDate } from '@/lib/utils'

const phases = ['All', 'Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'] as const
const statuses = ['All', 'Recruiting', 'Completed', 'Active, not recruiting', 'Terminated', 'Not yet recruiting'] as const
export function ClinicalTrialsPage() {
  const [params] = useSearchParams()
  const [drug, setDrug] = useState(params.get('drug') ?? '')
  const [phase, setPhase] = useState('All')
  const [status, setStatus] = useState('All')
  const [country, setCountry] = useState('')
  const [sponsor, setSponsor] = useState('')
  const [selectedTrial, setSelectedTrial] = useState<ClinicalTrial | null>(null)

  const filters = {
    drug: drug.trim() || undefined,
    phase: phase === 'All' ? undefined : phase,
    status: status === 'All' ? undefined : status,
    country: country.trim() || undefined,
    sponsor: sponsor.trim() || undefined,
  }
  const { data: trials, isLoading, isError, refetch } = useTrials(filters)

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Clinical trials"
        title="Clinical trial explorer"
        subtitle="Screen ClinicalTrials.gov records relevant to repurposing research. Filter by phase, status, geography, and sponsor."
      />

      {/* Filters */}
      <Card className="mb-5">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5">
            <Label htmlFor="f-drug">Drug or intervention</Label>
            <Input id="f-drug" value={drug} onChange={(e) => setDrug(e.target.value)} placeholder="Any intervention" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-phase">Phase</Label>
            <Select id="f-phase" value={phase} onChange={(e) => setPhase(e.target.value)}>
              {phases.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-status">Status</Label>
            <Select id="f-status" value={status} onChange={(e) => setStatus(e.target.value)}>
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-country">Country</Label>
            <Input id="f-country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Any country" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-sponsor">Sponsor</Label>
            <Input id="f-sponsor" value={sponsor} onChange={(e) => setSponsor(e.target.value)} placeholder="Any sponsor" />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingState rows={5} label="Screening trial registry" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !trials || trials.items.length === 0 ? (
        <NoResults
          query={[drug, phase !== 'All' && phase, status !== 'All' && status].filter(Boolean).join(', ')}
          onClear={() => {
            setDrug(''); setPhase('All'); setStatus('All'); setCountry(''); setSponsor('')
          }}
        />
      ) : (
        <>
          <p className="mb-3 text-xs font-medium text-slate-400" aria-live="polite">
            {trials.items.length} live trial record{trials.items.length === 1 ? '' : 's'} returned
          </p>
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <FlaskConical className="size-4 text-primary-600" aria-hidden />
              <CardTitle>Registry results</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              <TableWrapper>
                <Table>
                  <THead>
                    <TR className="hover:bg-transparent">
                      <TH>Trial ID</TH><TH>Drug</TH><TH>Condition</TH><TH>Phase</TH><TH>Status</TH><TH>Sponsor</TH><TH>Start Date</TH><TH>Location</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {trials.items.map((t) => (
                      <TR key={t.id} className="cursor-pointer" onClick={() => setSelectedTrial(t)}>
                        <TD><span className="font-mono text-xs font-semibold text-primary-700">{t.nctId}</span></TD>
                        <TD className="font-medium text-navy-900">{t.drug}</TD>
                        <TD className="max-w-[200px] truncate">{t.condition}</TD>
                        <TD><Badge variant="outline">{t.phase}</Badge></TD>
                        <TD><StatusPill status={t.status} pulse={t.status === 'Recruiting'} /></TD>
                        <TD className="max-w-[180px] truncate text-mutedfg">{t.sponsor}</TD>
                        <TD className="whitespace-nowrap text-mutedfg">{formatDate(t.startDate)}</TD>
                        <TD className="max-w-[160px] truncate text-xs text-mutedfg">
                          {t.locations.map((l) => l.city).join(', ')}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </TableWrapper>
            </CardContent>
          </Card>
        </>
      )}

      {/* Detail drawer */}
      <Sheet open={!!selectedTrial} onOpenChange={(v) => !v && setSelectedTrial(null)}>
        <SheetContent side="right" aria-describedby={undefined}>
          <DialogTitle className="sr-only">Trial details</DialogTitle>
          {selectedTrial && (
            <div className="flex h-full flex-col overflow-y-auto scrollbar-thin">
              <div className="border-b border-line p-6 pr-12">
                <p className="font-mono text-xs text-primary-700">{selectedTrial.nctId}</p>
                <h2 className="mt-1.5 text-lg font-bold leading-snug tracking-tight">{selectedTrial.title}</h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant="outline">{selectedTrial.phase}</Badge>
                  <StatusPill status={selectedTrial.status} pulse={selectedTrial.status === 'Recruiting'} />
                </div>
              </div>
              <div className="flex-1 space-y-6 p-6">
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">Study summary</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-800">{selectedTrial.summary}</p>
                </section>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-y border-line py-4 text-sm">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Drug / intervention</dt>
                    <dd className="mt-0.5 font-semibold">{selectedTrial.drug}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Condition</dt>
                    <dd className="mt-0.5 font-semibold">{selectedTrial.condition}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Sponsor</dt>
                    <dd className="mt-0.5 font-semibold">{selectedTrial.sponsor}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Start date</dt>
                    <dd className="mt-0.5 font-semibold">{formatDate(selectedTrial.startDate)}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                      <Users className="size-3" aria-hidden /> Enrollment
                    </dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">{selectedTrial.enrollment.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Primary outcome</dt>
                    <dd className="mt-0.5 max-w-[240px] text-[13px] leading-snug">{selectedTrial.primaryOutcome}</dd>
                  </div>
                </dl>
                <section>
                  <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                    <MapPin className="size-3.5" aria-hidden /> Study locations
                  </h3>
                  <ul className="mt-2 space-y-1.5">
                    {selectedTrial.locations.map((l) => (
                      <li key={`${l.city}-${l.country}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                        <span className="font-medium">{l.city}</span>
                        <span className="text-xs text-mutedfg">{l.country}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
              <div className="border-t border-line p-4 no-print">
                <Button variant="soft" className="w-full" onClick={() => window.open(`https://clinicaltrials.gov/study/${selectedTrial.nctId}`, '_blank')}>
                  View on ClinicalTrials.gov
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
