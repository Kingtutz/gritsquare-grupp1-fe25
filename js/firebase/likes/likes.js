import { usersUrl, messagesBaseUrl } from '../core.js'

export const likePost = async (username, postId) => {
  try {
    const putResponse = await fetch(
      `${usersUrl}/${encodeURIComponent(
        username
      )}/liked-posts/${encodeURIComponent(postId)}.json`,
      {
        method: 'PUT',
        body: JSON.stringify(true),
        headers: { 'Content-type': 'application/json; charset=UTF-8' }
      }
    )
    if (!putResponse.ok) throw new Error(putResponse.status)

    await updatePostLikes(postId, 1)
    return true
  } catch (error) {
    console.error('Error liking post:', error)
    throw error
  }
}

export const unlikePost = async (username, postId) => {
  try {
    const deleteResponse = await fetch(
      `${usersUrl}/${encodeURIComponent(
        username
      )}/liked-posts/${encodeURIComponent(postId)}.json`,
      { method: 'DELETE' }
    )
    if (!deleteResponse.ok) throw new Error(deleteResponse.status)

    await updatePostLikes(postId, -1)
    return true
  } catch (error) {
    console.error('Error unliking post:', error)
    throw error
  }
}

export const updatePostLikes = async (postId, increment) => {
  try {
    const response = await fetch(
      `${messagesBaseUrl}/${encodeURIComponent(postId)}.json`
    )
    if (!response.ok) throw new Error(response.status)
    const post = await response.json()

    const newLikes = Math.max((post?.likes || 0) + increment, 0)

    const updateResponse = await fetch(
      `${messagesBaseUrl}/${encodeURIComponent(postId)}/likes.json`,
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

export const LikeMessage = async (id, likes) => {
  const url =
    'https://messageboard-77286-default-rtdb.europe-west1.firebasedatabase.app/messages'
  const options = {
    method: 'PATCH',
    body: JSON.stringify({
      likes: likes + 1
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  }
  const response = await fetch(`${url}/${id}.json`, options)
  if (!response.ok) throw new Error(response.status)
  const data = await response.json()
}

export const dislikePost = async (username, postId) => {
  try {
    const putResponse = await fetch(
      `${usersUrl}/${encodeURIComponent(
        username
      )}/disliked-posts/${encodeURIComponent(postId)}.json`,
      {
        method: 'PUT',
        body: JSON.stringify(true),
        headers: { 'Content-type': 'application/json; charset=UTF-8' }
      }
    )
    if (!putResponse.ok) throw new Error(putResponse.status)

    await updatePostDislikes(postId, 1)
    return true
  } catch (error) {
    console.error('Error disliking post:', error)
    throw error
  }
}

export const undislikePost = async (username, postId) => {
  try {
    const deleteResponse = await fetch(
      `${usersUrl}/${encodeURIComponent(
        username
      )}/disliked-posts/${encodeURIComponent(postId)}.json`,
      { method: 'DELETE' }
    )
    if (!deleteResponse.ok) throw new Error(deleteResponse.status)

    await updatePostDislikes(postId, -1)
    return true
  } catch (error) {
    console.error('Error removing dislike from post:', error)
    throw error
  }
}

export const updatePostDislikes = async (postId, increment) => {
  try {
    const response = await fetch(
      `${messagesBaseUrl}/${encodeURIComponent(postId)}.json`
    )
    if (!response.ok) throw new Error(response.status)
    const post = await response.json()

    const newDislikes = Math.max((post?.dislikes || 0) + increment, 0)

    const updateResponse = await fetch(
      `${messagesBaseUrl}/${encodeURIComponent(postId)}/dislikes.json`,
      {
        method: 'PUT',
        body: JSON.stringify(newDislikes),
        headers: { 'Content-type': 'application/json; charset=UTF-8' }
      }
    )
    if (!updateResponse.ok) throw new Error(updateResponse.status)
    return true
  } catch (error) {
    console.error('Error updating post dislikes:', error)
    throw error
  }
}

export const disLikeMessage = async (id, dislikes) => {
  const url =
    'https://messageboard-77286-default-rtdb.europe-west1.firebasedatabase.app/messages'

  const options = {
    method: 'PATCH',
    body: JSON.stringify({
      dislikes: dislikes + 1
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  }
  const response = await fetch(`${url}/${id}.json`, options)
  if (!response.ok) throw new Error(response.status)
  const data = await response.json()
}
