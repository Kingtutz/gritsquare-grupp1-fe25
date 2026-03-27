// Shared state for theme module
export const state = {
  themeToggleButton: null,
  soundToggleButton: null,
  rainToggleButton: null,
  rainVolumeControl: null,
  rainVolumeSlider: null,
  controlsContainer: null,
  themeInitialized: false,
  cabinActive: false,
  isMuted: false,
  audioUnlocked: false,
  dayAudio: null,
  nightAudio: null,
  cabinAudio: null,
  pausedThemeAudio: null,
  pausedThemeTime: 0,
  activeTrack: null,
  fadeToken: 0,
  retryPlaybackArmed: false,
  pendingPlayback: null,
  rainOverlayElement: null,
  isRainEnabled: false,
  rainAudioContext: null,
  rainAudioSource: null,
  rainAudioGain: null,
  rainAudioInitialized: false,
  rainAudioVolume: 0.1,
  audioUnlockInitialized: false
}

// Constants
export const THEME_KEY = 'garden-theme'
export const SOUND_MUTED_KEY = 'garden-sound-muted'
export const RAIN_OVERLAY_KEY = 'garden-rain-overlay-enabled'
export const RAIN_VOLUME_KEY = 'garden-rain-volume'
export const LIGHT_THEME = 'light'
export const DARK_THEME = 'dark'
export const SLOW_TRANSITION_MS = 3600
export const AUDIO_FADE_MS = 320
export const AUDIO_FADE_STEP_MS = 40
export const DEFAULT_RAIN_AUDIO_VOLUME = 0.1

export const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

export const soundBasePath = isInSitesFolder() ? '../sounds' : './sounds'
export const iconBasePath = isInSitesFolder() ? '../img/emojis' : './img/emojis'
