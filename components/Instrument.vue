<template>
  <div class="instrument-container">
    <div class="instrument-header">
      <div class="instrument-title">
        {{ trackId }} · {{ label }}
      </div>
      <p v-if="description" class="instrument-description">
        {{ description }}
      </p>
    </div>
    <div class="input-container">
      <div
        v-for="effect in effects"
        :key="effect.id"
        class="input-wrapper"
      >
        <span class="input-label">
          {{ effect.label }}
          <button
            type="button"
            class="help-button"
            :aria-label="`${effect.label}の説明`"
            :title="effect.description"
          >
            ?
          </button>
        </span>
        <input
          :value="values[effect.id]"
          :min="ranges[effect.id].min"
          :max="ranges[effect.id].max"
          :step="ranges[effect.id].step"
          type="range"
          class="input"
          :aria-label="effect.label"
          @input="setAmount(effect.id, $event.target.value)"
        >
      </div>
    </div>
    <p v-if="loadError" class="load-error">
      音源の読み込みに失敗しました
    </p>
  </div>
</template>

<script>
import firebase from '~/plugins/firebase'
import effects from '~/data/effects.json'

const DEFAULT_VALUES = {
  volume: -64,
  filter: 10,
  vibrato: 0,
  tremolo: 0,
  panner: 0
}

const RANGES = {
  volume: { min: -64, max: 0, step: 0.64 },
  filter: { min: 0, max: 10, step: 0.1 },
  vibrato: { min: 0, max: 40, step: 0.4 },
  tremolo: { min: 0, max: 8, step: 0.08 },
  panner: { min: 0, max: 16, step: 0.16 }
}

export default {
  props: {
    trackId: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      effects,
      ranges: RANGES,
      values: { ...DEFAULT_VALUES },
      loaded: false,
      loadError: false,
      player: null,
      filter: null,
      vibrato: null,
      tremolo: null,
      panner: null
    }
  },
  created () {
    this.initAudioChain()
    this.initPlayer()
  },
  beforeDestroy () {
    if (this.player) {
      this.player.stop()
      this.player.dispose()
    }
    if (this.filter) {
      this.filter.dispose()
    }
    if (this.vibrato) {
      this.vibrato.dispose()
    }
    if (this.tremolo) {
      this.tremolo.dispose()
    }
    if (this.panner) {
      this.panner.dispose()
    }
  },
  methods: {
    initAudioChain () {
      const Tone = this.$tone

      this.filter = new Tone.AutoFilter({
        frequency: 0,
        octaves: this.values.filter
      }).start()

      this.vibrato = new Tone.Vibrato({
        frequency: this.values.vibrato
      })

      this.tremolo = new Tone.Tremolo({
        frequency: this.values.tremolo,
        spread: 0
      }).start()

      this.panner = new Tone.AutoPanner({
        frequency: this.values.panner,
        depth: 0.75
      }).start()
    },

    async initPlayer () {
      try {
        const downloadUrl = await firebase
          .storage()
          .ref()
          .child(this.url)
          .getDownloadURL()

        const Tone = this.$tone

        this.player = new Tone.Player({
          url: downloadUrl,
          loop: true,
          autostart: true
        })

        this.player.volume.value = this.values.volume
        this.player.chain(
          this.filter,
          this.vibrato,
          this.panner,
          this.tremolo,
          Tone.getDestination()
        )

        await Tone.loaded()

        if (!this.loaded) {
          this.loaded = true
          this.$emit('loaded')
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error.message)
        this.loadError = true
        this.$emit('load-error', { trackId: this.trackId, message: error.message })
      }
    },

    setAmount (key, value) {
      const numericValue = Number(value)
      this.values[key] = numericValue

      if (!this.player && key !== 'volume') {
        return
      }

      switch (key) {
        case 'volume':
          if (this.player) {
            this.player.volume.value = numericValue
          }
          break
        case 'filter':
          this.filter.octaves = numericValue
          break
        case 'vibrato':
          this.vibrato.frequency.value = numericValue
          break
        case 'tremolo':
          this.tremolo.frequency.value = numericValue
          break
        case 'panner':
          this.panner.frequency.value = numericValue
          break
        default:
          break
      }
    },

    applyPreset (presetValues) {
      Object.keys(DEFAULT_VALUES).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(presetValues, key)) {
          this.setAmount(key, presetValues[key])
        }
      })
    }
  }
}
</script>

<style scoped>
.instrument-container {
  width: 100%;
  min-height: 292px;
  padding: 20px;
  border-radius: 16px;
  box-shadow: -4px -4px 8px rgba(255, 255, 255, 0.05),
    4px 4px 16px rgba(0, 0, 0, 0.5);
}

.instrument-header {
  margin-bottom: 12px;
}

.instrument-title {
  color: #767676;
  font-size: 24px;
}

.instrument-description {
  margin-top: 6px;
  color: #888888;
  font-size: 13px;
  font-weight: normal;
  line-height: 1.4;
}

.input-container {
  display: flex;
  flex-flow: column;
  justify-content: space-between;
  gap: 8px;
}

.input-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.input-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #666666;
  font-size: 14px;
}

.help-button {
  width: 18px;
  height: 18px;
  padding: 0;
  border: 1px solid #555555;
  border-radius: 50%;
  background: transparent;
  color: #888888;
  font-size: 11px;
  line-height: 1;
  cursor: help;
}

.input {
  display: inline-block;
  width: 80%;
  cursor: pointer;
}

.load-error {
  margin-top: 12px;
  color: #ff8a8a;
  font-size: 13px;
  font-weight: normal;
}

@media screen and (max-width: 424px) {
  .input-wrapper {
    flex-flow: column;
    align-items: stretch;
  }

  .input {
    width: 100%;
  }
}
</style>
