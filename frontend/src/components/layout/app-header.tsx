import { Link } from '@tanstack/react-router'
import { MenuIcon, MoonIcon, SunIcon } from 'lucide-react'
import { Fragment } from 'react'

import { BrandMark } from '@/components/brand-mark'
import { Button } from '@/components/ui/button'
import { SheetTrigger } from '@/components/ui/sheet'
import { useUiStore, type Breadcrumb } from '@/stores/ui-store'

export function AppHeader() {
  const theme = useUiStore((state) => state.theme)
  const toggleTheme = useUiStore((state) => state.toggleTheme)
  const breadcrumbs = useUiStore((state) => state.breadcrumbs)
  const nextThemeLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <header className="bg-card flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-5">
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
          <MenuIcon />
        </Button>
      </SheetTrigger>

      <Link to="/" className="flex items-center gap-1.5 rounded-md font-semibold lg:hidden">
        <BrandMark />
        Ascertain
      </Link>

      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center text-sm lg:flex">
        <ol className="flex min-w-0 items-center gap-2">
          {breadcrumbs.map((crumb, crumbIndex) => {
            const isLast = crumbIndex === breadcrumbs.length - 1
            return (
              <Fragment key={`${crumb.label}-${crumbIndex}`}>
                {crumbIndex > 0 ? (
                  <li aria-hidden="true" className="text-muted-foreground/70">
                    /
                  </li>
                ) : null}
                <li className="min-w-0 truncate">
                  {crumb.to && !isLast ? (
                    <BreadcrumbLink crumb={crumb} />
                  ) : (
                    <span
                      className={isLast ? 'text-foreground font-medium' : 'text-muted-foreground'}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              </Fragment>
            )
          })}
        </ol>
      </nav>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label={nextThemeLabel} onClick={toggleTheme}>
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </Button>
      </div>
    </header>
  )
}

const BREADCRUMB_LINK_CLASS =
  'text-muted-foreground hover:text-foreground rounded-sm transition-colors'

function BreadcrumbLink({ crumb }: { crumb: Breadcrumb }) {
  if (crumb.to === '/patients/$patientId') {
    return (
      <Link to={crumb.to} params={{ patientId: crumb.patientId }} className={BREADCRUMB_LINK_CLASS}>
        {crumb.label}
      </Link>
    )
  }
  if (crumb.to === '/patients' || crumb.to === '/') {
    return (
      <Link to={crumb.to} className={BREADCRUMB_LINK_CLASS}>
        {crumb.label}
      </Link>
    )
  }
  return <span className="text-muted-foreground">{crumb.label}</span>
}
