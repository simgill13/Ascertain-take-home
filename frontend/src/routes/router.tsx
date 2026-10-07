import type { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Outlet,
  redirect,
  stripSearchParams,
} from '@tanstack/react-router'

import { AppShell } from '@/components/layout/app-shell'
import { RouteErrorPage } from '@/routes/route-error-page'
import { patientQueryOptions } from '@/features/patients/api'
import {
  DEFAULT_PATIENT_DETAIL_SEARCH,
  DEFAULT_PATIENT_LIST_SEARCH,
  parsePatientDetailSearch,
  parsePatientListSearch,
} from '@/features/patients/search-params'
import { hasSeenWelcome } from '@/lib/first-visit'
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
  notFoundComponent: NotFoundPage,
})

const dashboardRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/',
  // A first-time visitor sees the welcome page once; `/` stays the dashboard home afterwards.
  beforeLoad: () => {
    if (!hasSeenWelcome()) throw redirect({ to: '/welcome' })
  },
  component: lazyRouteComponent(
    () => import('@/features/dashboard/dashboard-page'),
    'DashboardPage',
  ),
})

const patientsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/patients',
  validateSearch: parsePatientListSearch,
  search: { middlewares: [stripSearchParams(DEFAULT_PATIENT_LIST_SEARCH)] },
  component: lazyRouteComponent(
    () => import('@/features/patients/patient-list-page'),
    'PatientListPage',
  ),
})

const newPatientRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/patients/new',
  component: lazyRouteComponent(
    () => import('@/features/patients/patient-form-page'),
    'NewPatientPage',
  ),
})

const patientDetailRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/patients/$patientId',
  validateSearch: parsePatientDetailSearch,
  search: { middlewares: [stripSearchParams(DEFAULT_PATIENT_DETAIL_SEARCH)] },
  // Hovering a patient link (defaultPreload: 'intent') warms the cache before the click.
  loader: ({ context, params }) => {
    void context.queryClient.prefetchQuery(patientQueryOptions(params.patientId))
  },
  component: lazyRouteComponent(
    () => import('@/features/patients/patient-detail-page'),
    'PatientDetailPage',
  ),
})

const editPatientRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/patients/$patientId/edit',
  component: lazyRouteComponent(
    () => import('@/features/patients/patient-form-page'),
    'EditPatientPage',
  ),
})

// The landing page sits outside the shell so it can own the whole viewport.
const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/welcome',
  component: lazyRouteComponent(() => import('@/features/landing/landing-page'), 'LandingPage'),
})

const routeTree = rootRoute.addChildren([
  shellRoute.addChildren([
    dashboardRoute,
    patientsRoute,
    newPatientRoute,
    patientDetailRoute,
    editPatientRoute,
  ]),
  welcomeRoute,
])

export function createAppRouter(queryClient: QueryClient) {
  return createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultNotFoundComponent: NotFoundPage,
    defaultErrorComponent: RouteErrorPage,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
