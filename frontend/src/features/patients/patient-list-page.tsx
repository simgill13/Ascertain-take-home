import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { PlusIcon, UsersIcon } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/state/empty-state'
import { ErrorState } from '@/components/state/error-state'
import { Button } from '@/components/ui/button'
import { patientListQueryOptions } from '@/features/patients/api'
import { PatientListToolbar } from '@/features/patients/patient-list-toolbar'
import { PatientPagination } from '@/features/patients/patient-pagination'
import { PatientTable } from '@/features/patients/patient-table'
import type { PatientListSearch } from '@/features/patients/search-params'

export function PatientListPage() {
  const search = useSearch({ from: '/shell/patients' })
  const navigate = useNavigate({ from: '/patients' })
  const listQuery = useQuery(patientListQueryOptions(search))

  const updateSearch = (next: Partial<PatientListSearch>) => {
    void navigate({
      search: (previous: PatientListSearch) => ({ ...previous, ...next }),
      replace: true,
    })
  }

  const patients = listQuery.data?.items ?? []
  const total = listQuery.data?.total ?? 0
  const totalPages = listQuery.data?.total_pages ?? 1
  const hasFilters = Boolean(search.search || search.status)

  return (
    <>
      <PageHeader
        title="Patients"
        description="Search, sort, and open a chart."
        actions={
          <Button asChild>
            <Link to="/patients/new">
              <PlusIcon aria-hidden="true" />
              New patient
            </Link>
          </Button>
        }
      />

      <PatientListToolbar
        search={search}
        onChange={updateSearch}
        resultCount={total}
        isFetching={listQuery.isFetching && !listQuery.isPending}
      />

      {listQuery.isError ? (
        <ErrorState error={listQuery.error} onRetry={() => void listQuery.refetch()} />
      ) : !listQuery.isPending && patients.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="size-8" />}
          title={hasFilters ? 'No patients match these filters' : 'No patients yet'}
          description={
            hasFilters
              ? 'Try a different spelling or clear the status filter.'
              : 'Add the first patient to start building the practice roster.'
          }
          action={
            hasFilters ? (
              <Button
                variant="outline"
                onClick={() => updateSearch({ search: undefined, status: undefined, page: 1 })}
              >
                Clear filters
              </Button>
            ) : (
              <Button asChild>
                <Link to="/patients/new">New patient</Link>
              </Button>
            )
          }
        />
      ) : (
        <>
          <PatientTable patients={patients} isLoading={listQuery.isPending} />
          <PatientPagination
            page={search.page}
            pageSize={search.pageSize}
            totalPages={totalPages}
            total={total}
            onPageChange={(page) => updateSearch({ page })}
            onPageSizeChange={(pageSize) => updateSearch({ pageSize, page: 1 })}
          />
        </>
      )}
    </>
  )
}
