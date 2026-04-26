import { CATEGORIES } from '@/constants'

interface Props {
  onSelectCategory: (categoryKey: string) => void
  buttonClassName?: string
}

const CategoryGrid = ({ onSelectCategory, buttonClassName }: Props) => {
  return (
    <div className="mt-2.5 grid grid-cols-3 gap-2">
      {CATEGORIES.map((category) => (
        <button
          key={category.key}
          className={`cursor-pointer rounded-sm border-none text-[0.8rem] ${buttonClassName || 'p-2'}`}
          style={{ backgroundColor: category.color }}
          onClick={() => onSelectCategory(category.key)}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}

export default CategoryGrid
