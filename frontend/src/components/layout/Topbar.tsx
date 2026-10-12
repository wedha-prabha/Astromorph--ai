import { Bell, ChevronDown, CircleDot, LogOut, Menu, Search, Settings as SettingsIcon, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CommandPalette } from '@/components/layout/CommandPalette'
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useNotifications } from '@/api/hooks'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/components/ui/toast'
import { cn, formatRelativeTime } from '@/lib/utils'

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [org, setOrg] = useState('Helix Research Institute')
  const { user, signOut } = useAuth()
  const { data: notifications } = useNotifications()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const unread = (notifications ?? []).filter((n) => n.unread).length

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-navy-800 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      {/* Workspace selector */}
      <Dropdown>
        <DropdownTrigger asChild>
          <button
            type="button"
            className="hidden w-[230px] items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-left shadow-sm transition-colors hover:bg-slate-50 md:flex"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary-500 to-accent text-[10px] font-bold text-white">
              HR
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-navy-900">{org}</span>
              <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Pro workspace</span>
            </span>
            <ChevronDown className="size-3.5 shrink-0 text-slate-400" aria-hidden />
          </button>
        </DropdownTrigger>
        <DropdownContent align="start" className="w-[260px]">
          <DropdownLabel>Workspaces</DropdownLabel>
          {['Helix Research Institute', 'Meridian Pharma Group', 'Personal Research'].map((name) => (
            <DropdownItem
              key={name}
              onSelect={() => {
                setOrg(name)
                toast({ title: 'Workspace switched', description: `Now viewing ${name}.`, tone: 'info' })
              }}
            >
              <CircleDot className={name === org ? 'text-primary-600' : 'opacity-30'} />
              <span className={cn(name === org && 'font-semibold')}>{name}</span>
            </DropdownItem>
          ))}
        </DropdownContent>
      </Dropdown>

      {/* Global search */}
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="group ml-auto flex h-9 flex-1 items-center gap-2.5 rounded-lg border border-line bg-slate-50 px-3 text-sm text-slate-400 shadow-sm transition-all hover:border-slate-300 hover:bg-surface sm:ml-6 sm:max-w-md"
        aria-keyshortcuts="Control+K"
      >
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="hidden flex-1 truncate text-left group-hover:text-slate-500 sm:block">Search drugs, diseases, analyses…</span>
        <kbd className="hidden rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 lg:block">Ctrl K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5 md:ml-0">
        {/* Research status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="mr-1 hidden cursor-default items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 xl:flex" tabIndex={0}>
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-pulse-dot rounded-full bg-emerald-400" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-emerald-700">Agents operational</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>All research agents online · last heartbeat 12s ago</TooltipContent>
        </Tooltip>

        {/* Notifications */}
        <Dropdown>
          <DropdownTrigger asChild>
            <button
              type="button"
              className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-navy-800"
              aria-label={`Notifications (${unread} unread)`}
            >
              <Bell className="size-5" />
              {unread > 0 && (
                <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary-600 text-[9px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>
          </DropdownTrigger>
          <DropdownContent align="end" className="w-[340px]">
            <DropdownLabel>Notifications</DropdownLabel>
            {(notifications ?? []).slice(0, 4).map((n) => (
              <DropdownItem key={n.id} className="items-start gap-3">
                <span className={`mt-1 size-1.5 shrink-0 rounded-full ${n.unread ? 'bg-primary-600' : 'bg-slate-300'}`} aria-hidden />
                <span className="min-w-0">
                  <span className="block text-sm font-medium leading-snug">{n.title}</span>
                  <span className="mt-0.5 block truncate text-xs text-mutedfg">{n.detail}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-400">{formatRelativeTime(n.time)}</span>
                </span>
              </DropdownItem>
            ))}
            {(notifications ?? []).length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-mutedfg">You're all caught up.</p>
            )}
          </DropdownContent>
        </Dropdown>

        {/* User menu */}
        <Dropdown>
          <DropdownTrigger asChild>
            <button type="button" className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-slate-100" aria-label="Account menu">
              <span className="flex size-8 items-center justify-center rounded-lg bg-navy-800 text-xs font-bold text-white">
                {user?.initials ?? 'RS'}
              </span>
              <ChevronDown className="hidden size-3.5 text-slate-400 sm:block" aria-hidden />
            </button>
          </DropdownTrigger>
          <DropdownContent align="end" className="w-[240px]">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-navy-900">{user?.name}</p>
              <p className="truncate text-xs text-mutedfg">{user?.email}</p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-primary-600">{user?.role}</p>
            </div>
            <DropdownSeparator />
            <DropdownItem onSelect={() => navigate('/settings')}>
              <User /> Profile & account
            </DropdownItem>
            <DropdownItem onSelect={() => navigate('/settings')}>
              <SettingsIcon /> Settings
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem
              className="text-rose-600 [&_svg]:text-rose-500"
              onSelect={() => {
                void signOut()
                  .then(() => navigate('/login'))
                  .catch(() => toast({ title: 'Sign-out failed', description: 'Please try again.', tone: 'error' }))
              }}
            >
              <LogOut /> Sign out
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  )
}
