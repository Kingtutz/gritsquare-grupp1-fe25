const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

const emojiBasePath = isInSitesFolder() ? '../img/emojis' : './img/emojis'

export const spriteSheetPath = `${emojiBasePath}/pixelemoji-set.png`
export const heartEmojiPath = `${emojiBasePath}/heartemoji.png`
export const brokenHeartEmojiPath = `${emojiBasePath}/brokenheartemoji.png`

export const SPRITE_COLUMNS = 5
export const SPRITE_ROWS = 5

const spriteEmojiDefinitions = Array.from(
  { length: SPRITE_COLUMNS * SPRITE_ROWS },
  (_, index) => {
    const row = Math.floor(index / SPRITE_COLUMNS)
    const column = index % SPRITE_COLUMNS

    return {
      id: `emoji-${index + 1}`,
      token: `:emoji-${index + 1}:`,
      type: 'sprite',
      row,
      column
    }
  }
)

export const heartEmojiDefinition = {
  id: 'heart',
  token: ':heart:',
  type: 'heart'
}

export const postEmojiDefinitions = [
  ...spriteEmojiDefinitions,
  heartEmojiDefinition
]

export const emojiDefinitionMap = new Map(
  postEmojiDefinitions.map(definition => [definition.token, definition])
)

export function escapeForRegExp (value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const emojiTokenPattern = new RegExp(
  `(${postEmojiDefinitions
    .map(definition => escapeForRegExp(definition.token))
    .sort((left, right) => right.length - left.length)
    .join('|')})`,
  'g'
)
