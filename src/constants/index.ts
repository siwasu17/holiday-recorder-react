// src/constants/index.ts
import type { Category, TimeSlot } from '@/types'

export const CATEGORIES: Category[] = [
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

export const TIME_SLOTS: TimeSlot[] = [
  { start: '08:00', label: '8 - 10' },
  { start: '10:00', label: '10 - 12' },
  { start: '12:00', label: '12 - 14' },
  { start: '14:00', label: '14 - 16' },
  { start: '16:00', label: '16 - 18' },
  { start: '18:00', label: '18 - 20' },
  { start: '20:00', label: '20 - 22' },
  { start: '22:00', label: '22 - 24' },
  { start: '00:00+', label: '24 - 26' },
]

export const MAX_ACTIVITIES_PER_SLOT = 4
export const ACTIVITY_DURATION_MINUTES = 30

export const LOCAL_STORAGE_ACTIVITY_PREFIX = 'activities-'
export const LOCAL_STORAGE_HOLIDAY_MAP_KEY = 'userDefinedHolidayMap'

export const A_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000
