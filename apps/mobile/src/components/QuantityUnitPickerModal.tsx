import { useCallback, useMemo } from 'react'
import { Modal, PlatformColor, Pressable, StyleSheet, Text, View } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { useTranslation } from 'react-i18next'
import { UNITS } from '@carrot/shared/types'
import { FRACTION_OPTIONS, parseQtyParts, serializeQtyParts } from '@carrot/shared/utils/ingredientUtils'
import { colors } from '../theme/colors'

const WHOLE_OPTIONS = Array.from({ length: 21 }, (_, i) => i)

export const QuantityUnitPickerModal = ({
  visible,
  qty,
  unit,
  onChange,
  onClose,
}: {
  visible: boolean
  qty: string
  unit: string
  onChange: (qty: string, unit: string) => void
  onClose: () => void
}) => {
  const { t } = useTranslation()
  const { whole, fraction } = useMemo(() => parseQtyParts(qty), [qty])

  const handleWholeChange = useCallback(
    (value: number) => onChange(serializeQtyParts(value, fraction), unit),
    [fraction, unit, onChange],
  )
  const handleFractionChange = useCallback(
    (value: string) => onChange(serializeQtyParts(whole, value), unit),
    [whole, unit, onChange],
  )
  const handleUnitChange = useCallback(
    (value: string) => onChange(qty, value),
    [qty, onChange],
  )

  const getDoneButtonStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => [styles.doneButton, pressed && styles.pressedLight],
    [],
  )

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <View style={styles.sheetHandle} />
          <Pressable
            style={getDoneButtonStyle}
            onPress={onClose}
            hitSlop={10}
            accessibilityLabel={t('common.done')}
          >
            <Text style={styles.doneText}>{t('common.done')}</Text>
          </Pressable>
        </View>
        <View style={styles.wheelRow}>
          <Picker
            style={styles.wheel}
            selectedValue={whole}
            onValueChange={handleWholeChange}
            accessibilityLabel={t('units.qtyLabel')}
          >
            {WHOLE_OPTIONS.map((value) => (
              <Picker.Item key={value} label={String(value)} value={value} />
            ))}
          </Picker>
          <Picker
            style={styles.wheel}
            selectedValue={fraction}
            onValueChange={handleFractionChange}
            accessibilityLabel={t('units.qtyLabel')}
          >
            {FRACTION_OPTIONS.map((value) => (
              <Picker.Item key={value} label={value === '0' ? '—' : value} value={value} />
            ))}
          </Picker>
          <Picker
            style={styles.wheel}
            selectedValue={unit}
            onValueChange={handleUnitChange}
            accessibilityLabel={t('units.unitLabel')}
          >
            <Picker.Item label="—" value="" />
            {UNITS.map((value) => (
              <Picker.Item key={value} label={t(`units.${value}`)} value={value} />
            ))}
          </Picker>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  pressedLight: { opacity: 0.7 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: PlatformColor('systemBackground') as unknown as string,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 16,
  },
  header: {
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: PlatformColor('opaqueSeparator') as unknown as string,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  doneButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  doneText: { fontSize: 17, lineHeight: 22, fontWeight: '600', color: colors.brand },
  wheelRow: { flexDirection: 'row' },
  wheel: { flex: 1 },
})
