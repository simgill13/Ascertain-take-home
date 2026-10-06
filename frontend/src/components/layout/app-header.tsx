import { Link } from '@tanstack/react-router'
import { MenuIcon, MoonIcon, SunIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useUiStore } from '@/stores/ui-store'

type AppHeaderProps = {
  onOpenMobileNav: () => void
}

export function AppHeader({ onOpenMobileNav }: AppHeaderProps) {
  const theme = useUiStore((state) => state.theme)
  const toggleTheme = useUiStore((state) => state.toggleTheme)
  const nextThemeLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-3 backdrop-blur sm:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open navigation"
        onClick={onOpenMobileNav}
      >
        <MenuIcon />
      </Button>

      <Link to="/" className="flex items-center gap-2 rounded-md px-1 font-semibold">
        <span
          aria-hidden="true"
          className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-md text-xs font-bold"
        >
          N
        </span>
        <span className="font-display text-lg tracking-tight">Northlight</span>
      </Link>

      <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 md:flex">
        <HeaderLink to="/">Dashboard</HeaderLink>
        <HeaderLink to="/patients">Patients</HeaderLink>
      </nav>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label={nextThemeLabel} onClick={toggleTheme}>
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </Button>
      </div>
    </header>
  )
}

function HeaderLink({ to, children }: { to: '/' | '/patients'; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
      activeProps={{ className: 'text-foreground bg-accent' }}
      activeOptions={{ exact: to === '/' }}
    >
      {children}
    </Link>
  )
}
