const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

const shuffleArray = array => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const getDefaultLinks = () => {
  if (isInSitesFolder()) {
    return [
      { label: 'Messageboard', href: '../index.html' },
      { label: 'About', href: './about.html' },
      { label: 'Contact', href: './contact.html' }
    ]
  }

  return [
    { label: 'Messageboard', href: './index.html' },
    { label: 'About', href: './sites/about.html' },
    { label: 'Contact', href: './sites/contact.html' }
  ]
}

export const renderHeader = links => {
  const navLinks = shuffleArray(links || getDefaultLinks())
  const mount = document.body
  const existingHeader = mount.querySelector('[data-generated-header="true"]')
  if (existingHeader) return existingHeader

  const header = document.createElement('header')
  header.dataset.generatedHeader = 'true'

  const nav = document.createElement('nav')
  navLinks.forEach(({ label, href }) => {
    const anchor = document.createElement('a')
    const background = document.createElement('img')
    const p = document.createElement('p')
    background.src = 'img/pixlecloud.png'
    p.textContent = label
    background.classList.add('cloud')
    anchor.href = href
    anchor.append(background)
    anchor.append(p)
    
    // Random positioning only on larger screens
    if (window.innerWidth > 600) {
      const randomTop = Math.random() * 40
      const randomLeft = Math.random() * 80
      anchor.style.top = randomTop + '%'
      anchor.style.left = randomLeft + '%'
    }
    
    nav.append(anchor)
  })

  header.append(nav)
  header.classList.add('sky-wrapper')

  if (mount === document.body) {
    document.body.prepend(header)
  } else {
    mount.replaceChildren(header)
  }

  return header
}

export const initHeaderOnLoad = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => renderHeader(), {
      once: true
    })
    return
  }

  renderHeader()
}
