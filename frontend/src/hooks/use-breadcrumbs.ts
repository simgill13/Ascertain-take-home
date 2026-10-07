import { useEffect } from 'react'

import { useUiStore, type Breadcrumb } from '@/stores/ui-store'

/** Publishes the page's breadcrumb trail to the top bar and clears it on unmount. */
export function useBreadcrumbs(breadcrumbs: Breadcrumb[]) {
  const setBreadcrumbs = useUiStore((state) => state.setBreadcrumbs)
  const serialized = JSON.stringify(breadcrumbs)

  useEffect(() => {
    setBreadcrumbs(JSON.parse(serialized) as Breadcrumb[])
    return () => setBreadcrumbs([])
  }, [serialized, setBreadcrumbs])
}
