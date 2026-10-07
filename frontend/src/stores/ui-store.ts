import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

export type Breadcrumb =
  | { label: string; to?: '/' | '/patients' }
  | { label: string; to: '/patients/$patientId'; patientId: string }

type UiState = {
  theme: Theme
  sidebarCollapsed: boolean
  breadcrumbs: Breadcrumb[]
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  toggleSidebar: () => void
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void
}

function readInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function applyThemeToDocument(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: readInitialTheme(),
      sidebarCollapsed: false,
      breadcrumbs: [],
      setTheme: (theme) => {
        applyThemeToDocument(theme)
        set({ theme })
      },
      toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
    }),
    {
      name: 'ascertain-ui',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
)

// Theme is stored under its own key so index.html can read it before React loads.
useUiStore.subscribe((state) => {
  try {
    localStorage.setItem('ascertain-theme', state.theme)
  } catch {
    /* storage unavailable */
  }
})
