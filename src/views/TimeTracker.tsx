import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getDateKey, isHoliday as isHolidayUtil } from '@/utils/date'
import { CATEGORIES, TIME_SLOTS } from '@/constants'
import { activityService, type ActivityMap } from '@/services/activityService'
import { useActivityManager } from '@/hooks/useActivityManager'
import TimeTrackerToolbar from '@/components/TimeTrackerToolbar'
import TimeTrackerActionFooter from '@/components/TimeTrackerActionFooter'
import ActivityEditModal from '@/components/ActivityEditModal'

interface TimeTrackerContentProps {
  dateKey: string
  currentDate: Date
  initialActivities: ActivityMap
  isHoliday: boolean
  onPreviousDay: () => void
  onNextDay: () => void
  onToggleHoliday: () => void
}

const TimeTrackerContent = ({
  dateKey,
  currentDate,
  initialActivities,
  isHoliday,
  onPreviousDay,
  onNextDay,
  onToggleHoliday,
}: TimeTrackerContentProps) => {
  const {
    activities,
    currentTimeSlot,
    setCurrentTimeSlot,
    canUndo,
    canRedo,
    undoAct,
    redoAct,
    selectCategory,
    editingActivity,
    editingSlotKey,
    editingSlotIndex,
    isModalOpen,
    openEditModal,
    closeEditModal,
    updateActivityMemo,
    updateActivityCategory,
    deleteActivity,
  } = useActivityManager(dateKey, initialActivities)

  const formattedDate = useMemo(() => {
    return currentDate.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    })
  }, [currentDate])

  const getActLabel = (categoryKey: string) => {
    return CATEGORIES.find((c) => c.key === categoryKey)?.label ?? '不明'
  }

  const getActColor = (categoryKey: string) => {
    return CATEGORIES.find((c) => c.key === categoryKey)?.color ?? '#000000'
  }

  return (
    <div className="flex h-[calc(100dvh-(var(--spacing-header)))] flex-col">
      <TimeTrackerToolbar
        formattedDate={formattedDate}
        isHoliday={isHoliday}
        onPreviousDay={onPreviousDay}
        onNextDay={onNextDay}
        onToggleHoliday={onToggleHoliday}
      />

      <main className="flex-1 overflow-y-auto pb-57.5">
        <div className="border-border-main flex w-full flex-col border-t" role="table">
          {TIME_SLOTS.map((slot) => (
            <div
              key={slot.start}
              onClick={() => setCurrentTimeSlot(slot.start)}
              className={`border-border-main grid min-h-22 cursor-pointer grid-cols-[80px_1fr] border-b transition-colors duration-200 hover:bg-[#f9f9f9] ${currentTimeSlot === slot.start ? 'bg-accent-soft' : ''}`}
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
                    className="box-border flex h-5 w-full flex-col items-center justify-center overflow-hidden rounded-[3px] p-[2px_4px] text-[clamp(0.6rem,1.5vh,0.75rem)] leading-[1.1] text-ellipsis whitespace-nowrap"
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

const TimeTracker = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const dateKey = useMemo(() => getDateKey(currentDate), [currentDate])

  const dbActivityEntry = useLiveQuery(() => activityService.getActivities(dateKey), [dateKey])
  const dbHolidayEntry = useLiveQuery(() => activityService.getHoliday(dateKey), [dateKey])

  const isHoliday = useMemo(() => {
    const userDefinedHolidays: Record<string, boolean> = {}
    if (dbHolidayEntry !== null && dbHolidayEntry !== undefined) {
      userDefinedHolidays[dateKey] = dbHolidayEntry
    }
    return isHolidayUtil(currentDate, userDefinedHolidays)
  }, [currentDate, dateKey, dbHolidayEntry])

  const changeDay = (days: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + days)
    setCurrentDate(newDate)
  }

  const toggleHoliday = async () => {
    await activityService.saveHoliday(dateKey, !isHoliday)
  }

  if (dbActivityEntry === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <div className="text-gray-500 text-sm">読み込み中...</div>
      </div>
    )
  }

  return (
    <TimeTrackerContent
      key={dateKey}
      dateKey={dateKey}
      currentDate={currentDate}
      initialActivities={dbActivityEntry ?? {}}
      isHoliday={isHoliday}
      onPreviousDay={() => changeDay(-1)}
      onNextDay={() => changeDay(1)}
      onToggleHoliday={toggleHoliday}
    />
  )
}

export default TimeTracker
