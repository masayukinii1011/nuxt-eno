<template>
  <div>
  <canvas id="myCanvas" width="2000" height="1400"></canvas>
  <div class="container">
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
      <div class="first-view-text">Please Click The Window</div>
    </div>
  </div>
  </div>
</template>

<script>
import Instrument from "~/components/Instrument.vue";
import { Shape, Stage, Ticker, Graphics} from '@createjs/easeljs';
import { Tween } from '@createjs/tweenjs';

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
  mounted() {
    const stage = new Stage('myCanvas');
    const particles = [];

    //Ticker.timingMode = Ticker.RAF;
    //Ticker.addEventListener("tick", handleTick);
    setInterval(handleTick, 100);
    function handleTick(event) {
      emitParticles();
      updateParticles();
      stage.update();
    }

    let count = 0;
    const MAX_LIFE = 10;

    function emitParticles() {
      for (var i = 0; i < 5; i++) {
        count += 1;
        const particle = new Shape();
        particle.graphics
          .beginFill(Graphics.getHSL(count, 50, 50, Math.random()))
          .drawCircle(0, 0, 10 * Math.random());

        stage.addChild(particle);
        particle.compositeOperation = "lighter";

          // パーティクルの発生場所
          particle.x = stage.canvas.width * Math.random();
          particle.y = stage.canvas.height * Math.random();

          // 動的にプロパティーを追加します。
          // 速度
          particle.vx = 2 * Math.random();
          particle.vy = 2 * Math.random();
          // 寿命
          particle.life = MAX_LIFE;

          particles.push(particle);
        }
      }

      // パーティクルを更新します
      function updateParticles() {
        // パーティクルの計算を行う
        for (var i = 0; i < particles.length; i++) {
          // オブジェクトの作成
          var particle = particles[i];

          // 重力
          particle.vy += 1;

          // 摩擦
          particle.vx *= 0.96;
          particle.vy *= 0.96;

          // 速度を位置に適用
          particle.x += particle.vx;
          particle.y += particle.vy;

          // パーティクルのサイズをライフ依存にする
          var scale = particle.life / MAX_LIFE;
          particle.scaleX = particle.scaleY = scale;

          // 寿命を減らす
          particle.life -= 1;

          if (particle.life <= 0) {
            stage.removeChild(particle);
            particles.splice(i, 1);
          }
        }
      }
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

.container {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
}

#myCanvas {
  width: 100%;
  height: 100%;
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
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.first-view-text {
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

  .first-view-text {
    font-size: 26px;
  }
}
</style>
