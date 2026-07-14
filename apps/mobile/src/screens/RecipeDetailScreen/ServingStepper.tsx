import { Pressable, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors } from '../../theme/colors'
import { styles } from './styles'

const ServingStepper = ({
  servings,
  onDecrease,
  onIncrease,
}: {
  servings: number
  onDecrease: () => void
  onIncrease: () => void
}) => {
  const { t } = useTranslation()
  const canDecrease = servings > 1
  const canIncrease = servings < 99
  const servingCountLabel = t('recipes.servings', { count: servings })

  return (
    <View style={styles.servingStepperRow}>
      <Text style={styles.keepScreenLabel}>{t('recipes.serves')}</Text>
      <View style={styles.servingStepper}>
        <Pressable
          onPress={canDecrease ? onDecrease : undefined}
          disabled={!canDecrease}
          style={styles.servingStepperButton}
          accessibilityRole="button"
          accessibilityLabel={t('recipes.decreaseServings')}
          accessibilityState={{ disabled: !canDecrease }}
        >
          <Feather
            name="minus"
            size={20}
            color={canDecrease ? colors.blue : colors.tertiaryLabel}
          />
        </Pressable>
        <Text
          style={styles.servingStepperValue}
          accessibilityLabel={servingCountLabel}
          accessibilityLiveRegion="polite"
        >
          {servings}
        </Text>
        <Pressable
          onPress={canIncrease ? onIncrease : undefined}
          disabled={!canIncrease}
          style={styles.servingStepperButton}
          accessibilityRole="button"
          accessibilityLabel={t('recipes.increaseServings')}
          accessibilityState={{ disabled: !canIncrease }}
        >
          <Feather
            name="plus"
            size={20}
            color={canIncrease ? colors.blue : colors.tertiaryLabel}
          />
        </Pressable>
      </View>
    </View>
  )
}

export default ServingStepper
