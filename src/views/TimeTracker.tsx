import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getDateKey, isHoliday as isHolidayUtil } from '@/utils/date'
import { CATEGORIES, TIME_SLOTS } from '@/constants'
import { activityService, type ActivityMap } from '@/services/activityService'
import { useActivityManager } from '@/hooks/useActivityManager'
import TimeTrackerToolbar from '@/components/TimeTrackerToolbar'
import TimeTrackerActionFooter from '@/components/TimeTrackerActionFooter'
import ActivityEditModal from '@/components/ActivityEditModal'
import type { TimeSlot, Activity } from '@/types'

const getActLabel = (categoryKey: string) => {
  return CATEGORIES.find((c) => c.key === categoryKey)?.label ?? '不明'
}

const getActColor = (categoryKey: string) => {
  return CATEGORIES.find((c) => c.key === categoryKey)?.color ?? '#000000'
}

interface TimeSlotRowProps {
  slot: TimeSlot
  activities: Activity[]
  isActive: boolean
  onClick: () => void
  onActivityClick: (slotStart: string, index: number) => void
}

const TimeSlotRow = ({ slot, activities, isActive, onClick, onActivityClick }: TimeSlotRowProps) => (
  <div
    onClick={onClick}
    className={`border-border-main grid h-22 cursor-pointer grid-cols-[54px_1fr] border-b transition-colors duration-200 hover:bg-[#f9f9f9] ${isActive ? 'bg-accent-soft' : ''}`}
    role="row"
  >
    <div
      className="text-text-sub flex items-center justify-center bg-[#f1efea] p-1 text-[0.7rem] font-bold leading-tight text-center"
      role="cell"
    >
      {slot.label}
    </div>

    <div className="flex flex-1 flex-col gap-0.5 p-1 overflow-hidden" role="cell">
      {activities.map((activity, index) => (
        <div
          key={index}
          className="box-border grid grid-cols-[1fr_auto_1fr] h-5 w-full items-center overflow-hidden rounded-[3px] p-[2px_4px] text-[clamp(0.6rem,1.5vh,0.75rem)] leading-[1.1]"
          style={{ backgroundColor: getActColor(activity.categoryKey) }}
          onClick={(e) => {
            e.stopPropagation()
            onActivityClick(slot.start, index)
          }}
        >
          <div />
          <span className="activity-label whitespace-nowrap">{getActLabel(activity.categoryKey)}</span>
          <div className="flex justify-start pl-1 overflow-hidden">
            {activity.memo && (
              <div className="rounded-[3px] bg-white/60 p-[0px_4px] text-[0.85em] text-ellipsis overflow-hidden whitespace-nowrap text-[#333]">
                {activity.memo}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)

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
        <div className="border-border-main grid w-full grid-cols-2 border-t" role="table">
          {/* 左列（前半のスロット） */}
          <div className="flex flex-col border-r border-border-main">
            {TIME_SLOTS.slice(0, Math.ceil(TIME_SLOTS.length / 2)).map((slot) => (
              <TimeSlotRow
                key={slot.start}
                slot={slot}
                activities={activities[slot.start] ?? []}
                isActive={currentTimeSlot === slot.start}
                onClick={() => setCurrentTimeSlot(slot.start)}
                onActivityClick={openEditModal}
              />
            ))}
          </div>
          {/* 右列（後半のスロット） */}
          <div className="flex flex-col">
            {TIME_SLOTS.slice(Math.ceil(TIME_SLOTS.length / 2)).map((slot) => (
              <TimeSlotRow
                key={slot.start}
                slot={slot}
                activities={activities[slot.start] ?? []}
                isActive={currentTimeSlot === slot.start}
                onClick={() => setCurrentTimeSlot(slot.start)}
                onActivityClick={openEditModal}
              />
            ))}
          </div>
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
