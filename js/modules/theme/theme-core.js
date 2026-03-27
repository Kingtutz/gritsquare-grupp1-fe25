// Shared state - Theme core
let themeToggleButton = null
let soundToggleButton = null
let rainToggleButton = null
let rainVolumeControl = null
let rainVolumeSlider = null
let controlsContainer = null
let cabinActive = false
let isMuted = false

// Constants
const THEME_KEY = 'garden-theme'
const SOUND_MUTED_KEY = 'garden-sound-muted'
const LIGHT_THEME = 'light'
const DARK_THEME = 'dark'
const SLOW_TRANSITION_MS = 3600

export function setThemeButtonRefs (refs) {
  themeToggleButton = refs.theme
  soundToggleButton = refs.sound
  rainToggleButton = refs.rain
  rainVolumeControl = refs.rainControl
  rainVolumeSlider = refs.rainSlider
  controlsContainer = refs.container
}

export function setCabinActive (active) {
  cabinActive = active
}

export function setIsMuted (muted) {
  isMuted = muted
}

export function getSavedTheme () {
  return localStorage.getItem(THEME_KEY) || LIGHT_THEME
}

export function getSavedMutedState () {
  return localStorage.getItem(SOUND_MUTED_KEY) === 'true'
}

function runThemeTransition (theme, { slow = false } = {}) {
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

function applyThemeClasses (theme) {
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
  localStorage.setItem(THEME_KEY, theme)
  window.dispatchEvent(
    new CustomEvent('garden:theme-changed', { detail: { theme } })
  )
}

export function applyTheme (theme, options = {}) {
  const { animate = true, slow = false } = options

  if (animate && slow) {
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
  const { playThemeTrack } = require('./audio.js')
  const currentTheme = getSavedTheme()
  const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME
  applyTheme(newTheme, { slow: true })
  window.setTimeout(() => {
    updateToggleButton(newTheme)
    updateSoundButton()
    if (!cabinActive) {
      playThemeTrack(newTheme)
    }
  }, Math.round(SLOW_TRANSITION_MS * 0.3))
}

export function updateToggleButton (theme) {
  if (!themeToggleButton) {
    return
  }

  themeToggleButton.textContent = theme === DARK_THEME ? 'Light' : 'Dark'
  themeToggleButton.setAttribute('data-theme', theme)
}

export function updateSoundButton () {
  if (!soundToggleButton) {
    return
  }

  const isInSitesFolder = () =>
    window.location.pathname.toLowerCase().includes('/sites/')
  const iconBasePath = isInSitesFolder() ? '../img/emojis' : './img/emojis'

  const iconName = isMuted ? 'blackmuted.png' : 'blackunmuted.png'

  const icon = document.createElement('img')
  icon.className = 'sound-toggle-icon'
  icon.src = `${iconBasePath}/${iconName}`
  icon.alt = ''
  icon.setAttribute('aria-hidden', 'true')

  const label = document.createElement('span')
  label.className = 'sound-toggle-label'
  label.textContent = isMuted ? 'Unmute' : 'Mute'

  soundToggleButton.replaceChildren(icon, label)
  soundToggleButton.title = isMuted ? 'Sound is muted' : 'Sound is enabled'
  soundToggleButton.setAttribute(
    'aria-label',
    isMuted ? 'Unmute background sound' : 'Mute background sound'
  )
  soundToggleButton.setAttribute('aria-pressed', String(isMuted))
}

export function updateRainButton () {
  if (!rainToggleButton) {
    return
  }

  const { isRainEnabled } = require('./rain.js')

  rainToggleButton.textContent = isRainEnabled ? 'Rain off' : 'Rain on'
  rainToggleButton.title = isRainEnabled
    ? 'Rain overlay is enabled'
    : 'Rain overlay is disabled'
  rainToggleButton.setAttribute(
    'aria-label',
    isRainEnabled ? 'Disable rain overlay' : 'Enable rain overlay'
  )
  rainToggleButton.setAttribute('aria-pressed', String(isRainEnabled))
}

export function updateRainVolumeControl () {
  if (!rainVolumeSlider) {
    return
  }

  const { rainAudioVolume } = require('./rain.js')
  rainVolumeSlider.value = String(Math.round(rainAudioVolume * 100))
}

export function updateControlsForCabinState () {
  if (!themeToggleButton) {
    return
  }

  themeToggleButton.hidden = cabinActive
}

export function getControlsContainer () {
  return controlsContainer
}

export function ensureControlsContainer () {
  if (!controlsContainer) {
    controlsContainer = document.createElement('div')
    controlsContainer.className = 'floating-top-left-controls'
    document.body.append(controlsContainer)
  }
  return controlsContainer
}
