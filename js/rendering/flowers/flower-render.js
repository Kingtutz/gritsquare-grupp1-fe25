import {
  postReply,
  deleteMessagebyId,
  isUserAdmin,
  dislikePost,
  undislikePost,
  likePost,
  unlikePost,
  getUserLikedPosts,
  getUserDislikedPosts
} from '../../firebase/firebase.js'
import { censorBadWords } from '../../modules/censor.js'
import { getUsername } from '../../modules/username.js'
import {
  createReactionIcon,
  setElementTextWithEmojis
} from '../../modules/emojis.js'
import {
  getFlowerImageForSeed,
  getFlowerImagesForCurrentTheme
} from './flower-images.js'
import {
  resolveFlowerPosition,
  getReadVersion,
  setReadVersion
} from './flower-positioning.js'

const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

const basePath = isInSitesFolder() ? '../img/flowers' : './img/flowers'
const FLOWER_SIZE = 64

export function renderFlowers (data) {
  const flowers = []

  if (!data || typeof data !== 'object') {
    return flowers
  }

  Object.entries(data).forEach(([postId, postData]) => {
    const flower = createFlowerElement(postId, postData)
    if (flower) {
      flowers.push(flower)
    }
  })

  return flowers
}

function createFlowerElement (postId, postData) {
  const garden =
    document.getElementById('garden') ??
    document.querySelector('.garden-wrapper')
  if (!garden) return null

  const flower = document.createElement('div')
  flower.className = 'garden-flower'
  flower.setAttribute('data-flower-id', postId)

  const images = getFlowerImagesForCurrentTheme()
  const seedImg = getFlowerImageForSeed(images, postId)
  const position = resolveFlowerPosition(garden, postId)

  const img = document.createElement('img')
  img.className = 'garden-flower-image'
  img.src = seedImg
  img.alt = `Message from ${postData.name}`
  img.style.left = position.left
  img.style.top = position.top
  img.style.position = 'absolute'
  img.style.width = `${FLOWER_SIZE}px`
  img.style.height = `${FLOWER_SIZE}px`
  img.style.cursor = 'pointer'

  flower.addEventListener('click', () => {
    openFlowerPopup(postId, postData)
  })

  flower.addEventListener('dragstart', e => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', flower.innerHTML)
    flower.style.opacity = '0.5'
  })

  flower.addEventListener('dragend', () => {
    flower.style.opacity = '1'
  })

  flower.appendChild(img)
  return flower
}

function openFlowerPopup (postId, postData) {
  // Placeholder - actual implementation in original renderflowers.js
  console.log('Open flower popup:', postId)
}
