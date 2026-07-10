import { Pressable, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Feather } from '@expo/vector-icons'
import type { Ingredient } from '@carrot/shared/types'
import { colors } from '../../theme/colors'
import { styles } from './styles'

const IngredientRow = ({
  ingredient,
  addMode = false,
  isAdded = false,
  onAdd,
  fontSize = 17,
  lineHeight = 22,
}: {
  ingredient: Ingredient
  addMode?: boolean
  isAdded?: boolean
  onAdd?: () => void
  fontSize?: number
  lineHeight?: number
}) => {
  const { t } = useTranslation()
  const parts = [ingredient.qty, ingredient.unit, ingredient.name].filter(Boolean).join(' ')
  return (
    <View style={styles.ingredientRow}>
      <Text style={styles.bullet}>{'•'}</Text>
      <Text style={[styles.ingredientText, { fontSize, lineHeight }]}>
        {parts}
      </Text>
      {addMode && (
        <Pressable
          onPress={isAdded ? undefined : onAdd}
          hitSlop={8}
          style={styles.addIngredientBtn}
          accessibilityLabel={isAdded ? t('shoppingList.addedToList') : t('shoppingList.addToList')}
        >
          <Feather name={isAdded ? 'check' : 'plus'} size={18} color={isAdded ? colors.green : colors.blue} />
        </Pressable>
      )}
    </View>
  )
}

export default IngredientRow
