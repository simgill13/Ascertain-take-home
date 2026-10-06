import { Link } from '@tanstack/react-router'
import { LayoutDashboardIcon, SparklesIcon, UsersIcon, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type SidebarNavItem = {
  to: '/' | '/patients' | '/welcome'
  label: string
  icon: LucideIcon
  exact?: boolean
}

const PRIMARY_NAV: SidebarNavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboardIcon, exact: true },
  { to: '/patients', label: 'Patients', icon: UsersIcon },
]

type AppSidebarProps = {
  onNavigate?: () => void
  className?: string
}

export function AppSidebar({ onNavigate, className }: AppSidebarProps) {
  return (
    <div className={cn('bg-sidebar text-sidebar-foreground flex h-full flex-col', className)}>
      <nav aria-label="Sidebar" className="flex-1 space-y-1 p-3">
        <p className="text-muted-foreground px-3 pt-2 pb-1 text-xs font-medium tracking-wide uppercase">
          Practice
        </p>
        {PRIMARY_NAV.map((item) => (
          <SidebarLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
      <div className="border-sidebar-border border-t p-3">
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
      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
      activeProps={{
        className: 'bg-sidebar-accent text-sidebar-accent-foreground',
        'aria-current': 'page',
      }}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  )
}
