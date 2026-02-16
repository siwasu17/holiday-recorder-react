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
import { getDateKey, isHoliday as isHolidayUtil } from '@/utils/date'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { Bar } from 'vue-chartjs'
import type { Activity } from '@/types'
import { CATEGORIES, A_DAY_IN_MILLISECONDS, LOCAL_STORAGE_ACTIVITY_PREFIX, LOCAL_STORAGE_HOLIDAY_MAP_KEY } from '@/constants'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

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

const isHoliday = (date: Date) => {
  return isHolidayUtil(date, userDefinedHolidayMap.value)
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
  const datasets = CATEGORIES
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
    const date = new Date(today.getTime() - i * A_DAY_IN_MILLISECONDS)
    const dateKey = getDateKey(date)
    const storageKey = `${LOCAL_STORAGE_ACTIVITY_PREFIX}${dateKey}`
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
  const saved = localStorage.getItem(LOCAL_STORAGE_HOLIDAY_MAP_KEY)
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
