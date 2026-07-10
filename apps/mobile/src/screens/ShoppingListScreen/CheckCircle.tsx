import { Pressable, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { styles } from './styles'

const CheckCircle = ({
  checked,
  onPress,
  accessibilityLabel,
}: {
  checked: boolean
  onPress: () => void
  accessibilityLabel?: string
}) => (
  <Pressable
    onPress={onPress}
    hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
    style={styles.circleBtn}
    accessibilityRole="checkbox"
    accessibilityState={{ checked }}
    accessibilityLabel={accessibilityLabel}
  >
    {checked ? (
      <View style={styles.checkCircleFilled}>
        <Feather name="check" size={13} color="#fff" />
      </View>
    ) : (
      <View style={styles.checkCircleRing} />
    )}
  </Pressable>
)

export default CheckCircle
