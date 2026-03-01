import React from 'react'
import { CATEGORIES } from '@/constants'
import './TimeTrackerActionFooter.css'

interface Props {
  canUndo: boolean
  canRedo: boolean
  onSelectCategory: (categoryKey: string) => void
  onUndo: () => void
  onRedo: () => void
}

const TimeTrackerActionFooter: React.FC<Props> = ({
  canUndo,
  canRedo,
  onSelectCategory,
  onUndo,
  onRedo,
}) => {
  return (
    <div className="tracker-action-footer">
      <div className="history-controls-inline">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="history-mini-button"
        >
          ↩ Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="history-mini-button"
        >
          Redo ↪
        </button>
      </div>
      <div className="category-grid">
        {CATEGORIES.map((category) => (
          <button
            key={category.key}
            className="mini-category-button"
            style={{ backgroundColor: category.color }}
            onClick={() => onSelectCategory(category.key)}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TimeTrackerActionFooter
