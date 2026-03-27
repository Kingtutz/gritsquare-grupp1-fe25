import { createMenu, buildNavigationLinks } from './navigation.js'
import { attachOnlineUsersSection } from './online-users.js'
import { createHomeTitlePlaque, syncHomeGrassHint } from './home.js'

const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

export function renderHeader () {
  const mount = document.body
  const existingHeader = mount.querySelector('[data-generated-header="true"]')
  if (existingHeader) existingHeader.remove()

  const header = document.createElement('header')
  header.dataset.generatedHeader = 'true'

  const nav = document.createElement('nav')

  // Create hamburger menu first so buttons can be added to it
  const { menuContent, menuButton } = createMenu(header)

  const onlineCountBadge = document.createElement('span')
  onlineCountBadge.className = 'hamburger-online-count'
  onlineCountBadge.hidden = true
  menuButton.append(onlineCountBadge)

  // Add spawn animal slot (filled by animal.js)
  const spawnAnimalSlot = document.createElement('div')
  spawnAnimalSlot.className = 'menu-spawn-animal-slot'
  menuContent.append(spawnAnimalSlot)

  // Build navigation
  buildNavigationLinks(nav, menuContent)

  // Add online users section
  attachOnlineUsersSection(menuContent, onlineUsers => {
    if (onlineUsers.length > 0) {
      onlineCountBadge.hidden = false
      onlineCountBadge.textContent = String(onlineUsers.length)
    } else {
      onlineCountBadge.hidden = true
      onlineCountBadge.textContent = ''
    }
  })

  header.append(nav)
  if (!isInSitesFolder()) {
    header.append(createHomeTitlePlaque())
    syncHomeGrassHint()
  }

  header.classList.add('sky-wrapper')

  if (mount === document.body) {
    document.body.prepend(header)
  } else {
    mount.replaceChildren(header)
  }

  window.dispatchEvent(new CustomEvent('garden:header-rendered'))

  return header
}

export function initHeaderOnLoad () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => renderHeader(), {
      once: true
    })
  } else {
    renderHeader()
  }

  // Re-render header when crossing 600px breakpoint
  let wasLargeScreen = window.innerWidth > 600
  window.addEventListener('resize', () => {
    const isLargeScreen = window.innerWidth > 600
    if (isLargeScreen !== wasLargeScreen) {
      wasLargeScreen = isLargeScreen
      renderHeader()
    }
  })

  window.addEventListener('garden:auth-changed', () => {
    renderHeader()
  })
}
