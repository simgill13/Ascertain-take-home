import { cn } from '@/lib/utils'

type LoadingStatusProps = {
  label: string
  className?: string
  children: React.ReactNode
}

/** Wraps skeleton content so assistive technology announces that loading is in progress. */
export function LoadingStatus({ label, className, children }: LoadingStatusProps) {
  return (
    <div role="status" aria-busy="true" className={cn(className)}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}
