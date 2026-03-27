import { subscribeToMessages, setUserOnlineState } from './firebase/firebase.js'
import {
  renderFlowers,
  syncRenderedFlowerTheme
} from './rendering/renderflowers.js'
import { initHeaderOnLoad } from './modules/header.js'
import { addStyling } from './modules/cssadder.js'
import { initAnimalControl } from './modules/animal.js'
import { initTheme } from './modules/theme.js'
import { initCabin } from './modules/cabin.js'
import { getUsername, initUsernamePrompt } from './modules/username.js'

function markCurrentUserOnline () {
  const username = getUsername().trim()
  if (!username) {
    return
  }

  setUserOnlineState(username, true).catch(() => {})
}

function markCurrentUserOffline () {
  const username = getUsername().trim()
  if (!username) {
    return
  }

  setUserOnlineState(username, false, { keepalive: true }).catch(() => {})
}

function isHomePage () {
  return document.getElementById('garden') !== null
}

function getGardenElement () {
  return (
    document.getElementById('garden') ??
    document.querySelector('.garden-wrapper')
  )
}

function renderFlowersInGarden (data) {
  const garden = getGardenElement()
  if (!garden) {
    return
  }

  garden.querySelectorAll('.garden-flower').forEach(flower => flower.remove())

  const flowers = renderFlowers(data)
  flowers.forEach(flower => {
    garden.appendChild(flower)
  })
}

async function initPage () {
  await addStyling()
  initHeaderOnLoad()
  initTheme()

  window.addEventListener('garden:theme-changed', () => {
    if (!getGardenElement()) {
      return
    }

    syncRenderedFlowerTheme()
  })

  if (!getGardenElement()) {
    return
  }

  subscribeToMessages(data => {
    renderFlowersInGarden(data)
  })

  if (!isHomePage()) {
    return
  }

  initUsernamePrompt()
  markCurrentUserOnline()
  window.addEventListener('pagehide', markCurrentUserOffline)
  window.addEventListener('beforeunload', markCurrentUserOffline)
  window.addEventListener('garden:auth-changed', markCurrentUserOnline)
  initAnimalControl()
  initCabin()
}

initPage()
