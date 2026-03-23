const animalSize = 48

const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

const ANIMAL_GIFS = [
  'pixel-rabbit-rabbit.gif',
  'bee-pixel.gif',
  'fox.gif',
  'horse.gif',
  'squrril.gif'
]

const basePath = isInSitesFolder() ? '../img/animals' : './img/animals'

function getRandomAnimalSrc () {
  const randomAnimal =
    ANIMAL_GIFS[Math.floor(Math.random() * ANIMAL_GIFS.length)]
  return `${basePath}/${randomAnimal}`
}

function randomPosition (garden, size) {
  const maxLeft = Math.max(garden.clientWidth - size, 0)
  const maxTop = Math.max(garden.clientHeight - size, 0)

  return {
    x: Math.floor(Math.random() * (maxLeft + 1)),
    y: Math.floor(Math.random() * (maxTop + 1))
  }
}

function moveAnimal (animal, garden) {
  const currentLeft = parseFloat(animal.style.left || '0')
  const next = randomPosition(garden, animalSize)

  animal.style.left = `${next.x}px`
  animal.style.top = `${next.y}px`

  if (next.x < currentLeft) {
    animal.style.transform = 'scaleX(-1)'
  } else {
    animal.style.transform = 'scaleX(1)'
  }
}

function spawnAnimal (garden) {
  if (!garden) {
    return
  }

  const animal = document.createElement('img')
  const start = randomPosition(garden, animalSize)
  const animalSrc = getRandomAnimalSrc()

  animal.src = animalSrc
  animal.alt = 'Random garden animal'
  animal.className = 'garden-animal'
  animal.style.left = `${start.x}px`
  animal.style.top = `${start.y}px`
  let moveIntervalId = null

  animal.addEventListener('click', () => {
    if (moveIntervalId !== null) {
      window.clearInterval(moveIntervalId)
    }
    animal.remove()
  })

  garden.append(animal)

  moveIntervalId = window.setInterval(() => {
    moveAnimal(animal, garden)
  }, 2000)
}

export function initAnimalControl () {
  const garden =
    document.getElementById('garden') ??
    document.querySelector('.garden-wrapper')

  if (!garden) {
    return
  }

  const existingButton = document.getElementById('spawn-animal-btn')
  if (existingButton) {
    existingButton.remove()
  }

  const button = document.createElement('button')
  button.id = 'spawn-animal-btn'
  button.type = 'button'
  button.textContent = 'Spawn Animal'

  button.addEventListener('click', () => {
    spawnAnimal(garden)
  })

  // Try to add to hamburger menu, fallback to body
  const menuContent = document.querySelector('.hamburger-menu-content')
  if (menuContent) {
    menuContent.append(button)
  } else {
    if (isInSitesFolder()) {
      button.classList.add('spawn-animal-btn-sites')
    }
    document.body.append(button)
  }
}
