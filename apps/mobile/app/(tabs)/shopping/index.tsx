import { StyleSheet, View } from 'react-native'
import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'
import BellMenu from '../../../src/components/BellMenu'
import BugReportButton from '../../../src/components/BugReportButton'
import HeaderTitle from '../../../src/components/HeaderTitle'
import ShoppingListScreen from '../../../src/screens/ShoppingListScreen'

export default function ShoppingTab() {
  const { t } = useTranslation()

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => <HeaderTitle title={t('shoppingList.title')} />,
          headerRight: () => (
            <View style={styles.headerRight}>
              <BugReportButton />
              <BellMenu />
            </View>
          ),
        }}
      />
      <ShoppingListScreen />
    </>
  )
}

const styles = StyleSheet.create({
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
})
