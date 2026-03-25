import { getAll } from './firebase/firebase.js'
import { renderFlowers, syncRenderedFlowerTheme } from './rendering/renderflowers.js'
import { initHeaderOnLoad } from './modules/header.js'
import { addStyling } from './modules/cssadder.js'
import { initAnimalControl } from './modules/animal.js'
import { initTheme } from './modules/theme.js'
import { initCabin } from './modules/cabin.js'
import { initUsernamePrompt } from './modules/username.js'

function isHomePage () {
  return document.getElementById('garden') !== null
}

async function initPage () {
  await addStyling()
  initHeaderOnLoad()
  initTheme()

  window.addEventListener('garden:theme-changed', () => {
    if (!isHomePage()) {
      return
    }

    syncRenderedFlowerTheme()
  })

  if (!isHomePage()) {
    return
  }

  initUsernamePrompt()
  initAnimalControl()
  initCabin()
  const data = await getAll()
  renderFlowers(data)
}

initPage()
