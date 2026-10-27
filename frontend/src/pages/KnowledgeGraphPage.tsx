import { Link, useSearchParams } from 'react-router-dom'
import { DisclaimerBanner } from '@/components/shared/PageHeader'
import { ErrorState, LoadingState } from '@/components/shared/states'
import { KnowledgeGraph } from '@/components/knowledge-graph/KnowledgeGraph'
import { Button } from '@/components/ui/button'
import { useKnowledgeGraph } from '@/api/hooks'

export function KnowledgeGraphPage() {
  const [params] = useSearchParams()
  const analysisId = params.get('analysis') ?? undefined
  const { data, isLoading, isError, refetch } = useKnowledgeGraph(analysisId)

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary-600">Knowledge graph</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Biomedical relationship explorer</h1>
          <p className="mt-1 text-sm text-mutedfg">
            {analysisId ? (
              <>Drug–target–pathway–disease network for analysis{' '}
                <Link to={`/analyses/${analysisId}`} className="font-mono text-primary-700 hover:underline">{analysisId}</Link>
              </>
            ) : 'Live graph data is available after a saved analysis is created.'}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/literature">Explore underlying literature</Link>
        </Button>
      </div>

      {!analysisId ? (
        <div className="rounded-xl border border-line bg-surface p-6 text-sm text-mutedfg">
          No saved analysis is available to graph yet. Graph relationships are not inferred from unrelated records.
        </div>
      ) : isLoading ? (
        <LoadingState rows={4} label="Building graph layout" />
      ) : isError || !data ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <KnowledgeGraph data={data} />
          <DisclaimerBanner compact className="mt-5 max-w-3xl" />
        </>
      )}
    </div>
  )
}
