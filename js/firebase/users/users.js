import { ref, onValue, db } from '../core.js'
import { usersUrl, messagesUrl, messagesBaseUrl } from '../core.js'

export const setUserOnlineState = async (username, isOnline, options = {}) => {
  const cleanUsername = String(username || '').trim()
  if (!cleanUsername) {
    return
  }

  const onlineResponse = await fetch(
    `${usersUrl}/${encodeURIComponent(cleanUsername)}/online.json`,
    {
      method: 'PUT',
      body: JSON.stringify(Boolean(isOnline)),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      },
      keepalive: Boolean(options.keepalive)
    }
  )

  if (!onlineResponse.ok) {
    throw new Error(onlineResponse.status)
  }

  const lastSeenResponse = await fetch(
    `${usersUrl}/${encodeURIComponent(cleanUsername)}/lastSeen.json`,
    {
      method: 'PUT',
      body: JSON.stringify(Date.now()),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      },
      keepalive: Boolean(options.keepalive)
    }
  )

  if (!lastSeenResponse.ok) {
    throw new Error(lastSeenResponse.status)
  }
}

export const subscribeToOnlineUsers = onData => {
  if (typeof onData !== 'function') {
    return () => {}
  }

  const usersDbRef = ref(db, '/users')
  return onValue(usersDbRef, snapshot => {
    const users = snapshot.val() || {}
    const onlineUsers = Object.entries(users)
      .filter(([, user]) => Boolean(user?.online))
      .map(([name]) => name)
      .sort((a, b) => a.localeCompare(b))

    onData(onlineUsers)
  })
}

// Get all posts by a specific user
export const getUserPosts = async username => {
  try {
    const response = await fetch(messagesUrl)
    if (!response.ok) throw new Error(response.status)
    const messages = await response.json()

    if (!messages) return {}

    const userPosts = {}
    Object.entries(messages).forEach(([id, message]) => {
      if (message.name === username) {
        userPosts[id] = message
      }
    })
    return userPosts
  } catch (error) {
    console.error('Error fetching user posts:', error)
    throw error
  }
}

// Get user's liked posts
export const getUserLikedPosts = async username => {
  try {
    const likedPostsResponse = await fetch(
      `${usersUrl}/${encodeURIComponent(username)}/liked-posts.json`
    )
    if (!likedPostsResponse.ok) throw new Error(likedPostsResponse.status)
    const likedPostIds = (await likedPostsResponse.json()) || {}

    const postIds = Object.keys(likedPostIds)
    if (postIds.length === 0) return {}

    let allMessages = {}
    try {
      const messagesResponse = await fetch(messagesUrl)
      if (messagesResponse.ok) {
        allMessages = (await messagesResponse.json()) || {}
      }
    } catch {
      allMessages = {}
    }

    const likedPosts = {}

    for (const postId of postIds) {
      if (allMessages?.[postId]) {
        likedPosts[postId] = allMessages[postId]
        continue
      }

      try {
        const singlePostResponse = await fetch(
          `${messagesBaseUrl}/${encodeURIComponent(postId)}.json`
        )
        if (!singlePostResponse.ok) continue

        const singlePostData = await singlePostResponse.json()
        if (singlePostData) {
          likedPosts[postId] = singlePostData
        }
      } catch {
        // Ignore individual post failures
      }
    }

    return likedPosts
  } catch (error) {
    console.error('Error fetching liked posts:', error)
    return {}
  }
}

// Get user's disliked posts
export const getUserDislikedPosts = async username => {
  try {
    const dislikedPostsResponse = await fetch(
      `${usersUrl}/${encodeURIComponent(username)}/disliked-posts.json`
    )
    if (!dislikedPostsResponse.ok) throw new Error(dislikedPostsResponse.status)
    return (await dislikedPostsResponse.json()) || {}
  } catch (error) {
    console.error('Error fetching disliked posts:', error)
    return {}
  }
}
