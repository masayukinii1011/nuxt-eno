<template>
  <div class="instrument-container">
    <div class="instrument-header">
      <div class="instrument-title">
        {{ trackId }} · {{ label }}
      </div>
    </div>
    <div class="input-container">
      <div
        v-for="effect in effectLabels"
        :key="effect.id"
        class="input-wrapper"
      >
        <span class="input-label">{{ effect.label }}</span>
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

const EFFECT_LABELS = [
  { id: 'volume', label: 'Volume' },
  { id: 'filter', label: 'Filter' },
  { id: 'vibrato', label: 'Vibrato' },
  { id: 'tremolo', label: 'Tremolo' },
  { id: 'panner', label: 'Panner' }
]

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
    url: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      effectLabels: EFFECT_LABELS,
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
    ;[this.player, this.filter, this.vibrato, this.tremolo, this.panner].forEach((node) => {
      if (!node) {
        return
      }

      try {
        if (typeof node.stop === 'function') {
          node.stop()
        }
        if (typeof node.dispose === 'function') {
          node.dispose()
        }
      } catch (error) {
        // Tone nodes may already be disposed when the page remounts.
      }
    })
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
        const audioUrl = this.url.startsWith('/')
          ? this.url
          : await firebase
            .storage()
            .ref()
            .child(this.url)
            .getDownloadURL()

        const Tone = this.$tone

        this.player = new Tone.Player({
          url: audioUrl,
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
        this.$emit('load-error', {
          trackId: this.trackId,
          message: error.message,
          code: error.code || ''
        })
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
    },

    getValues () {
      return {
        id: this.trackId,
        volume: this.values.volume,
        filter: this.values.filter,
        vibrato: this.values.vibrato,
        tremolo: this.values.tremolo,
        panner: this.values.panner
      }
    }
  }
}
</script>

<style scoped>
.instrument-container {
  width: 100%;
  padding: 20px;
  border-radius: 16px;
  box-shadow: -4px -4px 8px rgba(255, 255, 255, 0.05),
    4px 4px 16px rgba(0, 0, 0, 0.5);
}

.instrument-header {
  margin-bottom: 12px;
}

.instrument-title {
  color: var(--eno-heading);
  font-size: 24px;
}

.input-container {
  display: flex;
  flex-flow: column;
  gap: 10px;
}

.input-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-label {
  display: inline-block;
  color: var(--eno-label);
  font-size: 14px;
}

.input {
  display: inline-block;
  width: 80%;
  cursor: pointer;
  accent-color: var(--eno-accent);
}

.load-error {
  margin-top: 12px;
  color: var(--eno-error);
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
