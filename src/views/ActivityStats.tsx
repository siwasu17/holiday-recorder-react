import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartData,
  ChartOptions,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { activityService } from '@/services/activityService'
import { statsService, DailyDurations, StatsResult } from '@/services/statsService'
import { A_DAY_IN_MILLISECONDS } from '@/constants'
import { getDateKey } from '@/utils/date'
import { useThemeContext } from '@/hooks/useThemeContext'
import { getCssVariableValue } from '@/utils/theme'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const ActivityStats = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { isDark } = useThemeContext()
  const [stats, setStats] = useState<StatsResult | null>(null)

  const textColor = getCssVariableValue('--color-text-main')
  const gridColor = getCssVariableValue('--color-chart-grid')

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeOutQuart' as const },
    interaction: { mode: 'nearest' as const, intersect: true },
    plugins: {
      title: { display: true, text: '日別 活動時間', color: textColor },
      legend: { labels: { color: textColor } },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || ''
            if (label) label += ': '
            if (context.parsed.y !== null) label += `${context.parsed.y.toFixed(1)} 時間`
            return label
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
      y: {
        stacked: true,
        title: { display: true, text: '合計時間', color: textColor },
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
    },
  }

  const createChartData = (dates: Date[], durations: Record<string, DailyDurations>) => {
    const sortedDates = [...dates].sort((a, b) => b.getTime() - a.getTime()).slice(0, 8)
    const labels = [...sortedDates].reverse().map((date) => {
      const dayOfWeek = date.toLocaleDateString('ja-JP', { weekday: 'short' }).slice(0, 1)
      const label = date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })
      return `${label}(${dayOfWeek})`
    })
    const datasets = statsService.getChartDatasets(sortedDates, durations, getDateKey, isDark)
    return { labels, datasets }
  }

  const holidayChartData: ChartData<'bar'> =
    stats && createChartData(stats.holidayDatesWithData, stats.holidayDailyActivityDurations) || {
      labels: [],
      datasets: [],
    }

  const weekdayChartData: ChartData<'bar'> =
    stats && createChartData(stats.weekdayDatesWithData, stats.weekdayDailyActivityDurations) || {
      labels: [],
      datasets: [],
    }

  const hasData =
    (holidayChartData.datasets?.some((d) => d.data.some((v) => (v as number) > 0)) ?? false) ||
    (weekdayChartData.datasets?.some((d) => d.data.some((v) => (v as number) > 0)) ?? false)

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true)
      const holidayEntries = await activityService.getAllHolidays()
      const holidayMap = holidayEntries.reduce(
        (acc, entry) => {
          acc[entry.date] = entry.isHoliday
          return acc
        },
        {} as Record<string, boolean>,
      )

      const today = new Date()
      const startDate = new Date(today.getTime() - 30 * A_DAY_IN_MILLISECONDS)
      const activitiesEntries = await activityService.getActivitiesInRange(getDateKey(startDate), getDateKey(today))

      const calculatedStats = statsService.calculateDailyDurations(activitiesEntries, holidayMap)
      setStats(calculatedStats)
      setIsLoading(false)
    }
    initialize()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center p-5">
        <div className="text-gray-500">データを読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="text-text-main p-5">
      <h3 className="mb-4 text-lg font-bold">活動記録グラフ</h3>
      {hasData ? (
        <div>
          {holidayChartData.datasets.length > 0 && (
            <div className="mt-5">
              <h4 className="text-text-sub mb-2 font-semibold">過去の活動(休日)</h4>
              <div className="relative mx-auto h-125 w-full max-w-200">
                <Bar data={holidayChartData} options={chartOptions} />
              </div>
            </div>
          )}
          {weekdayChartData.datasets.length > 0 && (
            <div className="mt-5">
              <h4 className="text-text-sub mb-2 font-semibold">過去の活動(平日)</h4>
              <div className="relative mx-auto h-125 w-full max-w-200">
                <Bar data={weekdayChartData} options={chartOptions} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-text-sub">記録された活動データがありません。</p>
      )}
    </div>
  )
}

export default ActivityStats
