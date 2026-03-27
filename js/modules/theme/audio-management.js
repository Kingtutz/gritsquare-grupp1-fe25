import {
  LIGHT_THEME,
  DARK_THEME,
  getSavedMutedState,
  setSavedMutedState
} from './theme-persistence.js'
import {
  SLOW_TRANSITION_MS,
  AUDIO_FADE_MS,
  AUDIO_FADE_STEP_MS,
  applyTheme
} from './theme-transitions.js'

const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

const soundBasePath = isInSitesFolder() ? '../sounds' : './sounds'

let dayAudio = null
let nightAudio = null
let cabinAudio = null
let pausedThemeAudio = null
let pausedThemeTime = 0
let activeTrack = null
let fadeToken = 0
let retryPlaybackArmed = false
let pendingPlayback = null
let audioUnlocked = false
let audioUnlockInitialized = false
let isMuted = false
let cabinActive = false

export function setAudioUnlocked (unlocked) {
  audioUnlocked = unlocked
}

export function setMuted (muted) {
  isMuted = muted
}

export function setCabinActive (active) {
  cabinActive = active
}

export function getIsMuted () {
  return isMuted
}

export function getAudioUnlocked () {
  return audioUnlocked
}

export function createAudioTrack (src, { loop = false, volume = 0.46 } = {}) {
  const audio = new Audio(src)
  audio.preload = 'auto'
  audio.loop = loop
  audio.volume = volume
  audio._targetVolume = volume
  audio.muted = isMuted
  return audio
}

export function ensureAudioTracks () {
  if (dayAudio && nightAudio && cabinAudio) {
    return
  }

  dayAudio = createAudioTrack(`${soundBasePath}/daygardenmusic.mp3`, {
    volume: 0.46
  })
  nightAudio = createAudioTrack(`${soundBasePath}/nightgardenmusic.mp3`, {
    volume: 0.46
  })
  cabinAudio = createAudioTrack(`${soundBasePath}/cabinmusic.mp3`, {
    loop: true,
    volume: 0.42
  })

  setTracksMuted(isMuted)

  dayAudio.addEventListener('ended', () => {
    if (cabinActive) {
      return
    }

    const nextTheme = DARK_THEME
    applyTheme(nextTheme, { slow: true })
    window.setTimeout(() => {
      playThemeTrack(nextTheme)
      window.dispatchEvent(
        new CustomEvent('garden:audio-theme-changed', {
          detail: { theme: nextTheme }
        })
      )
    }, Math.round(SLOW_TRANSITION_MS * 0.3))
  })

  nightAudio.addEventListener('ended', () => {
    if (cabinActive) {
      return
    }

    const nextTheme = LIGHT_THEME
    applyTheme(nextTheme, { slow: true })
    window.setTimeout(() => {
      playThemeTrack(nextTheme)
      window.dispatchEvent(
        new CustomEvent('garden:audio-theme-changed', {
          detail: { theme: nextTheme }
        })
      )
    }, Math.round(SLOW_TRANSITION_MS * 0.3))
  })
}

export function setTracksMuted (muted) {
  ;[dayAudio, nightAudio, cabinAudio].forEach(track => {
    if (track) {
      track.muted = muted
    }
  })
}

export function pauseAllTracks () {
  ;[dayAudio, nightAudio, cabinAudio].forEach(track => {
    if (track) {
      track.pause()
    }
  })
  activeTrack = null
}

export function getThemeTrack (theme) {
  return theme === DARK_THEME ? nightAudio : dayAudio
}

export function fadeVolume (track, from, to, duration, token, onDone = null) {
  if (!track) {
    return
  }

  const steps = Math.max(1, Math.round(duration / AUDIO_FADE_STEP_MS))
  const stepValue = (to - from) / steps
  let currentStep = 0

  track.volume = from

  const intervalId = window.setInterval(() => {
    if (token !== fadeToken) {
      window.clearInterval(intervalId)
      return
    }

    currentStep += 1
    const nextValue = from + stepValue * currentStep
    const clamped = Math.max(0, Math.min(1, nextValue))
    track.volume = clamped

    if (currentStep >= steps) {
      window.clearInterval(intervalId)
      track.volume = Math.max(0, Math.min(1, to))
      if (typeof onDone === 'function') {
        onDone()
      }
    }
  }, AUDIO_FADE_STEP_MS)
}

export function armPlaybackRetry (track, { resume = false } = {}) {
  if (!track) {
    return
  }

  pendingPlayback = {
    track,
    resume,
    time: track.currentTime
  }

  if (retryPlaybackArmed) {
    return
  }

  const retry = () => {
    retryPlaybackArmed = false
    const queued = pendingPlayback
    pendingPlayback = null

    if (!queued) {
      return
    }

    audioUnlocked = true
    if (queued.resume && Number.isFinite(queued.time)) {
      queued.track.currentTime = queued.time
    }

    playTrack(queued.track, { resume: true })
  }

  document.addEventListener('pointerdown', retry, { once: true, capture: true })
  document.addEventListener('keydown', retry, { once: true, capture: true })
  retryPlaybackArmed = true
}

export function playTrack (track, { resume = false } = {}) {
  if (!track) {
    return
  }

  if (!audioUnlocked) {
    armPlaybackRetry(track, { resume })
    return
  }

  const token = ++fadeToken
  const previousTrack = activeTrack

  if (previousTrack && previousTrack !== track) {
    fadeVolume(
      previousTrack,
      previousTrack.volume,
      0,
      AUDIO_FADE_MS,
      token,
      () => {
        previousTrack.pause()
        previousTrack.volume = previousTrack._targetVolume || 0.46
      }
    )
  }

  if (!resume) {
    track.currentTime = 0
  }

  const targetVolume = track._targetVolume || 0.46
  track.volume = previousTrack === track ? track.volume : 0
  track.muted = isMuted

  track
    .play()
    .then(() => {
      if (token !== fadeToken) {
        return
      }

      fadeVolume(track, track.volume, targetVolume, AUDIO_FADE_MS, token)
      activeTrack = track
    })
    .catch(() => {
      armPlaybackRetry(track, { resume: true })
    })
}

export function playThemeTrack (theme, { resume = false } = {}) {
  ensureAudioTracks()
  const track = getThemeTrack(theme)
  playTrack(track, { resume })
}

export function handleCabinOpened (getSavedTheme) {
  ensureAudioTracks()
  cabinActive = true

  const currentThemeTrack = getThemeTrack(getSavedTheme())
  pausedThemeAudio = currentThemeTrack
  pausedThemeTime = currentThemeTrack?.currentTime || 0

  pauseAllTracks()
  playTrack(cabinAudio)
}

export function handleCabinClosed (getSavedTheme) {
  ensureAudioTracks()
  cabinActive = false

  if (pausedThemeAudio && pausedThemeTime > 0) {
    pausedThemeAudio.currentTime = pausedThemeTime
    playTrack(pausedThemeAudio, { resume: true })
  } else {
    playThemeTrack(getSavedTheme())
  }

  pausedThemeAudio = null
  pausedThemeTime = 0
}

export function startUserGestureUnlock () {
  if (audioUnlockInitialized) {
    return
  }

  const unlock = () => {
    audioUnlocked = true
    window.dispatchEvent(new CustomEvent('garden:audio-unlocked'))
  }

  document.addEventListener('pointerdown', unlock, {
    once: true,
    capture: true
  })
  document.addEventListener('keydown', unlock, { once: true, capture: true })
  audioUnlockInitialized = true
}
