import { ArrowLeft, BookOpenText, GitBranch } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { DisclaimerBanner } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function AnalysisProgressPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation() as { state?: { drugName?: string; diseaseName?: string } }
  const pair = [location.state?.drugName, location.state?.diseaseName].filter(Boolean).join(' ')

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <p className="text-xs font-bold uppercase tracking-widest text-primary-600">Saved analysis</p>
      <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Analysis processing is unavailable</h1>
      {id && <p className="mt-1 font-mono text-xs text-slate-400">{id}</p>}

      <Card className="mt-6">
        <CardContent className="space-y-4 p-6">
          <p className="text-sm leading-relaxed text-mutedfg">
            ASTROMORPH currently retrieves live biomedical source records, but it does not persist analyses or run an
            agent-processing pipeline. No progress or synthesized results are being generated for this analysis.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to={`/literature${pair ? `?q=${encodeURIComponent(pair)}` : ''}`}>
                <BookOpenText /> Search live literature
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/trials${location.state?.drugName ? `?drug=${encodeURIComponent(location.state.drugName)}` : ''}`}>
                <GitBranch /> Search clinical trials
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/analyses"><ArrowLeft /> My analyses</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <DisclaimerBanner compact className="mt-5" />
    </div>
  )
}
