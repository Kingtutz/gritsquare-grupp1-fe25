const RABBIT_SIZE = 48

const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

const ANIMAL_GIFS = ['pixel-rabbit-rabbit.gif', 'bee-pixel.gif']

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

function moveRabbit (rabbit, garden) {
  const currentLeft = parseFloat(rabbit.style.left || '0')
  const next = randomPosition(garden, RABBIT_SIZE)

  rabbit.style.left = `${next.x}px`
  rabbit.style.top = `${next.y}px`

  if (next.x < currentLeft) {
    rabbit.style.transform = 'scaleX(-1)'
  } else {
    rabbit.style.transform = 'scaleX(1)'
  }
}

function spawnRabbit (garden) {
  if (!garden) {
    return
  }

  const rabbit = document.createElement('img')
  const start = randomPosition(garden, RABBIT_SIZE)
  const animalSrc = getRandomAnimalSrc()

  rabbit.src = animalSrc
  rabbit.alt = 'Random garden animal'
  rabbit.className = 'garden-rabbit'
  rabbit.style.left = `${start.x}px`
  rabbit.style.top = `${start.y}px`

  garden.append(rabbit)

  window.setInterval(() => {
    moveRabbit(rabbit, garden)
  }, 1400)
}

export function initRabbitControl () {
  const garden =
    document.getElementById('garden') ??
    document.querySelector('.garden-wrapper')

  if (!garden) {
    return
  }

  const existingButton = document.getElementById('spawn-rabbit-btn')
  if (existingButton) {
    existingButton.remove()
  }

  const button = document.createElement('button')
  button.id = 'spawn-rabbit-btn'
  button.type = 'button'
  button.textContent = 'Spawn Animal'

  button.addEventListener('click', () => {
    spawnRabbit(garden)
  })

  if (isInSitesFolder()) {
    button.classList.add('spawn-rabbit-btn-sites')
  }

  document.body.append(button)
}
