<template>
  <div ref="wrap" class="wrap">
    <Canvas :canvas-width="wrapWidth" :canvas-height="wrapHeight" />
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
            <form
              class="share-form"
              @submit.prevent="shareMix"
            >
              <div class="share-field">
                <label
                  class="share-label"
                  for="mix-title"
                >タイトル（任意）</label>
                <input
                  id="mix-title"
                  v-model="mixTitleInput"
                  class="share-input"
                  name="title"
                  type="text"
                  :maxlength="titleMaxLength"
                  autocomplete="off"
                  enterkeyhint="done"
                  aria-describedby="share-status"
                >
              </div>
              <button
                class="preset-button share-button"
                type="submit"
                :disabled="sharing"
              >
                {{ sharing ? 'Sharing...' : 'Share' }}
              </button>
            </form>
            <p
              id="share-status"
              class="share-status"
              :class="{ 'share-status-error': Boolean(shareError || mixLoadError) }"
              aria-live="polite"
            >
              {{ mixLoadError || shareError || shareNotice }}
            </p>
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
import {
  TITLE_MAX_LENGTH,
  DEFAULT_TITLE,
  snapshotMix,
  createMix,
  getMix
} from '~/lib/mix'

const PRESET_STORAGE_KEY = 'nuxt-eno:last-preset'

export default {
  components: {
    Instrument,
    Canvas
  },
  data () {
    return {
      tracks,
      presets,
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

      return 'Mix Your Own Vibes'
    },
    firstViewDescription () {
      if (this.mixId) {
        return 'クリックで共有されたミックスを再生します'
      }

      return 'クリックで音声を開始し、8つのレイヤーをミックスできます'
    },
    isStorageQuotaError () {
      return this.loadErrors.some((error) => {
        return error.code === 'storage/quota-exceeded' ||
          (error.message && error.message.includes('402'))
      })
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
      }
    },
    restoreLastPreset () {
      if (!process.client) {
        return
      }

      const lastPresetId = localStorage.getItem(PRESET_STORAGE_KEY)
      if (!lastPresetId) {
        return
      }

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
    },
    applySharedMix (mix) {
      const instrumentRefs = this.$refs.instruments || []

      instrumentRefs.forEach((instrument) => {
        const track = mix.tracks.find(item => item.id === instrument.trackId)
        if (track) {
          instrument.applyPreset(track)
        }
      })
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
          this.mixLoadError = 'ミックスが見つかりませんでした。通常のミキサーとして使えます。'
          if (this.loadedAll) {
            this.restoreLastPreset()
          }
          return
        }

        this.sharedMix = mix
        this.mixTitleInput = mix.title === DEFAULT_TITLE ? '' : mix.title

        if (this.loadedAll) {
          this.applySharedMix(mix)
        }
      } catch (error) {
        this.sharedMix = null
        this.mixLoadError = 'ミックスを読み込めませんでした。通常のミキサーとして使えます。'
        if (this.loadedAll) {
          this.restoreLastPreset()
        }
      }
    },
    mixShareUrl (id) {
      return `${window.location.origin}/mix/${id}`
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

      try {
        const payload = snapshotMix(this.$refs.instruments, this.mixTitleInput)
        const id = await createMix(payload)
        const url = this.mixShareUrl(id)

        try {
          await this.copyUrl(url)
          this.shareNotice = `共有URLをコピーしました: ${url}`
        } catch (error) {
          this.shareNotice = `共有URL: ${url}`
        }

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
        this.shareError = '共有に失敗しました。時間をおいてもう一度お試しください。'
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
  color: #888888;
  font-size: 15px;
  font-weight: normal;
  line-height: 1.5;
}

.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.preset-button {
  padding: 8px 14px;
  border: 1px solid #444444;
  border-radius: 999px;
  background: rgba(19, 20, 25, 0.8);
  color: #c7c7c7;
  font-size: 13px;
  cursor: pointer;
}

.preset-button:hover {
  border-color: #666666;
}

.preset-button:focus-visible,
.share-input:focus-visible {
  outline: 2px solid #c7c7c7;
  outline-offset: 2px;
}

.preset-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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

.share-label {
  color: #888888;
  font-size: 13px;
  font-weight: normal;
}

.share-input {
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid #444444;
  border-radius: 999px;
  background: rgba(19, 20, 25, 0.8);
  color: #c7c7c7;
  font-size: 1rem;
  font-weight: normal;
}

.share-button {
  min-height: 40px;
}

.share-status {
  min-height: 1.5em;
  margin-bottom: 16px;
  color: #888888;
  font-size: 14px;
  font-weight: normal;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.share-status-error {
  color: #ff8a8a;
}

.error-banner {
  margin-bottom: 16px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(255, 138, 138, 0.12);
  color: #ff8a8a;
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
  grid-template-rows: repeat(4, 1fr);
  grid-template-columns: 1fr 1fr;
  grid-gap: 32px;
}

.instrument {
  display: flex;
  justify-content: center;
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
  color: #888888;
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
