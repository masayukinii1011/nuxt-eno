<template>
  <div @click="start()">test</div>
</template>

<script>
import Tone from "tone";
import firebase from "~/plugins/firebase";

export default {
  data: function() {
    return {
      player: "",
      sound: ""
    };
  },
  mounted: function() {
    const sound = firebase
      .storage()
      .ref()
      .child("nuxt-eno02.mp3")
      .getDownloadURL()
      .then(url => {
        this.sound = url;
        this.player = new Tone.Player(this.sound).toMaster();
        this.player.autostart = true;
      })
      .catch(error => {
        console.error(error);
      });
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
