import React from 'react'
import { CATEGORIES } from '@/constants'

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
    <div className="fixed left-0 right-0 bottom-0 bg-surface p-[10px] shadow-[0_-2px_4px_rgba(0,0,0,0.1)] z-10">
      <div className="flex justify-center gap-[100px] mb-[4px]">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="bg-none border border-[#ddd] rounded-[15px] px-[12px] py-[2px] text-[0.8rem] text-[#666] cursor-pointer transition-all duration-200 disabled:text-[#ccc] disabled:border-[#eee] disabled:cursor-not-allowed enabled:hover:bg-[#f9f9f9] enabled:hover:border-[#bbb]"
        >
          ↩ Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="bg-none border border-[#ddd] rounded-[15px] px-[12px] py-[2px] text-[0.8rem] text-[#666] cursor-pointer transition-all duration-200 disabled:text-[#ccc] disabled:border-[#eee] disabled:cursor-not-allowed enabled:hover:bg-[#f9f9f9] enabled:hover:border-[#bbb]"
        >
          Redo ↪
        </button>
      </div>
      <div className="grid grid-cols-3 gap-[8px] mt-[10px]">
        {CATEGORIES.map((category) => (
          <button
            key={category.key}
            className="px-[4px] py-[8px] border-none rounded-[4px] text-[0.8rem] cursor-pointer"
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
