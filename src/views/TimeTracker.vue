<template>
  <div class="tracker-container">
    <TimeTrackerToolbar :formatted-date="formattedDate" @previous-day="previousDay" @next-day="nextDay" />

    <main class="main-content-scrollable">
      <div class="timetable" role="table">
        <div
          v-for="slot in timeSlots"
          :key="slot.start"
          @click="selectTimeSlot(slot.start)"
          :class="['time-row', { 'is-selected': isSlotSelected(slot.start) }]"
          role="row"
        >
          <div class="time-label" role="cell">
            {{ slot.label }}
          </div>

          <div class="activity-cell" role="cell">
            <div
              class="activity-item"
              v-for="(task, index) in activities.get(slot.start)"
              :key="index"
              :style="{ backgroundColor: getActColor(task.categoryKey) }"
              @click.stop="openEditModal(slot.start, index)"
            >
              {{ getActLabel(task.categoryKey) }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <TimeTrackerActionFooter
      :categories="categories"
      :can-undo="canUndo"
      :can-redo="canRedo"
      @select-category="selectCategory"
      @undo="undoAct"
      @redo="redoAct"
    />

    <!-- Modal for editing activities -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>{{ editingActLabel }}</h3>
        <p class="slot-info">{{ editingSlotLabel }} の {{ editingIndex + 1 }}つ目</p>

        <div class="edit-actions">
          <p>別のカテゴリに変更：</p>
          <div class="category-grid">
            <button
              v-for="category in categories"
              :key="category.key"
              class="mini-category-button"
              :style="{ backgroundColor: category.color }"
              @click="updateActivity(category.key)"
            >
              {{ category.label }}
            </button>
          </div>
        </div>

        <hr />

        <div class="modal-footer">
          <button @click="deleteActivity" class="danger-button">この活動を削除</button>
          <button @click="closeModal" class="cancel-button">キャンセル</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, shallowReactive, onMounted } from 'vue'
import type { TimeSlot, Category, Task } from '@/types'
import TimeTrackerToolbar from '@/components/TimeTrackerToolbar.vue'
import TimeTrackerActionFooter from '@/components/TimeTrackerActionFooter.vue'

const currentDate = ref(new Date())
const currentTimeSlot = ref<string | null>(null)
const MAX_ACTIVITIES_PER_SLOT = 4

type ActivityTasksMap = Map<string, Task[]>

const activities: ActivityTasksMap = reactive(new Map())
const actHistories = shallowReactive<ActivityTasksMap[]>([new Map()])
const actHistoriesIndex = ref(0)

const isModalOpen = ref(false)
const editingSlot = ref<string | null>(null)
const editingIndex = ref<number | -1>(-1)

const categories: Category[] = [
  { key: 'meal', label: '食事', color: '#FFE5D9' },
  { key: 'rest', label: '休息', color: '#D6EFFF' },
  { key: 'exercise', label: '運動', color: '#E2F0CB' },
  { key: 'plan', label: '検討', color: '#E8DFF5' },
  { key: 'dev_in', label: '開発(In)', color: '#B9F2FF' },
  { key: 'dev_out', label: '開発(Out)', color: '#89CFF0' },
  { key: 'culture', label: '文化', color: '#FCE1E4' },
  { key: 'event', label: '行事', color: '#F3C4FB' },
  { key: 'housework', label: '家事(定)', color: '#FFF9C4' },
  { key: 'task', label: '家事(単)', color: '#FFD3D3' },
  { key: 'etc', label: 'その他', color: '#F0F4EF' },
  { key: 'nop', label: '余白', color: '#E0E0E0' },
]

const timeSlots: TimeSlot[] = [
  { start: '08:00', label: '8 - 10' },
  { start: '10:00', label: '10 - 12' },
  { start: '12:00', label: '12 - 14' },
  { start: '14:00', label: '14 - 16' },
  { start: '16:00', label: '16 - 18' },
  { start: '18:00', label: '18 - 20' },
  { start: '20:00', label: '20 - 22' },
  { start: '22:00', label: '22 - 24' },
  { start: '00:00+', label: '24 - 26' },
]

onMounted(() => {
  loadFromLocalStorage()
})

const formattedDate = computed(() => {
  return currentDate.value.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  })
})

const isSlotSelected = computed(() => (slotStart: string) => {
  return currentTimeSlot.value === slotStart
})

const canUndo = computed(() => actHistoriesIndex.value > 0)

const canRedo = computed(() => actHistoriesIndex.value + 1 < actHistories.length)

const editingSlotLabel = computed(() => {
  return timeSlots.find((s) => s.start === editingSlot.value)?.label ?? ''
})

const editingActLabel = computed(() => {
  const task = activities.get(editingSlot.value ?? '')?.[editingIndex.value]
  return categories.find((c) => c.key === task?.categoryKey)?.label
})

const createTask = (categoryKey: string): Task => {
  return {
    id: crypto.randomUUID(),
    categoryKey,
    memo: '',
  }
}

const getActLabel = (categoryKey: string) => {
  return categories.find((c) => c.key == categoryKey)?.label ?? '不明'
}

const getActColor = (categoryKey: string) => {
  return categories.find((c) => c.key == categoryKey)?.color ?? '#000000'
}

const changeDay = (days: number) => {
  const newDate = new Date(currentDate.value)
  newDate.setDate(newDate.getDate() + days)
  currentDate.value = newDate
  loadFromLocalStorage()
}

const previousDay = () => changeDay(-1)
const nextDay = () => changeDay(1)

const selectCategory = (taskCategory: string) => {
  if (!currentTimeSlot.value) return
  const timeSlot = currentTimeSlot.value
  const currentActivitiesInSlot = [...(activities.get(timeSlot) ?? [])]

  if (currentActivitiesInSlot.length < MAX_ACTIVITIES_PER_SLOT) {
    currentActivitiesInSlot.push(createTask(taskCategory))
    activities.set(timeSlot, currentActivitiesInSlot)
    saveHistory()
  }

  if (activities.get(timeSlot)?.length === MAX_ACTIVITIES_PER_SLOT) {
    moveToNextSlot()
  }
}

const saveHistory = () => {
  actHistoriesIndex.value++
  const snapshot = new Map()
  activities.forEach((value, key) => snapshot.set(key, [...value]))
  actHistories[actHistoriesIndex.value] = snapshot
  actHistories.length = actHistoriesIndex.value + 1
  saveToLocalStorage()
}

const moveToNextSlot = () => {
  const currentIndex = timeSlots.findIndex((slot) => slot.start === currentTimeSlot.value)
  const nextIndex = currentIndex + 1
  currentTimeSlot.value = nextIndex >= timeSlots.length ? null : (timeSlots[nextIndex]?.start ?? null)
}

const undoAct = () => {
  if (!canUndo.value) return
  actHistoriesIndex.value--
  restoreState()
}

const redoAct = () => {
  if (!canRedo.value) return
  actHistoriesIndex.value++
  restoreState()
}

const restoreState = () => {
  const targetState = actHistories[actHistoriesIndex.value]
  if (targetState) {
    activities.clear()
    targetState.forEach((val, key) => activities.set(key, [...val]))
    saveToLocalStorage()
  }
}

const selectTimeSlot = (timeSlotKey: string) => {
  currentTimeSlot.value = timeSlotKey
}

const openEditModal = (slotStart: string, index: number) => {
  editingSlot.value = slotStart
  editingIndex.value = index
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingSlot.value = null
  editingIndex.value = -1
}

const updateActivity = (newCategoryKey: string) => {
  if (!editingSlot.value || editingIndex.value === -1) return
  const currentList = [...(activities.get(editingSlot.value) ?? [])]
  currentList[editingIndex.value] = createTask(newCategoryKey)
  activities.set(editingSlot.value, currentList)
  saveHistory()
  closeModal()
}

const deleteActivity = () => {
  if (!editingSlot.value || editingIndex.value === -1) return
  const currentList = [...(activities.get(editingSlot.value) ?? [])]
  currentList.splice(editingIndex.value, 1)
  activities.set(editingSlot.value, currentList)
  saveHistory()
  closeModal()
}

const getDateKey = (date: Date) => date.toISOString().split('T')[0]

const saveToLocalStorage = () => {
  const key = `activities-${getDateKey(currentDate.value)}`
  localStorage.setItem(key, JSON.stringify(Object.fromEntries(activities)))
}

const loadFromLocalStorage = () => {
  const key = `activities-${getDateKey(currentDate.value)}`
  const saved = localStorage.getItem(key)
  activities.clear()
  if (saved) {
    const dataObj = JSON.parse(saved)
    for (const [slot, tasks] of Object.entries(dataObj) as [string, Task[]][]) {
      activities.set(slot, tasks)
    }
  }
  resetHistoryAfterLoad()
}

const resetHistoryAfterLoad = () => {
  actHistories.length = 0
  const snapshot = new Map()
  activities.forEach((v, k) => snapshot.set(k, [...v]))
  actHistories.push(snapshot)
  actHistoriesIndex.value = 0
}
</script>

<style scoped>
.tracker-container {
  display: flex;
  flex-direction: column;
  height: calc(100dvh - var(--app-header-height));
}

.main-content-scrollable {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 230px;
}

.timetable {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-top: 1px solid var(--border-color);
}

.time-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.2s;
  min-height: 60px;
}

.time-row:hover {
  background-color: #f9f9f9;
}

.time-row.is-selected {
  background-color: var(--accent-soft);
}

.time-label {
  padding: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  background-color: #f1efea;
  color: var(--text-sub);
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-cell {
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activity-item {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 2px 4px;
  font-size: clamp(0.6rem, 1.5vh, 0.75rem);
  line-height: 1.2;
  border-radius: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

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
