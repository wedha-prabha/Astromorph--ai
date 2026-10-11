import { cn } from '@/lib/utils'

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#269C8E" />
          <stop offset="1" stopColor="#0891B2" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#logo-grad)" />
      <circle cx="20" cy="12" r="3.6" fill="#fff" />
      <circle cx="11.5" cy="26.5" r="3" fill="#A7F3EB" />
      <circle cx="28.5" cy="26.5" r="3" fill="#A7F3EB" />
      <path d="M20 16v4.5m0 0-5.5 4M20 20.5l5.5 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-extrabold tracking-wide text-navy-900">ASTROMORPH</span>
          <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-primary-600">
            Pharma Intelligence
          </span>
        </span>
      )}
    </span>
  )
}
