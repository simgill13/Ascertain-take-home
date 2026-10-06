import { useEffect, useMemo, useRef } from 'react'

/**
 * Returns a stable function that invokes `callback` after `delayMs` of inactivity.
 * Pending calls are cancelled on unmount.
 */
export function useDebouncedCallback<Arguments extends unknown[]>(
  callback: (...callArguments: Arguments) => void,
  delayMs: number,
) {
  const latestCallback = useRef(callback)
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    latestCallback.current = callback
  }, [callback])

  useEffect(() => {
    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current)
    }
  }, [])

  return useMemo(
    () =>
      (...callArguments: Arguments) => {
        if (timeoutId.current) clearTimeout(timeoutId.current)
        timeoutId.current = setTimeout(() => latestCallback.current(...callArguments), delayMs)
      },
    [delayMs],
  )
}
