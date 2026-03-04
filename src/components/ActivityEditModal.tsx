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
    return CATEGORIES.find((c) => c.key === activity?.categoryKey)?.label ?? '不明'
  }, [activity])

  if (!show) return null

  return (
    <div
      className="fixed top-0 left-0 z-[1000] flex h-full w-full items-center justify-center bg-[rgba(0,0,0,0.6)]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-[90%] max-w-[400px] rounded-[12px] bg-white p-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
        <div className="mb-[15px] flex items-baseline justify-between gap-[10px]">
          <div className="text-[1.5rem] text-[#333]">{categoryLabel}</div>
          <span className="text-[0.8rem] text-[#666]">
            {slotLabel} #{slotIndex + 1}
          </span>
          <button
            onClick={onDeleteActivity}
            className="cursor-pointer rounded-[6px] border-none bg-[#ff4d4f] p-[10px] text-white"
          >
            削除
          </button>
        </div>

        <div>
          <p>別のカテゴリに変更：</p>
          <div className="mt-[10px] grid grid-cols-3 gap-[8px]">
            {CATEGORIES.map((category) => (
              <button
                key={category.key}
                className="cursor-pointer rounded-[4px] border-none p-[8px_4px] text-[0.8rem]"
                style={{ backgroundColor: category.color }}
                onClick={() => onUpdateActivityCategory(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-[20px] flex items-center gap-[10px]">
          <input
            id="memo-input"
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモを入力"
            className="grow rounded-md border border-[#ccc] p-[8px_10px] text-[1rem]"
          />
        </div>

        <div className="mt-[20px] flex flex-col gap-[10px]">
          <button
            onClick={() => onUpdateActivityMemo(memo)}
            className="cursor-pointer rounded-md border-none bg-[#007bff] p-[8px_15px] whitespace-nowrap text-white transition-colors duration-200 hover:bg-[#0056b3]"
          >
            保存
          </button>
          <button onClick={onClose} className="cursor-pointer rounded-md border-none bg-[#f0f0f0] p-2.5">
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActivityEditModal
