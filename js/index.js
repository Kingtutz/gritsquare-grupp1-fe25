import { getAll } from './firebase/messages.js'
import { renderFlowers } from './rendering/renderflowers.js'
import { initHeaderOnLoad } from './modules/header.js'
import { addStyling } from './modules/cssadder.js'
import { initAnimalControl } from './modules/animal.js'
import { initTheme } from './modules/theme.js'

async function initPage () {
  initHeaderOnLoad()
  initTheme()
  await addStyling()
  initAnimalControl()
  const data = await getAll()
  renderFlowers(data)
}

initPage()
