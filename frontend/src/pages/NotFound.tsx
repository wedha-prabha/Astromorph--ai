import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent shadow-lift">
        <Compass className="size-8 text-white" aria-hidden />
      </span>
      <p className="mt-6 font-mono text-sm font-bold uppercase tracking-widest text-primary-600">Error 404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">This research path doesn't exist</h1>
      <p className="mt-2 max-w-md text-mutedfg">
        The page you're looking for was moved, renamed, or never made it past peer review.
      </p>
      <div className="mt-7 flex gap-3">
        <Button asChild size="lg">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/">Visit homepage</Link>
        </Button>
      </div>
    </div>
  )
}
