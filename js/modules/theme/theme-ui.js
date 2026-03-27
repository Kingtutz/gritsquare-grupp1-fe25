import { LIGHT_THEME, DARK_THEME, getSavedTheme } from './theme-persistence.js'
import { SLOW_TRANSITION_MS, applyTheme } from './theme-transitions.js'
import {
  ensureAudioTracks,
  playThemeTrack,
  toggleSoundMute,
  startUserGestureUnlock
} from './audio-management.js'
import {
  toggleRainOverlay,
  getRainEnabled,
  getRainVolume,
  setRainVolume
} from './rain-audio.js'

const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

const iconBasePath = isInSitesFolder() ? '../img/emojis' : './img/emojis'

let themeToggleButton = null
let soundToggleButton = null
let rainToggleButton = null
let rainVolumeControl = null
let rainVolumeSlider = null
let controlsContainer = null
let cabinActive = false
let isMuted = false

export function setUiCabinActive (active) {
  cabinActive = active
}

export function setUiMuted (muted) {
  isMuted = muted
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

  const isEnabled = getRainEnabled()
  rainToggleButton.textContent = isEnabled ? 'Rain off' : 'Rain on'
  rainToggleButton.title = isEnabled
    ? 'Rain overlay is enabled'
    : 'Rain overlay is disabled'
  rainToggleButton.setAttribute(
    'aria-label',
    isEnabled ? 'Disable rain overlay' : 'Enable rain overlay'
  )
  rainToggleButton.setAttribute('aria-pressed', String(isEnabled))
}

export function updateRainVolumeControl () {
  if (!rainVolumeSlider) {
    return
  }

  const volume = getRainVolume()
  rainVolumeSlider.value = String(Math.round(volume * 100))
}

function updateControlsForCabinState () {
  if (!themeToggleButton) {
    return
  }

  // Keep global sound control available in cabin, hide global theme toggle
  // to avoid duplicating with cabin-local readability toggle.
  themeToggleButton.hidden = cabinActive
}

function handleThemeToggle () {
  const currentTheme = getSavedTheme()
  const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME
  applyTheme(newTheme, { slow: true })
  window.setTimeout(() => {
    updateToggleButton(newTheme)
    updateSoundButton()
    ensureAudioTracks()
    if (!cabinActive) {
      playThemeTrack(newTheme)
    }
  }, Math.round(SLOW_TRANSITION_MS * 0.3))
}

function handleSoundToggle () {
  ensureAudioTracks()
  isMuted = !isMuted
  localStorage.setItem('garden-sound-muted', String(isMuted))
  window.dispatchEvent(
    new CustomEvent('garden:mute-state-changed', { detail: { isMuted } })
  )
}

export function createThemeControls (savedTheme) {
  if (
    themeToggleButton &&
    soundToggleButton &&
    rainToggleButton &&
    rainVolumeControl &&
    rainVolumeSlider
  ) {
    return
  }

  themeToggleButton = document.createElement('button')
  themeToggleButton.id = 'theme-toggle-btn'
  themeToggleButton.type = 'button'
  themeToggleButton.className = 'theme-toggle-btn'
  themeToggleButton.textContent = savedTheme === DARK_THEME ? 'Light' : 'Dark'
  themeToggleButton.setAttribute('data-theme', savedTheme)
  themeToggleButton.addEventListener('click', handleThemeToggle)

  soundToggleButton = document.createElement('button')
  soundToggleButton.id = 'sound-toggle-btn'
  soundToggleButton.type = 'button'
  soundToggleButton.className = 'theme-toggle-btn sound-toggle-btn'
  soundToggleButton.addEventListener('click', handleSoundToggle)
  updateSoundButton()

  rainToggleButton = document.createElement('button')
  rainToggleButton.id = 'rain-toggle-btn'
  rainToggleButton.type = 'button'
  rainToggleButton.className = 'theme-toggle-btn rain-toggle-btn'
  rainToggleButton.addEventListener('click', toggleRainOverlay)
  updateRainButton()

  const volumeLabel = document.createElement('label')
  volumeLabel.className = 'rain-volume-label'
  volumeLabel.htmlFor = 'rain-volume-slider'
  volumeLabel.textContent = 'Rain volume'

  rainVolumeSlider = document.createElement('input')
  rainVolumeSlider.id = 'rain-volume-slider'
  rainVolumeSlider.className = 'rain-volume-slider'
  rainVolumeSlider.type = 'range'
  rainVolumeSlider.min = '0'
  rainVolumeSlider.max = '35'
  rainVolumeSlider.step = '1'
  rainVolumeSlider.addEventListener('input', () => {
    const volume = Number(rainVolumeSlider.value) / 100
    setRainVolume(volume)
  })

  rainVolumeControl = document.createElement('div')
  rainVolumeControl.className = 'rain-volume-control'
  rainVolumeControl.append(volumeLabel, rainVolumeSlider)
  updateRainVolumeControl()
}

export function mountThemeControls () {
  if (
    !themeToggleButton ||
    !soundToggleButton ||
    !rainToggleButton ||
    !rainVolumeControl
  ) {
    return
  }

  if (!controlsContainer) {
    controlsContainer = document.createElement('div')
    controlsContainer.className = 'floating-top-left-controls'
    document.body.append(controlsContainer)
  }

  controlsContainer.replaceChildren(
    soundToggleButton,
    themeToggleButton,
    rainToggleButton,
    rainVolumeControl
  )
  updateControlsForCabinState()
}

export function handleCabinOpened () {
  cabinActive = true
  updateControlsForCabinState()
}

export function handleCabinClosed () {
  cabinActive = false
  updateControlsForCabinState()
}
