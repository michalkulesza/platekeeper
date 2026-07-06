import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../theme/colors'

export interface NutritionBoxGridItem {
  label: string
  value: string
  accessibilityLabel: string
}

interface NutritionBoxGridProps {
  items: NutritionBoxGridItem[]
  editing: boolean
  onChangeValue?: (index: number, value: string) => void
  disclaimerText: string
  disclaimerAccessibilityLabel: string
}

const NutritionBoxGrid = ({
  items,
  editing,
  onChangeValue,
  disclaimerText,
  disclaimerAccessibilityLabel,
}: NutritionBoxGridProps) => {
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((item, i) => (
          <View key={item.label} style={styles.box}>
            {editing ? (
              <TextInput
                style={styles.numberInput}
                value={item.value}
                onChangeText={(v) => onChangeValue?.(i, v)}
                keyboardType="number-pad"
                placeholder="—"
                placeholderTextColor={colors.placeholderText}
                accessibilityLabel={item.accessibilityLabel}
              />
            ) : (
              <Text style={styles.number}>{item.value !== '' ? item.value : '—'}</Text>
            )}
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
        <Pressable
          hitSlop={12}
          onPress={() => setShowDisclaimer((prev) => !prev)}
          style={({ pressed }) => [styles.infoBtn, pressed && { opacity: 0.6 }]}
          accessibilityLabel={disclaimerAccessibilityLabel}
        >
          <Feather name="info" size={16} color={colors.secondaryLabel} />
        </Pressable>
      </ScrollView>

      {showDisclaimer && (
        <>
          <Pressable
            style={styles.backdrop}
            onPress={() => setShowDisclaimer(false)}
            accessibilityLabel={disclaimerAccessibilityLabel}
          />
          <View style={styles.popover}>
            <Text style={styles.popoverText}>{disclaimerText}</Text>
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10, position: 'relative' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  box: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 64,
  },
  number: { fontSize: 17, lineHeight: 22, fontWeight: '600', color: colors.label },
  numberInput: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.label,
    textAlign: 'center',
    minWidth: 40,
    padding: 0,
  },
  label: { fontSize: 13, lineHeight: 18, color: colors.secondaryLabel, marginTop: 2 },
  infoBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 10,
  },
  popover: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 6,
    backgroundColor: colors.tertiaryBackground,
    borderRadius: 10,
    padding: 12,
    width: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 20,
  },
  popoverText: { fontSize: 13, lineHeight: 18, color: colors.label },
})

export default NutritionBoxGrid
