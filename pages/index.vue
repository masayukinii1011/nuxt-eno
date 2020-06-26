<template>
  <div>
    <div v-if="clicked" class="instruments">
      <Instrument :url="'sounds/nuxt-eno01bass.mp3'" />
      <Instrument :url="'sounds/nuxt-eno04note.mp3'" />
      <Instrument :url="'sounds/nuxt-eno05.mp3'" />
      <Instrument :url="'sounds/nuxt-eno06.mp3'" />
      <Instrument :url="'sounds/nuxt-eno08.mp3'" />
      <Instrument :url="'sounds/nuxt-eno09.mp3'" />
      <Instrument :url="'sounds/nuxt-eno10.mp3'" />
      <Instrument :url="'sounds/nuxt-eno11note.mp3'" />
    </div>
    <div v-else @click="firstClick" class="first-view">
      Please Click The Window Anywhere.
    </div>
  </div>
</template>

<script>
import Instrument from "~/components/Instrument.vue";

export default {
  components: {
    Instrument
  },
  data: function() {
    return {
      clicked: false
    };
  },
  methods: {
    firstClick: function() {
        this.clicked = true
    }
  }
};
</script>

<style>
.first-view {
  width: 100vw;
  height: 100vh;
}
</style>
