<template>
  <div>
    <Instrument :url="'sounds/nuxt-eno01bass.mp3'" />
    <Instrument :url="'sounds/nuxt-eno02.mp3'" />
    <Instrument :url="'sounds/nuxt-eno03.mp3'" />
    <Instrument :url="'sounds/nuxt-eno04tone.mp3'" />
    <Instrument :url="'sounds/nuxt-eno05.mp3'" />
    <Instrument :url="'sounds/nuxt-eno06.mp3'" />
    <Instrument :url="'sounds/nuxt-eno07.mp3'" />
    <Instrument :url="'sounds/nuxt-eno08.mp3'" />
    <Instrument :url="'sounds/nuxt-eno09.mp3'" />
    <Instrument :url="'sounds/nuxt-eno10.mp3'" />
    <Instrument :url="'sounds/nuxt-eno11note.mp3'" />
    <Instrument :url="'sounds/nuxt-eno12.mp3'" />
  </div>
</template>

<script>
import Instrument from "~/components/Instrument.vue";

export default {
  components: {
    Instrument
  }
};
</script>

<style>
</style>
