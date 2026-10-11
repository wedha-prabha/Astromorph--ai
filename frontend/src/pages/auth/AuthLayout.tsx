import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Logo } from '@/components/layout/Logo'

const highlights = [
  'Nine-agent explainable research pipelines',
  'Biomedical knowledge graph exploration',
  'Evidence scoring with safety integration',
]

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      {/* Brand panel */}
      <div className="relative hidden w-[46%] overflow-hidden bg-navy-950 lg:block">
        <div className="absolute inset-0 bg-grid opacity-25" aria-hidden />
        <div className="absolute -left-24 top-1/3 size-96 rounded-full bg-primary-600/20 blur-3xl" aria-hidden />
        <div className="absolute -right-16 bottom-0 size-80 rounded-full bg-accent/20 blur-3xl" aria-hidden />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-navy-200 transition-colors hover:text-white">
            <ArrowLeft className="size-4" /> Back to homepage
          </Link>
          <div>
            <h2 className="max-w-md text-3xl font-bold leading-snug tracking-tight">
              Research question in.
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                Explainable evidence out.
              </span>
            </h2>
            <ul className="mt-8 space-y-3.5">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-3 text-sm text-navy-100">
                  <CheckCircle2 className="size-4 shrink-0 text-cyan-300" aria-hidden />
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-navy-300">
            ASTROMORPH provides AI-assisted research analysis and evidence synthesis. Results are not medical advice,
            diagnosis, or a substitute for clinical judgment.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col px-5 py-8 sm:px-10">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-mutedfg">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
        {footer && <div className="mx-auto w-full max-w-md border-t border-line pt-5 text-center text-xs leading-relaxed text-slate-400">{footer}</div>}
      </div>
    </div>
  )
}
