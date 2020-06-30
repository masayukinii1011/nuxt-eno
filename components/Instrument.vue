<template>
  <div class="instrument-container">
    <div class="instrument-title">{{title}}</div>
    <div class="input-container">
      <div>
        <span class="input-label">Volume</span>
        <input
          @input="setVolumeAmount($event.target.value)"
          :value="volumeAmount"
          :min="volumeAmount"
          max="0"
          type="range"
          class="input"
          step="0.64"
        />
      </div>
      <div>
        <span class="input-label">Filter</span>
        <input
          @input="setFilterAmount($event.target.value)"
          :value="filterAmount"
          min="0"
          :max="filterAmount"
          step="0.1"
          type="range"
          class="input"
        />
      </div>
      <div>
        <span class="input-label">Vibrato</span>
        <input
          @input="setVibratoAmount($event.target.value)"
          :value="vibratoAmount"
          :min="vibratoAmount"
          max="40"
          step="0.4"
          type="range"
          class="input"
        />
      </div>
      <div>
        <span class="input-label">Tremolo</span>
        <input
          @input="setTremoloAmount($event.target.value)"
          :value="tremoloAmount"
          :min="tremoloAmount"
          max="8"
          step="0.08"
          type="range"
          class="input"
        />
      </div>
      <div>
        <span class="input-label">Panner</span>
        <input
          @input="setPannerAmount($event.target.value)"
          :value="pannerAmount"
          :min="pannerAmount"
          max="16"
          step="0.16"
          type="range"
          class="input"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Tone from "tone";
import firebase from "~/plugins/firebase";

export default {
  props: {
    title: "",
    url: ""
  },
  data: function() {
    return {
      buffer: "",
      loaded: false,
      player: "",
      filter: "",
      vibrato: "",
      tremolo: "",
      panner: "",
      volumeAmount: -64,
      filterAmount: 10,
      vibratoAmount: 0,
      tremoloAmount: 0,
      pannerAmount: 0
    };
  },
  watch: {
    //バッファへの読み込み監視
    buffer: function() {
      if (!this.loaded) {
        this.loaded = true;
        this.$emit("loaded");
      }
    }
  },
  created: function() {
    this.initFilter();
    this.initVibrato();
    this.initTremolo();
    this.initPanner();
    this.initPlayer();
  },
  methods: {
    //フィルター初期化
    initFilter: function() {
      this.filter = new Tone.AutoFilter({
        frequency: 0,
        octaves: this.filterAmount
      }).start();
    },

    //ビブラート初期化
    initVibrato: function() {
      this.vibrato = new Tone.Vibrato({
        frequency: this.vibratoAmount
      });
    },

    //トレモロ初期化
    initTremolo: function() {
      this.tremolo = new Tone.Tremolo({
        frequency: this.tremoloAmount,
        spread: 0
      })
        .start()
        .toMaster();
    },

    //パナー初期化
    initPanner: function() {
      this.panner = new Tone.AutoPanner({
        frequency: this.pannerAmount,
        depth: 0.75
      }).start();
    },

    //プレーヤー初期化
    initPlayer: async function() {
      /*
      this.player = new Tone.Player({
        url: this.url,
        loop: true,
        autostart: true
      }).chain(this.filter, this.vibrato, this.panner, this.tremolo);
*/
      await firebase
        .storage()
        .ref()
        .child(this.url)
        .getDownloadURL()
        .then(url => {
          this.player = new Tone.Player({
            url: url,
            loop: true,
            autostart: true
          }).chain(this.filter, this.vibrato, this.panner, this.tremolo);
        })
        .catch(error => {
          console.error(error.message);
        });

      this.player.volume.value = this.volumeAmount;
      this.buffer = this.player.buffer;
    },

    //ボリューム量設定
    setVolumeAmount: function(value) {
      this.player.volume.value = value;
    },

    //フィルター量設定
    setFilterAmount: function(value) {
      this.filter.octaves = value;
    },

    //ビブラート量設定
    setVibratoAmount: function(value) {
      this.vibrato.frequency.value = value;
    },

    //トレモロ量設定
    setTremoloAmount: function(value) {
      this.tremolo.frequency.value = value;
    },

    //パナー量設定
    setPannerAmount: function(value) {
      this.panner.frequency.value = value;
    }
  }
};
</script>

<style scoped>
.instrument-container {
  width: 100%;
  height: 268px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(243, 247, 250, 0.05);
  box-shadow: 6px 6px 12px #b8b9be, -6px -6px 12px #fff;
}

.instrument-title {
  margin-bottom: 12px;
  font-size: 24px;
}

.input-container {
  display: flex;
  flex-flow: column;
  justify-content: space-between;
  height: 80%;
}

.input-label {
  width: 16%;
  font-size: 14px;
  display: inline-block;
}

.input {
  width: 80%;
  cursor: pointer;
}
</style>