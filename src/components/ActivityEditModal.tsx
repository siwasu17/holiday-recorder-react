import React, { useState, useMemo } from 'react'
import type { Activity } from '@/types'
import { CATEGORIES } from '@/constants'

interface Props {
  show: boolean
  slotLabel: string | null
  slotIndex: number
  activity: Activity | null
  onClose: () => void
  onUpdateActivityCategory: (categoryKey: string) => void
  onUpdateActivityMemo: (memo: string) => void
  onDeleteActivity: () => void
}

const ActivityEditModal: React.FC<Props> = ({
  show,
  slotLabel,
  slotIndex,
  activity,
  onClose,
  onUpdateActivityCategory,
  onUpdateActivityMemo,
  onDeleteActivity,
}) => {
  const [prevActivity, setPrevActivity] = useState(activity)
  const [memo, setMemo] = useState(activity?.memo || '')

  if (activity !== prevActivity) {
    setPrevActivity(activity)
    setMemo(activity?.memo || '')
  }

  const categoryLabel = useMemo(() => {
    return (
      CATEGORIES.find((c) => c.key === activity?.categoryKey)?.label ?? '不明'
    )
  }, [activity])

  if (!show) return null

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.6)] flex justify-center items-center z-[1000]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white p-[20px] rounded-[12px] w-[90%] max-w-[400px] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
        <div className="flex items-baseline gap-[10px] mb-[15px] justify-between">
          <div className="text-[1.5rem] text-[#333]">{categoryLabel}</div>
          <span className="text-[#666] text-[0.8rem]">
            {slotLabel} #{slotIndex + 1}
          </span>
          <button
            onClick={onDeleteActivity}
            className="border-none p-[10px] rounded-[6px] cursor-pointer bg-[#ff4d4f] text-white"
          >
            削除
          </button>
        </div>

        <div>
          <p>別のカテゴリに変更：</p>
          <div className="grid grid-cols-3 gap-[8px] mt-[10px]">
            {CATEGORIES.map((category) => (
              <button
                key={category.key}
                className="p-[8px_4px] border-none rounded-[4px] text-[0.8rem] cursor-pointer"
                style={{ backgroundColor: category.color }}
                onClick={() => onUpdateActivityCategory(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-[10px] mt-[20px] items-center">
          <input
            id="memo-input"
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモを入力"
            className="flex-grow p-[8px_10px] border border-[#ccc] rounded-[6px] text-[1rem]"
          />
        </div>

        <div className="flex flex-col gap-[10px] mt-[20px]">
          <button
            onClick={() => onUpdateActivityMemo(memo)}
            className="bg-[#007bff] text-white border-none p-[8px_15px] rounded-[6px] cursor-pointer whitespace-nowrap transition-colors duration-200 hover:bg-[#0056b3]"
          >
            保存
          </button>
          <button
            onClick={onClose}
            className="border-none p-[10px] rounded-[6px] cursor-pointer bg-[#f0f0f0]"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActivityEditModal
