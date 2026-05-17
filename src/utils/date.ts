import { LATE_NIGHT_THRESHOLD_HOUR } from '@/constants'

export const getDateKey = (date: Date): string => {
  // sv-SEはスウェーデン形式だがYYYY-MM-DDにできる
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export const isHoliday = (date: Date, userDefinedHolidays: Record<string, boolean>): boolean => {
  const dateKey = getDateKey(date)
  const userDefined = userDefinedHolidays[dateKey]
  if (userDefined !== undefined) {
    return userDefined
  }
  const dayOfWeek = date.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6
}

/**
 * 4時前なら前日の日付を「今日」と判定する
 */
export const getEffectiveToday = (): Date => {
  const now = new Date()
  if (now.getHours() < LATE_NIGHT_THRESHOLD_HOUR) {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday
  }
  return now
}

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return getDateKey(date1) === getDateKey(date2)
}

/**
 * 08:00 -> 480
 * 22:00 -> 1320
 * 00:00+ -> 1440 (24:00)
 */
export const parseSlotTime = (slotStart: string): number => {
  if (slotStart.endsWith('+')) {
    const [hours, minutes] = slotStart.replace('+', '').split(':').map(Number)
    return (hours + 24) * 60 + (minutes || 0)
  }
  const [hours, minutes] = slotStart.split(':').map(Number)
  return hours * 60 + (minutes || 0)
}

/**
 * 現在の時刻を分（0〜1440+）で返す。
 * 00:00〜LATE_NIGHT_THRESHOLD_HOURの間は、前日の24:00〜として扱う
 */
export const getMinutesInDay = (date: Date): number => {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  if (hours < LATE_NIGHT_THRESHOLD_HOUR) {
    return (hours + 24) * 60 + minutes
  }
  return hours * 60 + minutes
}
