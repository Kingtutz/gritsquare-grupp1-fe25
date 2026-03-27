const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

const basePath = isInSitesFolder() ? '../img/flowers' : './img/flowers'

const LIGHT_FLOWER_IMAGES = [
  `${basePath}/Lightflower1.png`,
  `${basePath}/Lightflower2.png`,
  `${basePath}/Lightflower3.png`,
  `${basePath}/Lightflower4.png`,
  `${basePath}/Lightflower5.png`,
  `${basePath}/Lightflower6.png`
]

const DARK_FLOWER_IMAGES = [
  `${basePath}/Darkflower1.png`,
  `${basePath}/Darkflower2.png`,
  `${basePath}/Darkflower3.png`,
  `${basePath}/Darkflower4.png`,
  `${basePath}/Darkflower5.png`,
  `${basePath}/Darkflower6.png`
]

export function isDarkThemeActive () {
  const html = document.documentElement
  return (
    html.getAttribute('data-theme') === 'dark' ||
    html.classList.contains('dark-mode')
  )
}

export function getFlowerImagesForCurrentTheme () {
  return isDarkThemeActive() ? DARK_FLOWER_IMAGES : LIGHT_FLOWER_IMAGES
}

export function getDefaultFlowerImage () {
  return getFlowerImagesForCurrentTheme()[0]
}

export function getFlowerImageForSeed (images, seedValue) {
  if (!Array.isArray(images) || images.length === 0) {
    return getDefaultFlowerImage()
  }

  const seed = hashString(String(seedValue || 'flower-default'))
  return images[seed % images.length]
}

export function extractFlowerVariantNumber (src) {
  const match = src.match(/(Lightflower|Darkflower)(\d+)\.png/i)
  if (!match) {
    return null
  }

  return Number(match[2])
}

export function syncRenderedFlowerTheme () {
  const garden =
    document.getElementById('garden') ??
    document.querySelector('.garden-wrapper')

  if (!garden) {
    return
  }

  const flowers = Array.from(garden.querySelectorAll('.garden-flower-image'))
  if (flowers.length === 0) {
    return
  }

  const useDark = isDarkThemeActive()
  const fallbackImages = useDark ? DARK_FLOWER_IMAGES : LIGHT_FLOWER_IMAGES
  const targetPrefix = useDark ? 'Darkflower' : 'Lightflower'

  flowers.forEach((flower, index) => {
    const variant = extractFlowerVariantNumber(flower.src)
    if (variant && variant >= 1 && variant <= 6) {
      flower.src = `${basePath}/${targetPrefix}${variant}.png`
      return
    }

    flower.src = fallbackImages[index % fallbackImages.length]
  })
}

function hashString (value) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}
