import { profanityList } from './profanityList.js'

function escapeRegex (str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function censorBadWords (text = '') {
  const escapedWords = profanityList.map(escapeRegex)
  const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi')
  return text.replace(regex, match => '*'.repeat(match.length))
}
