import { useTranslation } from 'react-i18next'
import { normalizeAllergenKey } from '../../pages/SettingsPage/helpers'

interface AllergenBadgesProps {
  allergens: string[]
}

const AllergenBadges = ({ allergens }: AllergenBadgesProps) => {
  const { t } = useTranslation()
  if (allergens.length === 0) return null

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {allergens.map((allergen) => (
        <span
          key={allergen}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium"
        >
          ⚠{' '}
          {t(`allergens.${normalizeAllergenKey(allergen)}`, {
            defaultValue: allergen,
          })}
        </span>
      ))}
    </div>
  )
}

export default AllergenBadges
