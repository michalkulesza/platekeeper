import type { StyleProp, ViewStyle } from 'react-native'
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import GlassViewSafe, { glassAvailable } from '../../components/GlassViewSafe'
import { colors } from '../../theme/colors'
import { styles } from './styles'

// Falls back to a flat fill with a manual opacity dim where Liquid Glass isn't available (Android, pre-iOS 18).
const PrimaryButton = ({
  onPress,
  disabled,
  loading,
  label,
  accessibilityLabel,
  style,
}: {
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  label: string
  accessibilityLabel: string
  style?: StyleProp<ViewStyle>
}) => (
  <Pressable
    style={({ pressed }) => [
      styles.primaryBtn,
      style,
      disabled && styles.btnDisabled,
      pressed && !glassAvailable && { opacity: 0.7 },
    ]}
    onPress={onPress}
    disabled={disabled}
    accessibilityLabel={accessibilityLabel}
  >
    <GlassViewSafe
      style={StyleSheet.absoluteFill}
      glassEffectStyle="regular"
      tintColor={colors.blue}
      isInteractive
    />
    {loading ? (
      <ActivityIndicator color={colors.background} size="small" />
    ) : (
      <Text style={styles.primaryBtnText}>{label}</Text>
    )}
  </Pressable>
)

export default PrimaryButton
