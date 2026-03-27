import {
  getUserLikedPosts,
  likePost,
  unlikePost,
  postReply
} from '../../firebase/firebase.js'
import { censorBadWords } from '../censor.js'
import { createReactionIcon, setElementTextWithEmojis } from '../emojis.js'

function normalizeReply (entry) {
  if (!entry || typeof entry !== 'object') {
    return null
  }

  const name = String(entry.name || '').trim()
  const message = String(entry.message || '').trim()

  if (!name || !message) {
    return null
  }

  return {
    id: String(entry.id || ''),
    name,
    message,
    createdAt:
      typeof entry.createdAt === 'number' && Number.isFinite(entry.createdAt)
        ? entry.createdAt
        : 0
  }
}

function normalizeUserName (value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function formatTimestamp (timestamp) {
  if (!timestamp || !Number.isFinite(timestamp)) {
    return 'unknown time'
  }

  try {
    return new Date(timestamp).toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'unknown time'
  }
}

export function getReplyList (postData) {
  const replies = []

  if (Array.isArray(postData?.replies)) {
    postData.replies.forEach(entry => {
      const normalized = normalizeReply(entry)
      if (normalized) {
        replies.push(normalized)
      }
    })
  } else if (postData?.replies && typeof postData.replies === 'object') {
    Object.values(postData.replies).forEach(entry => {
      const normalized = normalizeReply(entry)
      if (normalized) {
        replies.push(normalized)
      }
    })
  }

  const legacyAnswer = normalizeReply(postData?.answer)
  if (legacyAnswer && replies.length === 0) {
    replies.push(legacyAnswer)
  }

  replies.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))

  return replies
}

export function getReplyCount (postData) {
  return getReplyList(postData).length
}

export function buildCabinReplyElement (replyData, currentUsername) {
  const item = document.createElement('article')
  item.className = 'cabin-post-reply-item'

  const ownReply =
    normalizeUserName(replyData?.name) === normalizeUserName(currentUsername)
  if (ownReply) {
    item.classList.add('cabin-post-reply-item-own')
  }

  const message = document.createElement('p')
  message.className = 'cabin-post-reply-message'
  setElementTextWithEmojis(message, replyData.message, { size: 16 })

  const meta = document.createElement('p')
  meta.className = 'cabin-post-reply-meta'

  const author = document.createElement('span')
  author.className = 'cabin-post-reply-author'
  author.textContent = ownReply ? 'You' : replyData.name

  const time = document.createElement('span')
  time.className = 'cabin-post-reply-time'
  time.textContent = formatTimestamp(replyData.createdAt)

  meta.append(author, time)

  item.append(message, meta)
  return item
}

export function buildCabinReplyForm ({
  postId,
  postData,
  username,
  onReplySaved
}) {
  const form = document.createElement('form')
  form.className = 'cabin-post-reply-form'

  const input = document.createElement('textarea')
  input.name = 'cabin-reply-message'
  input.className = 'cabin-post-reply-input'
  input.maxLength = 180
  input.required = true
  input.placeholder = 'Write a reply...'

  const actions = document.createElement('div')
  actions.className = 'cabin-post-reply-actions'

  const submit = document.createElement('button')
  submit.type = 'submit'
  submit.className = 'cabin-post-reply-submit'
  submit.textContent = 'Reply'

  const status = document.createElement('p')
  status.className = 'cabin-post-reply-status'
  status.hidden = true

  actions.append(submit, status)
  form.append(input, actions)

  form.addEventListener('submit', async event => {
    event.preventDefault()

    const nameValue = censorBadWords(String(username || '').trim())
    const messageValue = censorBadWords(input.value.trim())

    if (!nameValue) {
      status.hidden = false
      status.textContent = 'You need to be logged in to reply.'
      return
    }

    if (!messageValue) {
      status.hidden = false
      status.textContent = 'Please enter a reply.'
      return
    }

    submit.disabled = true
    status.hidden = false
    status.textContent = 'Sending...'

    try {
      const savedReply = await postReply(postId, messageValue, nameValue)
      if (!Array.isArray(postData.replies)) {
        postData.replies = getReplyList(postData)
      }
      postData.replies.push(savedReply)
      input.value = ''
      status.textContent = 'Reply posted.'
      onReplySaved()
    } catch {
      status.textContent = 'Could not post reply. Try again.'
    } finally {
      submit.disabled = false
    }
  })

  return form
}

export async function checkIfLiked (postId, username) {
  try {
    const likedPosts = await getUserLikedPosts(username)
    return !!likedPosts[postId]
  } catch (error) {
    console.error('Error checking like status:', error)
    return false
  }
}

export function displayPostsList (postsData, container, username, hubContainer) {
  container.innerHTML = ''

  if (!postsData || Object.keys(postsData).length === 0) {
    container.innerHTML = '<p style="color: #999;">No posts yet</p>'
    return
  }

  Object.entries(postsData).forEach(([postId, postData]) => {
    const postItem = document.createElement('div')
    postItem.className = 'cabin-post-item'
    postItem.style.padding = '12px'
    postItem.style.marginBottom = '10px'
    postItem.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
    postItem.style.borderRadius = '4px'
    postItem.style.cursor = 'pointer'
    postItem.style.borderLeft = '4px solid #8B6F47'
    postItem.style.transition = 'all 0.2s'

    const title = document.createElement('p')
    title.textContent = postData.title || 'Untitled'
    title.style.margin = '0 0 4px 0'
    title.style.fontWeight = 'bold'
    title.style.color = '#333'

    const meta = document.createElement('p')
    meta.className = 'cabin-post-item-meta'
    meta.textContent = `${getReplyCount(postData)} replies`

    postItem.append(title, meta)
    postItem.addEventListener('click', () => {
      window.dispatchEvent(
        new CustomEvent('cabin:showPostDetail', {
          detail: { postData, postId, username, hubContainer }
        })
      )
    })

    postItem.addEventListener('mouseenter', () => {
      postItem.style.backgroundColor = 'rgba(255, 255, 255, 1)'
      postItem.style.transform = 'translateX(4px)'
    })

    postItem.addEventListener('mouseleave', () => {
      postItem.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
      postItem.style.transform = 'translateX(0)'
    })

    container.append(postItem)
  })
}

export function displayLikedList (likedData, container, username, hubContainer) {
  container.innerHTML = ''

  if (!likedData || Object.keys(likedData).length === 0) {
    container.innerHTML = '<p style="color: #999;">No liked posts yet</p>'
    return
  }

  Object.entries(likedData).forEach(([postId, postData]) => {
    const likedItem = document.createElement('div')
    likedItem.className = 'cabin-liked-item'
    likedItem.style.padding = '12px'
    likedItem.style.marginBottom = '10px'
    likedItem.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
    likedItem.style.borderRadius = '4px'
    likedItem.style.cursor = 'pointer'
    likedItem.style.borderLeft = '4px solid #FFB347'
    likedItem.style.transition = 'all 0.2s'

    const title = document.createElement('p')
    title.textContent = postData.title || 'Untitled'
    title.style.margin = '0 0 4px 0'
    title.style.fontWeight = 'bold'
    title.style.color = '#333'

    const author = document.createElement('p')
    author.textContent = `by ${postData.name} • ${getReplyCount(
      postData
    )} replies`
    author.className = 'cabin-liked-item-meta'
    author.style.margin = '0'
    author.style.fontSize = '12px'
    author.style.color = '#666'

    likedItem.append(title, author)
    likedItem.addEventListener('click', () => {
      window.dispatchEvent(
        new CustomEvent('cabin:showPostDetail', {
          detail: { postData, postId, username, hubContainer }
        })
      )
    })

    likedItem.addEventListener('mouseenter', () => {
      likedItem.style.backgroundColor = 'rgba(255, 255, 255, 1)'
      likedItem.style.transform = 'translateX(4px)'
    })

    likedItem.addEventListener('mouseleave', () => {
      likedItem.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
      likedItem.style.transform = 'translateX(0)'
    })

    container.append(likedItem)
  })
}
