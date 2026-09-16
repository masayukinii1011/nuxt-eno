import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp
} from 'firebase/firestore'
import firebase from '~/plugins/firebase'
import tracks from '~/data/tracks.json'
import { normalizeSkinId, DEFAULT_SKIN_ID } from '~/lib/theme'

export const MIX_SCHEMA_VERSION = 1
export const TRACK_COUNT = 8
export const TITLE_MAX_LENGTH = 80
export const DEFAULT_TITLE = 'Untitled mix'

export const EFFECT_RANGES = {
  volume: { min: -64, max: 0 },
  filter: { min: 0, max: 10 },
  vibrato: { min: 0, max: 40 },
  tremolo: { min: 0, max: 8 },
  panner: { min: 0, max: 16 }
}

const EFFECT_KEYS = ['volume', 'filter', 'vibrato', 'tremolo', 'panner']
const TRACK_IDS = tracks.map(track => track.id)
const FIRESTORE_TIMEOUT_MS = 10000
const MIXES_DATABASE_ID = 'mixes'
const MIXES_COLLECTION = 'mixes'

function isFiniteNumber (value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function isInRange (value, range) {
  return isFiniteNumber(value) && value >= range.min && value <= range.max
}

function isValidTrack (track) {
  if (!track || typeof track !== 'object') {
    return false
  }

  if (!TRACK_IDS.includes(track.id)) {
    return false
  }

  return EFFECT_KEYS.every((key) => {
    return isInRange(track[key], EFFECT_RANGES[key])
  })
}

export function snapshotMix (instruments, title, skinId) {
  const trimmed = String(title || '').trim().slice(0, TITLE_MAX_LENGTH)
  const instrumentList = Array.isArray(instruments)
    ? instruments
    : (instruments ? [instruments] : [])

  return {
    schemaVersion: MIX_SCHEMA_VERSION,
    title: trimmed || DEFAULT_TITLE,
    skinId: normalizeSkinId(skinId),
    tracks: instrumentList.map(instrument => instrument.getValues())
  }
}

export function isValidMix (data) {
  if (!data || typeof data !== 'object') {
    return false
  }

  if (data.schemaVersion !== MIX_SCHEMA_VERSION) {
    return false
  }

  if (
    typeof data.title !== 'string' ||
    data.title.length === 0 ||
    data.title.length > TITLE_MAX_LENGTH
  ) {
    return false
  }

  if (!Array.isArray(data.tracks) || data.tracks.length !== TRACK_COUNT) {
    return false
  }

  const ids = data.tracks.map(track => track && track.id)
  const hasDuplicateId = ids.some((id, index) => ids.indexOf(id) !== index)

  if (hasDuplicateId) {
    return false
  }

  if (data.skinId !== undefined && typeof data.skinId !== 'string') {
    return false
  }

  if (data.skinId !== undefined && normalizeSkinId(data.skinId) !== data.skinId) {
    return false
  }

  return data.tracks.every(isValidTrack) &&
    TRACK_IDS.every(id => ids.includes(id))
}

function withTimeout (promise, message) {
  let timer

  const timeout = new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      reject(new Error(message))
    }, FIRESTORE_TIMEOUT_MS)
  })

  return Promise.race([promise, timeout]).finally(() => {
    clearTimeout(timer)
  })
}

function firestoreDb () {
  return getFirestore(firebase.app(), MIXES_DATABASE_ID)
}

function mixesCollection () {
  return collection(firestoreDb(), MIXES_COLLECTION)
}

export async function createMix (payload) {
  if (!isValidMix(payload)) {
    throw new Error('Invalid mix')
  }

  const ref = await withTimeout(
    addDoc(mixesCollection(), {
      schemaVersion: payload.schemaVersion,
      title: payload.title,
      skinId: payload.skinId || DEFAULT_SKIN_ID,
      tracks: JSON.parse(JSON.stringify(payload.tracks)),
      createdAt: serverTimestamp()
    }),
    'Mix save timed out'
  )

  return ref.id
}

export async function getMix (id) {
  if (!id || typeof id !== 'string') {
    return null
  }

  const snap = await withTimeout(
    getDoc(doc(firestoreDb(), MIXES_COLLECTION, id)),
    'Mix load timed out'
  )

  if (!snap.exists()) {
    return null
  }

  const data = snap.data() || {}
  const mix = {
    schemaVersion: data.schemaVersion,
    title: data.title,
    skinId: normalizeSkinId(data.skinId),
    tracks: data.tracks
  }

  if (!isValidMix(mix)) {
    return null
  }

  return {
    id: snap.id,
    ...mix
  }
}
