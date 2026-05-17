import { CATEGORIES } from '@/constants'
import { useThemeContext } from '@/hooks/useThemeContext'

interface Props {
  onSelectCategory: (categoryKey: string) => void
  buttonClassName?: string
}

const CategoryGrid = ({ onSelectCategory, buttonClassName }: Props) => {
  const { isDark } = useThemeContext()

  return (
    <div className="mt-2.5 grid grid-cols-3 gap-2">
      {CATEGORIES.map((category) => (
        <button
          key={category.key}
          type="button"
          className={`text-text-main cursor-pointer rounded-sm border-none text-[0.8rem] transition-colors duration-200 ${
            buttonClassName || 'p-2'
          }`}
          style={{ backgroundColor: isDark ? category.darkColor : category.color }}
          onClick={() => onSelectCategory(category.key)}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}

export default CategoryGrid
