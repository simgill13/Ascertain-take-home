import { Outlet } from '@tanstack/react-router'
import { useState } from 'react'

import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/sonner'

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to main content
      </a>

      <aside className="border-sidebar-border hidden w-56 shrink-0 border-r lg:block">
        <AppSidebar className="sticky top-0 h-dvh" />
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="w-72 p-0 data-[state=closed]:duration-150 data-[state=open]:duration-200"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <AppSidebar onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="bg-card flex min-w-0 flex-1 flex-col">
        <AppHeader onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  )
}
