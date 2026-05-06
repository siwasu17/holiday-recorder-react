import { CATEGORIES } from '@/constants'
import { useThemeContext } from '@/hooks/useThemeContext'

interface Props {
  onSelectCategory: (categoryKey: string) => void
  buttonClassName?: string
}

const CategoryGrid = ({ onSelectCategory, buttonClassName }: Props) => {
  const { theme } = useThemeContext()
  const isDark =
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div className="mt-2.5 grid grid-cols-3 gap-2">
      {CATEGORIES.map((category) => (
        <button
          key={category.key}
          className={`cursor-pointer rounded-sm border-none text-[0.8rem] transition-colors duration-200 ${
            buttonClassName || 'p-2'
          } ${isDark ? 'text-[#e0e0e0]' : 'text-[#333]'}`}
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
