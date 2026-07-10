import { View } from 'react-native'
import type { PresenceUser } from '@carrot/shared/types'
import { styles } from './styles'
import PresenceChip from './PresenceChip'

const PresenceBar = ({ users, currentUserId }: { users: PresenceUser[]; currentUserId?: string }) => {
  const others = users.filter((u) => u.user_id !== currentUserId)
  if (others.length === 0) return null
  return (
    <View style={styles.presenceBar}>
      {others.map((u) => (
        <PresenceChip key={u.user_id} user={u} />
      ))}
    </View>
  )
}

export default PresenceBar
