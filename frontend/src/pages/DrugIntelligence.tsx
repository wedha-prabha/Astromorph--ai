import { Activity, ArrowUpRight, BookOpenText, FlaskConical, Pill, Search, ShieldAlert, Target } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EvidenceBadge } from '@/components/shared/evidence-badge'
import { DisclaimerBanner, PageHeader } from '@/components/shared/PageHeader'
import { ErrorState, LoadingState, NoResults } from '@/components/shared/states'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Table, TableWrapper, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusPill } from '@/components/shared/evidence-badge'
import { useDrug, useDrugs, useLiterature, useTrials } from '@/api/hooks'

export function DrugIntelligencePage() {
  const [params, setParams] = useSearchParams()
  const { data: drugs, isLoading: listLoading, isError } = useDrugs()
  const query = params.get('id') ?? 'montelukast'
  const [searchTerm, setSearchTerm] = useState('')

  const suggestions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return []
    return (drugs ?? []).filter((d) => d.name.toLowerCase().includes(q)).slice(0, 5)
  }, [drugs, searchTerm])

  const { data: drug, isLoading: detailLoading } = useDrug(query)
  const { data: trials } = useTrials({ drug: drug?.name })
  const { data: papers } = useLiterature({ q: drug?.name.toLowerCase() })

  if (isError) return <ErrorState />

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Drug intelligence"
        title="Research-grade drug profiles"
        subtitle="Mechanism of action, molecular targets, approved indications, safety signals, and emerging repurposing candidates — compiled from curated public sources."
      />

      {/* Search */}
      <div className="relative mb-7 max-w-xl">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && suggestions[0]) {
              setParams({ id: suggestions[0].id })
              setSearchTerm('')
            }
          }}
          placeholder='Search drugs — try "Montelukast"'
          className="h-11 pl-10"
          aria-label="Search drugs"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-line bg-surface shadow-lift animate-fade-in">
            {suggestions.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                  onClick={() => {
                    setParams({ id: d.id })
                    setSearchTerm('')
                  }}
                >
                  <Pill className="size-4 text-primary-600" aria-hidden />
                  <span>
                    <span className="block text-sm font-medium">{d.name}</span>
                    <span className="block text-xs text-mutedfg">{d.drugClass}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {listLoading || detailLoading || !drug ? (
        <LoadingState rows={3} label="Loading drug profile" />
      ) : (
        <>
          {/* Header card */}
          <Card className="mb-6 overflow-hidden border-primary-100 bg-gradient-to-r from-primary-50/70 to-surface">
            <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent p-3 shadow-sm">
                  <Pill className="size-6 text-white" aria-hidden />
                </span>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">{drug.name}</h2>
                  <p className="mt-0.5 text-sm text-mutedfg">
                    {drug.brandNames.length > 0 && `${drug.brandNames.join(', ')} · `}
                    Approved {drug.approvalYear} · ATC {drug.atcCode}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="default">{drug.drugClass}</Badge>
                    <Badge variant="neutral">{drug.stats.targets} targets</Badge>
                    <Badge variant="neutral">{drug.stats.pathways} pathways</Badge>
                  </div>
                </div>
              </div>
              <dl className="grid grid-cols-3 gap-4 text-center sm:gap-8">
                {[
                  ['Publications', drug.stats.publications],
                  ['Trials', drug.stats.trials],
                  ['Repurposing candidates', drug.repurposingCandidates.length],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                    <dd className="mt-0.5 text-xl font-bold tabular-nums text-navy-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {!drug.detailed && (
            <DisclaimerBanner compact className="mb-6 max-w-none" />
          )}

          <Tabs defaultValue="overview">
            <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="mechanism">Mechanism</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
              <TabsTrigger value="safety">Safety</TabsTrigger>
              <TabsTrigger value="trials">Trials</TabsTrigger>
              <TabsTrigger value="literature">Literature</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>Drug overview</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-relaxed text-mutedfg">{drug.description}</p>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 text-sm">
                      {drug.pharmacokinetics.map((pk) => (
                        <div key={pk.label}>
                          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{pk.label}</dt>
                          <dd className="font-semibold text-navy-900">{pk.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Approved indications & status</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="divide-y divide-line">
                      {drug.indications.map((ind) => (
                        <li key={ind.indication} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                          <span className="text-sm font-medium text-navy-800">{ind.indication}</span>
                          <Badge variant={ind.status === 'Approved' ? 'emerald' : 'amber'}>{ind.status}</Badge>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Potential repurposing candidates</CardTitle>
                    <p className="mt-0.5 text-xs text-mutedfg">Ranked by research-evidence strength across ASTROMORPH analyses</p>
                  </div>
                  <Activity className="size-4 text-primary-600" aria-hidden />
                </CardHeader>
                <CardContent>
                  <TableWrapper>
                    <Table>
                      <THead>
                        <TR className="hover:bg-transparent">
                          <TH>Disease</TH>
                          <TH>Score</TH>
                          <TH>Evidence band</TH>
                          <TH>Status</TH>
                          <TH aria-label="Actions" />
                        </TR>
                      </THead>
                      <TBody>
                        {drug.repurposingCandidates.map((c) => (
                          <TR key={c.disease}>
                            <TD className="font-medium text-navy-900">{c.disease}</TD>
                            <TD>
                              <div className="flex items-center gap-2">
                                <Progress className="w-20" value={c.score} />
                                <span className="text-xs font-bold tabular-nums">{c.score}%</span>
                              </div>
                            </TD>
                            <TD><EvidenceBadge band={c.band} /></TD>
                            <TD><StatusPill status={c.status} pulse={c.status === 'Processing'} /></TD>
                            <TD>
                              {c.analysisId && c.band !== null && (
                                <Button variant="link" size="sm" asChild className="h-auto px-0 py-0">
                                  <Link to={`/analyses/${c.analysisId}`}>
                                    View analysis <ArrowUpRight className="size-3.5" aria-hidden />
                                  </Link>
                                </Button>
                              )}
                            </TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  </TableWrapper>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mechanism" className="space-y-5">
              <Card>
                <CardHeader><CardTitle>Mechanism of action</CardTitle></CardHeader>
                <CardContent><p className="max-w-3xl text-sm leading-relaxed text-navy-800">{drug.mechanism}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex-row items-center gap-2 space-y-0">
                  <Target className="size-4 text-primary-600" aria-hidden />
                  <CardTitle>Molecular targets</CardTitle>
                </CardHeader>
                <CardContent>
                  <TableWrapper>
                    <Table>
                      <THead>
                        <TR className="hover:bg-transparent"><TH>Target</TH><TH>Kind</TH><TH>Affinity</TH><TH>Role</TH></TR>
                      </THead>
                      <TBody>
                        {drug.targets.map((t) => (
                          <TR key={t.name}>
                            <TD className="font-mono text-sm font-semibold text-navy-900">{t.name}</TD>
                            <TD className="text-mutedfg">{t.kind}</TD>
                            <TD><Badge variant="cyan">{t.affinity}</Badge></TD>
                            <TD className="max-w-[280px] text-sm text-mutedfg">{t.role}</TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  </TableWrapper>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evidence">
              <Card>
                <CardHeader><CardTitle>Evidence snapshot</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-mutedfg">
                    Cross-references between {drug.name} and disease evidence are maintained per analysis.
                    Open a linked analysis for the full five-dimension breakdown with source-level citations.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {drug.repurposingCandidates.filter((c) => c.analysisId).map((c) => (
                      <Link key={c.disease} to={`/analyses/${c.analysisId}`} className="group rounded-xl border border-line p-4 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lift">
                        <p className="font-semibold group-hover:text-primary-800">{drug.name} → {c.disease}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <EvidenceBadge band={c.band} score={c.score} />
                          <StatusPill status={c.status} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="safety" className="space-y-5">
              {drug.boxedWarning && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5">
                  <ShieldAlert className="mt-0.5 size-5 shrink-0 text-rose-600" aria-hidden />
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-rose-700">Boxed warning</p>
                    <p className="mt-1 text-sm leading-relaxed text-rose-900">{drug.boxedWarning}</p>
                  </div>
                </div>
              )}
              <div className="grid gap-5 lg:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>Reported adverse events</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="divide-y divide-line">
                      {drug.commonAdverseEvents.map((ae) => (
                        <li key={ae.event} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                          <span className="text-sm font-medium text-navy-800">{ae.event}</span>
                          <span className="flex items-center gap-2">
                            <Badge variant={ae.severity === 'serious' ? 'rose' : ae.severity === 'rare' ? 'amber' : 'neutral'}>{ae.severity}</Badge>
                            <span className="w-14 text-right text-xs tabular-nums text-mutedfg">{ae.frequency}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Contraindications & cautions</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {drug.contraindications.map((c) => (
                        <li key={c} className="flex gap-2.5 text-sm leading-relaxed text-mutedfg">
                          <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-rose-400" /> {c}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trials">
              {!trials || trials.length === 0 ? (
                <NoResults query={drug.name} onClear={() => undefined} />
              ) : (
                <Card>
                  <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle>Clinical trials mentioning {drug.name}</CardTitle>
                    <FlaskConical className="size-4 text-primary-600" aria-hidden />
                  </CardHeader>
                  <CardContent className="px-0 pb-2">
                    <TableWrapper>
                      <Table>
                        <THead>
                          <TR className="hover:bg-transparent">
                            <TH>Trial ID</TH><TH>Condition</TH><TH>Phase</TH><TH>Status</TH><TH>Sponsor</TH>
                          </TR>
                        </THead>
                        <TBody>
                          {trials.slice(0, 6).map((t) => (
                            <TR key={t.id}>
                              <TD><span className="font-mono text-xs font-semibold text-primary-700">{t.nctId}</span></TD>
                              <TD className="max-w-[240px] truncate">{t.condition}</TD>
                              <TD><Badge variant="outline">{t.phase}</Badge></TD>
                              <TD><StatusPill status={t.status} /></TD>
                              <TD className="max-w-[200px] truncate text-mutedfg">{t.sponsor}</TD>
                            </TR>
                          ))}
                        </TBody>
                      </Table>
                    </TableWrapper>
                    <div className="border-t border-line px-5 pt-3">
                      <Button variant="link" size="sm" asChild className="px-0">
                        <Link to={`/trials?drug=${encodeURIComponent(drug.name)}`}>Open in Clinical Trial explorer →</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="literature">
              {!papers || papers.length === 0 ? (
                <NoResults query={drug.name} onClear={() => undefined} />
              ) : (
                <div className="space-y-3">
                  {papers.slice(0, 5).map((p) => (
                    <Card key={p.id} className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-semibold leading-snug">{p.title}</h3>
                          <p className="mt-1 text-xs text-mutedfg">{p.authors} · {p.journal} · {p.year}</p>
                        </div>
                        <EvidenceBadge band={p.relevanceScore >= 85 ? 'Strong' : p.relevanceScore >= 70 ? 'Moderate' : 'Preliminary'} score={p.relevanceScore} />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mutedfg">{p.abstractSnippet}</p>
                    </Card>
                  ))}
                  <Button variant="outline" asChild>
                    <Link to={`/literature?q=${encodeURIComponent(drug.name)}`}>
                      <BookOpenText /> Open full literature results
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
