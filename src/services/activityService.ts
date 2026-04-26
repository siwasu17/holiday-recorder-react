import { db } from '@/db'
import type { Activity } from '@/types'

export type ActivityMap = Record<string, Activity[]>

export const activityService = {
  async getActivities(dateKey: string): Promise<ActivityMap | null> {
    const entry = await db.activities.get(dateKey)
    return entry?.slots || null
  },

  async saveActivities(dateKey: string, slots: ActivityMap): Promise<void> {
    await db.activities.put({
      date: dateKey,
      slots,
    })
  },

  async getHoliday(dateKey: string): Promise<boolean | null> {
    const entry = await db.holidays.get(dateKey)
    return entry?.isHoliday ?? null
  },

  async saveHoliday(dateKey: string, isHoliday: boolean): Promise<void> {
    await db.holidays.put({
      date: dateKey,
      isHoliday,
    })
  },

  async getActivitiesInRange(startDateKey: string, endDateKey: string) {
    return await db.activities.where('date').between(startDateKey, endDateKey, true, true).toArray()
  },

  async getAllHolidays() {
    return await db.holidays.toArray()
  },
}
