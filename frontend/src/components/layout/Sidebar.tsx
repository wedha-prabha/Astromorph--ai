import {
  Activity,
  BookOpenText,
  FlaskConical,
  GitBranch,
  LayoutDashboard,
  LifeBuoy,
  Network,
  Pill,
  PlusCircle,
  ScrollText,
  Settings as SettingsIcon,
  Star,
  Stethoscope,
  X,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/layout/Logo'
import { cn } from '@/lib/utils'

export const navSections = [
  {
    label: 'Workspace',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/analyses/new', icon: PlusCircle, label: 'New Analysis' },
      { to: '/analyses', icon: Activity, label: 'My Analyses' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/drugs', icon: Pill, label: 'Drug Intelligence' },
      { to: '/diseases', icon: Stethoscope, label: 'Disease Intelligence' },
      { to: '/knowledge-graph', icon: Network, label: 'Knowledge Graph' },
    ],
  },
  {
    label: 'Evidence',
    items: [
      { to: '/trials', icon: FlaskConical, label: 'Clinical Trials' },
      { to: '/literature', icon: BookOpenText, label: 'Literature' },
      { to: '/agents', icon: GitBranch, label: 'Data Sources' },
    ],
  },
  {
    label: 'Output',
    items: [
      { to: '/reports', icon: ScrollText, label: 'Reports' },
      { to: '/saved', icon: Star, label: 'Saved Research' },
    ],
  },
] as const

interface SidebarProps {
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const navigate = useNavigate()

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-navy-950/40 backdrop-blur-[2px] transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onCloseMobile}
        aria-hidden
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-line bg-surface transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Primary navigation"
      >
        <div className="flex h-16 items-center justify-between px-5">
          <button
            type="button"
            onClick={() => {
              navigate('/dashboard')
              onCloseMobile?.()
            }}
            className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Logo />
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-700 lg:hidden"
            onClick={onCloseMobile}
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.label} className="mb-5">
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{section.label}</p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/analyses'}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-primary-50 text-primary-800 shadow-[inset_2px_0_0_0] shadow-primary-600'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900',
                        )
                      }
                    >
                      <item.icon className="size-[17px] shrink-0" aria-hidden />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <ul className="space-y-0.5">
            <li>
              <NavLink
                to="/settings"
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-primary-50 text-primary-800' : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900',
                  )
                }
              >
                <SettingsIcon className="size-[17px]" aria-hidden /> Settings
              </NavLink>
            </li>
            <li>
              <a
                href="#help"
                onClick={(e) => e.preventDefault()}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-navy-900"
              >
                <LifeBuoy className="size-[17px]" aria-hidden /> Help & Documentation
              </a>
            </li>
          </ul>
        </div>
      </aside>
    </>
  )
}
