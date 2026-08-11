<template>
  <div ref="wrap" class="wrap">
    <Canvas :canvas-width="wrapWidth" :canvas-height="wrapHeight" />
    <div ref="container" class="container">
      <div v-if="clicked" class="clicked-container">
        <transition name="loaded">
          <div v-show="loadedAll" class="loaded-container">
            <div class="title">
              Mix Your Own Vibes
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
            <div v-if="loadErrors.length" class="error-banner">
              一部の音源を読み込めませんでした（{{ loadErrors.length }}件）
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
                  :description="track.description"
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
          クリックで音声を開始し、8つのレイヤーをミックスできます
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
      wrapHeight: 0
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
        this.restoreLastPreset()
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

.error-banner {
  margin-bottom: 16px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(255, 138, 138, 0.12);
  color: #ff8a8a;
  font-size: 14px;
  font-weight: normal;
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
