import { useState } from 'react'
import type { Activity } from '@/types'
import { MAX_ACTIVITIES_PER_SLOT, TIME_SLOTS } from '@/constants'
import { activityService, type ActivityMap } from '@/services/activityService'

export const useActivityManager = (dateKey: string, initialActivities: ActivityMap) => {
  const [activities, setActivities] = useState<ActivityMap>(initialActivities)
  const [actHistories, setActHistories] = useState<ActivityMap[]>([initialActivities])
  const [actHistoriesIndex, setActHistoriesIndex] = useState(0)
  const [currentTimeSlot, setCurrentTimeSlot] = useState<string | null>(null)

  const [editingSlotKey, setEditingSlotKey] = useState<string | null>(null)
  const [editingSlotIndex, setEditingSlotIndex] = useState<number>(-1)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Sync with external changes if we haven't started editing yet
  const [prevInitialActivities, setPrevInitialActivities] = useState<ActivityMap>(initialActivities)
  if (initialActivities !== prevInitialActivities) {
    setPrevInitialActivities(initialActivities)
    if (actHistories.length === 1 && actHistoriesIndex === 0) {
      setActivities(initialActivities)
      setActHistories([initialActivities])
    }
  }

  const editingActivity = (() => {
    if (!editingSlotKey || editingSlotIndex === -1) return null
    return activities[editingSlotKey]?.[editingSlotIndex] ?? null
  })()

  const canUndo = actHistoriesIndex > 0
  const canRedo = actHistoriesIndex + 1 < actHistories.length

  const saveHistory = (newActivities: ActivityMap) => {
    const newIndex = actHistoriesIndex + 1
    const newHistories = actHistories.slice(0, newIndex)
    newHistories.push(newActivities)
    setActHistories(newHistories)
    setActHistoriesIndex(newIndex)
    setActivities(newActivities)
    activityService.saveActivities(dateKey, newActivities)
  }

  const createActivity = (categoryKey: string): Activity => {
    return {
      id: crypto.randomUUID(),
      categoryKey,
      memo: '',
    }
  }

  const moveToNextSlot = (currentSlot: string) => {
    const currentIndex = TIME_SLOTS.findIndex((slot) => slot.start === currentSlot)
    const nextIndex = currentIndex + 1
    setCurrentTimeSlot(nextIndex >= TIME_SLOTS.length ? null : (TIME_SLOTS[nextIndex]?.start ?? null))
  }

  const selectCategory = (categoryKey: string) => {
    if (!currentTimeSlot) return
    const timeSlot = currentTimeSlot
    const currentActivitiesInSlot = [...(activities[timeSlot] ?? [])]

    if (currentActivitiesInSlot.length < MAX_ACTIVITIES_PER_SLOT) {
      currentActivitiesInSlot.push(createActivity(categoryKey))
      const newActivities = { ...activities, [timeSlot]: currentActivitiesInSlot }
      saveHistory(newActivities)

      if (currentActivitiesInSlot.length === MAX_ACTIVITIES_PER_SLOT) {
        moveToNextSlot(timeSlot)
      }
    }
  }

  const undoAct = () => {
    if (!canUndo) return
    const newIndex = actHistoriesIndex - 1
    const targetState = actHistories[newIndex]
    setActHistoriesIndex(newIndex)
    setActivities(targetState)
    activityService.saveActivities(dateKey, targetState)
  }

  const redoAct = () => {
    if (!canRedo) return
    const newIndex = actHistoriesIndex + 1
    const targetState = actHistories[newIndex]
    setActHistoriesIndex(newIndex)
    setActivities(targetState)
    activityService.saveActivities(dateKey, targetState)
  }

  const openEditModal = (slotStart: string, index: number) => {
    setEditingSlotKey(slotStart)
    setEditingSlotIndex(index)
    setIsModalOpen(true)
  }

  const closeEditModal = () => {
    setIsModalOpen(false)
    setEditingSlotKey(null)
    setEditingSlotIndex(-1)
  }

  const updateActivityInList = (updater: (list: Activity[]) => Activity[]) => {
    if (!editingSlotKey || editingSlotIndex === -1) return
    const currentList = [...(activities[editingSlotKey] ?? [])]
    const newList = updater(currentList)
    const newActivities = { ...activities, [editingSlotKey]: newList }
    saveHistory(newActivities)
    closeEditModal()
  }

  const updateActivityMemo = (newMemo: string) => {
    if (!editingActivity) return
    updateActivityInList((list) => {
      const newList = [...list]
      newList[editingSlotIndex] = { ...editingActivity, memo: newMemo }
      return newList
    })
  }

  const updateActivityCategory = (newCategoryKey: string) => {
    updateActivityInList((list) => {
      const newList = [...list]
      newList[editingSlotIndex] = createActivity(newCategoryKey)
      return newList
    })
  }

  const deleteActivity = () => {
    updateActivityInList((list) => {
      const newList = [...list]
      newList.splice(editingSlotIndex, 1)
      return newList
    })
  }

  return {
    activities,
    currentTimeSlot,
    setCurrentTimeSlot,
    canUndo,
    canRedo,
    undoAct,
    redoAct,
    selectCategory,
    editingActivity,
    editingSlotKey,
    editingSlotIndex,
    isModalOpen,
    openEditModal,
    closeEditModal,
    updateActivityMemo,
    updateActivityCategory,
    deleteActivity,
  }
}
