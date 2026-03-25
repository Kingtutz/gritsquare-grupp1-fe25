import { createFlowerForm } from './messageForm.js'
import { logout, getUsername, initUsernamePrompt } from './username.js'
import { searchUser, resetSearchFilter } from '../search.js'
import { subscribeToOnlineUsers } from '../firebase/firebase.js'

let unsubscribeOnlineUsers = null

const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

const getDefaultLinks = () => {
  if (isInSitesFolder()) {
    return [
      { label: 'Messageboard', href: '../index.html' },
      { label: 'About', href: './about.html' },
      { label: 'Contact', href: './contact.html' },
      { label: 'Plant flower', href: '#' },
      { label: 'Search', href: '#' }
    ]
  }

  return [
    { label: 'Messageboard', href: './index.html' },
    { label: 'About', href: './sites/about.html' },
    { label: 'Contact', href: './sites/contact.html' },
    { label: 'Plant flower', href: '#' },
    { label: 'Search', href: '#' }
  ]
}

export const renderHeader = () => {
  const navLinks = getDefaultLinks()
  const mount = document.body
  const existingHeader = mount.querySelector('[data-generated-header="true"]')
  if (existingHeader) existingHeader.remove()
  const isSmallScreen = window.innerWidth <= 600

  const imagePath = isInSitesFolder()
    ? '../img/icons/pixlecloud.png'
    : 'img/icons/pixlecloud.png'

  const header = document.createElement('header')
  header.dataset.generatedHeader = 'true'

  const nav = document.createElement('nav')

  // Create hamburger menu first so buttons can be added to it
  const { menuContent, menuButton } = createMenu(header)

  const onlineCountBadge = document.createElement('span')
  onlineCountBadge.className = 'hamburger-online-count'
  onlineCountBadge.hidden = true
  menuButton.append(onlineCountBadge)

  const username = getUsername()

  const closeMenu = () => {
    menuContent.classList.remove('open')
  }

  const addMenuActionButton = ({ label, href }) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = label

    button.addEventListener('click', async event => {
      event.preventDefault()

      if (label === 'Plant flower') {
        createFlowerForm()
        closeMenu()
        return
      }

      if (label === 'Search') {
        await searchUser()
        closeMenu()
        return
      }

      window.location.assign(href)
      closeMenu()
    })

    menuContent.append(button)
  }

  const orderedMenuLabels = [
    'Plant flower',
    'Search',
    'Messageboard',
    'About',
    'Contact'
  ]

  orderedMenuLabels.forEach(label => {
    const link = navLinks.find(navLink => navLink.label === label)
    if (link) {
      addMenuActionButton(link)
    }
  })

  const themeToggleSlot = document.createElement('div')
  themeToggleSlot.className = 'menu-theme-toggle-slot'
  menuContent.append(themeToggleSlot)

  const clearSearchButton = document.createElement('button')
  clearSearchButton.type = 'button'
  clearSearchButton.textContent = 'Show all flowers'
  clearSearchButton.addEventListener('click', async e => {
    e.preventDefault()
    await resetSearchFilter()
    closeMenu()
  })
  menuContent.append(clearSearchButton)

  attachOnlineUsersSection(menuContent, onlineUsers => {
    if (onlineUsers.length > 0) {
      onlineCountBadge.hidden = false
      onlineCountBadge.textContent = String(onlineUsers.length)
    } else {
      onlineCountBadge.hidden = true
      onlineCountBadge.textContent = ''
    }
  })

  if (username) {
    const logoutButton = document.createElement('button')
    logoutButton.type = 'button'
    logoutButton.textContent = 'Logout'
    logoutButton.addEventListener('click', e => {
      e.preventDefault()
      logout()
      const existingOverlay = document.querySelector('#username-prompt-overlay')
      if (existingOverlay) existingOverlay.remove()
      initUsernamePrompt()
      closeMenu()
    })
    menuContent.append(logoutButton)
  }

  const spawnAnimalSlot = document.createElement('div')
  spawnAnimalSlot.className = 'menu-spawn-animal-slot'
  menuContent.append(spawnAnimalSlot)

  const themeCycleSlot = document.createElement('div')
  themeCycleSlot.className = 'menu-theme-cycle-slot'
  menuContent.append(themeCycleSlot)

  navLinks.forEach(({ label, href }) => {
    // On small screens, keep nav clouds focused on the primary action.
    if (
      isSmallScreen &&
      ['Messageboard', 'About', 'Contact', 'Search'].includes(label)
    ) {
      return
    }

    const anchor = document.createElement('a')
    if (label === 'Plant flower') {
      anchor.classList.add('mobile-cloud-primary')
    }

    if (label === 'Plant flower') {
      anchor.href = '#'
      anchor.addEventListener('click', e => {
        e.preventDefault()
        createFlowerForm()
      })
    }

    if (label === 'Search') {
      anchor.href = '#'
      anchor.addEventListener('click', e => {
        e.preventDefault()
        searchUser()
      })
    }

    const background = document.createElement('img')
    const p = document.createElement('p')
    background.src = imagePath
    p.textContent = label
    background.classList.add('cloud')

    if (label !== 'Plant flower' && label !== 'Search') {
      anchor.href = href
    }

    anchor.append(background)
    anchor.append(p)

    // Random positioning only on larger screens
    if (window.innerWidth > 600) {
      const randomTop = Math.random() * 40
      const randomLeft = Math.random() * 80
      const randomDuration = (18 + Math.random() * 14).toFixed(2)
      const randomDelay = -(Math.random() * 14).toFixed(2)
      anchor.style.top = randomTop + '%'
      anchor.style.left = randomLeft + '%'
      anchor.style.setProperty('--cloud-duration', `${randomDuration}s`)
      anchor.style.setProperty('--cloud-delay', `${randomDelay}s`)

      for (let i = 0; i <= 4; i++) {
        const x = (Math.random() * 24 - 12).toFixed(2)
        const y = (Math.random() * 40 - 20).toFixed(2)
        anchor.style.setProperty(`--cx${i}`, `${x}vw`)
        anchor.style.setProperty(`--cy${i}`, `${y}px`)
      }
      anchor.style.paddingBottom = '20px'
    }

    nav.append(anchor)
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

function createHomeTitlePlaque () {
  const plaque = document.createElement('div')
  plaque.className = 'garden-title-plaque'
  plaque.setAttribute('aria-label', 'Garden Gathering')

  const subtitle = document.createElement('p')
  subtitle.className = 'garden-title-sub'
  subtitle.textContent = 'Welcome to'

  const title = document.createElement('h1')
  title.className = 'garden-title-main'
  title.textContent = 'Garden Gathering'

  plaque.append(subtitle, title)
  return plaque
}

function syncHomeGrassHint () {
  const garden = document.getElementById('garden')
  if (!garden) {
    return
  }

  const existingHint = garden.querySelector('.garden-grass-hint')
  if (existingHint) {
    existingHint.remove()
  }

  garden.append(createGardenGrassHint())
}

function createGardenGrassHint () {
  const hint = document.createElement('p')
  hint.className = 'garden-grass-hint'
  hint.textContent = 'drag the flowers to decorate your garden'
  return hint
}

function createMenu (header) {
  const menuContainer = document.createElement('div')
  menuContainer.className = 'hamburger-menu-container'

  const menuButton = document.createElement('button')
  menuButton.className = 'hamburger-btn'
  menuButton.type = 'button'
  menuButton.innerHTML = '☰'
  menuButton.addEventListener('click', e => {
    e.stopPropagation()
    menuContent.classList.toggle('open')
  })

  const menuContent = document.createElement('div')
  menuContent.className = 'hamburger-menu-content'

  menuContainer.append(menuButton)
  menuContainer.append(menuContent)
  header.append(menuContainer)

  document.addEventListener('click', e => {
    if (!menuContainer.contains(e.target)) {
      menuContent.classList.remove('open')
    }
  })

  return { menuContent, menuButton }
}

function attachOnlineUsersSection (menuContent, onUsersUpdate = null) {
  if (unsubscribeOnlineUsers) {
    unsubscribeOnlineUsers()
    unsubscribeOnlineUsers = null
  }

  const section = document.createElement('section')
  section.className = 'menu-online-users'

  const heading = document.createElement('p')
  heading.className = 'menu-online-users-heading'

  const list = document.createElement('ul')
  list.className = 'menu-online-users-list'

  section.append(heading, list)
  menuContent.append(section)

  unsubscribeOnlineUsers = subscribeToOnlineUsers(onlineUsers => {
    if (typeof onUsersUpdate === 'function') {
      onUsersUpdate(onlineUsers)
    }

    heading.textContent = `Online now (${onlineUsers.length})`
    list.replaceChildren()

    if (onlineUsers.length === 0) {
      const empty = document.createElement('li')
      empty.className = 'menu-online-users-empty'
      empty.textContent = 'No users online'
      list.append(empty)
      return
    }

    onlineUsers.forEach(name => {
      const item = document.createElement('li')
      item.textContent = name

      if (name.toLowerCase() === getUsername().trim().toLowerCase()) {
        item.classList.add('menu-online-users-self')
      }

      list.append(item)
    })
  })
}

export const initHeaderOnLoad = () => {
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
