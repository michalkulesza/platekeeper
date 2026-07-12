import { useCallback, useRef } from 'react'
import { Dimensions, Pressable, StyleSheet, Text, type View as RNView } from 'react-native'
import { useTranslation } from 'react-i18next'
import type { Tag, TagCategory } from '@carrot/shared/types'
import { tTag } from '@carrot/shared/utils/tagUtils'
import GlassViewSafe from '../../components/GlassViewSafe'
import { colors } from '../../theme/colors'

export const POPOVER_WIDTH = 180
const POPOVER_MARGIN = 12

export interface PopoverPosition {
  top: number
  left: number
}

const CategoryFilterChip = ({
  category,
  tags,
  selectedTagIds,
  onOpen,
}: {
  category: TagCategory
  tags: Tag[]
  selectedTagIds: Set<string>
  onOpen: (category: TagCategory, position: PopoverPosition) => void
}) => {
  const { t } = useTranslation()
  const anchorRef = useRef<RNView>(null)

  const selectedTags = tags.filter((tag) => selectedTagIds.has(tag.id))
  const isActive = selectedTags.length > 0
  const label = isActive
    ? selectedTags.length > 1
      ? `${tTag(selectedTags[0].name, t)} +${selectedTags.length - 1}`
      : tTag(selectedTags[0].name, t)
    : t(`tags.category.${category}`)

  const handlePress = useCallback(() => {
    anchorRef.current?.measureInWindow((x, y, width, height) => {
      const screenWidth = Dimensions.get('window').width
      const left = Math.min(x, screenWidth - POPOVER_WIDTH - POPOVER_MARGIN)
      onOpen(category, { top: y + height + 4, left: Math.max(left, POPOVER_MARGIN) })
    })
  }, [category, onOpen])

  return (
    <Pressable
      ref={anchorRef}
      onPress={handlePress}
      style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
      accessibilityLabel={t(`tags.category.${category}`)}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <GlassViewSafe
        style={StyleSheet.absoluteFill}
        glassEffectStyle={isActive ? 'clear' : 'regular'}
        tintColor={isActive ? colors.blue : colors.gray5}
      />
      <Text style={[styles.chipText, isActive && styles.chipTextSelected]} numberOfLines={1}>
        {label} ▾
      </Text>
    </Pressable>
  )
}

export default CategoryFilterChip

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: 'hidden',
    maxWidth: 140,
  },
  chipText: { fontSize: 13, color: colors.secondaryLabel },
  chipTextSelected: { color: '#ffffff', fontWeight: '600' },
})
