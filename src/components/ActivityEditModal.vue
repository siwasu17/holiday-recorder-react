<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>{{ categoryLabel }}</h3>
      <p class="slot-info">{{ slotLabel }} の {{ slotIndex + 1 }}つ目</p>

      <div class="edit-actions">
        <p>別のカテゴリに変更：</p>
        <div class="category-grid">
          <button
            v-for="category in categories"
            :key="category.key"
            class="mini-category-button"
            :style="{ backgroundColor: category.color }"
            @click="$emit('update-activity-category', category.key)"
          >
            {{ category.label }}
          </button>
        </div>
      </div>

      <hr />

      <div class="modal-footer">
        <button @click="$emit('delete-activity')" class="danger-button">この活動を削除</button>
        <button @click="$emit('close')" class="cancel-button">キャンセル</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Activity, Category } from '@/types'
import { computed } from 'vue'

const props = defineProps<{
  show: boolean
  categories: Category[]
  slotLabel: string | null
  slotIndex: number
  activity: Activity | null
}>()

defineEmits(['close', 'update-activity-category', 'update-activity-memo', 'delete-activity'])

const categoryLabel = computed(() => {
  return props.categories.find((c) => c.key == props.activity?.categoryKey)?.label ?? '不明'
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.danger-button,
.cancel-button {
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
}

.danger-button {
  background-color: #ff4d4f;
  color: white;
}

.cancel-button {
  background: #f0f0f0;
}

.slot-info {
  color: #666;
  font-size: 0.9rem;
}

.modal-content .category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 10px;
}

.modal-content .mini-category-button {
  padding: 8px 4px;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}
</style>
