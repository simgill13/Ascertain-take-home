import { XIcon } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

type TagInputProps = {
  id: string
  value: string[]
  onChange: (nextTags: string[]) => void
  placeholder?: string
  describedBy?: string
  invalid?: boolean
  variant?: 'default' | 'allergy'
}

/**
 * Enter or a trailing comma adds the typed text as a tag; Backspace on an empty field removes
 * the last tag. Duplicates are ignored case-insensitively.
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

  const commitTag = (rawText: string) => {
    const candidate = rawText.replace(/,/g, '').trim()
    setDraft('')
    if (!candidate) return
    const alreadyPresent = value.some((tag) => tag.toLowerCase() === candidate.toLowerCase())
    if (!alreadyPresent) onChange([...value, candidate])
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitTag(draft)
      return
    }
    const lastTag = value.at(-1)
    if (event.key === 'Backspace' && draft === '' && lastTag !== undefined) {
      removeTag(lastTag)
    }
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
          const typed = event.target.value
          if (typed.endsWith(',')) {
            commitTag(typed)
            return
          }
          setDraft(typed)
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => commitTag(draft)}
      />
    </div>
  )
}
