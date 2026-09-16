import skins from '~/data/skins.json'

export const DEFAULT_SKIN_ID = 'charcoal'
export const SKIN_STORAGE_KEY = 'nuxt-eno:last-skin'

const SKIN_MAP = skins.reduce((map, skin) => {
  map[skin.id] = skin
  return map
}, {})

export function getSkinIds () {
  return skins.map(skin => skin.id)
}

export function getSkin (skinId) {
  return SKIN_MAP[normalizeSkinId(skinId)]
}

export function normalizeSkinId (skinId) {
  if (typeof skinId === 'string' && SKIN_MAP[skinId]) {
    return skinId
  }

  return DEFAULT_SKIN_ID
}

export function applySkin (skinId) {
  if (!process.client) {
    return DEFAULT_SKIN_ID
  }

  const skin = getSkin(skinId)
  const root = document.documentElement
  const tokens = skin.tokens

  root.style.setProperty('--eno-bg', tokens.bg)
  root.style.setProperty('--eno-surface', tokens.surface)
  root.style.setProperty('--eno-text', tokens.text)
  root.style.setProperty('--eno-muted', tokens.muted)
  root.style.setProperty('--eno-label', tokens.label)
  root.style.setProperty('--eno-heading', tokens.heading)
  root.style.setProperty('--eno-border', tokens.border)
  root.style.setProperty('--eno-border-hover', tokens.borderHover)
  root.style.setProperty('--eno-accent', tokens.accent)
  root.style.setProperty('--eno-focus', tokens.focus)
  root.style.setProperty('--eno-error', tokens.error)
  root.style.setProperty('--eno-error-bg', tokens.errorBg)
  root.style.setProperty('--eno-particle-hue', String(tokens.particleHue))

  return skin.id
}
