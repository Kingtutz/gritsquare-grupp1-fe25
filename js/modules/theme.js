const THEME_KEY = 'garden-theme'
const LIGHT_THEME = 'light'
const DARK_THEME = 'dark'
const THEME_CYCLE_DELAY_MS = 3 * 60 * 1000
// Duration (ms) of the slow overlay used for the automatic day/night cycle
const SLOW_TRANSITION_MS = 3600
let themeCycleIntervalId = null
let themeToggleButton = null
let themeCycleButton = null
let themeInitialized = false

function getSavedTheme () {
  return localStorage.getItem(THEME_KEY) || LIGHT_THEME
}

function runThemeTransition (theme, { slow = false } = {}) {
  const html = document.documentElement
  const targetClass = theme === DARK_THEME ? 'theme-to-dark' : 'theme-to-light'
  const duration = slow ? SLOW_TRANSITION_MS : 580

  html.classList.remove('theme-to-dark', 'theme-to-light', 'theme-slow-transition')
  html.classList.add(targetClass)
  if (slow) html.classList.add('theme-slow-transition')

  // Restart animation cleanly on repeated toggles.
  html.classList.remove('theme-transitioning')
  void html.offsetWidth
  html.classList.add('theme-transitioning')

  window.setTimeout(() => {
    html.classList.remove('theme-transitioning', 'theme-to-dark', 'theme-to-light', 'theme-slow-transition')
  }, duration + 50)
}

// Applies the actual CSS class + localStorage changes (no animation).
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
  window.dispatchEvent(new CustomEvent('garden:theme-changed', { detail: { theme } }))
}

function applyTheme (theme, options = {}) {
  const { animate = true, slow = false } = options

  if (animate && slow) {
    // Cycle-triggered: start overlay, then swap the actual background at the
    // covered midpoint (~28% of SLOW_TRANSITION_MS) so the swap is invisible.
    runThemeTransition(theme, { slow: true })
    window.setTimeout(
      () => applyThemeClasses(theme),
      Math.round(SLOW_TRANSITION_MS * 0.30)
    )
    return
  }

  if (animate) {
    runThemeTransition(theme)
  }

  applyThemeClasses(theme)
}

function toggleTheme () {
  const currentTheme = getSavedTheme()
  const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME
  applyTheme(newTheme, { slow: true })
  window.setTimeout(() => updateToggleButton(newTheme), Math.round(SLOW_TRANSITION_MS * 0.30))
}

function updateCycleButtonLabel () {
  if (!themeCycleButton) {
    return
  }

  themeCycleButton.textContent =
    themeCycleIntervalId === null
      ? 'Enable day/night cycle'
      : 'Disable day/night cycle'
}

function updateToggleButton (theme) {
  const btn = document.getElementById('theme-toggle-btn')
  if (btn) {
    btn.textContent = theme === DARK_THEME ? 'Light' : 'Dark'
    btn.setAttribute('data-theme', theme)
  }
}

function startThemeCycleTimer () {
  if (themeCycleIntervalId !== null) {
    return
  }

  themeCycleIntervalId = window.setInterval(() => {
    const currentTheme = getSavedTheme()
    const nextTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME
    applyTheme(nextTheme, { slow: true })
    // Update button label at the same moment the theme actually takes effect
    window.setTimeout(() => updateToggleButton(nextTheme), Math.round(SLOW_TRANSITION_MS * 0.30))
  }, THEME_CYCLE_DELAY_MS)
}

function stopThemeCycleTimer () {
  if (themeCycleIntervalId === null) {
    return
  }

  window.clearInterval(themeCycleIntervalId)
  themeCycleIntervalId = null
}

function mountThemeControls () {
  if (!themeToggleButton || !themeCycleButton) {
    return
  }

  const menuContent = document.querySelector('.hamburger-menu-content')
  if (menuContent) {
    const themeToggleSlot = menuContent.querySelector('.menu-theme-toggle-slot')
    const themeCycleSlot = menuContent.querySelector('.menu-theme-cycle-slot')

    if (themeToggleSlot) {
      themeToggleSlot.replaceChildren(themeToggleButton)
    } else {
      menuContent.append(themeToggleButton)
    }

    if (themeCycleSlot) {
      themeCycleSlot.replaceChildren(themeCycleButton)
    } else {
      menuContent.append(themeCycleButton)
    }

    return
  }

  document.body.append(themeToggleButton)
  document.body.append(themeCycleButton)
}

function createThemeControls (savedTheme) {
  if (themeToggleButton && themeCycleButton) {
    return
  }

  themeToggleButton = document.createElement('button')
  themeToggleButton.id = 'theme-toggle-btn'
  themeToggleButton.type = 'button'
  themeToggleButton.className = 'theme-toggle-btn'
  themeToggleButton.textContent = savedTheme === DARK_THEME ? 'Light' : 'Dark'
  themeToggleButton.setAttribute('data-theme', savedTheme)
  themeToggleButton.addEventListener('click', toggleTheme)

  themeCycleButton = document.createElement('button')
  themeCycleButton.id = 'theme-cycle-disable-btn'
  themeCycleButton.type = 'button'
  themeCycleButton.className = 'theme-cycle-btn theme-cycle-disable-btn'
  themeCycleButton.addEventListener('click', () => {
    if (themeCycleIntervalId === null) {
      startThemeCycleTimer()
    } else {
      stopThemeCycleTimer()
    }

    updateCycleButtonLabel()
  })

  updateCycleButtonLabel()
}

export function initTheme () {
  const savedTheme = getSavedTheme()
  applyTheme(savedTheme, { animate: false })
  if (!themeInitialized) {
    startThemeCycleTimer()
    createThemeControls(savedTheme)

    window.addEventListener('garden:header-rendered', () => {
      mountThemeControls()
    })

    themeInitialized = true
  }

  updateToggleButton(getSavedTheme())
  updateCycleButtonLabel()
  mountThemeControls()
}
