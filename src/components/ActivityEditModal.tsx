import { useState } from 'react'
import type { Activity } from '@/types'
import { CATEGORIES } from '@/constants'
import CategoryGrid from './CategoryGrid'
import { useThemeContext } from '@/hooks/useThemeContext'

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

const ActivityEditModal = ({
  show,
  slotLabel,
  slotIndex,
  activity,
  onClose,
  onUpdateActivityCategory,
  onUpdateActivityMemo,
  onDeleteActivity,
}: Props) => {
  const [prevActivity, setPrevActivity] = useState(activity)
  const [memo, setMemo] = useState(activity?.memo || '')
  const { isDark } = useThemeContext()

  if (activity !== prevActivity) {
    setPrevActivity(activity)
    setMemo(activity?.memo || '')
  }

  const category = CATEGORIES.find((c) => c.key === activity?.categoryKey)

  if (!show) return null

  const categoryColor = category ? (isDark ? category.darkColor : category.color) : 'transparent'

  return (
    <div
      className="fixed top-0 left-0 z-1000 flex h-full w-full items-center justify-center bg-[rgba(0,0,0,0.6)]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface w-[90%] max-w-100 rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
        <div className="mb-3.75 flex items-baseline justify-between gap-2.5">
          <span className="text-text-sub text-[0.8rem]">
            {slotLabel} #{slotIndex + 1}
          </span>
          <div
            className="text-text-main rounded-md p-[4px_12px] text-[1.2rem] font-bold transition-colors duration-200"
            style={{ backgroundColor: categoryColor }}
          >
            {category?.label ?? '不明'}
          </div>
          <button
            type="button"
            onClick={onDeleteActivity}
            className="hover:bg-error-hover cursor-pointer rounded-md border-none bg-error p-2.5 text-white transition-colors duration-200"
          >
            削除
          </button>
        </div>

        <div>
          <p className="text-text-main">別のカテゴリに変更：</p>
          <CategoryGrid onSelectCategory={onUpdateActivityCategory} buttonClassName="p-[8px_4px]" />
        </div>

        <div className="mt-5 flex items-center gap-2.5">
          <input
            id="memo-input"
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモを入力"
            className="border-border-main bg-surface text-text-main grow rounded-md border p-[8px_10px] text-[1rem]"
          />
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => onUpdateActivityMemo(memo)}
            className="bg-primary hover:bg-primary-hover cursor-pointer rounded-md border-none p-[8px_15px] whitespace-nowrap text-white transition-colors duration-200"
          >
            保存
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-accent-soft text-text-main cursor-pointer rounded-md border-none p-2.5"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActivityEditModal
