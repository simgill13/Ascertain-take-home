import { useQuery, type UseQueryResult } from '@tanstack/react-query'
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
import { hasActiveFilters, type PatientListSearch } from '@/features/patients/search-params'
import type { PatientListResponse } from '@/features/patients/types'

export function PatientListPage() {
  const listSearch = useSearch({ from: '/shell/patients' })
  const navigate = useNavigate({ from: '/patients' })
  const listQuery = useQuery(patientListQueryOptions(listSearch))

  const updateSearch = (changes: Partial<PatientListSearch>) => {
    void navigate({
      search: (previous: PatientListSearch) => ({ ...previous, ...changes }),
      replace: true,
    })
  }

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
        listSearch={listSearch}
        onChange={updateSearch}
        resultCount={listQuery.isSuccess ? listQuery.data.total : null}
        isFetching={listQuery.isFetching && !listQuery.isPending}
      />

      <PatientListBody listSearch={listSearch} listQuery={listQuery} onChange={updateSearch} />
    </>
  )
}

type PatientListBodyProps = {
  listSearch: PatientListSearch
  listQuery: UseQueryResult<PatientListResponse>
  onChange: (changes: Partial<PatientListSearch>) => void
}

function PatientListBody({ listSearch, listQuery, onChange }: PatientListBodyProps) {
  if (listQuery.isError) {
    return <ErrorState error={listQuery.error} onRetry={() => void listQuery.refetch()} />
  }

  if (listQuery.isPending) {
    return <PatientTable patients={[]} isLoading />
  }

  const { items: patients, total, total_pages: totalPages } = listQuery.data
  if (patients.length === 0) {
    return <NoPatientsFound listSearch={listSearch} onChange={onChange} />
  }

  return (
    <>
      <PatientTable patients={patients} isLoading={false} />
      <PatientPagination
        page={listSearch.page}
        pageSize={listSearch.pageSize}
        totalPages={totalPages}
        total={total}
        onPageChange={(page) => onChange({ page })}
        onPageSizeChange={(pageSize) => onChange({ pageSize, page: 1 })}
      />
    </>
  )
}

function NoPatientsFound({
  listSearch,
  onChange,
}: Pick<PatientListBodyProps, 'listSearch' | 'onChange'>) {
  if (hasActiveFilters(listSearch)) {
    return (
      <EmptyState
        icon={<UsersIcon className="size-8" />}
        title="No patients match these filters"
        description="Try a different spelling or clear the status filter."
        action={
          <Button
            variant="outline"
            onClick={() => onChange({ search: undefined, status: undefined, page: 1 })}
          >
            Clear filters
          </Button>
        }
      />
    )
  }

  return (
    <EmptyState
      icon={<UsersIcon className="size-8" />}
      title="No patients yet"
      description="Add the first patient to start building the practice roster."
      action={
        <Button asChild>
          <Link to="/patients/new">New patient</Link>
        </Button>
      }
    />
  )
}
