import React, { useState, useMemo } from 'react'
import { getDateKey, isHoliday as isHolidayUtil } from '@/utils/date'
import type { Activity } from '@/types'
import {
  CATEGORIES,
  TIME_SLOTS,
  MAX_ACTIVITIES_PER_SLOT,
  LOCAL_STORAGE_ACTIVITY_PREFIX,
  LOCAL_STORAGE_HOLIDAY_MAP_KEY,
} from '@/constants'
import TimeTrackerToolbar from '@/components/TimeTrackerToolbar'
import TimeTrackerActionFooter from '@/components/TimeTrackerActionFooter'
import ActivityEditModal from '@/components/ActivityEditModal'

type ActivityMap = Record<string, Activity[]>

const TimeTracker = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [prevDate, setPrevDate] = useState(currentDate)
  const [currentTimeSlot, setCurrentTimeSlot] = useState<string | null>(null)

  const [userDefinedHolidayMap, setUserDefinedHolidayMap] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_HOLIDAY_MAP_KEY)
    return saved ? JSON.parse(saved) : {}
  })

  const [activities, setActivities] = useState<ActivityMap>(() => {
    const key = `${LOCAL_STORAGE_ACTIVITY_PREFIX}${getDateKey(currentDate)}`
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : {}
  })

  const [actHistories, setActHistories] = useState<ActivityMap[]>([activities])
  const [actHistoriesIndex, setActHistoriesIndex] = useState(0)

  if (currentDate !== prevDate) {
    setPrevDate(currentDate)
    const key = `${LOCAL_STORAGE_ACTIVITY_PREFIX}${getDateKey(currentDate)}`
    const saved = localStorage.getItem(key)
    const newActivities = saved ? JSON.parse(saved) : {}
    setActivities(newActivities)
    setActHistories([newActivities])
    setActHistoriesIndex(0)
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSlotKey, setEditingSlotKey] = useState<string | null>(null)
  const [editingSlotIndex, setEditingSlotIndex] = useState<number>(-1)

  const editingActivity = useMemo(() => {
    if (!editingSlotKey || editingSlotIndex === -1) return null
    return activities[editingSlotKey]?.[editingSlotIndex] ?? null
  }, [activities, editingSlotKey, editingSlotIndex])

  const formattedDate = useMemo(() => {
    return currentDate.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    })
  }, [currentDate])

  const isHoliday = useMemo(() => {
    return isHolidayUtil(currentDate, userDefinedHolidayMap)
  }, [currentDate, userDefinedHolidayMap])

  const canUndo = actHistoriesIndex > 0
  const canRedo = actHistoriesIndex + 1 < actHistories.length

  const saveToLocalStorage = (newActivities: ActivityMap) => {
    const key = `${LOCAL_STORAGE_ACTIVITY_PREFIX}${getDateKey(currentDate)}`
    localStorage.setItem(key, JSON.stringify(newActivities))
  }

  const saveHistory = (newActivities: ActivityMap) => {
    const newIndex = actHistoriesIndex + 1
    const newHistories = actHistories.slice(0, newIndex)
    newHistories.push(newActivities)
    setActHistories(newHistories)
    setActHistoriesIndex(newIndex)
    setActivities(newActivities)
    saveToLocalStorage(newActivities)
  }

  const createActivity = (categoryKey: string): Activity => {
    return {
      id: crypto.randomUUID(),
      categoryKey,
      memo: '',
    }
  }

  const getActLabel = (categoryKey: string) => {
    return CATEGORIES.find((c) => c.key === categoryKey)?.label ?? '不明'
  }

  const getActColor = (categoryKey: string) => {
    return CATEGORIES.find((c) => c.key === categoryKey)?.color ?? '#000000'
  }

  const changeDay = (days: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + days)
    setCurrentDate(newDate)
  }

  const previousDay = () => changeDay(-1)
  const nextDay = () => changeDay(1)

  const saveUserDefinedHoliday = () => {
    const dateKey = getDateKey(currentDate)
    const newMap = { ...userDefinedHolidayMap }

    if (newMap[dateKey] !== undefined) {
      delete newMap[dateKey]
    } else {
      newMap[dateKey] = !isHoliday
    }
    setUserDefinedHolidayMap(newMap)
    localStorage.setItem(LOCAL_STORAGE_HOLIDAY_MAP_KEY, JSON.stringify(newMap))
  }

  const moveToNextSlot = (currentSlot: string) => {
    const currentIndex = TIME_SLOTS.findIndex((slot) => slot.start === currentSlot)
    const nextIndex = currentIndex + 1
    setCurrentTimeSlot(nextIndex >= TIME_SLOTS.length ? null : (TIME_SLOTS[nextIndex]?.start ?? null))
  }

  const selectCategory = (categoryKey: string) => {
    if (!currentTimeSlot) return
    const timeSlot = currentTimeSlot
    const currentActivitiesInSlot = [...(activities[timeSlot] ?? [])]

    if (currentActivitiesInSlot.length < MAX_ACTIVITIES_PER_SLOT) {
      currentActivitiesInSlot.push(createActivity(categoryKey))
      const newActivities = { ...activities, [timeSlot]: currentActivitiesInSlot }
      saveHistory(newActivities)

      if (currentActivitiesInSlot.length === MAX_ACTIVITIES_PER_SLOT) {
        moveToNextSlot(timeSlot)
      }
    }
  }

  const undoAct = () => {
    if (!canUndo) return
    const newIndex = actHistoriesIndex - 1
    const targetState = actHistories[newIndex]
    setActHistoriesIndex(newIndex)
    setActivities(targetState)
    saveToLocalStorage(targetState)
  }

  const redoAct = () => {
    if (!canRedo) return
    const newIndex = actHistoriesIndex + 1
    const targetState = actHistories[newIndex]
    setActHistoriesIndex(newIndex)
    setActivities(targetState)
    saveToLocalStorage(targetState)
  }

  const selectTimeSlot = (timeSlotKey: string) => {
    setCurrentTimeSlot(timeSlotKey)
  }

  const openEditModal = (slotStart: string, index: number) => {
    setEditingSlotKey(slotStart)
    setEditingSlotIndex(index)
    setIsModalOpen(true)
  }

  const closeEditModal = () => {
    setIsModalOpen(false)
    setEditingSlotKey(null)
    setEditingSlotIndex(-1)
  }

  const updateActivity = (updater: (list: Activity[]) => Activity[]) => {
    if (!editingSlotKey || editingSlotIndex === -1) return
    const currentList = [...(activities[editingSlotKey] ?? [])]
    const newList = updater(currentList)
    const newActivities = { ...activities, [editingSlotKey]: newList }
    saveHistory(newActivities)
    closeEditModal()
  }

  const updateActivityMemo = (newMemo: string) => {
    if (!editingActivity) return
    updateActivity((list) => {
      const newList = [...list]
      newList[editingSlotIndex] = { ...editingActivity, memo: newMemo }
      return newList
    })
  }

  const updateActivityCategory = (newCategoryKey: string) => {
    updateActivity((list) => {
      const newList = [...list]
      newList[editingSlotIndex] = createActivity(newCategoryKey)
      return newList
    })
  }

  const deleteActivity = () => {
    updateActivity((list) => {
      const newList = [...list]
      newList.splice(editingSlotIndex, 1)
      return newList
    })
  }

  return (
    <div className="h-[calc(100dvh-(var(--spacing-header)))] flex flex-col">
      <TimeTrackerToolbar
        formattedDate={formattedDate}
        isHoliday={isHoliday}
        onPreviousDay={previousDay}
        onNextDay={nextDay}
        onToggleHoliday={saveUserDefinedHoliday}
      />

      <main className="flex-1 overflow-y-auto pb-57.5">
        <div className="border-border-main flex w-full flex-col border-t" role="table">
          {TIME_SLOTS.map((slot) => (
            <div
              key={slot.start}
              onClick={() => selectTimeSlot(slot.start)}
              className={`border-border-main grid min-h-15 cursor-pointer grid-cols-[80px_1fr] border-b transition-colors duration-200 hover:bg-[#f9f9f9] ${currentTimeSlot === slot.start ? 'bg-accent-soft' : ''}`}
              role="row"
            >
              <div
                className="text-text-sub flex items-center justify-center bg-[#f1efea] p-1 text-[0.8rem] font-bold"
                role="cell"
              >
                {slot.label}
              </div>

              <div className="flex flex-col gap-0.5 p-1" role="cell">
                {(activities[slot.start] ?? []).map((activity, index) => (
                  <div
                    key={index}
                    className="box-border flex w-full grow flex-col items-center justify-center overflow-hidden rounded-[3px] p-[2px_4px] text-[clamp(0.6rem,1.5vh,0.75rem)] leading-[1.2] text-ellipsis whitespace-nowrap"
                    style={{ backgroundColor: getActColor(activity.categoryKey) }}
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditModal(slot.start, index)
                    }}
                  >
                    <span className="activity-label">{getActLabel(activity.categoryKey)}</span>
                    {activity.memo && (
                      <div className="mt-0.5 max-w-full overflow-hidden rounded-[3px] bg-white p-[1px_4px] text-[0.8em] text-ellipsis whitespace-nowrap text-[#333]">
                        {activity.memo}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <ActivityEditModal
        show={isModalOpen}
        activity={editingActivity}
        slotLabel={editingSlotKey}
        slotIndex={editingSlotIndex}
        onClose={closeEditModal}
        onUpdateActivityCategory={updateActivityCategory}
        onUpdateActivityMemo={updateActivityMemo}
        onDeleteActivity={deleteActivity}
      />

      <TimeTrackerActionFooter
        canUndo={canUndo}
        canRedo={canRedo}
        onSelectCategory={selectCategory}
        onUndo={undoAct}
        onRedo={redoAct}
      />
    </div>
  )
}

export default TimeTracker
