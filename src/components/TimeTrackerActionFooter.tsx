import CategoryGrid from './CategoryGrid'

interface Props {
  canUndo: boolean
  canRedo: boolean
  onSelectCategory: (categoryKey: string) => void
  onUndo: () => void
  onRedo: () => void
}

const TimeTrackerActionFooter = ({ canUndo, canRedo, onSelectCategory, onUndo, onRedo }: Props) => {
  return (
    <div className="bg-surface fixed right-0 bottom-0 left-0 z-10 p-2.5 shadow-[0_-2px_4px_rgba(0,0,0,0.1)]">
      <div className="mb-1 flex justify-center gap-25">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="border-border-main text-text-sub enabled:hover:bg-accent-soft disabled:text-text-sub/30 cursor-pointer rounded-[15px] border bg-none px-3 py-0.5 text-[0.8rem] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ↩ Undo
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="border-border-main text-text-sub enabled:hover:bg-accent-soft disabled:text-text-sub/30 cursor-pointer rounded-[15px] border bg-none px-3 py-0.5 text-[0.8rem] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Redo ↪
        </button>
      </div>
      <CategoryGrid onSelectCategory={onSelectCategory} buttonClassName="py-2 px-1" />
    </div>
  )
}

export default TimeTrackerActionFooter
