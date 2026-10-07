const WELCOME_SEEN_KEY = 'ascertain-welcome-seen'

/** True once the visitor has seen the welcome page in this browser. */
export function hasSeenWelcome(): boolean {
  try {
    return localStorage.getItem(WELCOME_SEEN_KEY) === '1'
  } catch {
    // Storage unavailable (privacy mode): never trap the visitor on the welcome page.
    return true
  }
}

export function markWelcomeSeen(): void {
  try {
    localStorage.setItem(WELCOME_SEEN_KEY, '1')
  } catch {
    /* storage unavailable */
  }
}
