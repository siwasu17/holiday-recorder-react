export const getDateKey = (date: Date): string => {
  // sv-SEはスウェーデン形式だがYYYY-MM-DDにできる
  // タイムゾーンは日本にする
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export const isHoliday = (
  date: Date,
  userDefinedHolidays: Record<string, boolean>
): boolean => {
  const dateKey = getDateKey(date)
  const userDefined = userDefinedHolidays[dateKey]
  if (userDefined !== undefined) {
    return userDefined
  }
  const dayOfWeek = date.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6
}
