import { createFlowerForm } from './messageForm.js'
import { logout, getUsername, initUsernamePrompt } from './username.js'
import { searchUser, resetSearchFilter } from '../search.js'

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

export const renderHeader = links => {
  const navLinks = getDefaultLinks()
  const mount = document.body
  const existingHeader = mount.querySelector('[data-generated-header="true"]')
  if (existingHeader) existingHeader.remove()
  const isDarkTheme =
    document.documentElement.getAttribute('data-theme') === 'dark'

  const imagePath = isInSitesFolder()
    ? '../img/icons/pixlecloud.png'
    : 'img/icons/pixlecloud.png'

  const header = document.createElement('header')
  header.dataset.generatedHeader = 'true'

  const nav = document.createElement('nav')

  // Create hamburger menu first so buttons can be added to it
  const menuContent = createMenu(header)

  // Add logout link at the end if user is logged in
  const username = getUsername()
  if (username) {
    navLinks.push({ label: 'Logout', href: '#' })
  }

  const clearSearchButton = document.createElement('button')
  clearSearchButton.textContent = 'Show all flowers'
  clearSearchButton.addEventListener('click', async e => {
    e.preventDefault()
    await resetSearchFilter()
    menuContent.classList.remove('open')
  })
  menuContent.append(clearSearchButton)

  navLinks.forEach(({ label, href }) => {
    // Create Logout as a button instead of a cloud
    if (label === 'Logout') {
      const button = document.createElement('button')
      button.textContent = 'Logout'
      button.addEventListener('click', e => {
        e.preventDefault()
        logout()
        const existingOverlay = document.querySelector(
          '#username-prompt-overlay'
        )
        if (existingOverlay) existingOverlay.remove()
        initUsernamePrompt()
      })
      menuContent.append(button)
      return
    }

    const anchor = document.createElement('a')

    if (label === 'Plant flower') {
      anchor.addEventListener('click', e => {
        e.preventDefault()
        createFlowerForm()
      })
    }

    if (label === 'Search') {
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

    if (label === 'Plant flower') {
      anchor.href = '#'
      anchor.addEventListener('click', event => {
        event.preventDefault()
        openPlantFlowerPopup()
      })
    } else {
      anchor.href = href
    }

    anchor.append(background)
    anchor.append(p)

    // Random positioning only on larger screens
    if (window.innerWidth > 600) {
      const randomTop = Math.random() * 40
      const randomLeft = Math.random() * 80
      const randomDuration = (8 + Math.random() * 8).toFixed(2)
      const randomDelay = -(Math.random() * 8).toFixed(2)
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
      anchor.style.paddingBo = '20px'
    }

    nav.append(anchor)
  })

  header.append(nav)
  header.classList.add(isDarkTheme ? 'sky-wrapper-darkmode' : 'sky-wrapper')

  if (mount === document.body) {
    document.body.prepend(header)
  } else {
    mount.replaceChildren(header)
  }

  return header
}

function createMenu (header) {
  const menuContainer = document.createElement('div')
  menuContainer.className = 'hamburger-menu-container'

  const menuButton = document.createElement('button')
  menuButton.className = 'hamburger-btn'
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

  return menuContent
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
}
