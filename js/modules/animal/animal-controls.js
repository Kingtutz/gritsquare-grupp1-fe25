import {
  getAnimalCount,
  spawnAnimal,
  MAX_ANIMALS_LIMIT
} from './animal-spawner.js'

const LIMIT_PROMPT_ID = 'spawn-animal-limit-prompt'

let limitPromptTimeoutId = null

export function getAnimalCountInGarden (garden) {
  return getAnimalCount(garden)
}

export function removeLimitPrompt () {
  const existingPrompt = document.getElementById(LIMIT_PROMPT_ID)
  if (existingPrompt) {
    existingPrompt.remove()
  }

  if (limitPromptTimeoutId !== null) {
    window.clearTimeout(limitPromptTimeoutId)
    limitPromptTimeoutId = null
  }
}

export function showLimitPrompt (button) {
  if (!button) {
    return
  }

  removeLimitPrompt()

  const prompt = document.createElement('div')
  prompt.id = LIMIT_PROMPT_ID
  prompt.className = 'spawn-animal-limit-prompt'
  prompt.textContent = `Max ${MAX_ANIMALS_LIMIT} animals reached`

  document.body.append(prompt)

  const buttonRect = button.getBoundingClientRect()
  const promptRect = prompt.getBoundingClientRect()
  const promptLeft = Math.max(8, buttonRect.right - promptRect.width)
  const promptTop = Math.max(8, buttonRect.top - promptRect.height - 10)

  prompt.style.left = `${promptLeft}px`
  prompt.style.top = `${promptTop}px`

  limitPromptTimeoutId = window.setTimeout(() => {
    prompt.remove()
    limitPromptTimeoutId = null
  }, 1800)
}

export function updateSpawnButtonState (button, garden) {
  if (!button || !garden) {
    return
  }

  const reachedLimit = getAnimalCount(garden) >= MAX_ANIMALS_LIMIT
  button.classList.toggle('is-limit-reached', reachedLimit)
  button.setAttribute('aria-disabled', reachedLimit ? 'true' : 'false')
  button.title = reachedLimit
    ? `Maximum ${MAX_ANIMALS_LIMIT} animals reached`
    : 'Spawn Animal'
}

export function handleSpawnButtonClick (garden, button) {
  const success = spawnAnimal(garden, button)

  if (!success) {
    updateSpawnButtonState(button, garden)
    showLimitPrompt(button)
  } else {
    updateSpawnButtonState(button, garden)
  }
}
