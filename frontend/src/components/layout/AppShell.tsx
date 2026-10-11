import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useState } from 'react'

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <TooltipProvider delayDuration={250}>
      <div className="min-h-screen bg-background">
        <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
        <div className="lg:pl-[264px]">
          <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
            <footer className="mt-12 border-t border-line pt-5 text-xs text-slate-400">
              <p>
                ASTROMORPH · AI-assisted research intelligence. Results are not medical advice, diagnosis, or a
                substitute for clinical judgment.
              </p>
            </footer>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
