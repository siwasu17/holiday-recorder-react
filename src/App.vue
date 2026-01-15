<template>
  <div id="app-shell">
    <header class="app-header">
      <nav class="app-nav">
        <button @click="currentView = 'Tracker'" :class="{ active: currentView === 'Tracker' }">トラッカー</button>
        <button @click="currentView = 'Statistics'" :class="{ active: currentView === 'Statistics' }">統計</button>
      </nav>
    </header>

    <main class="app-main">
      <component :is="views[currentView]" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Tracker from './views/Tracker.vue'
import Statistics from './views/Statistics.vue'

type ViewName = 'Tracker' | 'Statistics'

const currentView = ref<ViewName>('Tracker')

const views = {
  Tracker,
  Statistics,
}
</script>

<style>
/* 既存のグローバルスタイルをここに移動または維持 */
:root {
  --bg-color: #fcfaf2;
  --surface-color: #fdfcf8;
  --text-main: #4a4945;
  --text-sub: #8c8b85;
  --border-color: #e8e6df;
  --accent-soft: #f0f3f5;
  --app-header-height: 52px;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app-shell {
  color: var(--text-main);
  background-color: var(--bg-color);
}

.app-header {
  background: var(--surface-color);
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 20;
  height: var(--app-header-height);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-nav {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.app-nav button {
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: 20px;
  background: none;
  font-size: 0.6rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-sub);
}

.app-nav button.active {
  background-color: var(--accent-soft);
  border-color: var(--border-color);
  color: var(--text-main);
  font-weight: 600;
}
</style>
