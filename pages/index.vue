<template>
  <div>
    <div @click="trigger()">test</div>
  </div>
</template>

<script>
import Tone from "tone";

export default {
  data: function() {
    return {
      synth: ""
    };
  },
  mounted: function() {
    this.synth = new Tone.Synth().toMaster();
  },
  methods: {
    trigger: function() {
      this.synth.triggerAttackRelease("C4", "8n");
    }
  }
};
</script>

<style>
</style>
