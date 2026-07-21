import { useCallback, useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { MenuView, type MenuAction } from '@react-native-menu/menu'
import * as Haptics from 'expo-haptics'
import { useTranslation } from 'react-i18next'
import Avatar from '../../components/Avatar'
import { styles } from './styles'

type RecipeMember = {
  id: string
  name: string
  color?: string
}

const RecipeMemberRow = ({ members, onDeleteRecipe }: { members: RecipeMember[]; onDeleteRecipe: () => void }) => {
  const { t } = useTranslation()
  const actions = useMemo<MenuAction[]>(
    () => [{ id: 'delete', title: t('common.delete'), image: 'trash', attributes: { destructive: true } }],
    [t],
  )

  const handleMenuAction = useCallback(
    ({ nativeEvent }: { nativeEvent: { event: string } }) => {
      if (nativeEvent.event === 'delete') onDeleteRecipe()
    },
    [onDeleteRecipe],
  )

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memberScroll}>
      <View style={styles.memberRow}>
        {members.map((member) => (
          <MenuView
            key={member.id}
            title={t('recipes.recipeActions')}
            actions={actions}
            shouldOpenOnLongPress
            onOpenMenu={() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            onPressAction={handleMenuAction}
          >
            <View style={styles.memberChip} accessible accessibilityLabel={member.name}>
              <Avatar name={member.name} color={member.color} size={28} />
              <Text numberOfLines={1} style={styles.memberName}>{member.name}</Text>
            </View>
          </MenuView>
        ))}
      </View>
    </ScrollView>
  )
}

export default RecipeMemberRow
