import type { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Outlet,
} from '@tanstack/react-router'

import { AppShell } from '@/components/layout/app-shell'
import { NotFoundPage } from '@/routes/not-found-page'

export type RouterContext = {
  queryClient: QueryClient
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  notFoundComponent: NotFoundPage,
})

const shellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'shell',
  component: AppShell,
})

const dashboardRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/',
  component: lazyRouteComponent(
    () => import('@/features/dashboard/dashboard-page'),
    'DashboardPage',
  ),
})

const patientsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/patients',
  component: lazyRouteComponent(
    () => import('@/features/patients/patient-list-page'),
    'PatientListPage',
  ),
})

const patientDetailRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/patients/$patientId',
  component: lazyRouteComponent(
    () => import('@/features/patients/patient-detail-page'),
    'PatientDetailPage',
  ),
})

// The landing page sits outside the shell so it can own the whole viewport.
const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/welcome',
  component: lazyRouteComponent(() => import('@/features/landing/landing-page'), 'LandingPage'),
})

const routeTree = rootRoute.addChildren([
  shellRoute.addChildren([dashboardRoute, patientsRoute, patientDetailRoute]),
  welcomeRoute,
])

export function createAppRouter(queryClient: QueryClient) {
  return createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultNotFoundComponent: NotFoundPage,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
