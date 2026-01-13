<template>
  <div class="tracker-action-footer">
    <div class="history-controls-inline">
      <button @click="$emit('undo')" :disabled="!canUndo" class="history-mini-button">
        ↩ Undo
      </button>
      <button @click="$emit('redo')" :disabled="!canRedo" class="history-mini-button">
        Redo ↪
      </button>
    </div>
    <div class="category-grid">
      <button
        v-for="category in categories"
        :key="category.key"
        class="mini-category-button"
        :style="{ backgroundColor: category.color }"
        @click="$emit('select-category', category.key)"
      >
        {{ category.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Category {
  key: string
  label: string
  color: string
}

defineProps<{
  categories: Category[]
  canUndo: boolean
  canRedo: boolean
}>()

defineEmits(['select-category', 'undo', 'redo'])
</script>

<style scoped>
.tracker-action-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--surface-color);
  padding: 10px;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.history-controls-inline {
  display: flex;
  justify-content: center;
  gap: 100px;
  margin-bottom: 4px; /* カテゴリーボタンとの間隔 */
}

.history-mini-button {
  background: none;
  border: 1px solid #ddd;
  border-radius: 15px;
  padding: 2px 12px;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.history-mini-button:disabled {
  color: #ccc;
  border-color: #eee;
  cursor: not-allowed;
}

.history-mini-button:not(:disabled):hover {
  background-color: #f9f9f9;
  border-color: #bbb;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 10px;
}

.mini-category-button {
  padding: 8px 4px;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}
</style>
