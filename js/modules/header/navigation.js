import { createFlowerForm } from '../messageForm.js'
import { logout, getUsername, initUsernamePrompt } from '../username.js'
import { searchUser, resetSearchFilter } from '../../search.js'

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

export function createMenu (header) {
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

export function buildNavigationLinks (navContainer, menuContent) {
  const navLinks = getDefaultLinks()
  const isSmallScreen = window.innerWidth <= 600
  const imagePath = isInSitesFolder()
    ? '../img/icons/pixlecloud.png'
    : 'img/icons/pixlecloud.png'

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

  const clearSearchButton = document.createElement('button')
  clearSearchButton.type = 'button'
  clearSearchButton.textContent = 'Show all flowers'
  clearSearchButton.addEventListener('click', async e => {
    e.preventDefault()
    await resetSearchFilter()
    closeMenu()
  })
  menuContent.append(clearSearchButton)

  if (getUsername()) {
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

  navLinks.forEach(({ label, href }) => {
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

    navContainer.append(anchor)
  })
}
