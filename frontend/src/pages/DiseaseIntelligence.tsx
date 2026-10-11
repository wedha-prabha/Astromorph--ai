import { Activity, ArrowUpRight, Dna, GitBranch, HeartPulse, Search, Stethoscope } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EvidenceBadge, StatusPill } from '@/components/shared/evidence-badge'
import { DisclaimerBanner, PageHeader } from '@/components/shared/PageHeader'
import { ErrorState, LoadingState } from '@/components/shared/states'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Table, TableWrapper, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDisease, useDiseases } from '@/api/hooks'

export function DiseaseIntelligencePage() {
  const [params, setParams] = useSearchParams()
  const { data: diseases, isLoading: listLoading, isError } = useDiseases()
  const query = params.get('id') ?? 'copd'
  const [searchTerm, setSearchTerm] = useState('')

  const suggestions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return []
    return (diseases ?? []).filter((d) => d.name.toLowerCase().includes(q)).slice(0, 5)
  }, [diseases, searchTerm])

  const { data: disease, isLoading: detailLoading } = useDisease(query)

  if (isError) return <ErrorState />

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Disease intelligence"
        title="Disease research profiles"
        subtitle="Pathophysiology, biological pathways, genetic associations, treatment landscape, and candidate repurposing opportunities. For research intelligence — not patient diagnosis."
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
          placeholder='Search diseases — try "COPD"'
          className="h-11 pl-10"
          aria-label="Search diseases"
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
                  <Stethoscope className="size-4 text-primary-600" aria-hidden />
                  <span>
                    <span className="block text-sm font-medium">{d.name}</span>
                    <span className="block text-xs text-mutedfg">{d.category}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {listLoading || detailLoading || !disease ? (
        <LoadingState rows={3} label="Loading disease profile" />
      ) : (
        <>
          {/* Header card */}
          <Card className="mb-6 overflow-hidden border-cyan-100 bg-gradient-to-r from-cyan-50/70 to-surface">
            <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-primary-500 p-3 shadow-sm">
                  <HeartPulse className="size-6 text-white" aria-hidden />
                </span>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">{disease.name}</h2>
                  <p className="mt-0.5 text-sm text-mutedfg">{disease.category} · ICD-10 {disease.icd10}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {disease.prevalence} · {disease.mortality}
                  </p>
                </div>
              </div>
              <dl className="grid grid-cols-3 gap-4 text-center sm:gap-8">
                {[
                  ['Publications', disease.stats.publications],
                  ['Trials', disease.stats.trials],
                  ['Candidates', disease.candidates.length],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                    <dd className="mt-0.5 text-xl font-bold tabular-nums text-navy-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {!disease.detailed && <DisclaimerBanner compact className="mb-6 max-w-none" />}

          <Tabs defaultValue="overview">
            <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pathways">Pathways & Genetics</TabsTrigger>
              <TabsTrigger value="treatments">Treatment Landscape</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>Disease overview</CardTitle></CardHeader>
                  <CardContent><p className="text-sm leading-relaxed text-navy-800">{disease.description}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Common symptoms</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="flex flex-wrap gap-2">
                      {disease.symptoms.map((s) => (
                        <li key={s}><Badge variant="navy">{s}</Badge></li>
                      ))}
                    </ul>
                    <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/70 p-3.5">
                      <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Unmet therapeutic need</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-amber-950/90">{disease.unmetNeed}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="pathways" className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <Card>
                  <CardHeader className="flex-row items-center gap-2 space-y-0">
                    <GitBranch className="size-4 text-primary-600" aria-hidden />
                    <CardTitle>Biological pathways</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {disease.pathways.map((p) => (
                        <li key={p.name} className="rounded-xl border border-line p-3.5">
                          <p className="text-sm font-semibold">{p.name}</p>
                          <p className="mt-0.5 text-[13px] leading-relaxed text-mutedfg">{p.role}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex-row items-center gap-2 space-y-0">
                    <Dna className="size-4 text-violet-600" aria-hidden />
                    <CardTitle>Associated genes & targets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <TableWrapper>
                      <Table>
                        <THead>
                          <TR className="hover:bg-transparent"><TH>Gene</TH><TH>Name</TH><TH>Association</TH></TR>
                        </THead>
                        <TBody>
                          {disease.genes.map((g) => (
                            <TR key={g.symbol}>
                              <TD><span className="font-mono text-xs font-bold text-violet-700">{g.symbol}</span></TD>
                              <TD className="text-sm">{g.name}</TD>
                              <TD className="max-w-[220px] text-xs text-mutedfg">{g.association}</TD>
                            </TR>
                          ))}
                        </TBody>
                      </Table>
                    </TableWrapper>
                    <div className="space-y-2 border-t border-line pt-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Protein targets</p>
                      {disease.proteinTargets.map((t) => (
                        <div key={t.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                          <span className="text-sm font-medium">{t.name}</span>
                          <span className="max-w-[55%] truncate text-right text-xs text-mutedfg" title={t.note}>{t.note}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="treatments">
              <Card>
                <CardHeader><CardTitle>Current treatment landscape</CardTitle></CardHeader>
                <CardContent className="px-0 pb-2">
                  <TableWrapper>
                    <Table>
                      <THead>
                        <TR className="hover:bg-transparent"><TH>Treatment</TH><TH>Class</TH><TH>Line of care</TH></TR>
                      </THead>
                      <TBody>
                        {disease.treatments.map((t) => (
                          <TR key={t.name}>
                            <TD className="font-semibold text-navy-900">{t.name}</TD>
                            <TD className="text-mutedfg">{t.drugClass}</TD>
                            <TD><Badge variant="outline">{t.line}</Badge></TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  </TableWrapper>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="candidates">
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Potential repurposing candidates</CardTitle>
                    <p className="mt-0.5 text-xs text-mutedfg">Ranked by research-evidence strength for this disease</p>
                  </div>
                  <Activity className="size-4 text-primary-600" aria-hidden />
                </CardHeader>
                <CardContent>
                  <TableWrapper>
                    <Table>
                      <THead>
                        <TR className="hover:bg-transparent"><TH>Drug</TH><TH>Score</TH><TH>Evidence band</TH><TH>Status</TH><TH aria-label="Actions" /></TR>
                      </THead>
                      <TBody>
                        {disease.candidates.map((c) => (
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
                              {c.analysisId && (
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
          </Tabs>

        </>
      )}
    </div>
  )
}
