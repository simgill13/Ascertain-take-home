import { cn } from '@/lib/utils'

const AVATAR_TINTS = [
  'bg-tint-green text-tint-green-foreground',
  'bg-tint-amber text-tint-amber-foreground',
  'bg-tint-blue text-tint-blue-foreground',
  'bg-tint-violet text-tint-violet-foreground',
  'bg-tint-red text-tint-red-foreground',
]

function tintFor(name: string): string {
  let hash = 0
  for (const character of name) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return AVATAR_TINTS[hash % AVATAR_TINTS.length] ?? AVATAR_TINTS[0]!
}

type AvatarInitialsProps = {
  firstName: string
  lastName: string
  className?: string
}

export function AvatarInitials({ firstName, lastName, className }: AvatarInitialsProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold',
        tintFor(`${firstName} ${lastName}`),
        className,
      )}
    >
      {initials}
    </span>
  )
}
