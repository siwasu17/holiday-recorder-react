import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useCurrentTime } from '@/hooks/useCurrentTime'
import { getDateKey, isHoliday as isHolidayUtil, isSameDay, getEffectiveToday, parseSlotTime, getMinutesInDay } from '@/utils/date'
import { CATEGORIES, TIME_SLOTS, SLOT_DURATION_MINUTES, TIME_LABEL_COLUMN_WIDTH } from '@/constants'
import { activityService, type ActivityMap } from '@/services/activityService'
import { useActivityManager } from '@/hooks/useActivityManager'
import TimeTrackerToolbar from '@/components/TimeTrackerToolbar'
import TimeTrackerActionFooter from '@/components/TimeTrackerActionFooter'
import ActivityEditModal from '@/components/ActivityEditModal'
import { useThemeContext } from '@/hooks/useThemeContext'
import type { TimeSlot, Activity } from '@/types'

const getActLabel = (categoryKey: string) => {
  return CATEGORIES.find((c) => c.key === categoryKey)?.label ?? '不明'
}

const getActColor = (categoryKey: string, isDark: boolean) => {
  const category = CATEGORIES.find((c) => c.key === categoryKey)
  if (!category) return '#000000'
  return isDark ? category.darkColor : category.color
}

interface TimeSlotRowProps {
  slot: TimeSlot
  activities: Activity[]
  isActive: boolean
  now: Date | null
  onClick: () => void
  onActivityClick: (slotStart: string, index: number) => void
}

const TimeSlotRow = ({ slot, activities, isActive, now, onClick, onActivityClick }: TimeSlotRowProps) => {
  const { isDark } = useThemeContext()

  const getIndicatorTop = () => {
    if (!now) return null
    const slotStartMin = parseSlotTime(slot.start)
    const nowMin = getMinutesInDay(now)
    const diff = nowMin - slotStartMin
    if (diff >= 0 && diff < SLOT_DURATION_MINUTES) {
      return (diff / SLOT_DURATION_MINUTES) * 100
    }
    return null
  }

  const indicatorTop = getIndicatorTop()

  return (
    <div
      onClick={onClick}
      className={`border-border-main hover:bg-accent-soft/50 grid h-24 cursor-pointer border-b transition-colors duration-200 ${isActive ? 'bg-accent-soft' : ''} relative`}
      style={{ gridTemplateColumns: `${TIME_LABEL_COLUMN_WIDTH}px 1fr` }}
      role="row"
    >
      <div
        className="text-text-sub bg-accent-soft/30 flex items-center justify-center p-1 text-center text-[0.7rem] leading-tight font-bold"
        role="cell"
      >
        {slot.label}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden p-1" role="cell">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="text-text-main box-border grid h-5 w-full grid-cols-[1fr_auto_1fr] items-center overflow-hidden rounded-[3px] p-[2px_4px] text-[clamp(0.6rem,1.5vh,0.75rem)] leading-[1.1] transition-colors duration-200"
            style={{ backgroundColor: getActColor(activity.categoryKey, isDark) }}
            onClick={(e) => {
              e.stopPropagation()
              onActivityClick(slot.start, index)
            }}
          >
            <div />
            <span className="activity-label whitespace-nowrap">{getActLabel(activity.categoryKey)}</span>
            <div className="flex justify-start overflow-hidden pl-1">
              {activity.memo && (
                <div className="bg-surface/40 text-text-main overflow-hidden rounded-[3px] p-[0px_4px] text-[0.85em] text-ellipsis whitespace-nowrap">
                  {activity.memo}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {indicatorTop !== null && (
        <div
          className="pointer-events-none absolute z-10 border-t border-blue-400/60"
          style={{
            top: `${indicatorTop}%`,
            left: `${TIME_LABEL_COLUMN_WIDTH}px`,
            width: `calc(100% - ${TIME_LABEL_COLUMN_WIDTH}px)`,
          }}
        />
      )}
    </div>
  )
}

interface TimeTrackerContentProps {
  dateKey: string
  currentDate: Date
  initialActivities: ActivityMap
  isHoliday: boolean
  now: Date
  isShowingToday: boolean
  onPreviousDay: () => void
  onNextDay: () => void
  onToggleHoliday: () => void
}

const TimeTrackerContent = ({
  dateKey,
  currentDate,
  initialActivities,
  isHoliday,
  now,
  isShowingToday,
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

  const formattedDate = currentDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  })

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
          <div className="border-border-main flex flex-col border-r">
            {TIME_SLOTS.slice(0, Math.ceil(TIME_SLOTS.length / 2)).map((slot) => (
              <TimeSlotRow
                key={slot.start}
                slot={slot}
                activities={activities[slot.start] ?? []}
                isActive={currentTimeSlot === slot.start}
                now={isShowingToday ? now : null}
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
                now={isShowingToday ? now : null}
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
  const now = useCurrentTime()
  const dateKey = getDateKey(currentDate)

  const dbActivityEntry = useLiveQuery(() => activityService.getActivities(dateKey), [dateKey])
  const dbHolidayEntry = useLiveQuery(() => activityService.getHoliday(dateKey), [dateKey])

  const isHoliday = (() => {
    const userDefinedHolidays: Record<string, boolean> = {}
    if (dbHolidayEntry !== null && dbHolidayEntry !== undefined) {
      userDefinedHolidays[dateKey] = dbHolidayEntry
    }
    return isHolidayUtil(currentDate, userDefinedHolidays)
  })()

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
        <div className="text-sm text-gray-500">読み込み中...</div>
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
      now={now}
      isShowingToday={isSameDay(currentDate, getEffectiveToday())}
      onPreviousDay={() => changeDay(-1)}
      onNextDay={() => changeDay(1)}
      onToggleHoliday={toggleHoliday}
    />
  )
}

export default TimeTracker
