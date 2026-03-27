const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

export function createHomeTitlePlaque () {
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

function createGardenGrassHint () {
  const hint = document.createElement('p')
  hint.className = 'garden-grass-hint'
  hint.textContent = 'drag the flowers to decorate your garden'
  return hint
}

export function syncHomeGrassHint () {
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
