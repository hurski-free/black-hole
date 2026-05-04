<script setup lang="ts">
import { ref, shallowRef, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Canvas2dGame } from '../game/Canvas2dGame'
import { baseEngine } from '../game/engine/BaseEngine'
import { canvas2dRender } from '../game/render/Canvas2dRender'

const props = withDefaults(
  defineProps<{
    mode: 'canvas2d' | 'webgl'
    autoStart?: boolean
  }>(),
  { autoStart: true },
)

const emit = defineEmits<{
  leave: []
}>()

const rootRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const gameRef = shallowRef<Canvas2dGame | null>(null)
let glRef: WebGLRenderingContext | WebGL2RenderingContext | null = null
let resizeObserver: ResizeObserver | null = null

function applyCanvasSize() {
  const root = rootRef.value
  const canvas = canvasRef.value
  if (!root || !canvas) return

  const w = root.clientWidth
  const h = root.clientHeight
  if (w < 1 || h < 1) return

  const dpr = window.devicePixelRatio || 1
  const bw = Math.max(1, Math.floor(w * dpr))
  const bh = Math.max(1, Math.floor(h * dpr))

  canvas.width = bw
  canvas.height = bh
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`

  if (props.mode === 'canvas2d') {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
  } else {
    const gl = glRef ?? (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ?? canvas.getContext('webgl')
    if (gl) {
      glRef = gl
      gl.viewport(0, 0, bw, bh)
      gl.clearColor(0.05, 0.06, 0.09, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
    }
  }
}

function initCanvas2dGame() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  gameRef.value?.stop()
  
  const game = new Canvas2dGame({
    ctx,
    engineFunction: baseEngine,
    renderFunction: canvas2dRender,
  })
  gameRef.value = game

  if (props.autoStart) {
    game.start()
  }
}

function teardownGame() {
  gameRef.value?.stop()
  gameRef.value = null
  glRef = null
}

onMounted(() => {
  nextTick(() => {
    applyCanvasSize()

    resizeObserver = new ResizeObserver(() => {
      applyCanvasSize()
      if (props.mode === 'webgl') {
        const gl = glRef
        if (gl) {
          gl.clearColor(0.05, 0.06, 0.09, 1)
          gl.clear(gl.COLOR_BUFFER_BIT)
        }
      }
    })

    if (rootRef.value) {
      resizeObserver.observe(rootRef.value)
    }

    if (props.mode === 'canvas2d') {
      initCanvas2dGame()
    } else {
      const canvas = canvasRef.value
      if (canvas) {
        glRef =
          (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ??
          canvas.getContext('webgl')
        applyCanvasSize()
      }
    }
  })
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  teardownGame()
})
</script>

<template>
  <div class="game-shell">
    <header class="game-toolbar">
      <button type="button" class="back-btn" @click="emit('leave')">Back</button>
      <span class="mode-label">
        {{ mode === 'canvas2d' ? 'Canvas 2D' : 'WebGL' }}
      </span>
    </header>
    <div ref="rootRef" class="canvas-wrap">
      <canvas ref="canvasRef" class="game-canvas" />
    </div>
  </div>
</template>

<style scoped>
.game-shell {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 0.75rem;
}

.game-toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.back-btn {
  font: inherit;
  cursor: pointer;
  padding: 0.35rem 0.75rem;
  border-radius: 0.35rem;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
}

.back-btn:hover {
  border-color: var(--accent-dim);
  color: var(--text-h);
}

.mode-label {
  font-size: 0.85rem;
  color: var(--muted);
}

.canvas-wrap {
  flex: 1;
  min-height: 280px;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background: var(--input-bg);
  overflow: hidden;
}

.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
