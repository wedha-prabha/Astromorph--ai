import { ArrowRight, BookOpenText, FileText, GitBranch, Info, Network, ShieldCheck } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis } from 'recharts'
import { DisclaimerBanner } from '@/components/shared/PageHeader'
import { ErrorState, LoadingState } from '@/components/shared/states'
import { EvidenceBadge } from '@/components/shared/evidence-badge'
import { ScoreRing } from '@/components/shared/ScoreRing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableWrapper, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useAnalysis, useEvidence, useReport } from '@/api/hooks'
import { formatNumber, scoreToBand } from '@/lib/utils'

const sourceTypeFilters = ['All', 'Literature', 'Clinical Trial', 'Safety', 'Molecular', 'Guideline'] as const

export function AnalysisResultsPage() {
  const { id = 'AST-2026-001' } = useParams()
  const navigate = useNavigate()
  const { data: analysis, isLoading, isError, refetch } = useAnalysis(id)
  const [typeFilter, setTypeFilter] = useState<(typeof sourceTypeFilters)[number]>('All')
  const [tab, setTab] = useState('overview')
  const { data: evidence, isLoading: evidenceLoading } = useEvidence(id, typeFilter)
  const { data: report } = useReport(id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        <LoadingState rows={3} label="Loading analysis results" />
      </div>
    )
  }
  if (isError || !analysis) return <ErrorState onRetry={() => refetch()} />

  const bandTone = analysis.overallScore >= 80 ? 'primary' : 'amber'

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs text-slate-400">{analysis.id}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{analysis.title}</h1>
          <p className="mt-1.5 text-sm text-mutedfg">AI-assisted drug repurposing analysis</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <EvidenceBadge band={scoreToBand(analysis.overallScore)} score={analysis.overallScore} />
            <Badge variant="navy">{analysis.status}</Badge>
            {report && (
              <Link
                to={`/reports/${report.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-medium text-navy-700 transition-colors hover:border-primary-300 hover:text-primary-700"
              >
                <FileText className="size-3" aria-hidden /> Research report ready
              </Link>
            )}
          </div>
        </div>
        <div className="grid shrink-0 grid-cols-3 gap-2 no-print">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/knowledge-graph?analysis=${analysis.id}`}>
              <Network /> Graph
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/trials?drug=Montelukast`}>
              <GitBranch /> Trials
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/literature?q=montelukast`}>
              <BookOpenText /> Papers
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-7">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="evidence">Evidence Breakdown</TabsTrigger>
          <TabsTrigger value="sources">Evidence Sources</TabsTrigger>
          <TabsTrigger value="agents">Agent Pipeline</TabsTrigger>
        </TabsList>

        {/* ---------------- Overview ---------------- */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Score */}
            <Card className="relative overflow-hidden">
              <div className="pointer-events-none absolute -right-10 -top-14 size-44 rounded-full bg-gradient-to-br from-primary-50 via-cyan-50 to-transparent blur-xl" aria-hidden />
              <CardHeader>
                <CardTitle>Repurposing Evidence</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pb-6">
                <ScoreRing score={analysis.overallScore} sublabel={`${analysis.evidenceBand} · ${scoreToBand(analysis.overallScore)}`} tone={bandTone as 'primary' | 'amber'} />
                <p className="mt-4 flex max-w-[260px] items-start gap-1.5 rounded-lg border border-cyan-200/70 bg-cyan-50/70 p-2.5 text-[11px] leading-relaxed text-cyan-900">
                  <Info className="mt-0.5 size-3 shrink-0 text-cyan-600" aria-hidden />
                  AI-generated research evidence score — not a clinical recommendation.
                </p>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>AI Research Summary</CardTitle>
                <p className="text-xs text-mutedfg">Synthesized by the Evidence Scoring & Report Generation agents</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.summaryOverview.map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed text-navy-800 first:font-medium">
                    {para}
                  </p>
                ))}
                <div className="grid gap-3 pt-1 sm:grid-cols-2">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Key Finding</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-emerald-950/90">{analysis.keyFinding}</p>
                  </div>
                  <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-3.5">
                    <p className="text-xs font-bold uppercase tracking-wide text-primary-700">Evidence Strength</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-primary-900/90">{analysis.evidenceStrength}</p>
                  </div>
                  <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3.5">
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Research Gap</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-amber-950/90">{analysis.researchGap}</p>
                  </div>
                  <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-3.5">
                    <p className="text-xs font-bold uppercase tracking-wide text-cyan-700">Recommended Next Investigation</p>
                    <ul className="mt-1.5 space-y-1 text-[13px] leading-relaxed text-cyan-950/90">
                      {analysis.nextInvestigation.map((s) => (
                        <li key={s} className="flex gap-1.5">
                          <span aria-hidden className="mt-[7px] size-1 shrink-0 rounded-full bg-cyan-500" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dimension mini chart */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Evidence dimension profile</CardTitle>
                <p className="mt-0.5 text-xs text-mutedfg">Weighted contribution of each dimension to the composite score</p>
              </div>
              <ShieldCheck className="size-4 text-slate-300" aria-hidden />
            </CardHeader>
            <CardContent className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.dimensions.map((d) => ({ name: d.label.split(' ')[0], score: d.score }))} margin={{ top: 4, right: 8, left: -22 }}>
                  <CartesianGrid strokeDasharray="3 6" stroke="#E9EEF4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={{ stroke: '#E9EEF4' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                  <ReTooltip cursor={{ fill: 'rgba(21,130,118,0.06)' }} contentStyle={{ borderRadius: 12, border: '1px solid #E4EAF1', fontSize: 13 }} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {analysis.dimensions.map((d) => (
                      <Cell key={d.id} fill={d.score >= 85 ? '#158276' : d.score >= 78 ? '#269C8E' : '#EAB308'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Evidence breakdown ---------------- */}
        <TabsContent value="evidence">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {analysis.dimensions.map((dim) => {
              const band = scoreToBand(dim.score)
              return (
                <Card key={dim.id} className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold leading-snug">{dim.label}</h3>
                      <EvidenceBadge band={band} />
                    </div>
                    <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-navy-900">{dim.score}%</p>
                    <Progress className="mt-2" value={dim.score} tone={dim.score >= 80 ? 'primary' : dim.score >= 65 ? 'sky' : 'amber'} />
                    <p className="mt-3 line-clamp-3 min-h-[54px] text-[13px] leading-relaxed text-mutedfg">{dim.description}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
                      <span className="text-xs font-medium text-slate-400">{formatNumber(dim.sources)} evidence sources</span>
                      <Button variant="link" size="sm" className="h-auto px-0 py-0" onClick={() => setTab('sources')}>
                        View evidence <ArrowRight className="size-3.5" aria-hidden />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ---------------- Evidence sources ---------------- */}
        <TabsContent value="sources">
          <Card>
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
              <div>
                <CardTitle>Evidence sources</CardTitle>
                <p className="mt-0.5 text-xs text-mutedfg">Every claim in this analysis is traceable to a listed source</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sourceTypeFilters.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setTypeFilter(f)}
                    className={
                      typeFilter === f
                        ? 'rounded-full border border-primary-600 bg-primary-600 px-3 py-1 text-xs font-semibold text-white shadow-sm'
                        : 'rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-navy-900'
                    }
                    aria-pressed={typeFilter === f}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="px-0">
              {evidenceLoading ? (
                <div className="px-5">
                  <LoadingState rows={4} label="Retrieving evidence" />
                </div>
              ) : (
                <TableWrapper>
                  <Table>
                    <THead>
                      <TR className="hover:bg-transparent">
                        <TH>Source</TH>
                        <TH>Type</TH>
                        <TH>Year</TH>
                        <TH>Relevance</TH>
                        <TH>Evidence Level</TH>
                        <TH>Citation</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {(evidence ?? []).map((src) => (
                        <TR key={src.id}>
                          <TD className="max-w-[340px]">
                            <p className="truncate font-medium text-navy-900" title={src.title}>{src.title}</p>
                            <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-mutedfg">
                              <DatabaseDot db={src.database} /> {src.database}
                            </p>
                          </TD>
                          <TD><Badge variant={src.type === 'Clinical Trial' ? 'cyan' : src.type === 'Safety' ? 'rose' : src.type === 'Molecular' ? 'violet' : src.type === 'Guideline' ? 'amber' : 'default'}>{src.type}</Badge></TD>
                          <TD className="tabular-nums text-mutedfg">{src.year}</TD>
                          <TD>
                            <div className="flex items-center gap-2">
                              <Progress className="w-16" value={src.relevance} tone={src.relevance >= 85 ? 'emerald' : 'sky'} />
                              <span className="text-xs font-semibold tabular-nums">{src.relevance}%</span>
                            </div>
                          </TD>
                          <TD className="max-w-[180px] text-[13px] text-mutedfg">{src.evidenceLevel}</TD>
                          <TD className="max-w-[280px]"><p className="truncate font-mono text-[11px] text-slate-400" title={src.citation}>{src.citation}</p></TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </TableWrapper>
              )}
            </CardContent>
          </Card>
          <DisclaimerBanner compact className="mt-4" />
        </TabsContent>

        {/* ---------------- Agent pipeline ---------------- */}
        <TabsContent value="agents">
          <div className="space-y-3">
            {analysis.agents.map((agent) => (
              <Card key={agent.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4">
                <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-accent text-xs font-bold text-white">
                  {String(agent.order).padStart(2, '0')}
                </span>
                <div className="min-w-[200px] flex-1">
                  <p className="text-sm font-semibold">{agent.name}</p>
                  <p className="text-xs text-mutedfg">{agent.activity}</p>
                </div>
                <div className="flex items-center gap-5 text-xs text-mutedfg">
                  {agent.sources !== null && agent.sources > 0 && <span><strong className="block text-sm text-navy-900">{formatNumber(agent.sources)}</strong>sources</span>}
                  {agent.durationSec !== null && <span><strong className="block text-sm text-navy-900">{agent.durationSec}s</strong>runtime</span>}
                  <EvidenceBadge band={agent.status === 'completed' ? 'Strong' : 'Moderate'} />
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <Button variant="outline" onClick={() => navigate(`/analyses/${analysis.id}/progress`)}>
              Replay pipeline run
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Report CTA */}
      {report && (
        <Card className="mt-6 border-primary-200 bg-gradient-to-r from-primary-50/80 to-accent-soft/60 no-print">
          <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <span className="flex size-11 items-center justify-center rounded-xl bg-surface shadow-sm ring-1 ring-primary-100">
                <FileText className="size-5 text-primary-700" aria-hidden />
              </span>
              <div>
                <p className="font-semibold">Full research report available</p>
                <p className="text-sm text-mutedfg">13 sections · 24 references · generated {new Date(report.generatedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <Button asChild>
              <Link to={`/reports/${report.id}`}>
                Open report <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DatabaseDot({ db }: { db: string }) {
  const color =
    db.includes('PubMed') ? '#60A5FA' :
    db === 'FDA' || db.includes('FAERS') ? '#FB7185' :
    db.includes('ClinicalTrials') ? '#22D3EE' :
    db.includes('DrugBank') ? '#A78BFA' : '#FBBF24'
  return <span aria-hidden className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
}
