<template>
  <div>
    <div @click="start()">test</div>
    <div>
      <input @input="setVolumeAmount($event.target.value)" :value="volumeAmount" :min="volumeAmount" max="0" type="range">
    </div>
    <div>
      <input @input="setFilterAmount($event.target.value)" :value="filterAmount" :min="filterAmount" max="100" type="range">
    </div>
    <div>
      <input @input="setTremoloAmount($event.target.value)" :value="tremoloAmount" :min="tremoloAmount" max="100" type="range">
    </div>
    <div>
      <input @input="setDelayAmount($event.target.value)" :value="delayAmount" :min="delayAmount" max="100" type="range">
    </div>
    <div>
      <input @input="setReverbAmount($event.target.value)" :value="reverbAmount" :min="reverbAmount" max="100" type="range">
    </div>
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
      volumeAmount: -100,
      filterAmount: 0,
      tremoloAmount: 0,
      delayAmount: 0,
      reverbAmount: 0,
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

    this.filter = new Tone.AutoFilter({
      frequency: 0
    }).start();
    this.filter.wet.value = this.filterAmount;

    this.tremolo = new Tone.Tremolo({
      frequency: 1,
      depth: 1,
      spread: 0
    }).start();
    this.tremolo.wet.value = this.tremoloAmount;

    this.delay = new Tone.FeedbackDelay()
    this.delay.wet.value = this.delayAmount;

    this.reverb = new Tone.Freeverb().toMaster()
    this.reverb.wet.value = this.reverbAmount;

    this.player = new Tone.Player({
      url: this.url,
      loop: true,
      //autostart: true,
    }).chain(this.filter, this.tremolo, this.delay, this.reverb);

    this.player.volume.value = this.volumeAmount;
  },
  methods: {
    start: function(){
      this.player.start();
    },
    setVolumeAmount: function(value){
      this.player.volume.value = value;
    },
    setFilterAmount: function(value){
      this.filter.wet.value = value;
    },
    setTremoloAmount: function(value){
      this.tremolo.wet.value = value;
    },
    setDelayAmount: function(value){
      this.delay.wet.value = value;
    },
    setReverbAmount: function(value){
      this.reverb.wet.value = value;
    },
  }
};
</script>

<style>
</style>