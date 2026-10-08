import {
  LIGHT_THEME,
  getSavedTheme,
  getSavedMutedState,
  getSavedRainState,
  getSavedRainVolume
} from './theme-persistence.js'
import { applyTheme } from './theme-transitions.js'
import {
  setAudioUnlocked,
  setMuted,
  setCabinActive,
  ensureAudioTracks,
  playThemeTrack,
  startUserGestureUnlock as initAudioUnlock,
  handleCabinOpened as audioCabinOpened,
  handleCabinClosed as audioCabinClosed,
  setTracksMuted,
  getIsMuted
} from './audio-management.js'
import {
  ensureRainOverlay,
  ensureRainAudioGraph,
  applyRainState,
  setRainAudioVolume,
  syncRainAudio,
  setRainMuted
} from './rain-audio.js'
import {
  createThemeControls,
  mountThemeControls,
  updateToggleButton,
  updateSoundButton,
  updateRainButton,
  updateRainVolumeControl,
  setUiCabinActive,
  setUiMuted,
  handleCabinOpened as uiCabinOpened,
  handleCabinClosed as uiCabinClosed
} from './theme-ui.js'

let themeInitialized = false

export function initTheme () {
  const savedTheme = getSavedTheme()
  const isMuted = getSavedMutedState()
  const isRainEnabled = getSavedRainState()
  const rainVolume = getSavedRainVolume()

  // Initialize all subsystems with saved state
  setMuted(isMuted)
  setUiMuted(isMuted)
  setRainMuted(isMuted)

  applyTheme(savedTheme, { animate: false })

  if (!themeInitialized) {
    ensureAudioTracks()
    ensureRainOverlay()
    ensureRainAudioGraph()
    applyRainState(isRainEnabled, { persist: false })
    initAudioUnlock()
    createThemeControls(savedTheme)

    // Event listeners for audio/rain synchronization
    window.addEventListener('garden:audio-unlocked', () => {
      setAudioUnlocked(true)
      syncRainAudio(true)
      if (!getIsMuted()) {
        playThemeTrack(savedTheme)
      }
    })

    window.addEventListener('garden:mute-state-changed', e => {
      const { isMuted: newMutedState } = e.detail
      setMuted(newMutedState)
      setUiMuted(newMutedState)
      setRainMuted(newMutedState)
      setTracksMuted(newMutedState)
      updateSoundButton()
      syncRainAudio(true)
    })

    window.addEventListener('garden:rain-state-changed', () => {
      updateRainButton()
      updateRainVolumeControl()
    })

    window.addEventListener('garden:audio-theme-changed', e => {
      const nextTheme = e?.detail?.theme
      if (nextTheme) {
        updateToggleButton(nextTheme)
      }
    })

    window.addEventListener('garden:header-rendered', () => {
      mountThemeControls()
    })

    window.addEventListener('garden:cabin-opened', () => {
      setCabinActive(true)
      setUiCabinActive(true)
      audioCabinOpened(getSavedTheme)
      uiCabinOpened()
    })

    window.addEventListener('garden:cabin-closed', () => {
      setCabinActive(false)
      setUiCabinActive(false)
      audioCabinClosed(getSavedTheme)
      uiCabinClosed()
    })

    themeInitialized = true
  }

  updateToggleButton(savedTheme)
  updateSoundButton()
  updateRainButton()
  updateRainVolumeControl()
  applyRainState(isRainEnabled, { persist: false })
  syncRainAudio(true)
  mountThemeControls()
}

// Export public functions for outside access if needed
export { updateToggleButton, updateSoundButton, updateRainButton }
