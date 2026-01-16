<template>
  <div class="tracker-toolbar">
    <div class="date-navigation">
      <button @click="$emit('previous-day')" class="nav-button">&lt; Prev</button>
      <div class="current-date">{{ formattedDate }}</div>
      <button @click="$emit('next-day')" class="nav-button">Next &gt;</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  formattedDate: string
}>()

defineEmits(['previous-day', 'next-day'])
</script>

<style scoped>
.tracker-toolbar {
  background: var(--surface-color);
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: var(--app-header-height, 52px);
  z-index: 10;
  width: 100%;
}

.date-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 10px;
  height: 50px; /* Explicit height */
  box-sizing: border-box;
}

.nav-button {
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  display: flex; /* Use flex for alignment */
  align-items: center;
  justify-content: center;
  min-width: 40px;
}

.current-date {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}
</style>
