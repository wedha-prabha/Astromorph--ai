import { BookOpenText, FileText, FlaskConical, Network, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, LoadingState } from '@/components/shared/states'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useSavedItems } from '@/api/hooks'
import { formatRelativeTime } from '@/lib/utils'

const kindMeta = {
  analysis: { icon: FileText, label: 'Analysis', to: (id: string) => '/analyses/AST-2026-001' },
  paper: { icon: BookOpenText, label: 'Publication', to: () => '/literature' },
  trial: { icon: FlaskConical, label: 'Clinical trial', to: () => '/trials' },
  'graph-view': { icon: Network, label: 'Graph view', to: () => '/knowledge-graph' },
} as const

export function SavedResearchPage() {
  const { data: items, isLoading } = useSavedItems()

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Workspace"
        title="Saved research"
        subtitle="Bookmarked analyses, publications, trials, and graph views collected during your investigation."
      />

      {isLoading ? (
        <LoadingState rows={4} label="Loading saved items" />
      ) : !items || items.length === 0 ? (
        <EmptyState
          icon={<Star className="size-5 text-primary-600" aria-hidden />}
          title="Nothing saved yet"
          description="Save papers, trials, and analyses as you explore — they'll be collected here for quick reference."
          action={<Link to="/literature" className="text-sm font-semibold text-primary-700 hover:underline">Browse the literature explorer →</Link>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => {
            const meta = kindMeta[item.kind]
            const Icon = meta.icon
            return (
              <Card key={item.id} className="transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lift">
                <CardContent className="flex items-start gap-4 p-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 ring-1 ring-primary-100">
                    <Icon className="size-[18px] text-primary-700" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{meta.label}</Badge>
                      <span className="text-[11px] text-slate-400">{formatRelativeTime(item.savedAt)}</span>
                    </div>
                    <h3 className="mt-1.5 truncate text-[15px] font-semibold">{item.title}</h3>
                    <p className="mt-0.5 truncate text-[13px] text-mutedfg">{item.meta}</p>
                  </div>
                  <Link to={meta.to(item.id)} className="shrink-0 self-center text-sm font-medium text-primary-700 hover:underline no-print">
                    Open
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
