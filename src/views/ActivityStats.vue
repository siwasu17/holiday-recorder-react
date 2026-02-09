<template>
  <div class="stats-container">
    <h3>活動記録グラフ</h3>

    <div v-if="hasData">
      <div v-if="hasHolidayData" class="chart-section">
        <h4>過去の活動(休日)</h4>
        <div class="chart-wrapper">
          <Bar :data="holidayChartData" :options="chartOptions" />
        </div>
      </div>
      <div v-if="hasWeekdayData" class="chart-section">
        <h4>過去の活動(平日)</h4>
        <div class="chart-wrapper">
          <Bar :data="weekdayChartData" :options="chartOptions" />
        </div>
      </div>
    </div>
    <div v-else>
      <p>記録された活動データがありません。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { Bar } from 'vue-chartjs'
import type { Activity, Category } from '@/types'

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

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const aDayOfMillsec = 24 * 60 * 60 * 1000

const userDefinedHolidayMap = ref<Record<string, boolean>>({})

const holidayChartData = ref<{
  labels: string[]
  datasets: any[]
}>({
  labels: [],
  datasets: [],
})

const weekdayChartData = ref<{
  labels: string[]
  datasets: any[]
}>({
  labels: [],
  datasets: [],
})

const hasHolidayData = computed(() => holidayChartData.value.datasets.some((d) => d.data.some((v: number) => v > 0)))
const hasWeekdayData = computed(() => weekdayChartData.value.datasets.some((d) => d.data.some((v: number) => v > 0)))
const hasData = computed(() => hasHolidayData.value || hasWeekdayData.value)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: '日別 活動時間',
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            label += `${context.parsed.y.toFixed(1)} 時間`
          }
          return label
        },
      },
    },
  },
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
      title: {
        display: true,
        text: '合計時間',
      },
    },
  },
}

const getDateKey = (date: Date) => {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

const isHoliday = (date: Date) => {
  const dateKey = getDateKey(date)
  if (userDefinedHolidayMap.value[dateKey]) {
    return true
  }
  const dayOfWeek = date.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6
}

const createChartData = (
  datesWithData: Date[],
  dailyActivityDurations: { [dateKey: string]: { [categoryKey: string]: number } },
) => {
  const sortedDates = [...datesWithData].sort((a, b) => b.getTime() - a.getTime()).slice(0, 8)

  const labels = [...sortedDates].reverse().map((date) => {
    const dayOfWeek = date.toLocaleDateString('ja-JP', { weekday: 'short' }).slice(0, 1) // Extract single kanji for day of week
    const label = date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })
    return `${label}(${dayOfWeek})`
  })
  const datasets = categories
    // nopは除外
    .filter((category) => category.key !== 'nop')
    .map((category) => {
      const data = sortedDates
        .map((date) => {
          const dateData = dailyActivityDurations[getDateKey(date)]
          // Data already contains durations in minutes, convert to hours here.
          return dateData ? (dateData[category.key] || 0) / 60 : 0
        })
        .reverse()

      return {
        label: category.label,
        backgroundColor: category.color,
        data: data,
        stack: 'activities',
      }
    })
    .filter((dataset) => dataset.data.some((d) => d > 0))

  return { labels, datasets }
}

const loadActivities = () => {
  const today = new Date()
  const holidayDailyActivityDurations: { [dateKey: string]: { [categoryKey: string]: number } } = {}
  const weekdayDailyActivityDurations: { [dateKey: string]: { [categoryKey: string]: number } } = {}
  const holidayDatesWithData: Date[] = []
  const weekdayDatesWithData: Date[] = []

  // 直近30日分くらいを探索対象とする
  for (let i = 0; i < 30; i++) {
    const date = new Date(today.getTime() - i * aDayOfMillsec)
    const dateKey = getDateKey(date)
    const storageKey = `activities-${dateKey}`
    const saved = localStorage.getItem(storageKey)

    if (saved) {
      const timeSlotsData = JSON.parse(saved) // This will be the object with timeSlot keys

      let totalActivitiesInDay = 0
      const currentDayDurations: { [categoryKey: string]: number } = {}

      for (const slotKey in timeSlotsData) {
        const activitiesInSlot = timeSlotsData[slotKey] as Activity[]
        const numActivitiesInSlot = activitiesInSlot.length

        if (numActivitiesInSlot > 0) {
          totalActivitiesInDay += numActivitiesInSlot
          const durationPerActivity = 120 / numActivitiesInSlot // minutes

          for (const activity of activitiesInSlot) {
            const categoryKey = activity.categoryKey
            currentDayDurations[categoryKey] = (currentDayDurations[categoryKey] || 0) + durationPerActivity
          }
        }
      }

      if (totalActivitiesInDay > 0) {
        if (isHoliday(date)) {
          holidayDatesWithData.push(date)
          holidayDailyActivityDurations[dateKey] = currentDayDurations
        } else {
          weekdayDatesWithData.push(date)
          weekdayDailyActivityDurations[dateKey] = currentDayDurations
        }
      }
    }
  }

  holidayChartData.value = createChartData(holidayDatesWithData, holidayDailyActivityDurations)
  weekdayChartData.value = createChartData(weekdayDatesWithData, weekdayDailyActivityDurations)
}

const loadHolidayMapFromLocalStorage = () => {
  const saved = localStorage.getItem('userDefinedHolidayMap')
  if (saved) {
    userDefinedHolidayMap.value = JSON.parse(saved)
  }
}

onMounted(() => {
  loadHolidayMapFromLocalStorage()
  loadActivities()
})
</script>

<style scoped>
.stats-container {
  padding: 20px;
}

.chart-section {
  margin-top: 20px;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  max-width: 800px;
  height: 500px;
  margin: 0 auto;
}
</style>
