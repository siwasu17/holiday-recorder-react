import { useState, useEffect } from 'react'

export const useCurrentTime = () => {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    let timerId: ReturnType<typeof setInterval> | null = null

    // 次の00秒までの時間を計算して、そこから1分間隔のインターバルを開始する
    const startTimer = () => {
      const msUntilNextMinute = 60000 - (new Date().getTime() % 60000)

      const timeoutId = setTimeout(() => {
        setNow(new Date())
        timerId = setInterval(() => {
          setNow(new Date())
        }, 60000)
      }, msUntilNextMinute)

      return () => {
        clearTimeout(timeoutId)
        if (timerId) clearInterval(timerId)
      }
    }

    return startTimer()
  }, [])

  return now
}
