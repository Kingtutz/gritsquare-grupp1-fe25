import {
  getUserPosts,
  getUserLikedPosts,
  likePost,
  unlikePost
} from '../../firebase/firebase.js'
import { getUsername } from '../username.js'
import { setElementTextWithEmojis } from '../emojis.js'
import { playCabinDoorSound, playCabinDoorSoundReverse } from './audio.js'
import {
  getReplyList,
  getReplyCount,
  buildCabinReplyElement,
  buildCabinReplyForm,
  checkIfLiked,
  displayPostsList,
  displayLikedList
} from './post-display.js'
import {
  createPixelLabel,
  setPixelButtonContent,
  updateCabinLikeButton
} from './ui-utils.js'

const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

const basePath = isInSitesFolder() ? '../img/cabin' : './img/cabin'

export async function loadHubContent (
  username,
  postsList,
  likedList,
  hubContainer
) {
  try {
    // Load user's posts
    const userPosts = await getUserPosts(username)
    displayPostsList(userPosts, postsList, username, hubContainer)

    // Load liked posts
    const likedPosts = await getUserLikedPosts(username)
    displayLikedList(likedPosts, likedList, username, hubContainer)
  } catch (error) {
    console.error('Error loading hub content:', error)
    postsList.innerHTML = '<p style="color: red;">Error loading posts</p>'
    likedList.innerHTML = '<p style="color: red;">Error loading liked posts</p>'
  }
}

function showPostDetail (postData, postId, username, hubContainer) {
  // Hide the hub container and show post detail
  hubContainer.style.display = 'none'

  const detailContainer = document.createElement('div')
  detailContainer.className = 'cabin-post-detail'
  detailContainer.style.display = 'flex'
  detailContainer.style.flexDirection = 'column'
  detailContainer.style.height = '100%'
  detailContainer.style.overflowY = 'auto'

  // Back button
  const backBtn = document.createElement('button')
  backBtn.type = 'button'
  backBtn.className = 'cabin-nav-btn'
  setPixelButtonContent(backBtn, 'pixel-icon-arrow-left', 'Back')
  backBtn.addEventListener('click', () => {
    detailContainer.remove()
    hubContainer.style.display = 'flex'
  })

  // Post content
  const title = document.createElement('h3')
  title.textContent = postData.title || 'Untitled'
  title.style.margin = '0 0 8px 0'
  title.style.color = '#8B6F47'

  const author = document.createElement('p')
  author.textContent = `By ${postData.name}`
  author.style.margin = '0 0 12px 0'
  author.style.fontSize = '14px'
  author.style.color = '#666'
  author.style.fontStyle = 'italic'

  const message = document.createElement('p')
  setElementTextWithEmojis(message, postData.message, { size: 18 })
  message.style.margin = '0 0 16px 0'
  message.style.lineHeight = '1.6'
  message.style.color = '#333'

  const actionsRow = document.createElement('div')
  actionsRow.className = 'cabin-post-actions'

  const copyBtn = document.createElement('button')
  copyBtn.type = 'button'
  copyBtn.className = 'cabin-post-copy-btn'
  copyBtn.textContent = 'Copy post'
  copyBtn.addEventListener('click', async () => {
    const copyText = [
      `Title: ${postData.title || 'Untitled'}`,
      `By: ${postData.name || 'Unknown'}`,
      '',
      `${postData.message || ''}`
    ].join('\n')

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyText)
      } else {
        const helper = document.createElement('textarea')
        helper.value = copyText
        document.body.append(helper)
        helper.select()
        document.execCommand('copy')
        helper.remove()
      }

      copyBtn.textContent = 'Copied!'
      window.setTimeout(() => {
        copyBtn.textContent = 'Copy post'
      }, 1200)
    } catch {
      copyBtn.textContent = 'Copy failed'
      window.setTimeout(() => {
        copyBtn.textContent = 'Copy post'
      }, 1200)
    }
  })

  const repliesSection = document.createElement('section')
  repliesSection.className = 'cabin-post-replies'

  const repliesTitle = document.createElement('h4')
  repliesTitle.className = 'cabin-post-replies-title'
  repliesTitle.textContent = 'Replies'

  const repliesList = document.createElement('div')
  repliesList.className = 'cabin-post-replies-list'

  const renderReplies = () => {
    repliesList.replaceChildren()
    const replies = getReplyList(postData)

    if (replies.length === 0) {
      const empty = document.createElement('p')
      empty.className = 'cabin-post-replies-empty'
      empty.textContent = 'No replies yet.'
      repliesList.append(empty)
      return
    }

    replies.forEach(reply => {
      repliesList.append(buildCabinReplyElement(reply, username))
    })
  }

  renderReplies()
  repliesSection.append(repliesTitle, repliesList)

  const replyForm = buildCabinReplyForm({
    postId,
    postData,
    username,
    onReplySaved: renderReplies
  })

  const isOwnPost = postData?.name === username
  if (!isOwnPost) {
    // Like/Unlike button
    const likeBtn = document.createElement('button')
    likeBtn.type = 'button'
    likeBtn.className = 'cabin-like-btn'

    // Check if already liked
    checkIfLiked(postId, username).then(isLiked => {
      updateCabinLikeButton(likeBtn, isLiked)
      likeBtn.addEventListener('click', async () => {
        try {
          if (isLiked) {
            await unlikePost(username, postId)
            isLiked = false
          } else {
            await likePost(username, postId)
            isLiked = true
          }

          updateCabinLikeButton(likeBtn, isLiked)

          const postsList = hubContainer.querySelector('.cabin-posts-list')
          const likedList = hubContainer.querySelector('.cabin-liked-list')
          if (postsList && likedList) {
            loadHubContent(username, postsList, likedList, hubContainer)
          }
        } catch (error) {
          console.error('Error toggling like:', error)
          alert('Error updating like status')
        }
      })
    })

    actionsRow.append(copyBtn, likeBtn)
    detailContainer.append(
      backBtn,
      title,
      author,
      message,
      repliesSection,
      replyForm,
      actionsRow
    )
  } else {
    actionsRow.append(copyBtn)
    detailContainer.append(
      backBtn,
      title,
      author,
      message,
      repliesSection,
      replyForm,
      actionsRow
    )
  }

  hubContainer.parentElement.append(detailContainer)
}

export function openCabinPopup () {
  const existing = document.getElementById('cabin-popup-overlay')
  if (existing) {
    existing.remove()
  }

  const username = getUsername()
  if (!username) {
    alert('Please login first')
    return
  }

  const overlay = document.createElement('div')
  overlay.id = 'cabin-popup-overlay'
  overlay.style.backgroundImage = `url('${basePath}/cozyInside.gif')`
  overlay.style.backgroundSize = 'cover'
  overlay.style.backgroundPosition = 'center'
  overlay.style.backgroundAttachment = 'fixed'

  const cabinContainer = document.createElement('div')
  cabinContainer.className = 'cabin-popup-container'

  // Create the content area
  const contentArea = document.createElement('div')
  contentArea.className = 'cabin-popup-content'

  // Header with username and close button
  const header = document.createElement('div')
  header.className = 'cabin-popup-header'
  header.style.display = 'flex'
  header.style.justifyContent = 'space-between'
  header.style.alignItems = 'center'

  const userInfo = document.createElement('div')
  const userName = document.createElement('h2')
  userName.textContent = username
  userName.className = 'cabin-popup-username'
  userName.style.margin = '0'
  userName.style.fontSize = '24px'
  userInfo.append(userName)

  const closeBtn = document.createElement('button')
  closeBtn.textContent = '✕'
  closeBtn.className = 'cabin-popup-close'
  closeBtn.setAttribute('aria-label', 'Close cabin popup')

  const cabinReadabilityBtn = document.createElement('button')
  cabinReadabilityBtn.type = 'button'
  cabinReadabilityBtn.className = 'cabin-reading-btn'
  cabinReadabilityBtn.textContent = 'Lamp'
  cabinReadabilityBtn.setAttribute('aria-pressed', 'false')
  cabinReadabilityBtn.setAttribute(
    'aria-label',
    'Toggle cabin readability mode'
  )

  cabinReadabilityBtn.addEventListener('click', () => {
    const nextState = !overlay.classList.contains('cabin-local-dark')
    overlay.classList.toggle('cabin-local-dark', nextState)
    cabinReadabilityBtn.setAttribute('aria-pressed', String(nextState))
    cabinReadabilityBtn.textContent = nextState ? 'Lamp on' : 'Lamp'
  })

  let isRemoved = false
  const removeOverlay = () => {
    if (isRemoved) {
      return
    }

    isRemoved = true
    document.removeEventListener('keydown', onKeyDown)
    playCabinDoorSoundReverse()
    overlay.remove()
    window.dispatchEvent(new CustomEvent('garden:cabin-closed'))
  }

  const onKeyDown = event => {
    if (event.key === 'Escape') {
      removeOverlay()
    }
  }

  document.addEventListener('keydown', onKeyDown)
  closeBtn.addEventListener('click', removeOverlay)

  const headerActions = document.createElement('div')
  headerActions.className = 'cabin-popup-header-actions'
  headerActions.append(cabinReadabilityBtn, closeBtn)

  header.append(userInfo, headerActions)

  // Main content container with two columns
  const hubContainer = document.createElement('div')
  hubContainer.className = 'cabin-hub-container'
  hubContainer.style.display = 'flex'
  hubContainer.style.gap = '20px'
  hubContainer.style.height = '100%'
  hubContainer.style.minHeight = '300px'

  // Left column - User's posts
  const leftColumn = document.createElement('div')
  leftColumn.className = 'cabin-column cabin-column-posts'
  leftColumn.style.flex = '1'
  leftColumn.style.display = 'flex'
  leftColumn.style.flexDirection = 'column'
  leftColumn.style.borderRight = '2px solid rgba(139, 111, 71, 0.3)'
  leftColumn.style.paddingRight = '15px'

  const postsTitle = document.createElement('h3')
  postsTitle.textContent = 'Your Posts'
  postsTitle.style.marginTop = '0'
  postsTitle.style.color = '#8B6F47'

  const postsList = document.createElement('div')
  postsList.className = 'cabin-posts-list'
  postsList.style.flex = '1'
  postsList.style.overflowY = 'auto'
  postsList.style.paddingRight = '10px'

  // Right column - Liked posts
  const rightColumn = document.createElement('div')
  rightColumn.className = 'cabin-column cabin-column-liked'
  rightColumn.style.flex = '1'
  rightColumn.style.display = 'flex'
  rightColumn.style.flexDirection = 'column'

  const likedTitle = document.createElement('h3')
  likedTitle.textContent = 'Liked Posts'
  likedTitle.style.marginTop = '0'
  likedTitle.style.color = '#8B6F47'

  const likedList = document.createElement('div')
  likedList.className = 'cabin-liked-list'
  likedList.style.flex = '1'
  likedList.style.overflowY = 'auto'
  likedList.style.paddingRight = '10px'

  leftColumn.append(postsTitle, postsList)
  rightColumn.append(likedTitle, likedList)

  hubContainer.append(leftColumn, rightColumn)
  contentArea.append(header, hubContainer)

  // Load and display posts
  loadHubContent(username, postsList, likedList, hubContainer)

  // Add clickable scroll icon for posting
  const scrollIcon = document.createElement('img')
  scrollIcon.src = `${basePath}/scroll.png`
  scrollIcon.alt = 'Scroll icon'
  scrollIcon.className = 'cabin-popup-icon cabin-popup-icon-scroll'
  scrollIcon.style.cursor = 'pointer'
  scrollIcon.style.width = '140px'
  scrollIcon.style.height = '100px'
  scrollIcon.style.bottom = '-30px'
  scrollIcon.style.right = '-70px'
  scrollIcon.title = 'Post message'
  scrollIcon.addEventListener('click', () => {
    window.dispatchEvent(
      new CustomEvent('cabin:showPostForm', {
        detail: { contentArea, username, hubContainer, postsList }
      })
    )
  })

  cabinContainer.append(contentArea, scrollIcon)

  // Close on background click
  overlay.addEventListener('click', event => {
    if (event.target === overlay) {
      removeOverlay()
    }
  })

  overlay.append(cabinContainer)
  document.body.append(overlay)
  window.dispatchEvent(new CustomEvent('garden:cabin-opened'))

  // Register event handlers for post detail and form
  const handleShowPostDetail = event => {
    const {
      postData,
      postId,
      username: eventUsername,
      hubContainer: eventHub
    } = event.detail
    showPostDetail(postData, postId, eventUsername, eventHub || hubContainer)
  }

  window.addEventListener('cabin:showPostDetail', handleShowPostDetail)

  // Cleanup on removal
  const observer = new MutationObserver(() => {
    if (!document.body.contains(overlay)) {
      window.removeEventListener('cabin:showPostDetail', handleShowPostDetail)
      observer.disconnect()
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
}
