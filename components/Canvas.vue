<template>
  <canvas id="myCanvas" :width="canvasWidth" :height="canvasHeight" />
</template>

<script>
import { Shape, Stage, Ticker, Graphics } from '@createjs/easeljs'

export default {
  props: {
    canvasWidth: {
      type: [Number, String],
      default: 0
    },
    canvasHeight: {
      type: [Number, String],
      default: 0
    }
  },
  data () {
    return {
      stage: null,
      count: 0,
      particles: [],
      maxLife: 20
    }
  },
  watch: {
    canvasWidth () {
      this.resizeStage()
    },
    canvasHeight () {
      this.resizeStage()
    }
  },
  mounted () {
    this.stage = new Stage('myCanvas')
    Ticker.addEventListener('tick', this.handleTick)
    this.resizeStage()
  },
  beforeDestroy () {
    Ticker.removeEventListener('tick', this.handleTick)
    if (this.stage) {
      this.stage.removeAllChildren()
      this.stage.clear()
    }
    this.particles = []
  },
  methods: {
    resizeStage () {
      if (!this.stage) {
        return
      }

      const width = Number(this.canvasWidth) || window.innerWidth
      const height = Number(this.canvasHeight) || window.innerHeight

      this.stage.canvas.width = width
      this.stage.canvas.height = height
    },
    handleTick () {
      this.emitParticles()
      this.updateParticles()
      this.stage.update()
    },
    emitParticles () {
      this.count += 1
      const particle = new Shape()

      particle.graphics
        .beginFill(Graphics.getHSL(this.count, 50, 50, Math.random()))
        .drawCircle(0, 0, 10 * Math.random())
      particle.compositeOperation = 'lighter'
      particle.x = this.stage.canvas.width * Math.random()
      particle.y = this.stage.canvas.height * Math.random()
      particle.vx = particle.vy = Math.random()
      particle.life = this.maxLife

      this.stage.addChild(particle)
      this.particles.push(particle)
    },
    updateParticles () {
      for (let i = this.particles.length - 1; i >= 0; i -= 1) {
        const particle = this.particles[i]
        const scale = particle.life / this.maxLife

        particle.vy += 1
        particle.vx *= 0.5
        particle.vy *= 0.5
        particle.x += particle.vx
        particle.y += particle.vy
        particle.scaleX = particle.scaleY = scale
        particle.life -= 1

        if (particle.life <= 0) {
          this.stage.removeChild(particle)
          this.particles.splice(i, 1)
        }
      }
    }
  }
}
</script>

<style scoped>
#myCanvas {
  position: fixed;
  top: 0;
  left: 0;
}
</style>
