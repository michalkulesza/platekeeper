import type { ReactNode } from 'react'
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Swipeable } from 'react-native-gesture-handler'
import type { ShoppingListItem } from '@carrot/shared/types'
import { styles } from './styles'
import CheckCircle from './CheckCircle'
import AddItemRow from './AddItemRow'

// Defined at module scope so its component *type* is stable across renders. The
// add row lives here, right after the unchecked items and before the completed
// section, so it stays the last "unchecked" row and new items get added above it.
const ShoppingListFooter = ({
  completedItems,
  onAdd,
  onFocusInput,
  onBlurInput,
  onToggle,
  onClearCompleted,
  renderRightDelete,
  bottomInset,
  onFooterLayout,
}: {
  completedItems: ShoppingListItem[]
  onAdd: (text: string) => void
  onFocusInput: () => void
  onBlurInput: () => void
  onToggle: (id: string, completed: boolean) => void
  onClearCompleted: () => void
  renderRightDelete: (id: string, locked: boolean) => () => ReactNode
  bottomInset: number
  onFooterLayout: (event: LayoutChangeEvent) => void
}) => {
  const { t } = useTranslation()
  return (
    <View onLayout={onFooterLayout}>
      <AddItemRow onAdd={onAdd} onFocusInput={onFocusInput} onBlurInput={onBlurInput} />

      {completedItems.length > 0 && (
        <View>
          <View style={styles.completedHeader}>
            <Text style={styles.completedLabel}>
              {completedItems.length} {t('shoppingList.completedSection')}
            </Text>
            <Pressable
              onPress={onClearCompleted}
              hitSlop={8}
              accessibilityLabel={t('shoppingList.clearCompleted')}
            >
              <Text style={styles.clearBtn}>{t('shoppingList.clearCompleted')}</Text>
            </Pressable>
          </View>
          {completedItems.map((item) => (
            <Swipeable
              key={item.id}
              renderRightActions={renderRightDelete(item.id, false)}
              overshootRight={false}
            >
              <View style={styles.item}>
                <CheckCircle
                  checked
                  onPress={() => onToggle(item.id, item.completed)}
                  accessibilityLabel={item.text}
                />
                <Text style={[styles.itemText, styles.completedText]}>{item.text}</Text>
              </View>
            </Swipeable>
          ))}
        </View>
      )}

      <View style={{ height: bottomInset + 24 }} />
    </View>
  )
}

export default ShoppingListFooter
