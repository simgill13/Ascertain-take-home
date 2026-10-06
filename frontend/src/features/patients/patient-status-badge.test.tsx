import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PatientStatusBadge } from '@/features/patients/patient-status-badge'

describe('PatientStatusBadge', () => {
  it('always renders a text label so status is not conveyed by color alone', () => {
    render(<PatientStatusBadge status="pending" />)

    expect(screen.getByText('Pending intake')).toBeInTheDocument()
  })
})
