import { Activity, ArrowRight, BookOpenText, FlaskConical, GitBranch, Plus, ScrollText, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { KpiCard } from '@/components/shared/KpiCard'
import { EvidenceBadge, StatusPill } from '@/components/shared/evidence-badge'
import { DisclaimerBanner } from '@/components/shared/PageHeader'
import { ErrorState, LoadingState } from '@/components/shared/states'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableWrapper, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { useActivity, useAnalyses, useStats } from '@/api/hooks'
import { useAuth } from '@/auth/AuthContext'
import { formatRelativeTime } from '@/lib/utils'

const activityIcons = {
  literature: BookOpenText,
  trial: FlaskConical,
  graph: GitBranch,
  safety: ShieldCheck,
  report: ScrollText,
  analysis: ArrowRight,
} as const

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: analyses, isLoading, isError, refetch } = useAnalyses()
  const { data: activity } = useActivity()
  const { data: stats, isLoading: statsLoading, isError: statsError } = useStats()

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Good morning, {user?.name.replace(/^Dr\.\s*/, '') || 'Researcher'}
          </h1>
          <p className="mt-1 text-sm text-mutedfg">
            Current records from PubMed and ClinicalTrials.gov. Public-source data refreshes every 15 minutes.
          </p>
        </div>
        <Button size="lg" onClick={() => navigate('/analyses/new')} className="self-start">
          <Plus /> New Drug Analysis
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(stats ?? []).map((s) => (
          <KpiCard key={s.id} stat={s} />
        ))}
      </div>

      {/* Current source data */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Live research sources</CardTitle>
            <p className="mt-0.5 text-xs text-mutedfg">Counts and records queried from their public registries</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsLoading ? (
              <p className="text-sm text-mutedfg">Loading current source counts…</p>
            ) : statsError ? (
              <p className="text-sm text-rose-700" role="alert">
                Live source counts are unavailable. Check the API connection and retry.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {(stats ?? []).map((stat) => (
                  <li key={stat.id} className="flex flex-col gap-1 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-medium text-navy-800">{stat.hint}</span>
                    <span className="font-mono text-sm text-mutedfg">{stat.value} · {stat.delta}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-slate-400">
              Sources: <a className="text-primary-700 hover:underline" href="https://pubmed.ncbi.nlm.nih.gov/" target="_blank" rel="noreferrer">PubMed</a>
              {' · '}
              <a className="text-primary-700 hover:underline" href="https://clinicaltrials.gov/" target="_blank" rel="noreferrer">ClinicalTrials.gov</a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Latest source records</CardTitle>
            <span className="text-xs text-mutedfg">Live</span>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
            <ol className="relative space-y-5 border-l border-line pl-5">
              {(activity ?? []).map((ev) => {
                const Icon = activityIcons[ev.kind]
                return (
                  <li key={ev.id} className="relative">
                    <span className="absolute -left-[31px] flex size-5 items-center justify-center rounded-full bg-surface ring-1 ring-line">
                      <Icon className="size-3 text-primary-600" aria-hidden />
                    </span>
                    <p className="text-sm font-semibold leading-snug">{ev.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-mutedfg">{ev.detail}</p>
                    <time className="mt-1 block text-[11px] font-medium text-slate-400">{formatRelativeTime(ev.timestamp)}</time>
                  </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Recent analyses */}
      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recent Analyses</CardTitle>
            <p className="mt-0.5 text-xs text-mutedfg">Drug–disease pairs evaluated by the agent pipeline</p>
          </div>
          <Link to="/analyses" className="text-sm font-medium text-primary-700 hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          {isLoading ? (
            <div className="px-5">
              <LoadingState rows={4} label="Loading recent analyses" />
            </div>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : (
            <TableWrapper>
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH>Drug</TH>
                    <TH>Disease</TH>
                    <TH>Evidence</TH>
                    <TH>Confidence</TH>
                    <TH>Status</TH>
                    <TH>Updated</TH>
                    <TH aria-label="Actions" />
                  </TR>
                </THead>
                <TBody>
                  {(analyses ?? []).map((a) => (
                    <TR key={a.id} className="cursor-pointer" onClick={() => navigate(a.status === 'Completed' ? `/analyses/${a.id}` : `/analyses/${a.id}/progress`)}>
                      <TD>
                        <span className="font-mono text-xs text-slate-400">{a.id}</span>
                        <p className="mt-0.5 font-semibold text-navy-900">{a.drugName}</p>
                      </TD>
                      <TD className="text-navy-800">{a.diseaseName}</TD>
                      <TD>
                        <EvidenceBadge band={a.evidenceBand} />
                      </TD>
                      <TD>
                        {a.confidence !== null ? (
                          <span className="font-semibold tabular-nums text-navy-900">{a.confidence}%</span>
                        ) : (
                          <span className="text-xs italic text-slate-400">—</span>
                        )}
                      </TD>
                      <TD>
                        <StatusPill status={a.status} pulse={a.status === 'Processing'} />
                      </TD>
                      <TD className="whitespace-nowrap text-mutedfg">{formatRelativeTime(a.updatedAt)}</TD>
                      <TD>
                        <ArrowRight className="size-4 text-slate-300 transition-colors group-hover:text-primary-600" aria-hidden />
                      </TD>
                    </TR>
                  ))}
                  {(analyses ?? []).length === 0 && (
                    <TR>
                      <TD colSpan={7} className="py-8 text-center text-sm text-mutedfg">
                        No saved analyses yet. Use New Drug Analysis to start a live evidence search.
                      </TD>
                    </TR>
                  )}
                </TBody>
              </Table>
            </TableWrapper>
          )}
        </CardContent>
      </Card>

      <DisclaimerBanner className="mt-6" compact />
    </div>
  )
}
