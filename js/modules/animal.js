// Barrel export from refactored animal submodules
import { getAnimalCount, spawnAnimal } from './animal/animal-spawner.js'
import {
  updateSpawnButtonState,
  handleSpawnButtonClick,
  removeLimitPrompt,
  showLimitPrompt
} from './animal/animal-controls.js'

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
    handleSpawnButtonClick(garden, button)
  })

  document.body.append(button)
  updateSpawnButtonState(button, garden)

  // Listen for animal removal events to update button state
  window.addEventListener('garden:animal-removed', ({ detail }) => {
    if (detail.garden === garden) {
      updateSpawnButtonState(button, garden)
      removeLimitPrompt()
    }
  })
}

// Export helper functions for external use
export {
  spawnAnimal,
  getAnimalCount,
  updateSpawnButtonState,
  removeLimitPrompt
}
