import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js'
import {
  getDatabase,
  ref,
  remove
} from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js'

// https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: 'AIzaSyBYrqmRZmIQjtWQZMSynD0F2wZPWA462tc',
  authDomain: 'messageboard-77286.firebaseapp.com',
  databaseURL:
    'https://messageboard-77286-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'messageboard-77286',
  storageBucket: 'messageboard-77286.firebasestorage.app',
  messagingSenderId: '262402990271',
  appId: '1:262402990271:web:724586d400e56438b0a60a'
}
const app = initializeApp(firebaseConfig)
const db = getDatabase(app)
export const usersRef = ref(db, '/messages')
const url =
  'https://messageboard-77286-default-rtdb.europe-west1.firebasedatabase.app/messages.json'
const messagesBaseUrl =
  'https://messageboard-77286-default-rtdb.europe-west1.firebasedatabase.app/messages'

export const getAll = async () => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(response.status)
  const messages = await response.json()
  console.log(messages)
  return messages
}

export const postMessage = async (message, name, title) => {
  const newMessage = {
    message: message,
    name: name,
    title: title,
    likes: 0,
    dislikes: 0,
    answer: { name: '', message: '', likes: 0, dislikes: 0 },
    replies: []
  }
  const options = {
    method: 'POST',
    body: JSON.stringify(newMessage),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  }

  const response = await fetch(url, options)
  if (!response.ok) throw new Error(response.status)
  const newID = await response.json()
  console.log(newID.name)

  return { id: newID.name, newMessage }
}

export const postReply = async (postId, message, name) => {
  const cleanPostId = String(postId || '').trim()
  if (!cleanPostId) {
    throw new Error('Missing post id')
  }

  const replyPayload = {
    name,
    message,
    likes: 0,
    dislikes: 0
  }

  const response = await fetch(
    `${messagesBaseUrl}/${encodeURIComponent(cleanPostId)}/replies.json`,
    {
      method: 'POST',
      body: JSON.stringify(replyPayload),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    }
  )

  if (!response.ok) {
    throw new Error(response.status)
  }

  const created = await response.json()
  return {
    ...replyPayload,
    id: created?.name || ''
  }
}

const usersUrl =
  'https://messageboard-77286-default-rtdb.europe-west1.firebasedatabase.app/users'

export const registerUser = async (username, password) => {
  const checkResponse = await fetch(
    `${usersUrl}/${encodeURIComponent(username)}.json`
  )
  if (!checkResponse.ok) throw new Error(checkResponse.status)
  const existing = await checkResponse.json()
  if (existing !== null) {
    throw new Error('Username already taken')
  }

  const putResponse = await fetch(
    `${usersUrl}/${encodeURIComponent(username)}.json`,
    {
      method: 'PUT',
      body: JSON.stringify({ password }),
      headers: { 'Content-type': 'application/json; charset=UTF-8' }
    }
  )
  if (!putResponse.ok) throw new Error(putResponse.status)
  return putResponse.json()
}

export const loginUser = async (username, password) => {
  const response = await fetch(
    `${usersUrl}/${encodeURIComponent(username)}.json`
  )
  if (!response.ok) throw new Error(response.status)
  const user = await response.json()
  if (user === null) {
    throw new Error('User not found')
  }
  if (user.password !== password) {
    throw new Error('Incorrect password')
  }
  return true
}

export const deleteMessagebyId = async id => {
  const singleMessageRef = ref(db, `${id}/messages`)
  try {
    await remove(singleMessageRef)
    console.log('message deleted')
  } catch (err) {
    console.error('message not deleted')
    throw err
  }
}

// Get all posts by a specific user
export const getUserPosts = async username => {
  try {
    const response = await fetch(url)
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
    const response = await fetch(
      `${usersUrl}/${encodeURIComponent(username)}.json`
    )
    if (!response.ok) throw new Error(response.status)
    const user = await response.json()

    if (!user || !user['liked-posts']) return {}

    // Fetch all messages to get full post data
    const messagesResponse = await fetch(url)
    if (!messagesResponse.ok) throw new Error(messagesResponse.status)
    const allMessages = await messagesResponse.json()

    const likedPosts = {}
    Object.keys(user['liked-posts']).forEach(postId => {
      if (allMessages[postId]) {
        likedPosts[postId] = allMessages[postId]
      }
    })

    return likedPosts
  } catch (error) {
    console.error('Error fetching liked posts:', error)
    return {}
  }
}

// Like a post
export const likePost = async (username, postId) => {
  try {
    const putResponse = await fetch(
      `${usersUrl}/${encodeURIComponent(
        username
      )}/liked-posts/${encodeURIComponent(postId)}.json`,
      {
        method: 'PUT',
        body: JSON.stringify({}),
        headers: { 'Content-type': 'application/json; charset=UTF-8' }
      }
    )
    if (!putResponse.ok) throw new Error(putResponse.status)

    // Also update the like count on the post
    await updatePostLikes(postId, 1)
    return true
  } catch (error) {
    console.error('Error liking post:', error)
    throw error
  }
}

// Unlike a post
export const unlikePost = async (username, postId) => {
  try {
    const deleteResponse = await fetch(
      `${usersUrl}/${encodeURIComponent(
        username
      )}/liked-posts/${encodeURIComponent(postId)}.json`,
      { method: 'DELETE' }
    )
    if (!deleteResponse.ok) throw new Error(deleteResponse.status)

    // Also update the like count on the post
    await updatePostLikes(postId, -1)
    return true
  } catch (error) {
    console.error('Error unliking post:', error)
    throw error
  }
}

// Update post like count
export const updatePostLikes = async (postId, increment) => {
  try {
    const response = await fetch(`${url}/${encodeURIComponent(postId)}.json`)
    if (!response.ok) throw new Error(response.status)
    const post = await response.json()

    const newLikes = (post.likes || 0) + increment

    const updateResponse = await fetch(
      `${url}/${encodeURIComponent(postId)}/likes.json`,
      {
        method: 'PUT',
        body: JSON.stringify(newLikes),
        headers: { 'Content-type': 'application/json; charset=UTF-8' }
      }
    )
    if (!updateResponse.ok) throw new Error(updateResponse.status)
    return true
  } catch (error) {
    console.error('Error updating post likes:', error)
    throw error
  }
}
