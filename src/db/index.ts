import Dexie, { type Table } from 'dexie'
import type { Activity } from '@/types'

export interface ActivityEntry {
  date: string // YYYY-MM-DD
  slots: Record<string, Activity[]>
}

export interface HolidayEntry {
  date: string // YYYY-MM-DD
  isHoliday: boolean
}

export class AppDatabase extends Dexie {
  activities!: Table<ActivityEntry>
  holidays!: Table<HolidayEntry>

  constructor() {
    super('HolidayRecorderDB')
    this.version(1).stores({
      activities: 'date',
      holidays: 'date',
    })
  }
}

export const db = new AppDatabase()
