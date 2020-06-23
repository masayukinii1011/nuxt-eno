<template>
  <div @click="start()">test</div>
</template>

<script>
import Tone from "tone";

export default {
  data: function() {
    return {
      player: "",
      sound: ""
    };
  },
  mounted: function() {
    this.sound = require("~/assets/sound/test.wav");
    console.log(this.sound);
    this.player = new Tone.Player(this.sound).toMaster();
    this.player.autostart = true;
  },
  methods: {
    start: function() {
      this.player.start();
    }
  }
};
</script>

<style>
</style>
