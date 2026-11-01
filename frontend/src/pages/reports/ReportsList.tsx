import { useEffect, useState } from 'react'
import { ArrowRight, FileText, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, LoadingState } from '@/components/shared/states'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { readSavedAnalysisReports, type SavedAnalysisReport } from '@/lib/savedAnalysisReports'

export function ReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<SavedAnalysisReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setReports([])
      setIsLoading(false)
      return
    }

    try {
      setReports(readSavedAnalysisReports(user.id))
      setError(null)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Saved reports could not be loaded.')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Reports"
        title="Research reports"
        subtitle="Reports you generate are saved in this browser for your account. Open one to review or download it again."
        actions={<Button asChild><Link to="/analyses/new"><Plus /> New Analysis</Link></Button>}
      />

      {isLoading ? (
        <LoadingState rows={3} label="Loading reports" />
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">{error}</div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-5 text-primary-600" aria-hidden />}
          title="No generated reports"
          description="Run a drug and condition analysis, then select Generate report below its research summary. Your report will be saved here."
          action={<Button asChild><Link to="/analyses/new">Start an analysis</Link></Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((saved) => (
            <Card key={saved.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-start gap-2">
                  <FileText className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden />
                  <span>{saved.drugName} and {saved.diseaseName}</span>
                </CardTitle>
                <p className="text-xs text-mutedfg">Generated {new Date(saved.createdAt).toLocaleString()}</p>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <p className="line-clamp-2 text-sm text-mutedfg">{saved.report.sections[1]?.paragraphs[0] ?? 'Research report'}</p>
                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <Link to={`/reports/${encodeURIComponent(saved.id)}`}>Open report <ArrowRight /></Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
