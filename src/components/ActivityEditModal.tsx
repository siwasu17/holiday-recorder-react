import React, { useState, useMemo } from 'react'
import type { Activity } from '@/types'
import { CATEGORIES } from '@/constants'
import './ActivityEditModal.css'

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
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="header-container">
          <div className="category-label">{categoryLabel}</div>
          <span className="slot-info">
            {slotLabel} #{slotIndex + 1}
          </span>
          <button onClick={onDeleteActivity} className="delete-button">
            削除
          </button>
        </div>

        <div>
          <p>別のカテゴリに変更：</p>
          <div className="category-grid">
            {CATEGORIES.map((category) => (
              <button
                key={category.key}
                className="mini-category-button"
                style={{ backgroundColor: category.color }}
                onClick={() => onUpdateActivityCategory(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="memo-input-container">
          <input
            id="memo-input"
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモを入力"
          />
        </div>

        <div className="modal-footer">
          <button
            onClick={() => onUpdateActivityMemo(memo)}
            className="save-memo-button"
          >
            保存
          </button>
          <button onClick={onClose} className="cancel-button">
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActivityEditModal
