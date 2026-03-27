import {
  THEME_KEY,
  LIGHT_THEME,
  DARK_THEME,
  setSavedTheme
} from './theme-persistence.js'

// Duration (ms) of the slow overlay used for the automatic day/night cycle
export const SLOW_TRANSITION_MS = 3600
export const AUDIO_FADE_MS = 320
export const AUDIO_FADE_STEP_MS = 40

export function runThemeTransition (theme, { slow = false } = {}) {
  const html = document.documentElement
  const targetClass = theme === DARK_THEME ? 'theme-to-dark' : 'theme-to-light'
  const duration = slow ? SLOW_TRANSITION_MS : 580

  html.classList.remove(
    'theme-to-dark',
    'theme-to-light',
    'theme-slow-transition'
  )
  html.classList.add(targetClass)
  if (slow) html.classList.add('theme-slow-transition')

  // Restart animation cleanly on repeated toggles.
  html.classList.remove('theme-transitioning')
  void html.offsetWidth
  html.classList.add('theme-transitioning')

  window.setTimeout(() => {
    html.classList.remove(
      'theme-transitioning',
      'theme-to-dark',
      'theme-to-light',
      'theme-slow-transition'
    )
  }, duration + 50)
}

// Applies the actual CSS class + localStorage changes (no animation).
export function applyThemeClasses (theme) {
  const html = document.documentElement
  if (theme === DARK_THEME) {
    html.setAttribute('data-theme', 'dark')
    html.classList.add('dark-mode')
    html.classList.remove('light-mode')
  } else {
    html.setAttribute('data-theme', 'light')
    html.classList.add('light-mode')
    html.classList.remove('dark-mode')
  }
  setSavedTheme(theme)
  window.dispatchEvent(
    new CustomEvent('garden:theme-changed', { detail: { theme } })
  )
}

export function applyTheme (theme, options = {}) {
  const { animate = true, slow = false } = options

  if (animate && slow) {
    // Cycle-triggered: start overlay, then swap the actual background at the
    // covered midpoint (~28% of SLOW_TRANSITION_MS) so the swap is invisible.
    runThemeTransition(theme, { slow: true })
    window.setTimeout(
      () => applyThemeClasses(theme),
      Math.round(SLOW_TRANSITION_MS * 0.3)
    )
    return
  }

  if (animate) {
    runThemeTransition(theme)
  }

  applyThemeClasses(theme)
}

export function toggleTheme () {
  // This will be set by audio-management module to handle audio state
  window.dispatchEvent(new CustomEvent('garden:theme-toggle-requested'))
}
