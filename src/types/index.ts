export interface TimeSlot {
  start: string
  label: string
}

export interface Category {
  key: string
  label: string
  color: string
  darkColor: string
}

export interface Activity {
  id: string
  categoryKey: string
  memo: string
}
