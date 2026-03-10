import { useState, useEffect, useMemo, useCallback } from 'react'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import type { Activity } from '@/types'
import {
  CATEGORIES,
  A_DAY_IN_MILLISECONDS,
  LOCAL_STORAGE_ACTIVITY_PREFIX,
  LOCAL_STORAGE_HOLIDAY_MAP_KEY,
} from '@/constants'
import { getDateKey, isHoliday as isHolidayUtil } from '@/utils/date'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const ActivityStats = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [holidayChartData, setHolidayChartData] = useState<{
    labels: string[]
    datasets: {
      label: string
      backgroundColor: string
      data: number[]
      stack: string
    }[]
  }>({
    labels: [],
    datasets: [],
  })
  const [weekdayChartData, setWeekdayChartData] = useState<{
    labels: string[]
    datasets: {
      label: string
      backgroundColor: string
      data: number[]
      stack: string
    }[]
  }>({
    labels: [],
    datasets: [],
  })

  const hasHolidayData = useMemo(
    () => holidayChartData.datasets.some((d) => d.data.some((v: number) => v > 0)),
    [holidayChartData],
  )
  const hasWeekdayData = useMemo(
    () => weekdayChartData.datasets.some((d) => d.data.some((v: number) => v > 0)),
    [weekdayChartData],
  )
  const hasData = hasHolidayData || hasWeekdayData

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 400,
        easing: 'easeOutQuart' as const,
      },
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: '日別 活動時間',
        },
        tooltip: {
          callbacks: {
            label: function (context: { dataset: { label?: string }; parsed: { y: number | null } }) {
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
    }),
    [],
  )

  const createChartData = useCallback(
    (
      datesWithData: Date[],
      dailyActivityDurations: {
        [dateKey: string]: { [categoryKey: string]: number }
      },
    ) => {
      const sortedDates = [...datesWithData].sort((a, b) => b.getTime() - a.getTime()).slice(0, 8)

      const labels = [...sortedDates].reverse().map((date) => {
        const dayOfWeek = date.toLocaleDateString('ja-JP', { weekday: 'short' }).slice(0, 1) // Extract single kanji for day of week
        const label = date.toLocaleDateString('ja-JP', {
          month: '2-digit',
          day: '2-digit',
        })
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
    },
    [],
  )

  useEffect(() => {
    const initialize = () => {
      setIsLoading(true)

      // 1. 休日マップの読み込み
      const savedHolidayMap = localStorage.getItem(LOCAL_STORAGE_HOLIDAY_MAP_KEY)
      const holidayMap = savedHolidayMap ? JSON.parse(savedHolidayMap) : {}

      // 2. アクティビティの読み込み
      const today = new Date()
      const holidayDailyActivityDurations: {
        [dateKey: string]: { [categoryKey: string]: number }
      } = {}
      const weekdayDailyActivityDurations: {
        [dateKey: string]: { [categoryKey: string]: number }
      } = {}
      const holidayDatesWithData: Date[] = []
      const weekdayDatesWithData: Date[] = []

      // 直近30日分くらいを探索対象とする
      for (let i = 0; i < 30; i++) {
        const date = new Date(today.getTime() - i * A_DAY_IN_MILLISECONDS)
        const dateKey = getDateKey(date)
        const storageKey = `${LOCAL_STORAGE_ACTIVITY_PREFIX}${dateKey}`
        const saved = localStorage.getItem(storageKey)

        if (saved) {
          const timeSlotsData = JSON.parse(saved)

          let totalActivitiesInDay = 0
          const currentDayDurations: { [categoryKey: string]: number } = {}

          for (const slotKey in timeSlotsData) {
            const activitiesInSlot = timeSlotsData[slotKey] as Activity[]
            const numActivitiesInSlot = activitiesInSlot.length

            if (numActivitiesInSlot > 0) {
              totalActivitiesInDay += numActivitiesInSlot
              const durationPerActivity = 120 / numActivitiesInSlot

              for (const activity of activitiesInSlot) {
                const categoryKey = activity.categoryKey
                currentDayDurations[categoryKey] = (currentDayDurations[categoryKey] || 0) + durationPerActivity
              }
            }
          }

          if (totalActivitiesInDay > 0) {
            // ステートの更新を待たずに、パースしたばかりのマップを直接使う
            if (isHolidayUtil(date, holidayMap)) {
              holidayDatesWithData.push(date)
              holidayDailyActivityDurations[dateKey] = currentDayDurations
            } else {
              weekdayDatesWithData.push(date)
              weekdayDailyActivityDurations[dateKey] = currentDayDurations
            }
          }
        }
      }

      setHolidayChartData(createChartData(holidayDatesWithData, holidayDailyActivityDurations))
      setWeekdayChartData(createChartData(weekdayDatesWithData, weekdayDailyActivityDurations))

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
          {hasHolidayData && (
            <div className="mt-5">
              <h4 className="mb-2 font-semibold">過去の活動(休日)</h4>
              <div className="relative mx-auto h-125 w-full max-w-200">
                <Bar data={holidayChartData} options={chartOptions} />
              </div>
            </div>
          )}
          {hasWeekdayData && (
            <div className="mt-5">
              <h4 className="mb-2 font-semibold">過去の活動(平日)</h4>
              <div className="relative mx-auto h-125 w-full max-w-200">
                <Bar data={weekdayChartData} options={chartOptions} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p>記録された活動データがありません。</p>
        </div>
      )}
    </div>
  )
}

export default ActivityStats
