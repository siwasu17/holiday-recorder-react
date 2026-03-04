import React from 'react'
import { CATEGORIES } from '@/constants'

interface Props {
  canUndo: boolean
  canRedo: boolean
  onSelectCategory: (categoryKey: string) => void
  onUndo: () => void
  onRedo: () => void
}

const TimeTrackerActionFooter: React.FC<Props> = ({ canUndo, canRedo, onSelectCategory, onUndo, onRedo }) => {
  return (
    <div className="bg-surface fixed right-0 bottom-0 left-0 z-10 p-[10px] shadow-[0_-2px_4px_rgba(0,0,0,0.1)]">
      <div className="mb-[4px] flex justify-center gap-[100px]">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="cursor-pointer rounded-[15px] border border-[#ddd] bg-none px-[12px] py-[2px] text-[0.8rem] text-[#666] transition-all duration-200 enabled:hover:border-[#bbb] enabled:hover:bg-[#f9f9f9] disabled:cursor-not-allowed disabled:border-[#eee] disabled:text-[#ccc]"
        >
          ↩ Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="cursor-pointer rounded-[15px] border border-[#ddd] bg-none px-[12px] py-[2px] text-[0.8rem] text-[#666] transition-all duration-200 enabled:hover:border-[#bbb] enabled:hover:bg-[#f9f9f9] disabled:cursor-not-allowed disabled:border-[#eee] disabled:text-[#ccc]"
        >
          Redo ↪
        </button>
      </div>
      <div className="mt-[10px] grid grid-cols-3 gap-[8px]">
        {CATEGORIES.map((category) => (
          <button
            key={category.key}
            className="cursor-pointer rounded-[4px] border-none px-[4px] py-[8px] text-[0.8rem]"
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
