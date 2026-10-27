import { FileText, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, LoadingState } from '@/components/shared/states'
import { Button } from '@/components/ui/button'
import { useAnalyses } from '@/api/hooks'

export function ReportsPage() {
  const { data: analyses, isLoading } = useAnalyses()
  const reports = (analyses ?? []).filter((analysis) => analysis.status === 'Completed')

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Reports"
        title="Research reports"
        subtitle="Reports are listed only when generated from a saved live evidence analysis."
        actions={<Button asChild><Link to="/analyses/new"><Plus /> New Analysis</Link></Button>}
      />

      {isLoading ? (
        <LoadingState rows={3} label="Loading reports" />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-5 text-primary-600" aria-hidden />}
          title="No generated reports"
          description="Reports will appear here after live analysis persistence and report generation are available."
        />
      ) : (
        <EmptyState title="Report records unavailable" description="Saved analysis reports are not yet available from the backend." />
      )}
    </div>
  )
}
