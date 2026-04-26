import type { Activity } from '@/types'
import { CATEGORIES, ACTIVITY_DURATION_MINUTES } from '@/constants'
import { isHoliday as isHolidayUtil } from '@/utils/date'

export interface DailyDurations {
  [categoryKey: string]: number
}

export interface StatsResult {
  holidayDailyActivityDurations: Record<string, DailyDurations>
  weekdayDailyActivityDurations: Record<string, DailyDurations>
  holidayDatesWithData: Date[]
  weekdayDatesWithData: Date[]
}

export const statsService = {
  calculateDailyDurations(activitiesEntries: { date: string; slots: Record<string, Activity[]> }[], holidayMap: Record<string, boolean>): StatsResult {
    const holidayDailyActivityDurations: Record<string, DailyDurations> = {}
    const weekdayDailyActivityDurations: Record<string, DailyDurations> = {}
    const holidayDatesWithData: Date[] = []
    const weekdayDatesWithData: Date[] = []

    for (const entry of activitiesEntries) {
      const date = new Date(entry.date)
      const dateKey = entry.date
      const timeSlotsData = entry.slots

      let totalActivitiesInDay = 0
      const currentDayDurations: DailyDurations = {}

      for (const slotKey in timeSlotsData) {
        const activitiesInSlot = timeSlotsData[slotKey]
        const numActivitiesInSlot = activitiesInSlot.length

        if (numActivitiesInSlot > 0) {
          totalActivitiesInDay += numActivitiesInSlot

          for (const activity of activitiesInSlot) {
            const categoryKey = activity.categoryKey
            currentDayDurations[categoryKey] = (currentDayDurations[categoryKey] || 0) + ACTIVITY_DURATION_MINUTES
          }
        }
      }

      if (totalActivitiesInDay > 0) {
        if (isHolidayUtil(date, holidayMap)) {
          holidayDatesWithData.push(date)
          holidayDailyActivityDurations[dateKey] = currentDayDurations
        } else {
          weekdayDatesWithData.push(date)
          weekdayDailyActivityDurations[dateKey] = currentDayDurations
        }
      }
    }

    return {
      holidayDailyActivityDurations,
      weekdayDailyActivityDurations,
      holidayDatesWithData,
      weekdayDatesWithData,
    }
  },

  getChartDatasets(sortedDates: Date[], dailyActivityDurations: Record<string, DailyDurations>, getDateKey: (date: Date) => string) {
    return CATEGORIES
      .filter((category) => category.key !== 'nop')
      .map((category) => {
        const data = sortedDates
          .map((date) => {
            const dateData = dailyActivityDurations[getDateKey(date)]
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
  }
}
