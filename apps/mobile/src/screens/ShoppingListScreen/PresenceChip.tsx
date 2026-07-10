import { Text, View } from 'react-native'
import type { PresenceUser } from '@carrot/shared/types'
import { styles } from './styles'

const PresenceChip = ({ user }: { user: PresenceUser }) => (
  <View style={[styles.presenceChip, { backgroundColor: user.color }]}>
    <Text style={styles.presenceInitial}>{user.nickname.charAt(0).toUpperCase()}</Text>
  </View>
)

export default PresenceChip
