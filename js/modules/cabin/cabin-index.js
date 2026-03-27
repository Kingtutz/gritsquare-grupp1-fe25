import { playCabinDoorSound } from './audio.js'
import { openCabinPopup } from './popup.js'
import { showPostForm } from './post-form.js'

export function initCabin () {
  const cabinImg = document.getElementById('cabinImg')
  const cabinWrapper = document.querySelector('.cabin-wrapper')

  if (!cabinImg || !cabinWrapper) {
    return
  }

  // Make cabin wrapper clickable
  cabinWrapper.style.cursor = 'pointer'
  cabinWrapper.addEventListener('click', () => {
    playCabinDoorSound()
    openCabinPopup()
  })

  // Listen for post form requests
  window.addEventListener('cabin:showPostForm', event => {
    const { contentArea, username, hubContainer, postsList } = event.detail
    showPostForm(contentArea, username, hubContainer, postsList)
  })
}

// Re-exports for backward compatibility
export { openCabinPopup, loadHubContent } from './popup.js'
export { showPostForm } from './post-form.js'
export { playCabinDoorSound, playCabinDoorSoundReverse } from './audio.js'
export {
  displayPostsList,
  displayLikedList,
  getReplyList,
  getReplyCount
} from './post-display.js'
