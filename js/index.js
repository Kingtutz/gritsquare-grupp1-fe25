import { getAll } from './firebase/firebase.js'
import { renderFlowers } from './rendering/renderflowers.js'
import { renderPost } from './rendering/renderpost.js'
import { initHeaderOnLoad } from './modules/header.js'
import { addStyling } from './modules/cssadder.js'

async function initPage () {
  initHeaderOnLoad()
  await addStyling()
  const data = await getAll()
  renderFlowers(data)
  renderPost()
}

initPage()
