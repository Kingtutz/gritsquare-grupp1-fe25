import { getAll } from '../../firebase/firebase.js'
import { renderFlowers } from '../../rendering/renderflowers.js'

function getGarden () {
  return (
    document.getElementById('garden') ??
    document.querySelector('.garden-wrapper')
  )
}

export function clearRenderedFlowers (garden) {
  garden.querySelectorAll('.garden-flower').forEach(flower => flower.remove())
}

export function clearSearchMessage (garden) {
  const existingMessage = garden.querySelector('.notFound')
  if (existingMessage) {
    existingMessage.remove()
  }
}

export async function renderSearchResults (data) {
  const garden = getGarden()

  if (!garden) {
    return
  }

  clearRenderedFlowers(garden)
  clearSearchMessage(garden)

  const flowers = renderFlowers(data)
  flowers.forEach(flower => {
    garden.appendChild(flower)
  })
}

export async function loadAllResults () {
  const all = await getAll()
  await renderSearchResults(all)
}
