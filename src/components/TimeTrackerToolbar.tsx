import React from 'react'

interface Props {
  formattedDate: string
  isHoliday: boolean
  onPreviousDay: () => void
  onNextDay: () => void
  onToggleHoliday: () => void
}

const TimeTrackerToolbar = ({
  formattedDate,
  isHoliday,
  onPreviousDay,
  onNextDay,
  onToggleHoliday,
}: Props) => {
  return (
    <div className="bg-surface top-header sticky z-10 w-full p-0 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
      <div className="box-border flex h-12.5 items-center justify-between p-2.5">
        <button
          onClick={onPreviousDay}
          className="border-border-main text-text-main hover:bg-accent-soft flex min-w-10 cursor-pointer items-center justify-center rounded-[20px] border bg-transparent px-4 py-1.5 text-[0.9rem] font-medium transition-all duration-200 outline-none"
        >
          &lt; Prev
        </button>
        <div className="flex flex-col items-center text-[1.1rem] font-semibold tracking-[0.05em]">
          {formattedDate}
          <label className="flex cursor-pointer items-center text-[0.75rem] font-normal select-none">
            <input
              type="checkbox"
              checked={isHoliday}
              onChange={onToggleHoliday}
              className="mr-1 h-3 w-3"
            />
            <span>休日</span>
          </label>
        </div>
        <button
          onClick={onNextDay}
          className="border-border-main text-text-main hover:bg-accent-soft flex min-w-10 cursor-pointer items-center justify-center rounded-[20px] border bg-transparent px-4 py-1.5 text-[0.9rem] font-medium transition-all duration-200 outline-none"
        >
          Next &gt;
        </button>
      </div>
    </div>
  )
}

export default TimeTrackerToolbar
