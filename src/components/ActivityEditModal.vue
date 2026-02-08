<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="header-container">
        <div class="category-label">{{ categoryLabel }}</div>
        <span class="slot-info">{{ slotLabel }} #{{ slotIndex + 1 }}</span>
        <button @click="$emit('delete-activity')" class="delete-button">削除</button>
      </div>

      <div>
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

      <div class="memo-input-container">
        <input id="memo-input" type="text" v-model="memo" placeholder="メモを入力" />
      </div>

      <div class="modal-footer">
        <button @click="$emit('update-activity-memo', memo)" class="save-memo-button">保存</button>
        <button @click="$emit('close')" class="cancel-button">キャンセル</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Activity, Category } from '@/types'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  categories: Category[]
  slotLabel: string | null
  slotIndex: number
  activity: Activity | null
}>()

defineEmits(['close', 'update-activity-category', 'update-activity-memo', 'delete-activity'])

const memo = ref(props.activity?.memo || '')

// memoの初期化が最初しか動かないのでactivityが変わったら新たに初期化されるようにするためのwatch
watch(
  () => props.activity,
  (newActivity) => {
    memo.value = newActivity?.memo || ''
  },
)

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

.header-container {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 15px;
  justify-content: space-between;
}

.category-label {
  font-size: 1.5rem; /* 少し大きめに */
  color: #333; /* 濃いめの色 */
}

.modal-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.delete-button,
.cancel-button {
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
}

.delete-button {
  background-color: #ff4d4f;
  color: white;
}

.cancel-button {
  background: #f0f0f0;
}

.slot-info {
  color: #666;
  font-size: 0.8rem;
}

.memo-input-container {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  align-items: center;
}

.memo-input-container input#memo-input {
  flex-grow: 1;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

.save-memo-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease;
}

.save-memo-button:hover {
  background-color: #0056b3;
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
