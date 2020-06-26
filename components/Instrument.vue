<template>
  <div>
    <div>test</div>
  </div>
</template>

<script>
import Tone from "tone";
import firebase from "~/plugins/firebase";
//音源ファイル小さく、ベースこみ
//キャッシュ、ローディングアニメ
export default {
  props: {
    url: ""
  },
  data: function() {
    return {
      player: "",
      filter: "",
      tremolo: "",
      delay: "",
      reverb: "",
    };
  },
  mounted: function() {
    /*
    firebase
      .storage()
      .ref()
      .child(this.url)
      .getDownloadURL()
      .then(url => {
        this.player = new Tone.Player({
          "url" : url,
        }).chain(this.reverb);
      })
      .catch(error => {
        console.error(error.message);
      });
      */

    this.fliter = new Tone.AutoFilter({
      frequency: 0
    }).start();
    this.fliter.wet.value = 100;

    this.tremolo = new Tone.Tremolo({
      frequency: 1,
      depth: 1,
      spread: 0
    }).start();
    this.tremolo.wet.value = 0;

    this.delay = new Tone.FeedbackDelay().toMaster()
    this.delay.wet.value = 0;

    this.reverb = new Tone.Freeverb().toMaster()
    this.reverb.wet.value = 0;

    this.player = new Tone.Player({
      url: this.url,
      loop: true,
      autostart: true,
    }).chain(this.fliter, this.tremolo, this.delay, this.reverb);

    this.player.volume.value = -16;
  },
  methods: {

  }
};
</script>

<style>
</style>
