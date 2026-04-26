import { db } from './index'
import { LOCAL_STORAGE_ACTIVITY_PREFIX, LOCAL_STORAGE_HOLIDAY_MAP_KEY } from '@/constants'
import type { Activity } from '@/types'

const MIGRATION_COMPLETED_KEY = 'dexie_migration_completed'

export const migrateFromLocalStorage = async () => {
  if (localStorage.getItem(MIGRATION_COMPLETED_KEY)) {
    return
  }

  console.log('Starting migration from localStorage to IndexedDB...')

  try {
    // 1. 活動データの移行
    const activityEntries: { date: string; slots: Record<string, Activity[]> }[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(LOCAL_STORAGE_ACTIVITY_PREFIX)) {
        const date = key.replace(LOCAL_STORAGE_ACTIVITY_PREFIX, '')
        const saved = localStorage.getItem(key)
        if (saved) {
          activityEntries.push({
            date,
            slots: JSON.parse(saved) as Record<string, Activity[]>,
          })
        }
      }
    }

    if (activityEntries.length > 0) {
      await db.activities.bulkPut(activityEntries)
      console.log(`Migrated ${activityEntries.length} activity entries.`)
    }

    // 2. 休日設定の移行
    const savedHolidayMap = localStorage.getItem(LOCAL_STORAGE_HOLIDAY_MAP_KEY)
    if (savedHolidayMap) {
      const holidayMap = JSON.parse(savedHolidayMap)
      const holidayEntries = Object.entries(holidayMap).map(([date, isHoliday]) => ({
        date,
        isHoliday: isHoliday as boolean,
      }))

      if (holidayEntries.length > 0) {
        await db.holidays.bulkPut(holidayEntries)
        console.log(`Migrated ${holidayEntries.length} holiday settings.`)
      }
    }

    localStorage.setItem(MIGRATION_COMPLETED_KEY, 'true')
    console.log('Migration completed successfully.')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}
