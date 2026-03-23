const THEME_KEY = 'garden-theme'
const LIGHT_THEME = 'light'
const DARK_THEME = 'dark'
const THEME_CYCLE_DELAY_MS = 3 * 60 * 1000
let themeCycleIntervalId = null

function getSavedTheme () {
  return localStorage.getItem(THEME_KEY) || LIGHT_THEME
}

function applyTheme (theme) {
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
}

function toggleTheme () {
  const currentTheme = getSavedTheme()
  const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME
  applyTheme(newTheme)
  updateToggleButton(newTheme)
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
    applyTheme(nextTheme)
    updateToggleButton(nextTheme)
  }, THEME_CYCLE_DELAY_MS)
}

function stopThemeCycleTimer () {
  if (themeCycleIntervalId === null) {
    return
  }

  window.clearInterval(themeCycleIntervalId)
  themeCycleIntervalId = null
}

export function initTheme () {
  const savedTheme = getSavedTheme()
  applyTheme(savedTheme)
  startThemeCycleTimer()

  const btn = document.createElement('button')
  btn.id = 'theme-toggle-btn'
  btn.type = 'button'
  btn.className = 'theme-toggle-btn'
  btn.textContent = savedTheme === DARK_THEME ? 'Light' : 'Dark'
  btn.setAttribute('data-theme', savedTheme)

  btn.addEventListener('click', toggleTheme)

  const disableCycleBtn = document.createElement('button')
  disableCycleBtn.id = 'theme-cycle-disable-btn'
  disableCycleBtn.type = 'button'
  disableCycleBtn.className = 'theme-cycle-btn theme-cycle-disable-btn'
  disableCycleBtn.textContent = 'Disable day/night cycle'

  disableCycleBtn.addEventListener('click', () => {
    if (themeCycleIntervalId === null) {
      startThemeCycleTimer()
      disableCycleBtn.textContent = 'Disable day/night cycle'
      return
    }

    stopThemeCycleTimer()
    disableCycleBtn.textContent = 'Enable day/night cycle'
  })

  // Try to add to hamburger menu, fallback to body
  const menuContent = document.querySelector('.hamburger-menu-content')
  if (menuContent) {
    menuContent.append(btn)
    menuContent.append(disableCycleBtn)
  } else {
    document.body.append(btn)
    document.body.append(disableCycleBtn)
  }
}
