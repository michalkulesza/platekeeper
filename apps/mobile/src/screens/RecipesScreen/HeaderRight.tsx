import { Pressable, View } from 'react-native'
import { MenuView } from '@react-native-menu/menu'
import type { MenuAction, NativeActionEvent } from '@react-native-menu/menu'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import BellMenu from '../../components/BellMenu'
import BugReportButton from '../../components/BugReportButton'
import { colors } from '../../theme/colors'
import { styles } from './styles'

const HeaderRight = ({
  addRecipeLabel,
  sortByLabel,
  filterMenuActions,
  onFilterAction,
}: {
  addRecipeLabel: string
  sortByLabel: string
  filterMenuActions: MenuAction[]
  onFilterAction: ({ nativeEvent }: NativeActionEvent) => void
}) => {
  const router = useRouter()
  return (
    <View style={styles.headerBtns}>
      <Pressable
        onPress={() => router.push('/import-recipe')}
        style={({ pressed }) => [styles.headerBtn, styles.addBtn, pressed && { opacity: 0.7 }]}
        accessibilityLabel={addRecipeLabel}
        accessibilityRole="button"
      >
        <Feather name="plus" size={20} color="white" />
      </Pressable>
      <MenuView title={sortByLabel} actions={filterMenuActions} onPressAction={onFilterAction}>
        <View style={styles.headerBtn}>
          <Feather name="sliders" size={22} color={colors.secondaryLabel} />
        </View>
      </MenuView>
      <BugReportButton />
      <BellMenu />
    </View>
  )
}

export default HeaderRight
