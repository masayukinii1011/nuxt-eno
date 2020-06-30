<template>
  <div class="container">
    <div v-if="clicked" class="clicked-container">
      <div v-show="loadedAll" class="loaded-container">
        <div class="title">Mix Your Own Vibes.</div>
        <div class="instruments">
          <div class="instrument">
            <Instrument :title="'01'" :url="'sounds/c/nuxt-eno01.mp3'" @loaded="loadEvent()" />
          </div>
          <div class="instrument">
            <Instrument :title="'02'" :url="'sounds/c/nuxt-eno02.mp3'" @loaded="loadEvent()" />
          </div>
          <div class="instrument">
            <Instrument :title="'03'" :url="'sounds/c/nuxt-eno03.mp3'" @loaded="loadEvent()" />
          </div>
          <div class="instrument">
            <Instrument :title="'04'" :url="'sounds/c/nuxt-eno04.mp3'" @loaded="loadEvent()" />
          </div>
          <div class="instrument">
            <Instrument :title="'05'" :url="'sounds/c/nuxt-eno05.mp3'" @loaded="loadEvent()" />
          </div>
          <div class="instrument">
            <Instrument :title="'06'" :url="'sounds/c/nuxt-eno06.mp3'" @loaded="loadEvent()" />
          </div>
          <div class="instrument">
            <Instrument :title="'07'" :url="'sounds/c/nuxt-eno07.mp3'" @loaded="loadEvent()" />
          </div>
          <div class="instrument">
            <Instrument :title="'08'" :url="'sounds/c/nuxt-eno08.mp3'" @loaded="loadEvent()" />
          </div>
        </div>
      </div>
      <div v-show="!loadedAll" class="loading-text">Loading...</div>
    </div>
    <div v-else @click="firstClick" class="first-view">
      <div class="first-view-text">Please Click The Window.</div>
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
      clicked: false,
      loadedAll: false,
      loadedCount: 0
    };
  },
  methods: {
    firstClick: function() {
      this.clicked = true;
    },
    loadEvent: function() {
      this.loadedCount++;
      if (this.loadedCount >= 8) {
        this.loadedAll = true;
      }
    }
  }
};
</script>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
}

.title {
  font-size: 54px;
  margin: 16px 0 24px;
}

.clicked-container {
  width: 100%;
  height: 100%;
}

.loaded-container {
  width: 896px;
  margin: 0 auto 48px;
}

.instruments {
  display: grid;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  grid-template-columns: 1fr 1fr;
  grid-gap: 32px;
}

.instrument {
  display: flex;
  justify-content: center;
}

.loading-text {
  font-size: 24px;
  margin: 8px;
}

.first-view {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.first-view-text {
  font-size: 24px;
  margin: 8px;
}
</style>
