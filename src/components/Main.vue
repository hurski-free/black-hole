<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Game from './Game.vue'

const canvas2dSupported = ref(false)
const webglSupported = ref(false)
const activeMode = ref<'canvas2d' | 'webgl' | null>(null)

onMounted(() => {
  const probe = document.createElement('canvas')
  canvas2dSupported.value = !!probe.getContext('2d')

  const webGlProbe = document.createElement('canvas')
  webglSupported.value = !!webGlProbe.getContext('webgl2')
})

function startCanvas2d() {
  activeMode.value = 'canvas2d'
}

function startWebgl() {
  activeMode.value = 'webgl'
}

function leaveGame() {
  activeMode.value = null
}
</script>

<template>
  <main class="main">
    <template v-if="!activeMode">
      <div class="main-content">
        <h1 class="title">Black hole</h1>
        <p class="lead">Select game mode.</p>
  
        <div class="stack">
          <section class="card">
            <h2 class="card-title">Canvas 2D</h2>
            <p class="card-body">
              Supported:
              <span :class="canvas2dSupported ? 'ok' : 'bad'">
                {{ canvas2dSupported ? 'yes' : 'no' }}
              </span>
            </p>
            <button
              type="button"
              class="primary"
              :disabled="!canvas2dSupported"
              @click="startCanvas2d"
            >
              Start
            </button>
          </section>
  
          <section class="card">
            <h2 class="card-title">WebGL</h2>
            <p class="card-body">
              Supported:
              <span :class="webglSupported ? 'ok' : 'bad'">
                {{ webglSupported ? 'yes' : 'no' }}
              </span>
            </p>
            <button
              type="button"
              class="primary"
              :disabled="!webglSupported"
              @click="startWebgl"
            >
              Start
            </button>
          </section>
        </div>
      </div>
    </template>

    <Game
      v-else
      :mode="activeMode"
      :auto-start="true"
      @leave="leaveGame"
    />
  </main>
</template>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  margin: 0 auto;
  gap: 1.25rem;
}

.main-content {
  max-width: 40rem;
  width: 100%;
  margin: 0 auto;
}

.title {
  margin: 0;
  font-size: 1.65rem;
}

.lead {
  margin: 0;
  color: var(--muted);
  font-size: 0.95rem;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  padding: 1.1rem 1.25rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.card-title {
  margin: 0;
  font-size: 1.05rem;
}

.card-body {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text);
}

.ok {
  color: var(--accent-dim);
  font-weight: 600;
}

.bad {
  color: #c97a7a;
  font-weight: 600;
}

.hint {
  margin: 0;
  font-size: 0.82rem;
  color: var(--muted);
}

.primary {
  align-self: flex-start;
  font: inherit;
  cursor: pointer;
  padding: 0.45rem 1rem;
  border-radius: 0.35rem;
  border: 1px solid color-mix(in srgb, var(--accent) 55%, var(--border));
  background: color-mix(in srgb, var(--accent) 18%, var(--surface));
  color: var(--text-h);
}

.primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--accent) 28%, var(--surface));
}

.primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
