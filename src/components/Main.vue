<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Game from './Game.vue';
import { LOCALE_STORAGE_KEY, type SupportedLanguages } from '../i18n';

const { locale, t } = useI18n();

const canvas2dSupported = ref(false);
const webglSupported = ref(false);
const activeMode = ref<'canvas2d' | 'webgl2' | null>(null);

onMounted(() => {
  const probe = document.createElement('canvas');
  canvas2dSupported.value = !!probe.getContext('2d');

  const webGlProbe = document.createElement('canvas');
  webglSupported.value = !!webGlProbe.getContext('webgl2');
});

function onLocaleChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as SupportedLanguages;
  locale.value = value;
  localStorage.setItem(LOCALE_STORAGE_KEY, value);
}

function startCanvas2d() {
  activeMode.value = 'canvas2d';
}

function startWebgl() {
  activeMode.value = 'webgl2';
}

function leaveGame() {
  activeMode.value = null;
}
</script>

<template>
  <main class="main">
    <label v-if="!activeMode" class="locale-switcher">
      <!-- <span class="locale-label">{{ t('main.language') }}</span> -->
      <select
        class="locale-select"
        :value="locale"
        :aria-label="t('main.language')"
        @change="onLocaleChange"
      >
        <option value="ru">RU</option>
        <option value="en">EN</option>
      </select>
    </label>

    <template v-if="!activeMode">
      <div class="main-content">
        <h1 class="title">{{ t('main.title') }}</h1>
        <p class="lead">{{ t('main.lead') }}</p>

        <div class="stack">
          <section class="card">
            <h2 class="card-title">{{ t('main.canvas2d') }}</h2>
            <p class="card-body">
              {{ t('main.supported') }}
              <span :class="canvas2dSupported ? 'ok' : 'bad'">
                {{ canvas2dSupported ? t('main.yes') : t('main.no') }}
              </span>
            </p>
            <button
              type="button"
              class="primary"
              :disabled="!canvas2dSupported"
              @click="startCanvas2d"
            >
              {{ t('main.start') }}
            </button>
          </section>

          <section class="card">
            <h2 class="card-title">{{ t('main.webgl2') }}</h2>
            <p class="card-body">
              {{ t('main.supported') }}
              <span :class="webglSupported ? 'ok' : 'bad'">
                {{ webglSupported ? t('main.yes') : t('main.no') }}
              </span>
            </p>
            <button
              type="button"
              class="primary"
              :disabled="!webglSupported"
              @click="startWebgl"
            >
              {{ t('main.start') }}
            </button>
          </section>
        </div>
      </div>
    </template>

    <Game v-else :render-mode="activeMode" @leave="leaveGame" />
  </main>
</template>

<style scoped>
.main {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  margin: 0 auto;
  gap: 1.25rem;
}

.locale-switcher {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--muted);
}

.locale-label {
  user-select: none;
}

.locale-select {
  font: inherit;
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  border-radius: 0.35rem;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
}

.locale-select:hover {
  border-color: var(--accent-dim);
  color: var(--text-h);
}

.main-content {
  max-width: 40rem;
  width: 100%;
  margin: 0 auto;
  padding-top: 2rem;
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
