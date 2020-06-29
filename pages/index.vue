<template>
  <div>
    <div v-if="clicked" class="instruments">
      <div>Mix Your Own Vibes.</div>
      <Instrument :title="'01'" :url="'sounds/c/nuxt-eno01.mp3'" />
      <Instrument :title="'02'" :url="'sounds/c/nuxt-eno02.mp3'" />
      <Instrument :title="'03'" :url="'sounds/c/nuxt-eno03.mp3'" />
      <Instrument :title="'04'" :url="'sounds/c/nuxt-eno04.mp3'" />
      <Instrument :title="'05'" :url="'sounds/c/nuxt-eno05.mp3'" />
      <Instrument :title="'06'" :url="'sounds/c/nuxt-eno06.mp3'" />
      <Instrument :title="'07'" :url="'sounds/c/nuxt-eno07.mp3'" />
      <Instrument :title="'08'" :url="'sounds/c/nuxt-eno08.mp3'" />
    </div>
    <div v-else @click="firstClick" class="first-view">Please Click The Window.</div>
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
      this.clicked = true;
    }
  }
};
</script>

<style>
.first-view {
  width: 100vw;
  height: 100vh;
  cursor: pointer;
}
</style>
