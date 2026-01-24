<template>
  <div class="stats-container">
    <h2>活動記録グラフ</h2>

    <div v-if="hasData">
      <div class="chart-section">
        <h3>過去の活動</h3>
        <div class="chart-wrapper">
          <Bar :data="chartData" :options="chartOptions" />
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

const MINUTES_PER_ACTIVITY = 30
const aDayOfMillsec = 24 * 60 * 60 * 1000

const chartData = ref<{
  labels: string[]
  datasets: any[]
}>({
  labels: [],
  datasets: [],
})

const hasData = computed(() => chartData.value.datasets.some((d) => d.data.some((v: number) => v > 0)))

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

const getDateKey = (date: Date) => date.toISOString().split('T')[0] ?? ''

const loadActivities = () => {
  const today = new Date()
  const labels: string[] = []
  const dailyData: { [dateKey: string]: { [categoryKey: string]: number } } = {}
  const datesWithData: Date[] = []

  // 直近30日分くらいを探索対象とする
  for (let i = 0; i < 30; i++) {
    const date = new Date(today.getTime() - i * aDayOfMillsec)
    const dateKey = getDateKey(date)
    const storageKey = `activities-${dateKey}`
    const saved = localStorage.getItem(storageKey)

    if (saved) {
      const dataObj = JSON.parse(saved)
      const activities = Object.values(dataObj).flat() as Activity[]
      if (activities.length > 0) {
        datesWithData.push(date)
        dailyData[dateKey] = {}
        for (const activity of activities) {
          const categoryKey = activity.categoryKey
          dailyData[dateKey][categoryKey] = (dailyData[dateKey][categoryKey] || 0) + 1
        }
      }
    }
  }

  // 日付順にソートして最新8件に絞る
  const sortedDates = datesWithData.sort((a, b) => b.getTime() - a.getTime()).slice(0, 8)

  for (const date of sortedDates.reverse()) {
    const dateKey = getDateKey(date)
    const label = date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })
    labels.push(dateKey === getDateKey(today) ? `${label}(本日)` : label)
  }

  const datasets = categories
    .map((category) => {
      const data = sortedDates.map((date) => {
        const data = dailyData[getDateKey(date)]
        if (data) {
          return (data[category.key] || 0) * (MINUTES_PER_ACTIVITY / 60)
        } else {
          return 0
        }
      })
      return {
        label: category.label,
        backgroundColor: category.color,
        data: data,
        stack: 'activities',
      }
    })
    .filter((dataset) => dataset.data.some((d) => d > 0))

  chartData.value = {
    labels: labels,
    datasets: datasets,
  }
}

onMounted(() => {
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
