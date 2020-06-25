<template>
  <div>
    <div @click="toggleSound()">test</div>
  </div>
</template>

<script>
import Tone from "tone";
import firebase from "~/plugins/firebase";

export default {
  props: {
    url: ""
  },
  data: function() {
    return {
      instrument: {
        player: "",
        isPlaying: false
      }
    };
  },
  mounted: function() {
    firebase
      .storage()
      .ref()
      .child(this.url)
      .getDownloadURL()
      .then(file => {
        this.instrument.player = new Tone.Player(file).toMaster();
      })
      .catch(error => {
        console.error(error);
      });
  },
  methods: {
    toggleSound: function() {
      if (this.instrument.isPlaying) {
        this.instrument.player.stop();
      } else {
        this.instrument.player.start();
      }
      this.instrument.isPlaying = !this.instrument.isPlaying;
    }
  }
};
</script>

<style>
</style>
