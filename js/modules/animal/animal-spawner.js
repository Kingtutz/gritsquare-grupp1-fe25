const animalSize = 48
const MAX_ANIMALS = 10

const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

const ANIMAL_GIFS = [
  'pixel-rabbit-rabbit.gif',
  'bee-pixel.gif',
  'fox.gif',
  'horse.gif',
  'squrril.gif',
  'run-pikachu.gif'
]

const basePath = isInSitesFolder() ? '../img/animals' : './img/animals'

export function getRandomAnimalSrc () {
  const randomAnimal =
    ANIMAL_GIFS[Math.floor(Math.random() * ANIMAL_GIFS.length)]
  return `${basePath}/${randomAnimal}`
}

export function randomPosition (garden, size) {
  const maxLeft = Math.max(garden.clientWidth - size, 0)
  const maxTop = Math.max(garden.clientHeight - size, 0)

  return {
    x: Math.floor(Math.random() * (maxLeft + 1)),
    y: Math.floor(Math.random() * (maxTop + 1))
  }
}

export function moveAnimal (animal, garden) {
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

export function getAnimalCount (garden) {
  return garden.querySelectorAll('.garden-animal').length
}

export function spawnAnimal (garden, button) {
  if (!garden) {
    return
  }

  if (getAnimalCount(garden) >= MAX_ANIMALS) {
    return false // Signal that spawn was blocked
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
    window.dispatchEvent(
      new CustomEvent('garden:animal-removed', { detail: { garden } })
    )
  })

  garden.append(animal)

  moveIntervalId = window.setInterval(() => {
    moveAnimal(animal, garden)
  }, 2000)

  return true // Signal successful spawn
}

export const ANIMAL_SIZE = animalSize
export const MAX_ANIMALS_LIMIT = MAX_ANIMALS
