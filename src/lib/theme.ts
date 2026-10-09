export type Theme = 'light' | 'dark'

export function getTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

/** Applies the theme and remembers it. Storage can be blocked, so failures are ignored. */
export function setTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // The theme still applies for this visit.
  }
}
