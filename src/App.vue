<template>
  <div id="activity-tracker-app" class="app-container">
    <div class="header-fixed">
      <div class="date-navigation">
        <button @click="previousDay" class="nav-button">&lt; Prev</button>
        <div class="current-date">{{ formattedDate }}</div>
        <button @click="nextDay" class="nav-button">Next &gt;</button>
      </div>
    </div>

    <hr />

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
              v-for="(actKey, index) in activities.get(slot.start)"
              :key="index"
              :style="{ backgroundColor: getActColor(actKey) }"
              @click="openEditModal(slot.start, index)"
            >
              {{ getActLabel(actKey) }}
            </div>
          </div>
        </div>
      </div>

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
    </main>

    <hr />

    <div class="footer-fixed">
      <div class="history-controls-inline">
        <button @click="undoAct" :disabled="!canUndo" class="history-mini-button">↩ Undo</button>
        <button @click="redoAct" :disabled="!canRedo" class="history-mini-button">Redo ↪</button>
      </div>
      <div class="category-grid">
        <button
          v-for="category in categories"
          :key="category.key"
          class="mini-category-button"
          :style="{ backgroundColor: category.color }"
          @click="selectCategory(category.key)"
        >
          {{ category.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, shallowReactive, onMounted } from 'vue'

const currentDate = ref(new Date())

const currentTimeSlot = ref<string | null>(null)

const MAX_ACTIVITIES_PER_SLOT = 4

type ActivityTasksMap = Map<string, string[]>

// timeSlot(string) -> taskCategories(string[]) のMap
const activities: ActivityTasksMap = reactive(new Map())
// 履歴の初期状態として空マップをいれておく
const actHistories = shallowReactive<ActivityTasksMap[]>([new Map()])
const actHistoriesIndex = ref(0)

const isModalOpen = ref(false)
const editingSlot = ref<string | null>(null)
const editingIndex = ref<number | -1>(-1)

/**
 * 活動カテゴリのリスト (定数)
 */
const categories = [
  { key: 'meal', label: '食事', color: '#FFE5D9' }, // シェルピンク
  { key: 'rest', label: '休息', color: '#D6EFFF' }, // スカイミスト
  { key: 'exercise', label: '運動', color: '#E2F0CB' }, // ペールライム
  { key: 'plan', label: '検討', color: '#E8DFF5' }, // ラベンダーミスト（明るい紫）
  { key: 'dev_in', label: '開発(In)', color: '#B9F2FF' }, // パステルアクア（澄んだ明るい水色）
  { key: 'dev_out', label: '開発(Out)', color: '#89CFF0' }, // ベビーブルー（透明感のある青）
  { key: 'culture', label: '文化', color: '#FCE1E4' }, // ベビーピンク
  { key: 'event', label: '行事', color: '#F3C4FB' }, // ライトバイオレット
  { key: 'housework', label: '家事(定)', color: '#FFF9C4' }, // ライトレモンイエロー
  { key: 'task', label: '家事(単)', color: '#FFD3D3' }, // パステルレッド
  { key: 'etc', label: 'その他', color: '#F0F4EF' }, // ホワイトミント
  { key: 'nop', label: '余白', color: '#E0E0E0' }, // フォググレー
]

/**
 * 時間割のタイムスロットデータ (定数)
 * 8時から26時までを2時間単位で定義
 */
const timeSlots = [
  { start: '08:00', label: '8:00 - 10:00' },
  { start: '10:00', label: '10:00 - 12:00' },
  { start: '12:00', label: '12:00 - 14:00' },
  { start: '14:00', label: '14:00 - 16:00' },
  { start: '16:00', label: '16:00 - 18:00' },
  { start: '18:00', label: '18:00 - 20:00' },
  { start: '20:00', label: '20:00 - 22:00' },
  { start: '22:00', label: '22:00 - 24:00' },
  { start: '00:00+', label: '24:00 - 26:00' }, // 翌日の0:00-2:00に相当
]

// 起動時にlocalStorageから状態復元
onMounted(() => {
  loadFromLocalStorage()
})

// --- Computed Properties (算出プロパティ) ---

/**
 * 表示日付を整形して返す (computed: 依存する値が変化したら再計算)
 */
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

const canUndo = computed(() => {
  return actHistoriesIndex.value > 0
})

const canRedo = computed(() => {
  // 指している位置が最新よりも前ならRedo可能
  // 例: index:0, 要素数(length):2
  return actHistoriesIndex.value + 1 < actHistories.length
})

const editingSlotLabel = computed(() => {
  return timeSlots.find((s) => s.start === editingSlot.value)?.label ?? ''
})

const editingActLabel = computed(() => {
  const actKey = activities.get(editingSlot.value ?? '')?.[editingIndex.value]

  return categories.find((c) => c.key === actKey)?.label
})

// --- Methods (関数) ---

const getActLabel = (actKey: string) => {
  return categories.find((c) => c.key == actKey)?.label ?? '不明'
}

const getActColor = (actKey: string) => {
  return categories.find((c) => c.key == actKey)?.color ?? '#000000'
}
/**
 * 日付を指定日数分変更する
 * @param {number} days - 変更する日数 (+1で翌日、-1で前日)
 */
const changeDay = (days: number) => {
  const newDate = new Date(currentDate.value)
  newDate.setDate(newDate.getDate() + days)
  currentDate.value = newDate

  // 日付が変わったら新しい日付のデータをロード
  loadFromLocalStorage()
}

const previousDay = () => {
  changeDay(-1)
}

const nextDay = () => {
  changeDay(1)
}

const selectCategory = (taskCategory: string) => {
  if (!currentTimeSlot.value) return

  const timeSlot = currentTimeSlot.value
  // 選択された時間スロットに入っているアクティビティの配列
  // reactiveな値からスプレッド演算子 [...配列] を使って、新しい配列（コピー）を作る
  const currentActivitiesInSlot = [...(activities.get(timeSlot) ?? [])]

  // 選択した時間枠にタスクカテゴリを追加
  if (currentActivitiesInSlot.length < MAX_ACTIVITIES_PER_SLOT) {
    currentActivitiesInSlot.push(taskCategory)
    activities.set(timeSlot, currentActivitiesInSlot)

    // Undo/Redoのための履歴保存
    saveHistory()
  }

  // 4つ埋まったら次の時間に移動する
  if (currentActivitiesInSlot.length >= MAX_ACTIVITIES_PER_SLOT) {
    moveToNextSlot()
  }

  console.log([...activities])
  console.log(`Index: ${actHistoriesIndex.value}`)
  console.log([...actHistories])
}

/**
 * 履歴保存
 */
const saveHistory = () => {
  // Undo/Redoのための履歴保存
  actHistoriesIndex.value++
  const snapshot = new Map()
  activities.forEach((value, key) => {
    snapshot.set(key, [...value])
  })
  actHistories[actHistoriesIndex.value] = snapshot
  // 新しい要素を追加した場合は、Redoできないように履歴の長さを切り詰める
  actHistories.length = actHistoriesIndex.value + 1

  // localStorageに状態保存
  saveToLocalStorage()
}

/**
 * 次の時間枠へ選択を移動、または選択解除する（内部用）
 */
const moveToNextSlot = () => {
  const currentIndex = timeSlots.findIndex((slot) => slot.start === currentTimeSlot.value)
  const nextIndex = currentIndex + 1

  // 次の枠がない（末尾）場合は解除、あれば移動
  if (nextIndex >= timeSlots.length) {
    currentTimeSlot.value = null
  } else {
    currentTimeSlot.value = timeSlots[nextIndex]?.start ?? null
  }
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

/**
 * actHistoriesIndexで示す状態にactivitiesを復元する
 */
const restoreState = () => {
  const targetState = actHistories[actHistoriesIndex.value]
  // 状態復元
  if (!!targetState) {
    activities.clear()
    targetState.forEach((val, key) => {
      activities.set(key, [...val])
    })

    // 状態が変わったのでlocalStorageに保存し直す
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

const updateActivity = (newActKey: string) => {
  if (!editingSlot.value || editingIndex.value === -1) return

  const currentList = [...(activities.get(editingSlot.value) ?? [])]
  currentList[editingIndex.value] = newActKey

  activities.set(editingSlot.value, currentList)
  saveHistory()
  closeModal()
}

const deleteActivity = () => {
  if (!editingSlot.value || editingIndex.value === -1) return

  const currentList = [...(activities.get(editingSlot.value) ?? [])]
  // 対象要素を削除
  currentList.splice(editingIndex.value, 1)

  activities.set(editingSlot.value, currentList)
  saveHistory()
  closeModal()
}

/**
 * LocalStorageへの保存・復元関連
 */
const getDateKey = (date: Date) => {
  return date.toISOString().split('T')[0]
}

const saveToLocalStorage = () => {
  const key = `activities-${getDateKey(currentDate.value)}`
  // Map を Object に変換して保存
  const dataObj = Object.fromEntries(activities)
  localStorage.setItem(key, JSON.stringify(dataObj))
}

const loadFromLocalStorage = () => {
  const key = `activities-${getDateKey(currentDate.value)}`
  const saved = localStorage.getItem(key)

  activities.clear()
  if (saved) {
    const dataObj = JSON.parse(saved)
    // Object を Map に戻す
    // Object.entries(dataObj) は [['08:00', [...]], ...] を返す
    const entries = Object.entries(dataObj) as [string, string[]][]
    for (const [slot, tasks] of entries) {
      activities.set(slot, tasks)
    }
    // 復元した情報を最初の履歴として登録する
    resetHistoryAfterLoad()
  }
}

const resetHistoryAfterLoad = () => {
  actHistories.length = 0
  const snapshot = new Map()
  activities.forEach((v, k) => snapshot.set(k, [...v]))
  actHistories.push(snapshot)
  actHistoriesIndex.value = 0
}
</script>

<style>
:root {
  --bg-color: #fcfaf2;
  --surface-color: #fdfcf8;
  --text-main: #4a4945;
  --text-sub: #8c8b85;
  --border-color: #e8e6df;
  --accent-soft: #f0f3f5;
}
.app-container {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
  color: var(--text-main);
  background-color: var(--bg-color);
}

.header-fixed,
.footer-fixed {
  position: fixed;
  left: 0;
  right: 0;
  background: var(--surface-color);
  padding: 10px 0;
  z-index: 10;
}

.header-fixed {
  top: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.footer-fixed {
  bottom: 0;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.main-content-scrollable {
  flex-grow: 1;
  overflow-y: auto; /* 内容が溢れたらここだけスクロールさせる */
  background-color: var(--bg-color);
  /* ヘッダーとフッターの高さに応じて調整 */
  padding-top: 50px;
  padding-bottom: 195px;
}

.timetable {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-top: 1px solid var(--border-color);
}

.time-row {
  display: grid;
  /* 左側のラベルを80px固定、右側を可変にする例 */
  grid-template-columns: 80px 1fr;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.2s;
  height: 60px;
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
  height: 100%;
  box-sizing: border-box;
}

.activity-item {
  /* itemを広げたくなければこれを消す */
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  min-height: 0;
  padding: 1px 4px;
  font-size: clamp(0.35rem, 1.5vh, 0.65rem);
  line-height: 1;
  margin-bottom: 1px;
  border-radius: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* はみ出た分を「...」にする */
}

/* 最後のアイテムの余白を消す */
.activity-item:last-child {
  margin-bottom: 0;
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

.modal-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.danger-button {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
}

.cancel-button {
  background: #f0f0f0;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
}

.slot-info {
  color: #666;
  font-size: 0.9rem;
}

.date-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 10px;
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
