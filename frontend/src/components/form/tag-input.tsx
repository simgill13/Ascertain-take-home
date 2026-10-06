import { XIcon } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

type TagInputProps = {
  id: string
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  describedBy?: string
  invalid?: boolean
  variant?: 'default' | 'allergy'
}

/**
 * Enter or comma adds the typed text as a tag; Backspace on an empty field removes the last tag.
 * Duplicates are ignored case-insensitively.
 */
export function TagInput({
  id,
  value,
  onChange,
  placeholder,
  describedBy,
  invalid,
  variant = 'default',
}: TagInputProps) {
  const [draft, setDraft] = useState('')

  const addDraft = () => {
    const candidate = draft.trim().replace(/,+$/, '').trim()
    if (!candidate) return
    const alreadyPresent = value.some((tag) => tag.toLowerCase() === candidate.toLowerCase())
    if (!alreadyPresent) onChange([...value, candidate])
    setDraft('')
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div>
      {value.length > 0 ? (
        <ul className="mb-2 flex flex-wrap gap-1.5" aria-label="Added items">
          {value.map((tag) => (
            <li key={tag}>
              <Badge
                variant={variant === 'allergy' ? 'destructive' : 'secondary'}
                className="gap-1 pr-1"
              >
                {tag}
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  className="hover:bg-foreground/10 rounded-full p-0.5"
                  onClick={() => removeTag(tag)}
                >
                  <XIcon className="size-3" aria-hidden="true" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
      <Input
        id={id}
        value={draft}
        placeholder={placeholder}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        autoComplete="off"
        onChange={(event) => {
          if (event.target.value.endsWith(',')) {
            setDraft(event.target.value)
            queueMicrotask(addDraft)
            return
          }
          setDraft(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            addDraft()
          }
          if (event.key === 'Backspace' && draft === '' && value.length > 0) {
            removeTag(value[value.length - 1] as string)
          }
        }}
        onBlur={addDraft}
      />
    </div>
  )
}
