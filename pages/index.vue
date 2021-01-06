<template>
  <div class="wrap" ref="wrap">
  <Canvas :canvasWidth="wrapWidth" :canvasHeight="wrapHeight" />
  <div class="container" ref="container">
    <div v-if="clicked" class="clicked-container">
      <transition name="loaded">
        <div v-show="loadedAll" class="loaded-container">
          <div class="title">
            Mix Your Own Vibes
          </div>
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
      </transition>
      <div v-show="!loadedAll" class="loading-text">Loading...</div>
    </div>
    <div v-else @click="firstClick" class="first-view">
      <div>Click</div>
    </div>
  </div>
  </div>
</template>

<script>
import Instrument from "~/components/Instrument.vue";
import Canvas from "~/components/Canvas.vue";

export default {
  components: {
    Instrument,
    Canvas
  },
  data: function() {
    return {
      clicked: false,
      loadedAll: false,
      loadedCount: 0,
      wrapWidth: '',
      wrapHeight: ''
    };
  },
  mounted() {
    this.onResize();
    window.addEventListener('resize', this.onResize)
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
    },
    onResize: function() {
      if(this.loadedAll) {
        this.wrapWidth = this.$refs.container.clientWidth
        this.wrapHeight = this.$refs.container.clientHeight
      } else {
        this.wrapWidth = this.$refs.wrap.clientWidth
        this.wrapHeight = this.$refs.wrap.clientHeight
      }
    }
  }
};
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: 4s ease-out;
}

.v-enter,
.v-leave-to {
  opacity: 0;
}

.loaded-enter-active,
.loaded-leave-active {
  transition: transform 0.8s ease-out, opacity 2s ease-out;
}

.loaded-enter,
.loaded-leave-to {
  transform: translateY(80px);
  opacity: 0;
}

.wrap {
  width: 100vw;
  height: 100vh;
}

.container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.title {
  font-size: 40px;
  margin: 16px 0 24px;
}

.clicked-container {
  width: 100%;
  height: 100%;
}

.loaded-container {
  max-width: 896px;
  padding: 0px 24px;
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
  font-size: 34px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
}

.first-view {
  cursor: pointer;
  font-size: 34px;
  white-space: nowrap;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  animation: fadeIn 4.8s ease-out;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@media screen and (max-width: 767px) {
  .instruments {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 424px) {
  .title {
    font-size: 28px;
  }

  .loading-text {
    font-size: 26px;
  }

  .first-view {
    font-size: 26px;
  }
}
</style>
