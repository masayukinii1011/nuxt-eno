/**
 * Firebase Storage から音源を static/sounds/c/ へダウンロードします。
 * 前提: Blaze プラン有効化後に実行してください（Spark では 402 エラーになります）。
 *
 * Usage: node scripts/download-sounds.mjs
 */
import { createWriteStream, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { initializeApp } from 'firebase/app'
import { getStorage, ref, getDownloadURL } from 'firebase/storage'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

const files = [
  'sounds/c/nuxt-eno01.mp3',
  'sounds/c/nuxt-eno02.mp3',
  'sounds/c/nuxt-eno03.mp3',
  'sounds/c/nuxt-eno04.mp3',
  'sounds/c/nuxt-eno05.mp3',
  'sounds/c/nuxt-eno06.mp3',
  'sounds/c/nuxt-eno07.mp3',
  'sounds/c/nuxt-eno08.mp3'
]

const app = initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
})

const storage = getStorage(app)

async function downloadFile (storagePath) {
  const url = await getDownloadURL(ref(storage, storagePath))
  const outputPath = join(rootDir, 'static', storagePath)

  mkdirSync(dirname(outputPath), { recursive: true })

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download ${storagePath}: ${response.status}`)
  }

  await pipeline(response.body, createWriteStream(outputPath))
  console.log(`saved ${outputPath}`)
}

async function main () {
  for (const file of files) {
    await downloadFile(file)
  }

  console.log('Done. Run npm run generate && firebase deploy --only hosting')
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
