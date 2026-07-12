import { Text, View } from 'react-native'
import { MenuView } from '@react-native-menu/menu'
import type { MenuAction, NativeActionEvent } from '@react-native-menu/menu'
import { Feather } from '@expo/vector-icons'
import type { HouseholdOut } from '@carrot/shared/types'
import { colors } from '../../theme/colors'
import { styles } from './styles'

const HeaderTitle = ({
  title,
  householdMenuActions,
  onHouseholdAction,
  activeHousehold,
  personalLabel,
  switchContextLabel,
}: {
  title: string
  householdMenuActions: MenuAction[]
  onHouseholdAction: ({ nativeEvent }: NativeActionEvent) => void
  activeHousehold: HouseholdOut | null
  personalLabel: string
  switchContextLabel: string
}) => (
  // width: '100%' on headerTitleWrap stops iOS from centering this custom
  // headerTitle view when the nav bar has extra room (e.g. iPhone Pro Max).
  <View style={styles.headerTitleWrap}>
    <Text style={styles.headerTitleText} numberOfLines={1}>
      {title}
    </Text>
    <MenuView title={switchContextLabel} actions={householdMenuActions} onPressAction={onHouseholdAction}>
      <View style={styles.householdSwitcher}>
        <View
          style={[
            styles.householdDot,
            activeHousehold?.color ? { backgroundColor: activeHousehold.color } : styles.householdDotEmpty,
          ]}
        />
        <Text style={styles.householdSwitcherText} numberOfLines={1}>
          {activeHousehold ? activeHousehold.name : personalLabel}
        </Text>
        <Feather name="chevron-down" size={13} color={colors.secondaryLabel} />
      </View>
    </MenuView>
  </View>
)

export default HeaderTitle
