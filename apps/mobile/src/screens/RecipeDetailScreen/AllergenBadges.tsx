import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { iKey } from '../SettingsScreen/helpers'
import { styles } from './styles'

const AllergenBadges = ({ allergens }: { allergens: string[] }) => {
  const { t } = useTranslation()
  if (allergens.length === 0) return null

  return (
    <View style={styles.allergenBadgeRow}>
      {allergens.map((allergen) => (
        <View key={allergen} style={styles.allergenBadgePill}>
          <Text style={styles.allergenBadgeText}>
            ⚠ {t(`allergens.${iKey(allergen)}`, { defaultValue: allergen })}
          </Text>
        </View>
      ))}
    </View>
  )
}

export default AllergenBadges
