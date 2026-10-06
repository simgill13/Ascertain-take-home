import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { PatientListToolbar } from '@/features/patients/patient-list-toolbar'
import { DEFAULT_PATIENT_LIST_SEARCH } from '@/features/patients/search-params'

describe('PatientListToolbar', () => {
  it('debounces typing into a single search change that resets the page', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <PatientListToolbar
        search={{ ...DEFAULT_PATIENT_LIST_SEARCH, page: 3 }}
        onChange={onChange}
        resultCount={0}
        isFetching={false}
      />,
    )

    await user.type(screen.getByLabelText('Search'), 'alva')
    expect(onChange).not.toHaveBeenCalled()

    await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
    expect(onChange).toHaveBeenCalledWith({ search: 'alva', page: 1 })
  })

  it('announces the result count', () => {
    render(
      <PatientListToolbar
        search={DEFAULT_PATIENT_LIST_SEARCH}
        onChange={vi.fn()}
        resultCount={17}
        isFetching={false}
      />,
    )

    expect(screen.getByText('17 patients')).toBeInTheDocument()
  })
})
