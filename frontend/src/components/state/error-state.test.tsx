import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ErrorState } from '@/components/state/error-state'
import { ApiError, NetworkError } from '@/lib/api/client'

describe('ErrorState', () => {
  it('explains a network failure and offers a retry', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ErrorState error={new NetworkError(new TypeError('fetch failed'))} onRetry={onRetry} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Connection problem')
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('shows the server detail for an API error', () => {
    render(<ErrorState error={new ApiError(404, { detail: 'Patient was not found.' })} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Patient was not found.')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
