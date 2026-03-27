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
  setReadVersion,
  saveFlowerPosition
} from './flower-positioning.js'

const FLOWER_SIZE = 64

function clamp (value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function normalizeReply (reply) {
  if (!reply) {
    return null
  }

  if (typeof reply === 'string') {
    const trimmed = reply.trim()
    if (!trimmed) {
      return null
    }

    return {
      name: 'Anonymous',
      message: trimmed
    }
  }

  if (typeof reply === 'object') {
    const message =
      typeof reply.message === 'string' ? reply.message.trim() : ''
    if (!message) {
      return null
    }

    return {
      name:
        typeof reply.name === 'string' && reply.name.trim()
          ? reply.name.trim()
          : 'Anonymous',
      message
    }
  }

  return null
}

function getReplyList (data) {
  const replies = []

  if (Array.isArray(data?.replies)) {
    data.replies.forEach(entry => {
      const normalized = normalizeReply(entry)
      if (normalized) {
        replies.push(normalized)
      }
    })
  } else if (data?.replies && typeof data.replies === 'object') {
    Object.values(data.replies).forEach(entry => {
      const normalized = normalizeReply(entry)
      if (normalized) {
        replies.push(normalized)
      }
    })
  }

  if (replies.length === 0) {
    const legacyAnswer = normalizeReply(data?.answer)
    if (legacyAnswer) {
      replies.push(legacyAnswer)
    }
  }

  return replies
}

function getThreadVersion (data) {
  if (!data || typeof data !== 'object') {
    return 0
  }

  const hasMainMessage =
    typeof data.message === 'string' && data.message.trim().length > 0
  if (!hasMainMessage) {
    return 0
  }

  return 1 + getReplyList(data).length
}

function hasUnreadContent (postId, data) {
  if (!postId) {
    return false
  }

  return getThreadVersion(data) > getReadVersion(postId)
}

function buildReplyElement (replyData) {
  const replyBlock = document.createElement('section')
  replyBlock.className = 'flower-popup-reply'

  const replyLabel = document.createElement('h4')
  replyLabel.className = 'flower-popup-reply-label'
  replyLabel.textContent = 'Reply'

  const replyText = document.createElement('p')
  replyText.className = 'flower-popup-reply-message'
  setElementTextWithEmojis(replyText, replyData.message, { size: 16 })

  const replyMeta = document.createElement('p')
  replyMeta.className = 'flower-popup-reply-meta'
  replyMeta.textContent = `From: ${replyData.name}`

  replyBlock.append(replyLabel, replyText, replyMeta)
  return replyBlock
}

function buildReplyForm ({ postId, data, onReplySaved }) {
  const form = document.createElement('form')
  form.className = 'flower-popup-reply-form'

  const replyMessage = document.createElement('textarea')
  replyMessage.name = 'reply-message'
  replyMessage.maxLength = 180
  replyMessage.required = true
  replyMessage.placeholder = 'Write a reply...'

  const actions = document.createElement('div')
  actions.className = 'flower-popup-reply-actions'

  const submit = document.createElement('button')
  submit.type = 'submit'
  submit.textContent = 'Reply'

  const status = document.createElement('p')
  status.className = 'flower-popup-reply-status'
  status.hidden = true

  actions.append(submit, status)
  form.append(replyMessage, actions)

  form.addEventListener('submit', async event => {
    event.preventDefault()

    const nameValue = censorBadWords(getUsername().trim())
    const messageValue = censorBadWords(replyMessage.value.trim())

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
      if (!Array.isArray(data.replies)) {
        data.replies = getReplyList(data)
      }
      data.replies.push(savedReply)
      replyMessage.value = ''
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

function normalizeUserName (value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function canDeleteAsOwner (data, currentUsername) {
  if (!data) {
    return false
  }

  return normalizeUserName(data.name) === normalizeUserName(currentUsername)
}

function appendDeleteButton ({ box, overlay, postId, data }) {
  const username = getUsername().trim()
  if (!postId || !username) {
    return
  }

  let deleteButton = null
  let status = null
  let adminLabel = null

  const mountDeleteControls = ({ fromAdmin = false } = {}) => {
    if (deleteButton) {
      return
    }

    if (fromAdmin) {
      adminLabel = document.createElement('p')
      adminLabel.className = 'flower-popup-admin-label'
      adminLabel.textContent = 'Admin access'
    }

    deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.className = 'flower-popup-delete-btn'
    deleteButton.textContent = 'Delete message'

    status = document.createElement('p')
    status.className = 'flower-popup-delete-status'
    status.hidden = true

    deleteButton.addEventListener('click', async () => {
      const shouldDelete = window.confirm(
        'Delete this message and all replies?'
      )
      if (!shouldDelete) {
        return
      }

      deleteButton.disabled = true
      status.hidden = false
      status.textContent = 'Deleting...'

      try {
        await deleteMessagebyId(postId)
        overlay.remove()
      } catch {
        status.textContent = 'Could not delete message.'
        deleteButton.disabled = false
      }
    })

    if (adminLabel) {
      box.append(adminLabel)
    }
    box.append(deleteButton, status)
  }

  if (canDeleteAsOwner(data, username)) {
    mountDeleteControls()
    return
  }

  isUserAdmin(username)
    .then(admin => {
      if (admin) {
        mountDeleteControls({ fromAdmin: true })
      }
    })
    .catch(() => {})
}

function enableFlowerDragging (flower, garden, onDragEnd = null) {
  let pointerId = null
  let startPointerX = 0
  let startPointerY = 0
  let startLeft = 0
  let startTop = 0
  let didDrag = false
  const dragThreshold = 3

  flower.addEventListener('pointerdown', event => {
    pointerId = event.pointerId
    startPointerX = event.clientX
    startPointerY = event.clientY
    startLeft = parseFloat(flower.style.left || '0')
    startTop = parseFloat(flower.style.top || '0')
    didDrag = false
    flower.setPointerCapture(pointerId)
  })

  flower.addEventListener('pointermove', event => {
    if (pointerId !== event.pointerId) {
      return
    }

    const deltaX = event.clientX - startPointerX
    const deltaY = event.clientY - startPointerY

    if (!didDrag && Math.abs(deltaX) + Math.abs(deltaY) >= dragThreshold) {
      didDrag = true
    }

    if (!didDrag) {
      return
    }

    const maxLeft = Math.max(garden.clientWidth - FLOWER_SIZE, 0)
    const maxTop = Math.max(garden.clientHeight - FLOWER_SIZE, 0)

    flower.style.left = `${clamp(startLeft + deltaX, 0, maxLeft)}px`
    flower.style.top = `${clamp(startTop + deltaY, 0, maxTop)}px`
  })

  function finishDrag (event) {
    if (pointerId !== event.pointerId) {
      return
    }

    if (flower.hasPointerCapture(pointerId)) {
      flower.releasePointerCapture(pointerId)
    }

    if (didDrag && onDragEnd) {
      onDragEnd(
        parseFloat(flower.style.left || '0'),
        parseFloat(flower.style.top || '0')
      )
    }

    pointerId = null
  }

  flower.addEventListener('pointerup', finishDrag)
  flower.addEventListener('pointercancel', finishDrag)

  return () => {
    const wasDragged = didDrag
    didDrag = false
    return wasDragged
  }
}

export function renderFlower (
  imageSrc,
  data = null,
  positionSeed = 'flower-default',
  postId = ''
) {
  const garden =
    document.getElementById('garden') ??
    document.querySelector('.garden-wrapper')

  if (!garden) {
    return null
  }

  const flower = document.createElement('div')
  const flowerImage = document.createElement('img')
  const unreadBadge = document.createElement('span')
  const fixedPosition = resolveFlowerPosition(garden, positionSeed)

  flowerImage.src = imageSrc
  flowerImage.alt = 'Flower'
  flowerImage.className = 'garden-flower-image'
  flowerImage.style.width = `${FLOWER_SIZE}px`
  flowerImage.style.height = `${FLOWER_SIZE}px`
  flowerImage.style.objectFit = 'contain'
  flowerImage.style.objectPosition = 'center'
  flowerImage.draggable = false

  flower.className = 'garden-flower'
  garden.style.position = 'relative'
  flower.style.position = 'absolute'
  flower.style.width = `${FLOWER_SIZE}px`
  flower.style.height = `${FLOWER_SIZE}px`
  flower.style.left = fixedPosition.left
  flower.style.top = fixedPosition.top

  unreadBadge.className = 'flower-unread-badge'
  unreadBadge.textContent = '!'
  unreadBadge.hidden = !hasUnreadContent(postId, data)

  flower.append(flowerImage, unreadBadge)

  const hoverTitle =
    typeof data?.title === 'string' && data.title.trim().length > 0
      ? data.title.trim()
      : 'Untitled post'
  flower.title = hoverTitle

  const consumeDragState = enableFlowerDragging(flower, garden, (left, top) => {
    saveFlowerPosition(positionSeed, left, top)
  })

  flower.addEventListener('click', () => {
    if (consumeDragState()) {
      return
    }

    setReadVersion(postId, getThreadVersion(data))
    unreadBadge.hidden = true

    openFlowerPopup(flowerImage.src, data, postId)
  })

  return flower
}

function openFlowerPopup (imageSrc, data, postId) {
  const existing = document.getElementById('flower-popup')
  if (existing) {
    existing.remove()
  }

  const overlay = document.createElement('div')
  overlay.id = 'flower-popup'

  const box = document.createElement('div')
  box.className = 'flower-popup-box'

  const img = document.createElement('img')
  img.src = imageSrc
  img.alt = 'Flower'

  const closeBtn = document.createElement('button')
  closeBtn.textContent = '\u2715'
  closeBtn.className = 'flower-popup-close'
  closeBtn.addEventListener('click', () => overlay.remove())

  overlay.addEventListener('click', event => {
    if (event.target === overlay) {
      overlay.remove()
    }
  })

  box.append(closeBtn, img)

  if (data) {
    if (data.name) {
      const name = document.createElement('h5')
      name.className = 'flower-popup-name'
      name.textContent = data.name
      box.append(name)
    }

    if (data.title) {
      const title = document.createElement('h3')
      title.className = 'flower-popup-message'
      title.textContent = data.title
      box.append(title)
    }

    const currentUser = getUsername().trim()
    const isOwnPost = Boolean(currentUser) && data?.name === currentUser
    const reactionActions = document.createElement('div')
    reactionActions.className = 'flower-popup-actions'
    let hasReactionActions = false
    let isLiked = false
    let isDisliked = false

    let renderLikeLabel = () => {}
    let renderDislikeLabel = () => {}

    if (data.likes !== undefined && !isOwnPost && currentUser) {
      const like = document.createElement('button')
      like.className = 'flower-like-btn'

      renderLikeLabel = () => {
        const likes = Math.max(data?.likes || 0, 0)
        like.replaceChildren(
          createReactionIcon('heart', { active: isLiked, size: 18 }),
          Object.assign(document.createElement('span'), {
            className: 'flower-reaction-count',
            textContent: String(likes)
          })
        )

        like.classList.toggle('is-active', isLiked)
      }

      renderLikeLabel()

      getUserLikedPosts(currentUser)
        .then(likedPosts => {
          isLiked = Boolean(likedPosts?.[postId])
          renderLikeLabel()
        })
        .catch(() => {
          renderLikeLabel()
        })

      like.addEventListener('click', async e => {
        e.preventDefault()

        try {
          if (isLiked) {
            await unlikePost(currentUser, postId)
            data.likes = Math.max((data?.likes || 0) - 1, 0)
            isLiked = false
          } else {
            if (isDisliked) {
              await undislikePost(currentUser, postId)
              data.dislikes = Math.max((data?.dislikes || 0) - 1, 0)
              isDisliked = false
              renderDislikeLabel()
            }

            await likePost(currentUser, postId)
            data.likes = (data?.likes || 0) + 1
            isLiked = true
          }

          renderLikeLabel()
        } catch (error) {
          console.error('Error toggling like:', error)
        }
      })

      reactionActions.append(like)
      hasReactionActions = true
    }

    if (data.dislikes !== undefined && !isOwnPost && currentUser) {
      const dislike = document.createElement('button')
      dislike.className = 'flower-dislike-btn'

      renderDislikeLabel = () => {
        dislike.replaceChildren(
          createReactionIcon('dislike', { active: isDisliked, size: 18 }),
          Object.assign(document.createElement('span'), {
            className: 'flower-reaction-count',
            textContent: String(data.dislikes || 0)
          })
        )

        dislike.classList.toggle('is-active', isDisliked)

        dislike.setAttribute(
          'aria-label',
          isDisliked ? 'Remove dislike from message' : 'Dislike message'
        )
      }

      renderDislikeLabel()

      getUserDislikedPosts(currentUser)
        .then(dislikedPosts => {
          isDisliked = Boolean(dislikedPosts?.[postId])
          renderDislikeLabel()
        })
        .catch(() => {
          renderDislikeLabel()
        })

      dislike.addEventListener('click', async e => {
        e.preventDefault()

        try {
          if (isDisliked) {
            await undislikePost(currentUser, postId)
            data.dislikes = Math.max((data?.dislikes || 0) - 1, 0)
            isDisliked = false
          } else {
            if (isLiked) {
              await unlikePost(currentUser, postId)
              data.likes = Math.max((data?.likes || 0) - 1, 0)
              isLiked = false
              renderLikeLabel()
            }

            await dislikePost(currentUser, postId)
            data.dislikes = (data?.dislikes || 0) + 1
            isDisliked = true
          }

          renderDislikeLabel()
        } catch (error) {
          console.error('Error toggling dislike:', error)
        }
      })

      reactionActions.append(dislike)
      hasReactionActions = true
    }

    if (hasReactionActions) {
      box.append(reactionActions)
    }

    if (data.message) {
      const message = document.createElement('p')
      message.className = 'flower-popup-message'
      setElementTextWithEmojis(message, data.message, { size: 18 })
      box.append(message)

      const repliesContainer = document.createElement('div')
      repliesContainer.className = 'flower-popup-replies'
      message.insertAdjacentElement('afterend', repliesContainer)

      const renderReplies = () => {
        repliesContainer.replaceChildren()
        const replies = getReplyList(data)
        replies.forEach(reply => {
          repliesContainer.append(buildReplyElement(reply))
        })
      }

      renderReplies()

      if (postId) {
        const replyForm = buildReplyForm({
          postId,
          data,
          onReplySaved: renderReplies
        })
        box.append(replyForm)
      }
    }
  }

  appendDeleteButton({ box, overlay, postId, data })

  overlay.append(box)
  document.body.append(overlay)
}

export function renderFlowers (data = null) {
  const renderedFlowers = []

  if (!data || typeof data !== 'object') {
    return renderedFlowers
  }

  const flowerImages = getFlowerImagesForCurrentTheme()

  Object.entries(data).forEach(([entryKey, entry]) => {
    const randomImage = getFlowerImageForSeed(flowerImages, entryKey)
    const flower = renderFlower(
      randomImage,
      entry,
      String(entryKey),
      String(entryKey)
    )

    if (flower) {
      renderedFlowers.push(flower)
    }
  })

  return renderedFlowers
}
