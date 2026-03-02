import React from 'react'

interface Props {
  formattedDate: string
  isHoliday: boolean
  onPreviousDay: () => void
  onNextDay: () => void
  onToggleHoliday: () => void
}

const TimeTrackerToolbar: React.FC<Props> = ({
  formattedDate,
  isHoliday,
  onPreviousDay,
  onNextDay,
  onToggleHoliday,
}) => {
  return (
    <div className="bg-surface p-0 shadow-[0_2px_4px_rgba(0,0,0,0.05)] sticky top-header z-10 w-full">
      <div className="flex justify-between items-center p-[10px] h-[50px] box-border">
        <button
          onClick={onPreviousDay}
          className="bg-transparent border border-border-main text-text-main px-[16px] py-[6px] rounded-[20px] text-[0.9rem] font-medium cursor-pointer transition-all duration-200 outline-none flex items-center justify-center min-w-[40px] hover:bg-accent-soft"
        >
          &lt; Prev
        </button>
        <div className="text-[1.1rem] font-semibold tracking-[0.05em] flex flex-col items-center">
          {formattedDate}
          <label className="flex items-center text-[0.75rem] cursor-pointer select-none font-normal">
            <input
              type="checkbox"
              checked={isHoliday}
              onChange={onToggleHoliday}
              className="mr-[4px] w-[12px] h-[12px]"
            />
            <span>休日</span>
          </label>
        </div>
        <button
          onClick={onNextDay}
          className="bg-transparent border border-border-main text-text-main px-[16px] py-[6px] rounded-[20px] text-[0.9rem] font-medium cursor-pointer transition-all duration-200 outline-none flex items-center justify-center min-w-[40px] hover:bg-accent-soft"
        >
          Next &gt;
        </button>
      </div>
    </div>
  )
}

export default TimeTrackerToolbar
