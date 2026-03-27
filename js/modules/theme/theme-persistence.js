// Storage keys and theme constants
export const THEME_KEY = 'garden-theme'
export const SOUND_MUTED_KEY = 'garden-sound-muted'
export const RAIN_OVERLAY_KEY = 'garden-rain-overlay-enabled'
export const RAIN_VOLUME_KEY = 'garden-rain-volume'
export const LIGHT_THEME = 'light'
export const DARK_THEME = 'dark'
export const DEFAULT_RAIN_AUDIO_VOLUME = 0.1

export function getSavedTheme () {
  return localStorage.getItem(THEME_KEY) || LIGHT_THEME
}

export function setSavedTheme (theme) {
  localStorage.setItem(THEME_KEY, theme)
}

export function getSavedMutedState () {
  return localStorage.getItem(SOUND_MUTED_KEY) === 'true'
}

export function setSavedMutedState (isMuted) {
  localStorage.setItem(SOUND_MUTED_KEY, String(isMuted))
}

export function getSavedRainState () {
  return localStorage.getItem(RAIN_OVERLAY_KEY) === 'true'
}

export function setSavedRainState (isEnabled) {
  localStorage.setItem(RAIN_OVERLAY_KEY, String(isEnabled))
}

export function getSavedRainVolume () {
  const rawValue = localStorage.getItem(RAIN_VOLUME_KEY)
  if (rawValue === null) {
    return DEFAULT_RAIN_AUDIO_VOLUME
  }

  const parsedValue = Number.parseFloat(rawValue)
  if (!Number.isFinite(parsedValue)) {
    return DEFAULT_RAIN_AUDIO_VOLUME
  }

  return Math.max(0, Math.min(0.35, parsedValue))
}

export function setSavedRainVolume (volume) {
  localStorage.setItem(RAIN_VOLUME_KEY, String(volume))
}
