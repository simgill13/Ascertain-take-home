import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { TagInput } from '@/components/form/tag-input'

function ControlledTagInput({ initial = [] }: { initial?: string[] }) {
  const [tags, setTags] = useState<string[]>(initial)
  return (
    <>
      <label htmlFor="tags">Allergies</label>
      <TagInput id="tags" value={tags} onChange={setTags} />
      <output data-testid="tags">{tags.join('|')}</output>
    </>
  )
}

describe('TagInput', () => {
  it('adds a tag on Enter and clears the field', async () => {
    const user = userEvent.setup()
    render(<ControlledTagInput />)

    await user.type(screen.getByLabelText('Allergies'), 'Latex{Enter}')

    expect(screen.getByTestId('tags')).toHaveTextContent('Latex')
    expect(screen.getByLabelText('Allergies')).toHaveValue('')
  })

  it('adds a tag when a comma is typed', async () => {
    const user = userEvent.setup()
    render(<ControlledTagInput />)

    await user.type(screen.getByLabelText('Allergies'), 'Peanuts,')

    expect(screen.getByTestId('tags')).toHaveTextContent('Peanuts')
  })

  it('ignores duplicates regardless of case', async () => {
    const user = userEvent.setup()
    render(<ControlledTagInput initial={['Latex']} />)

    await user.type(screen.getByLabelText('Allergies'), 'latex{Enter}')

    expect(screen.getByTestId('tags')).toHaveTextContent(/^Latex$/)
  })

  it('removes a tag from its remove button', async () => {
    const user = userEvent.setup()
    render(<ControlledTagInput initial={['Latex', 'Shellfish']} />)

    await user.click(screen.getByRole('button', { name: 'Remove Latex' }))

    expect(screen.getByTestId('tags')).toHaveTextContent(/^Shellfish$/)
  })
})
