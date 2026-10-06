import type { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Outlet,
  stripSearchParams,
} from '@tanstack/react-router'

import { AppShell } from '@/components/layout/app-shell'
import {
  DEFAULT_PATIENT_LIST_SEARCH,
  patientListSearchSchema,
} from '@/features/patients/search-params'
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
  validateSearch: patientListSearchSchema,
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
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
