<template>
  <div class="tracker-container">
    <TimeTrackerToolbar
      :formatted-date="formattedDate"
      :is-holiday="isHoliday"
      @previous-day="previousDay"
      @next-day="nextDay"
      @toggle-holiday="saveUserDefinedHoliday"
    />

    <main class="main-content-scrollable">
      <div class="timetable" role="table">
        <div
          v-for="slot in TIME_SLOTS"
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
              v-for="(activity, index) in activities.get(slot.start)"
              :key="index"
              :style="{ backgroundColor: getActColor(activity.categoryKey) }"
              @click.stop="openEditModal(slot.start, index)"
            >
              <span class="activity-label">{{ getActLabel(activity.categoryKey) }}</span>
              <div v-if="activity.memo" class="memo-label">
                {{ activity.memo }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <ActivityEditModal
      :show="isModalOpen"
      :activity="editingActivity"
      :slot-label="editingSlotKey"
      :slot-index="editingSlotIndex"
      @close="closeEditModal"
      @update-activity-category="updateActivityCategory"
      @update-activity-memo="updateActivityMemo"
      @delete-activity="deleteActivity"
    />

    <TimeTrackerActionFooter
      :can-undo="canUndo"
      :can-redo="canRedo"
      @select-category="selectCategory"
      @undo="undoAct"
      @redo="redoAct"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, shallowReactive, onMounted } from 'vue'
import { getDateKey, isHoliday as isHolidayUtil } from '@/utils/date'
import type { Activity } from '@/types'
import { CATEGORIES, TIME_SLOTS, MAX_ACTIVITIES_PER_SLOT, LOCAL_STORAGE_ACTIVITY_PREFIX, LOCAL_STORAGE_HOLIDAY_MAP_KEY } from '@/constants'
import TimeTrackerToolbar from '@/components/TimeTrackerToolbar.vue'
import TimeTrackerActionFooter from '@/components/TimeTrackerActionFooter.vue'
import ActivityEditModal from '@/components/ActivityEditModal.vue'

const currentDate = ref(new Date())
const currentTimeSlot = ref<string | null>(null)

type ActivityMap = Map<string, Activity[]>

const activities: ActivityMap = reactive(new Map())
const actHistories = shallowReactive<ActivityMap[]>([new Map()])
const actHistoriesIndex = ref(0)

const isModalOpen = ref(false)
const editingSlotKey = ref<string | null>(null)
const editingSlotIndex = ref<number | -1>(-1)

const editingActivity = computed(() => {
  if (!editingSlotKey.value || editingSlotIndex.value === -1) return null
  return activities.get(editingSlotKey.value)?.[editingSlotIndex.value] ?? null
})

// 日付をキー、休日ならtrue / 平日ならfalse
// '2026-01-01': true,
// '2026-01-10': false,
const userDefinedHolidayMap = ref<Record<string, boolean>>({})

onMounted(() => {
  loadHolidayMapFromLocalStorage()
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

const isHoliday = computed(() => {
  return isHolidayUtil(currentDate.value, userDefinedHolidayMap.value)
})

const isSlotSelected = computed(() => (slotStart: string) => {
  return currentTimeSlot.value === slotStart
})

const canUndo = computed(() => actHistoriesIndex.value > 0)

const canRedo = computed(() => actHistoriesIndex.value + 1 < actHistories.length)

const createActivity = (categoryKey: string): Activity => {
  return {
    id: crypto.randomUUID(),
    categoryKey,
    memo: '',
  }
}

const getActLabel = (categoryKey: string) => {
  return CATEGORIES.find((c) => c.key == categoryKey)?.label ?? '不明'
}

const getActColor = (categoryKey: string) => {
  return CATEGORIES.find((c) => c.key == categoryKey)?.color ?? '#000000'
}

const changeDay = (days: number) => {
  const newDate = new Date(currentDate.value)
  newDate.setDate(newDate.getDate() + days)
  currentDate.value = newDate
  loadFromLocalStorage()
}

const previousDay = () => changeDay(-1)
const nextDay = () => changeDay(1)

const saveUserDefinedHoliday = () => {
  const dateKey = getDateKey(currentDate.value)

  // ユーザー定義の休日設定がある場合
  if (userDefinedHolidayMap.value[dateKey] !== undefined) {
    // 設定を削除し、曜日ベースのデフォルト判定に戻す
    delete userDefinedHolidayMap.value[dateKey]
  } else {
    // ユーザー定義の設定がない場合
    // 現在の isHoliday (曜日ベースで判定されている) とは逆の状態を保存する
    // これにより、土日を平日にしたり、平日を休日にしたりできる
    userDefinedHolidayMap.value[dateKey] = !isHoliday.value
  }
  saveHolidayMapToLocalStorage()
}

const selectCategory = (categoryKey: string) => {
  if (!currentTimeSlot.value) return
  const timeSlot = currentTimeSlot.value
  const currentActivitiesInSlot = [...(activities.get(timeSlot) ?? [])]

  if (currentActivitiesInSlot.length < MAX_ACTIVITIES_PER_SLOT) {
    currentActivitiesInSlot.push(createActivity(categoryKey))
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
  const currentIndex = TIME_SLOTS.findIndex((slot) => slot.start === currentTimeSlot.value)
  const nextIndex = currentIndex + 1
  currentTimeSlot.value = nextIndex >= TIME_SLOTS.length ? null : (TIME_SLOTS[nextIndex]?.start ?? null)
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
  editingSlotKey.value = slotStart
  editingSlotIndex.value = index
  isModalOpen.value = true
}

const closeEditModal = () => {
  isModalOpen.value = false
  editingSlotKey.value = null
  editingSlotIndex.value = -1
}

// Activity更新の処理のテンプレートが記載されている関数
// 編集しているtimeSlotに対応するactivityリストをどのように変えるかはupdaterのラムダを渡すことで可変にできる
const updateActivity = (updater: (list: Activity[]) => Activity[]) => {
  if (!editingSlotKey.value || editingSlotIndex.value === -1) return
  const currentList = [...(activities.get(editingSlotKey.value) ?? [])]
  activities.set(editingSlotKey.value, updater(currentList))
  saveHistory()
  closeEditModal()
}

const updateActivityMemo = (newMemo: string) => {
  if (!editingActivity.value) return
  const activity = editingActivity.value
  updateActivity((list) => {
    // activityを複製して、memoだけ更新する
    list[editingSlotIndex.value] = { ...activity, memo: newMemo }
    return list
  })
}

const updateActivityCategory = (newCategoryKey: string) => {
  updateActivity((list) => {
    list[editingSlotIndex.value] = createActivity(newCategoryKey)
    return list
  })
}

const deleteActivity = () => {
  updateActivity((list) => {
    list.splice(editingSlotIndex.value, 1)
    return list
  })
}

const saveToLocalStorage = () => {
  const key = `${LOCAL_STORAGE_ACTIVITY_PREFIX}${getDateKey(currentDate.value)}`
  localStorage.setItem(key, JSON.stringify(Object.fromEntries(activities)))
}

const saveHolidayMapToLocalStorage = () => {
  localStorage.setItem(LOCAL_STORAGE_HOLIDAY_MAP_KEY, JSON.stringify(userDefinedHolidayMap.value))
}

const loadHolidayMapFromLocalStorage = () => {
  const saved = localStorage.getItem(LOCAL_STORAGE_HOLIDAY_MAP_KEY)
  if (saved) {
    userDefinedHolidayMap.value = JSON.parse(saved)
  }
}

const loadFromLocalStorage = () => {
  const key = `${LOCAL_STORAGE_ACTIVITY_PREFIX}${getDateKey(currentDate.value)}`
  const saved = localStorage.getItem(key)
  activities.clear()
  if (saved) {
    const dataObj = JSON.parse(saved)
    for (const [slot, activitiesData] of Object.entries(dataObj) as [string, Activity[]][]) {
      activities.set(slot, activitiesData)
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
  flex-direction: column;
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

.memo-label {
  background-color: white;
  font-size: 0.8em;
  padding: 1px 4px;
  border-radius: 3px;
  margin-top: 2px;
  color: #333;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
