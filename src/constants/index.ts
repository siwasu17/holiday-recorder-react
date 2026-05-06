// src/constants/index.ts
import type { Category, TimeSlot } from '@/types'

export const CATEGORIES: Category[] = [
  { key: 'meal', label: '食事', color: '#FFE5D9', darkColor: '#5C3D2E' },
  { key: 'rest', label: '休息', color: '#D6EFFF', darkColor: '#2E4C5C' },
  { key: 'exercise', label: '運動', color: '#E2F0CB', darkColor: '#3D4D2E' },
  { key: 'plan', label: '検討', color: '#E8DFF5', darkColor: '#443552' },
  { key: 'dev_in', label: '開発(In)', color: '#B9F2FF', darkColor: '#2E5C66' },
  { key: 'dev_out', label: '開発(Out)', color: '#89CFF0', darkColor: '#25465C' },
  { key: 'culture', label: '文化', color: '#FCE1E4', darkColor: '#5C2E35' },
  { key: 'event', label: '行事', color: '#F3C4FB', darkColor: '#5C2E5C' },
  { key: 'housework', label: '家事(定)', color: '#FFF9C4', darkColor: '#5C5C2E' },
  { key: 'task', label: '家事(単)', color: '#FFD3D3', darkColor: '#5C2E2E' },
  { key: 'etc', label: 'その他', color: '#F0F4EF', darkColor: '#333D33' },
  { key: 'nop', label: '余白', color: '#E0E0E0', darkColor: '#333333' },
]

export const TIME_SLOTS: TimeSlot[] = [
  { start: '08:00', label: '8-' },
  { start: '10:00', label: '10-' },
  { start: '12:00', label: '12-' },
  { start: '14:00', label: '14-' },
  { start: '16:00', label: '16-' },
  { start: '18:00', label: '18-' },
  { start: '20:00', label: '20-' },
  { start: '22:00', label: '22-' },
  { start: '00:00+', label: '24-' },
]

export const MAX_ACTIVITIES_PER_SLOT = 4
export const ACTIVITY_DURATION_MINUTES = 30

export const LOCAL_STORAGE_ACTIVITY_PREFIX = 'activities-'
export const LOCAL_STORAGE_HOLIDAY_MAP_KEY = 'userDefinedHolidayMap'

export const A_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

export const THEME_COLORS = {
  light: {
    textMain: '#4a4945',
    textSub: '#8c8b85',
    grid: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    textMain: '#e0e0e0',
    textSub: '#a0a0a0',
    grid: 'rgba(255, 255, 255, 0.1)',
  },
} as const

