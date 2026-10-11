import { ArrowRight, BookOpenText, FlaskConical, GitBranch, Plus, ScrollText, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { KpiCard } from '@/components/shared/KpiCard'
import { EvidenceBadge, StatusPill } from '@/components/shared/evidence-badge'
import { DisclaimerBanner } from '@/components/shared/PageHeader'
import { ErrorState, LoadingState } from '@/components/shared/states'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableWrapper, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { useActivity, useAnalyses } from '@/api/hooks'
import { useAuth } from '@/auth/AuthContext'
import { kpiStats } from '@/api/mock/report'
import { formatRelativeTime } from '@/lib/utils'

const chartData = [
  { day: 'Aug 11', papers: 42, trials: 6 },
  { day: 'Aug 12', papers: 55, trials: 4 },
  { day: 'Aug 13', papers: 38, trials: 8 },
  { day: 'Aug 14', papers: 71, trials: 5 },
  { day: 'Aug 15', papers: 64, trials: 9 },
  { day: 'Aug 16', papers: 88, trials: 7 },
  { day: 'Aug 17', papers: 59, trials: 3 },
  { day: 'Aug 18', papers: 76, trials: 11 },
  { day: 'Aug 19', papers: 92, trials: 8 },
  { day: 'Aug 20', papers: 84, trials: 6 },
  { day: 'Aug 21', papers: 118, trials: 12 },
  { day: 'Aug 22', papers: 96, trials: 9 },
  { day: 'Aug 23', papers: 132, trials: 14 },
  { day: 'Aug 24', papers: 148, trials: 10 },
]

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

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Good morning, {user?.name.replace(/^Dr\.\s*/, '') || 'Researcher'}
          </h1>
          <p className="mt-1 text-sm text-mutedfg">Explore evidence-backed drug repurposing opportunities.</p>
        </div>
        <Button size="lg" onClick={() => navigate('/analyses/new')} className="self-start">
          <Plus /> New Drug Analysis
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpiStats.map((s) => (
          <KpiCard key={s.id} stat={s} />
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Evidence processed</CardTitle>
              <p className="mt-0.5 text-xs text-mutedfg">Publications & trials indexed · last 14 days</p>
            </div>
            <EvidenceBadge band="Strong" score={87} />
          </CardHeader>
          <CardContent className="h-[260px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="papersFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#269C8E" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#269C8E" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="trialsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0891B2" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#0891B2" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="#E9EEF4" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={{ stroke: '#E9EEF4' }} interval={2} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <ReTooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E4EAF1', boxShadow: '0 8px 24px rgba(12,29,51,.1)', fontSize: 13 }}
                  labelStyle={{ fontWeight: 700, color: '#0C1D33' }}
                />
                <Area type="monotone" dataKey="papers" name="Publications" stroke="#158276" strokeWidth={2.2} fill="url(#papersFill)" />
                <Area type="monotone" dataKey="trials" name="Trials" stroke="#0891B2" strokeWidth={2} fill="url(#trialsFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Research Activity</CardTitle>
            <span className="text-xs text-mutedfg">Today</span>
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
