import { ArrowRight, Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { EvidenceBadge, StatusPill } from '@/components/shared/evidence-badge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableWrapper, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { useAnalyses } from '@/api/hooks'
import { formatDate, formatRelativeTime } from '@/lib/utils'

export function MyAnalysesPage() {
  const navigate = useNavigate()
  const { data: analyses, isLoading, isError, refetch } = useAnalyses()

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Workspace"
        title="My analyses"
        subtitle="Every drug–disease question you've asked ASTROMORPH, with its evidence status and outputs."
        actions={
          <Button asChild>
            <Link to="/analyses/new"><Plus /> New Drug Analysis</Link>
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState rows={5} label="Loading analyses" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !analyses || analyses.length === 0 ? (
        <EmptyState
          title="No analyses yet"
          description="Start your first drug repurposing analysis — the agent pipeline will retrieve literature, map mechanisms, and synthesize an explainable evidence report."
          action={<Button asChild><Link to="/analyses/new">Start New Analysis</Link></Button>}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All analyses ({analyses.length})</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <TableWrapper>
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH>Analysis ID</TH><TH>Drug</TH><TH>Disease</TH><TH>Evidence</TH><TH>Confidence</TH><TH>Status</TH><TH>Created</TH><TH>Updated</TH><TH aria-label="Actions" />
                  </TR>
                </THead>
                <TBody>
                  {analyses.map((a) => (
                    <TR
                      key={a.id}
                      className="cursor-pointer"
                      onClick={() => navigate(a.status === 'Completed' ? `/analyses/${a.id}` : `/analyses/${a.id}/progress`)}
                    >
                      <TD className="font-mono text-xs text-primary-700">{a.id}</TD>
                      <TD className="font-semibold text-navy-900">{a.drugName}</TD>
                      <TD>{a.diseaseName}</TD>
                      <TD><EvidenceBadge band={a.evidenceBand} /></TD>
                      <TD>{a.confidence !== null ? <span className="font-semibold tabular-nums">{a.confidence}%</span> : <span className="text-xs italic text-slate-400">—</span>}</TD>
                      <TD><StatusPill status={a.status} pulse={a.status === 'Processing'} /></TD>
                      <TD className="whitespace-nowrap text-mutedfg">{formatDate(a.createdAt)}</TD>
                      <TD className="whitespace-nowrap text-mutedfg">{formatRelativeTime(a.updatedAt)}</TD>
                      <TD><ArrowRight className="size-4 text-slate-300" aria-hidden /></TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TableWrapper>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
