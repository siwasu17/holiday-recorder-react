import { useState, useEffect, useMemo, useCallback } from 'react'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ChartData, ChartOptions } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { activityService } from '@/services/activityService'
import { statsService, DailyDurations } from '@/services/statsService'
import { A_DAY_IN_MILLISECONDS } from '@/constants'
import { getDateKey } from '@/utils/date'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const ActivityStats = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [holidayChartData, setHolidayChartData] = useState<ChartData<'bar'>>({
    labels: [],
    datasets: [],
  })
  const [weekdayChartData, setWeekdayChartData] = useState<ChartData<'bar'>>({
    labels: [],
    datasets: [],
  })

  const hasData = useMemo(
    () =>
      (holidayChartData.datasets?.some((d) => d.data.some((v) => (v as number) > 0)) ?? false) ||
      (weekdayChartData.datasets?.some((d) => d.data.some((v) => (v as number) > 0)) ?? false),
    [holidayChartData, weekdayChartData],
  )

  const chartOptions = useMemo<ChartOptions<'bar'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1000, easing: 'easeOutQuart' as const },
      interaction: { mode: 'nearest' as const, intersect: true },
      plugins: {
        title: { display: true, text: '日別 活動時間' },
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
        x: { stacked: true },
        y: { stacked: true, title: { display: true, text: '合計時間' } },
      },
    }),
    [],
  )

  const createChartData = useCallback((dates: Date[], durations: Record<string, DailyDurations>) => {
    const sortedDates = [...dates].sort((a, b) => b.getTime() - a.getTime()).slice(0, 8)
    const labels = [...sortedDates].reverse().map((date) => {
      const dayOfWeek = date.toLocaleDateString('ja-JP', { weekday: 'short' }).slice(0, 1)
      const label = date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })
      return `${label}(${dayOfWeek})`
    })
    const datasets = statsService.getChartDatasets(sortedDates, durations, getDateKey)
    return { labels, datasets }
  }, [])

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true)
      const holidayEntries = await activityService.getAllHolidays()
      const holidayMap = holidayEntries.reduce((acc, entry) => {
        acc[entry.date] = entry.isHoliday
        return acc
      }, {} as Record<string, boolean>)

      const today = new Date()
      const startDate = new Date(today.getTime() - 30 * A_DAY_IN_MILLISECONDS)
      const activitiesEntries = await activityService.getActivitiesInRange(getDateKey(startDate), getDateKey(today))

      const stats = statsService.calculateDailyDurations(activitiesEntries, holidayMap)

      setHolidayChartData(createChartData(stats.holidayDatesWithData, stats.holidayDailyActivityDurations))
      setWeekdayChartData(createChartData(stats.weekdayDatesWithData, stats.weekdayDailyActivityDurations))
      setIsLoading(false)
    }
    initialize()
  }, [createChartData])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center p-5">
        <div className="text-gray-500">データを読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="p-5">
      <h3 className="mb-4 text-lg font-bold">活動記録グラフ</h3>
      {hasData ? (
        <div>
          {holidayChartData.datasets.length > 0 && (
            <div className="mt-5">
              <h4 className="mb-2 font-semibold">過去の活動(休日)</h4>
              <div className="relative mx-auto h-125 w-full max-w-200">
                <Bar data={holidayChartData} options={chartOptions} />
              </div>
            </div>
          )}
          {weekdayChartData.datasets.length > 0 && (
            <div className="mt-5">
              <h4 className="mb-2 font-semibold">過去の活動(平日)</h4>
              <div className="relative mx-auto h-125 w-full max-w-200">
                <Bar data={weekdayChartData} options={chartOptions} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>記録された活動データがありません。</p>
      )}
    </div>
  )
}

export default ActivityStats
