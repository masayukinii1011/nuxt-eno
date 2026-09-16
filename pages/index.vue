<template>
  <div ref="wrap" class="wrap">
    <Canvas
      :canvas-width="wrapWidth"
      :canvas-height="wrapHeight"
      :particle-hue="particleHue"
    />
    <div ref="container" class="container">
      <div v-if="clicked" class="clicked-container">
        <transition name="loaded">
          <div v-show="loadedAll" class="loaded-container">
            <div class="title">
              {{ displayedTitle }}
            </div>
            <p class="subtitle">
              8つのレイヤーを組み合わせて、自分だけの環境音楽を作りましょう。
            </p>
            <div class="presets">
              <span class="presets-label">Preset</span>
              <div class="presets-buttons">
                <button
                  v-for="preset in presets"
                  :key="preset.id"
                  type="button"
                  class="preset-button"
                  :title="preset.description"
                  @click="applyPreset(preset)"
                >
                  {{ preset.label }}
                </button>
              </div>
            </div>
            <div class="skins">
              <span class="skins-label">Color</span>
              <div class="skins-buttons">
                <button
                  v-for="skin in skins"
                  :key="skin.id"
                  type="button"
                  class="skin-button"
                  :class="{ 'skin-button-active': selectedSkinId === skin.id }"
                  :title="skin.description"
                  :aria-pressed="selectedSkinId === skin.id"
                  @click="selectSkin(skin.id)"
                >
                  <span
                    class="skin-swatch"
                    :style="{ backgroundColor: skin.tokens.accent }"
                    aria-hidden="true"
                  />
                  {{ skin.label }}
                </button>
              </div>
            </div>
            <section
              class="share"
              aria-labelledby="share-heading"
            >
              <h2
                id="share-heading"
                class="share-heading"
              >
                今の設定を反映した Mix URL を作成
              </h2>
              <form
                class="share-form"
                @submit.prevent="shareMix"
              >
                <div class="share-field">
                  <label
                    class="share-label"
                    for="mix-title"
                  >Mix 名（任意）</label>
                  <input
                    id="mix-title"
                    v-model="mixTitleInput"
                    class="share-input"
                    name="title"
                    type="text"
                    :maxlength="titleMaxLength"
                    autocomplete="off"
                    enterkeyhint="done"
                    placeholder="リンクに表示されます"
                    :aria-describedby="shareStatusMessage ? 'share-status' : null"
                  >
                </div>
                <button
                  class="preset-button share-button"
                  type="submit"
                  :disabled="sharing"
                >
                  {{ sharing ? 'Creating...' : 'Create URL' }}
                </button>
              </form>
              <p
                v-if="shareStatusMessage"
                id="share-status"
                class="share-status"
                :class="{ 'share-status-error': Boolean(shareError || mixLoadError) }"
                aria-live="polite"
              >
                {{ shareStatusMessage }}
              </p>
              <div
                v-if="shareUrl"
                class="share-result"
              >
                <label
                  class="share-label"
                  for="share-url"
                >Mix URL</label>
                <div class="share-url-row">
                  <input
                    id="share-url"
                    class="share-input share-url-input"
                    name="mix-url"
                    type="url"
                    readonly
                    autocomplete="off"
                    :value="shareUrl"
                    @focus="$event.target.select()"
                  >
                  <button
                    class="preset-button share-button"
                    type="button"
                    @click="copyShareUrl"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </section>
            <div v-if="loadErrors.length" class="error-banner">
              <p>一部の音源を読み込めませんでした（{{ loadErrors.length }}件）</p>
              <p v-if="isStorageQuotaError" class="error-banner-detail">
                Firebase Storage が Spark プランでは利用できなくなっています。
                Blaze プランへアップグレード後に <code>npm run download-sounds</code> を実行し、再デプロイしてください。
              </p>
            </div>
            <div class="instruments">
              <div
                v-for="track in tracks"
                :key="track.id"
                class="instrument"
              >
                <Instrument
                  ref="instruments"
                  :track-id="track.id"
                  :label="track.label"
                  :url="track.path"
                  @loaded="loadEvent"
                  @load-error="loadErrorEvent"
                />
              </div>
            </div>
          </div>
        </transition>
        <div v-show="!loadedAll" class="loading-text">
          Loading...
        </div>
      </div>
      <div v-else class="first-view" @click="firstClick">
        <div class="first-view-title">
          Click
        </div>
        <p class="first-view-description">
          {{ firstViewDescription }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Instrument from '~/components/Instrument.vue'
import Canvas from '~/components/Canvas.vue'
import tracks from '~/data/tracks.json'
import presets from '~/data/presets.json'
import skins from '~/data/skins.json'
import {
  TITLE_MAX_LENGTH,
  DEFAULT_TITLE,
  snapshotMix,
  createMix,
  getMix
} from '~/lib/mix'
import {
  DEFAULT_SKIN_ID,
  SKIN_STORAGE_KEY,
  applySkin,
  getSkin
} from '~/lib/theme'

const PRESET_STORAGE_KEY = 'nuxt-eno:last-preset'
const PRESET_STORAGE_SCHEMA_KEY = 'nuxt-eno:last-preset-schema'
const PRESET_STORAGE_SCHEMA = 2
const LEGACY_PRESET_ID_ALIASES = {
  reset: 'quiet',
  'soft-ambient': 'dreamscape',
  dreamscape: 'soft-vibe',
  minimal: 'bright-air'
}

export default {
  components: {
    Instrument,
    Canvas
  },
  data () {
    return {
      tracks,
      presets,
      skins,
      selectedSkinId: DEFAULT_SKIN_ID,
      clicked: false,
      loadedAll: false,
      loadedCount: 0,
      loadErrors: [],
      wrapWidth: 0,
      wrapHeight: 0,
      mixTitleInput: '',
      titleMaxLength: TITLE_MAX_LENGTH,
      sharing: false,
      shareNotice: '',
      shareError: '',
      shareUrl: '',
      mixLoadError: '',
      sharedMix: null,
      mixLoadPromise: null
    }
  },
  computed: {
    mixId () {
      return this.$route.name === 'mix-id' ? this.$route.params.id : null
    },
    displayedTitle () {
      if (this.sharedMix && this.sharedMix.title) {
        return this.sharedMix.title
      }

      return 'Ambient Music Mixer'
    },
    firstViewDescription () {
      if (this.mixId) {
        return '共有されたミックスです。クリックして再生'
      }

      return 'クリックで音声を開始し、8つのレイヤーをミックスできます'
    },
    isStorageQuotaError () {
      return this.loadErrors.some((error) => {
        return error.code === 'storage/quota-exceeded' ||
          (error.message && error.message.includes('402'))
      })
    },
    particleHue () {
      const skin = getSkin(this.selectedSkinId)
      return skin.tokens.particleHue
    },
    shareStatusMessage () {
      return this.mixLoadError || this.shareError || this.shareNotice
    }
  },
  watch: {
    mixId: {
      immediate: true,
      handler () {
        this.mixLoadPromise = this.loadSharedMix()
      }
    }
  },
  mounted () {
    if (!this.mixId) {
      this.restoreLastSkin()
    }
    this.onResize()
    window.addEventListener('resize', this.onResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    async firstClick () {
      await this.$tone.start()
      this.clicked = true
    },
    loadEvent () {
      this.loadedCount += 1
      if (this.loadedCount >= this.tracks.length) {
        this.loadedAll = true
        this.onResize()
        this.restoreMixOrPreset()
      }
    },
    loadErrorEvent (error) {
      this.loadErrors.push(error)
      this.loadEvent()
    },
    applyPreset (preset) {
      const instrumentRefs = this.$refs.instruments || []

      instrumentRefs.forEach((instrument) => {
        instrument.applyPreset(preset.values)
      })

      if (process.client) {
        localStorage.setItem(PRESET_STORAGE_KEY, preset.id)
        localStorage.setItem(
          PRESET_STORAGE_SCHEMA_KEY,
          String(PRESET_STORAGE_SCHEMA)
        )
      }
    },
    resolveStoredPresetId (storedPresetId) {
      const schema = Number(localStorage.getItem(PRESET_STORAGE_SCHEMA_KEY) || 0)
      const legacyId = LEGACY_PRESET_ID_ALIASES[storedPresetId]

      if (
        schema < PRESET_STORAGE_SCHEMA &&
        legacyId &&
        this.presets.some(item => item.id === legacyId)
      ) {
        return legacyId
      }

      if (this.presets.some(item => item.id === storedPresetId)) {
        return storedPresetId
      }

      if (legacyId && this.presets.some(item => item.id === legacyId)) {
        return legacyId
      }

      return storedPresetId
    },
    restoreLastPreset () {
      if (!process.client) {
        return
      }

      const storedPresetId = localStorage.getItem(PRESET_STORAGE_KEY)
      if (!storedPresetId) {
        return
      }

      const lastPresetId = this.resolveStoredPresetId(storedPresetId)
      const preset = this.presets.find(item => item.id === lastPresetId)
      if (preset) {
        this.applyPreset(preset)
      }
    },
    async restoreMixOrPreset () {
      if (this.mixId && this.mixLoadPromise) {
        await this.mixLoadPromise
      }

      if (this.sharedMix) {
        this.applySharedMix(this.sharedMix)
        return
      }

      this.restoreLastPreset()
      this.restoreLastSkin()
    },
    selectSkin (skinId) {
      this.selectedSkinId = applySkin(skinId)

      if (process.client) {
        localStorage.setItem(SKIN_STORAGE_KEY, this.selectedSkinId)
      }
    },
    restoreLastSkin () {
      if (!process.client) {
        return
      }

      const lastSkinId = localStorage.getItem(SKIN_STORAGE_KEY)
      this.selectedSkinId = applySkin(lastSkinId || DEFAULT_SKIN_ID)
    },
    applySharedMix (mix) {
      const instrumentRefs = this.$refs.instruments || []

      instrumentRefs.forEach((instrument) => {
        const track = mix.tracks.find(item => item.id === instrument.trackId)
        if (track) {
          instrument.applyPreset(track)
        }
      })

      if (mix.skinId) {
        this.selectedSkinId = applySkin(mix.skinId)
      }
    },
    async loadSharedMix () {
      const id = this.mixId

      if (!id) {
        return
      }

      if (this.sharedMix && this.sharedMix.id === id) {
        return
      }

      this.mixLoadError = ''

      try {
        const mix = await getMix(id)

        if (!mix) {
          this.sharedMix = null
          this.shareUrl = ''
          this.mixLoadError = 'ミックスが見つかりませんでした。通常のミキサーとして使えます。'
          if (this.loadedAll) {
            this.restoreLastPreset()
          }
          return
        }

        this.sharedMix = mix
        this.shareUrl = this.mixShareUrl(id)
        this.mixTitleInput = mix.title === DEFAULT_TITLE ? '' : mix.title
        this.selectedSkinId = applySkin(mix.skinId)

        if (this.loadedAll) {
          this.applySharedMix(mix)
        }
      } catch (error) {
        this.sharedMix = null
        this.shareUrl = ''
        this.mixLoadError = 'ミックスを読み込めませんでした。通常のミキサーとして使えます。'
        if (this.loadedAll) {
          this.restoreLastPreset()
        }
      }
    },
    mixShareUrl (id) {
      return `${window.location.origin}/mix/${id}`
    },
    shareSuccessNotice (hadLink, copied) {
      if (hadLink) {
        return copied
          ? '新しいリンクができました。コピーしました。'
          : '新しいリンクができました。下の URL をコピーしてください。'
      }

      return copied
        ? 'リンクをコピーしました。この URL を開くと同じミックスが再生されます'
        : 'リンクを作成しました。下の URL をコピーしてください。'
    },
    async copyShareUrl () {
      if (!this.shareUrl) {
        return
      }

      this.shareError = ''

      try {
        await this.copyUrl(this.shareUrl)
        this.shareNotice = 'リンクをコピーしました。この URL を開くと同じミックスが再生されます'
      } catch (error) {
        this.shareNotice = ''
        this.shareError = 'コピーできませんでした。URL を選択してコピーしてください。'
      }
    },
    async copyUrl (url) {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url)
        return
      }

      const input = document.createElement('input')
      input.value = url
      input.setAttribute('readonly', '')
      input.style.position = 'absolute'
      input.style.left = '-9999px'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    },
    async shareMix () {
      this.shareError = ''
      this.shareNotice = ''
      this.sharing = true
      const hadLink = Boolean(this.shareUrl)

      try {
        const payload = snapshotMix(
          this.$refs.instruments,
          this.mixTitleInput,
          this.selectedSkinId
        )
        const id = await createMix(payload)
        const url = this.mixShareUrl(id)
        let copied = false

        this.shareUrl = url

        try {
          await this.copyUrl(url)
          copied = true
        } catch (error) {
          copied = false
        }

        this.shareNotice = this.shareSuccessNotice(hadLink, copied)
        this.sharedMix = {
          id,
          ...payload
        }
        this.mixLoadError = ''

        if (process.client && window.history && window.history.pushState) {
          window.history.pushState({}, '', `/mix/${id}`)
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        this.shareError = 'リンクを作成できませんでした。時間をおいてもう一度お試しください。'
      } finally {
        this.sharing = false
      }
    },
    onResize () {
      if (this.loadedAll && this.$refs.container) {
        this.wrapWidth = this.$refs.container.clientWidth
        this.wrapHeight = this.$refs.container.clientHeight
      } else if (this.$refs.wrap) {
        this.wrapWidth = this.$refs.wrap.clientWidth
        this.wrapHeight = this.$refs.wrap.clientHeight
      }
    }
  }
}
</script>

<style scoped>
.wrap {
  width: 100vw;
  height: 100vh;
}

.container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.title {
  font-size: 40px;
  margin: 16px 0 8px;
}

.subtitle {
  margin-bottom: 20px;
  color: var(--eno-muted);
  font-size: 15px;
  font-weight: normal;
  line-height: 1.5;
}

.presets {
  margin-bottom: 16px;
}

.presets-label {
  display: block;
  margin-bottom: 8px;
  color: var(--eno-muted);
  font-size: 13px;
  font-weight: normal;
}

.presets-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preset-button {
  padding: 8px 14px;
  border: 1px solid var(--eno-border);
  border-radius: 999px;
  background: var(--eno-surface);
  color: var(--eno-text);
  font-size: 13px;
  cursor: pointer;
}

.preset-button:hover {
  border-color: var(--eno-border-hover);
}

.preset-button:focus-visible,
.share-input:focus-visible,
.share-url-input:focus-visible,
.skin-button:focus-visible {
  outline: 2px solid var(--eno-focus);
  outline-offset: 2px;
}

.preset-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.share {
  margin-bottom: 20px;
}

.share-heading {
  margin: 0 0 16px;
  color: var(--eno-text);
  font-size: 15px;
  font-weight: normal;
}

.share-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 12px;
}

.share-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: min(100%, 220px);
  flex: 1 1 180px;
}

.skins {
  margin-bottom: 20px;
}

.skins-label {
  display: block;
  margin-bottom: 8px;
  color: var(--eno-muted);
  font-size: 13px;
  font-weight: normal;
}

.skins-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skin-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid var(--eno-border);
  border-radius: 999px;
  background: var(--eno-surface);
  color: var(--eno-text);
  font-size: 13px;
  cursor: pointer;
}

.skin-button:hover {
  border-color: var(--eno-border-hover);
}

.skin-button-active {
  border-color: var(--eno-accent);
}

.skin-swatch {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.share-label {
  color: var(--eno-muted);
  font-size: 13px;
  font-weight: normal;
}

.share-input {
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid var(--eno-border);
  border-radius: 999px;
  background: var(--eno-surface);
  color: var(--eno-text);
  font-size: 1rem;
  font-weight: normal;
}

.share-button {
  min-height: 40px;
}

.share-status {
  margin: 8px 0 0;
  color: var(--eno-muted);
  font-size: 14px;
  font-weight: normal;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.share-result {
  margin-top: 12px;
  padding: 12px 14px;
  border: 1px solid var(--eno-border);
  border-radius: 8px;
  background: var(--eno-surface);
}

.share-result .share-label {
  display: block;
  margin-bottom: 6px;
}

.share-url-row {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 10px;
}

.share-url-input {
  flex: 1 1 220px;
  min-width: 0;
  border-radius: 8px;
  font-size: 13px;
  cursor: text;
}

.share-status-error {
  color: var(--eno-error);
}

.error-banner {
  margin-bottom: 16px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--eno-error-bg);
  color: var(--eno-error);
  font-size: 14px;
  font-weight: normal;
}

.error-banner-detail {
  margin-top: 8px;
  line-height: 1.5;
}

.clicked-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.loaded-container {
  max-width: 896px;
  padding: 0 24px;
  margin: 0 auto 48px;
}

.instruments {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
}

.instrument {
  width: 100%;
}

.loading-text {
  font-size: 34px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.first-view {
  cursor: pointer;
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: fadeIn 4.8s ease-out;
}

.first-view-title {
  font-size: 34px;
  white-space: nowrap;
}

.first-view-description {
  margin-top: 16px;
  max-width: 320px;
  color: var(--eno-muted);
  font-size: 15px;
  font-weight: normal;
  line-height: 1.6;
}

.loaded-enter-active,
.loaded-leave-active {
  transition: transform 0.8s ease-out, opacity 2s ease-out;
}

.loaded-enter,
.loaded-leave-to {
  transform: translateY(80px);
  opacity: 0;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@media screen and (max-width: 767px) {
  .instruments {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 424px) {
  .title {
    font-size: 28px;
  }

  .loading-text,
  .first-view-title {
    font-size: 26px;
  }
}
</style>
