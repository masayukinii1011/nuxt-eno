<template>
  <canvas id="myCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
</template>

<script>
import { Shape, Stage, Ticker, Graphics} from '@createjs/easeljs';

export default {
    props: ['canvasWidth', 'canvasHeight'],
    data: function() {
    return {
      stage: '',
      count: 0,
      particles: [],
      maxLife: 20,
    };
  },
  mounted() {
    this.stage = new Stage('myCanvas');
    Ticker.addEventListener("tick", this.handleTick);
  },
  methods: {
    handleTick: function() {
      this.emitParticles();
      this.updateParticles();
      this.stage.update();
    },
    emitParticles: function() {
      this.count ++;
      const particle = new Shape();

      particle.graphics
        .beginFill(Graphics.getHSL(this.count, 50, 50, Math.random()))
        .drawCircle(0, 0, 10 * Math.random());
      particle.compositeOperation = "lighter";
      particle.x = this.stage.canvas.width * Math.random();
      particle.y = this.stage.canvas.height * Math.random();
      particle.vx = particle.vy = Math.random();
      particle.life = this.maxLife;

      this.stage.addChild(particle);
      this.particles.push(particle);
    },
    updateParticles: function() {
      for (let i = 0; i < this.particles.length; i++) {
        const particle = this.particles[i];
        const scale = particle.life / this.maxLife;

        particle.vy += 1;
        particle.vx *= 0.5;
        particle.vy *= 0.5;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.scaleX = particle.scaleY = scale;
        particle.life -= 1;

        if (particle.life <= 0) {
          this.stage.removeChild(particle);
          this.particles.splice(i, 1);
        }
      }
    }
  }
};
</script>

<style scoped>
#myCanvas {
  position:fixed;
  top:0;
  left:0;
}
</style>