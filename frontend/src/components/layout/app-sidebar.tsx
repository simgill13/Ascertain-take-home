import { Link } from '@tanstack/react-router'
import { FlagIcon, SparklesIcon, UsersIcon, type LucideIcon } from 'lucide-react'

import { BrandMark } from '@/components/brand-mark'
import { cn } from '@/lib/utils'

type SidebarNavItem = {
  to: '/' | '/patients' | '/welcome'
  label: string
  icon: LucideIcon
  exact?: boolean
}

const PRIMARY_NAV: SidebarNavItem[] = [
  { to: '/', label: 'Statuses', icon: FlagIcon, exact: true },
  { to: '/patients', label: 'Patients', icon: UsersIcon },
]

type AppSidebarProps = {
  onNavigate?: () => void
  className?: string
}

export function AppSidebar({ onNavigate, className }: AppSidebarProps) {
  return (
    <div className={cn('bg-sidebar text-sidebar-foreground flex h-full flex-col', className)}>
      <div className="flex h-14 items-center px-5">
        <Link
          to="/"
          onClick={onNavigate}
          className="text-foreground flex items-center gap-2 rounded-md text-base font-semibold tracking-tight"
        >
          <BrandMark />
          Northlight
        </Link>
      </div>
      <nav aria-label="Sidebar" className="flex-1 space-y-0.5 px-3 pt-2">
        {PRIMARY_NAV.map((item) => (
          <SidebarLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
      <div className="px-3 pb-4">
        <SidebarLink
          item={{ to: '/welcome', label: 'About Northlight', icon: SparklesIcon }}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  )
}

function SidebarLink({ item, onNavigate }: { item: SidebarNavItem; onNavigate?: () => void }) {
  const Icon = item.icon
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      activeOptions={{ exact: item.exact ?? false }}
      className="hover:bg-sidebar-accent/70 flex min-h-10 items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors"
      activeProps={{
        className: 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
        'aria-current': 'page',
      }}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  )
}
