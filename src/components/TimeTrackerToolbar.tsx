import React from 'react'
import './TimeTrackerToolbar.css'

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
    <div className="tracker-toolbar">
      <div className="date-navigation">
        <button onClick={onPreviousDay} className="nav-button">
          &lt; Prev
        </button>
        <div className="current-date">
          {formattedDate}
          <label className="holiday-toggle">
            <input
              type="checkbox"
              checked={isHoliday}
              onChange={onToggleHoliday}
            />
            <span>休日</span>
          </label>
        </div>
        <button onClick={onNextDay} className="nav-button">
          Next &gt;
        </button>
      </div>
    </div>
  )
}

export default TimeTrackerToolbar
