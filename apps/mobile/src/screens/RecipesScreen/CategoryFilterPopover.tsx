import { Modal, PlatformColor, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import type { Tag } from '@carrot/shared/types'
import { tTag } from '@carrot/shared/utils/tagUtils'
import { colors } from '../../theme/colors'
import { POPOVER_WIDTH, type PopoverPosition } from './CategoryFilterChip'

const CategoryFilterPopover = ({
  position,
  tags,
  selectedTagIds,
  onToggle,
  onClose,
}: {
  position: PopoverPosition | null
  tags: Tag[]
  selectedTagIds: Set<string>
  onToggle: (tagId: string) => void
  onClose: () => void
}) => {
  const { t } = useTranslation()

  return (
    <Modal visible={position !== null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      {position && (
        <View style={[styles.popover, { top: position.top, left: position.left }]}>
          <ScrollView bounces={false} style={styles.popoverScroll}>
            {tags.map((tag) => {
              const isSelected = selectedTagIds.has(tag.id)
              return (
                <Pressable
                  key={tag.id}
                  style={styles.row}
                  onPress={() => onToggle(tag.id)}
                  accessibilityLabel={tag.name}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={styles.rowText} numberOfLines={1}>
                    {tTag(tag.name, t)}
                  </Text>
                  {isSelected && <Text style={styles.rowCheck}>✓</Text>}
                </Pressable>
              )
            })}
          </ScrollView>
        </View>
      )}
    </Modal>
  )
}

export default CategoryFilterPopover

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  popover: {
    position: 'absolute',
    width: POPOVER_WIDTH,
    maxHeight: 260,
    backgroundColor: PlatformColor('systemBackground') as unknown as string,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  popoverScroll: { flexGrow: 0 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: PlatformColor('separator') as unknown as string,
  },
  rowText: { fontSize: 15, color: PlatformColor('label') as unknown as string, flexShrink: 1 },
  rowCheck: { fontSize: 15, color: colors.brand, marginLeft: 8 },
})
