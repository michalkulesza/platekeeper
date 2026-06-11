import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useMealPlan } from '@platekeeper/shared/hooks/useMealPlan'
import { useRecipes } from '@platekeeper/shared/hooks/useRecipes'
import type { MealPlanEntry, RecipeOut } from '@platekeeper/shared/types'

import { toYYYYMM, toISODate, formatWeekdayShort, formatMonthYear } from '@platekeeper/shared/utils/dateUtils'

// ─── helpers ───────────────────────────────────────────────────────────────

const getDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = []
  const date = new Date(year, month, 1)
  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}

interface WeekGroup {
  weekLabel: string
  days: Date[]
}

const groupByWeek = (days: Date[]): WeekGroup[] => {
  const groups: WeekGroup[] = []
  let current: Date[] = []

  for (const day of days) {
    current.push(day)
    if (day.getDay() === 0 || day === days[days.length - 1]) {
      const first = current[0]
      const last = current[current.length - 1]
      groups.push({
        weekLabel: `${first.getDate()} – ${last.getDate()}`,
        days: current,
      })
      current = []
    }
  }
  if (current.length > 0) {
    const first = current[0]
    const last = current[current.length - 1]
    groups.push({
      weekLabel: `${first.getDate()} – ${last.getDate()}`,
      days: current,
    })
  }
  return groups
}

// ─── RecipePicker modal ─────────────────────────────────────────────────────

interface RecipePickerProps {
  visible: boolean
  date: string
  currentRecipeId: string | null
  recipes: RecipeOut[]
  onPick: (recipeId: string) => void
  onRemove: () => void
  onClose: () => void
}

const RecipePicker = ({
  visible,
  date,
  currentRecipeId,
  recipes,
  onPick,
  onRemove,
  onClose,
}: RecipePickerProps) => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return recipes
    return recipes.filter((r) => r.title.toLowerCase().includes(q))
  }, [recipes, search])

  const handleClose = useCallback(() => {
    setSearch('')
    onClose()
  }, [onClose])

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<RecipeOut>) => (
      <TouchableOpacity
        style={[styles.pickerItem, item.id === currentRecipeId && styles.pickerItemActive]}
        onPress={() => {
          setSearch('')
          onPick(item.id)
        }}
        accessibilityLabel={item.title}
        accessibilityRole="button"
      >
        <Text
          style={[styles.pickerItemText, item.id === currentRecipeId && styles.pickerItemTextActive]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    ),
    [currentRecipeId, onPick],
  )

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>{t('mealPlan.chooseDish')}</Text>
          <Text style={styles.pickerDate}>{date}</Text>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.pickerClose}
            accessibilityLabel={t('common.close')}
            accessibilityRole="button"
          >
            <Text style={styles.pickerCloseText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.pickerSearch}
          placeholder={t('mealPlan.searchRecipes')}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          accessibilityLabel={t('mealPlan.searchRecipes')}
        />

        {currentRecipeId && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => {
              setSearch('')
              onRemove()
            }}
            accessibilityLabel={t('mealPlan.removeFromPlan')}
            accessibilityRole="button"
          >
            <Text style={styles.removeButtonText}>{t('mealPlan.removeFromPlan')}</Text>
          </TouchableOpacity>
        )}

        {filtered.length === 0 ? (
          <View style={styles.pickerEmpty}>
            <Text style={styles.pickerEmptyText}>
              {recipes.length === 0
                ? t('mealPlan.noRecipesYet')
                : t('mealPlan.noRecipesMatch')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            style={styles.pickerList}
          />
        )}
      </View>
    </Modal>
  )
}

// ─── Day cell ───────────────────────────────────────────────────────────────

interface DayCellProps {
  date: Date
  entry: MealPlanEntry | undefined
  onPress: (date: Date) => void
}

const DayCell = ({ date, entry, onPress }: DayCellProps) => {
  const { i18n } = useTranslation()
  const dayShort = formatWeekdayShort(date, i18n.language)
  const dayLong = new Intl.DateTimeFormat(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' }).format(date)
  const today = new Date()
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  return (
    <TouchableOpacity
      style={[styles.dayCell, isToday && styles.dayCellToday]}
      onPress={() => onPress(date)}
      accessibilityLabel={`${dayLong}${entry ? ': ' + entry.recipe.title : ''}`}
      accessibilityRole="button"
    >
      <View style={styles.dayCellHeader}>
        <Text style={styles.dayName}>{dayShort}</Text>
        <Text style={[styles.dayNum, isToday && styles.dayNumToday]}>{date.getDate()}</Text>
      </View>
      {entry ? (
        <Text style={styles.dayRecipe} numberOfLines={2}>
          {entry.recipe.title}
        </Text>
      ) : (
        <Text style={styles.dayEmpty}>{'+'}</Text>
      )}
    </TouchableOpacity>
  )
}

// ─── Main screen ─────────────────────────────────────────────────────────────

const MealPlanScreen = () => {
  const { t, i18n } = useTranslation()
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [pickerDate, setPickerDate] = useState<Date | null>(null)

  const month = useMemo(() => toYYYYMM(currentDate), [currentDate])
  const { entries, isLoading, error, setEntry, deleteEntry } = useMealPlan(month)
  const { recipes } = useRecipes()

  const entriesByDate = useMemo(() => {
    const map = new Map<string, MealPlanEntry>()
    for (const entry of entries) {
      map.set(entry.date, entry)
    }
    return map
  }, [entries])

  const weeks = useMemo(() => {
    const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())
    return groupByWeek(days)
  }, [currentDate])

  const goToPrevMonth = useCallback(() => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }, [])

  const handleDayPress = useCallback((date: Date) => {
    setPickerDate(date)
  }, [])

  const handlePickRecipe = useCallback(
    (recipeId: string) => {
      if (!pickerDate) return
      setEntry.mutate({ date: toISODate(pickerDate), recipeId })
      setPickerDate(null)
    },
    [pickerDate, setEntry],
  )

  const handleRemoveEntry = useCallback(() => {
    if (!pickerDate) return
    deleteEntry.mutate(toISODate(pickerDate))
    setPickerDate(null)
  }, [pickerDate, deleteEntry])

  const handleClosePicker = useCallback(() => {
    setPickerDate(null)
  }, [])

  const pickerDateStr = pickerDate ? toISODate(pickerDate) : ''
  const pickerCurrentRecipeId = pickerDate
    ? (entriesByDate.get(pickerDateStr)?.recipe.id ?? null)
    : null

  return (
    <View style={styles.container}>
      {/* Month header */}
      <View style={styles.monthHeader}>
        <TouchableOpacity
          onPress={goToPrevMonth}
          style={styles.arrowBtn}
          accessibilityLabel={t('mealPlan.prevMonth')}
          accessibilityRole="button"
        >
          <Text style={styles.arrowText}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {formatMonthYear(currentDate, i18n.language)}
        </Text>
        <TouchableOpacity
          onPress={goToNextMonth}
          style={styles.arrowBtn}
          accessibilityLabel={t('mealPlan.nextMonth')}
          accessibilityRole="button"
        >
          <Text style={styles.arrowText}>{'›'}</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" accessibilityLabel={t('common.loading')} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll}>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekBlock}>
              <Text style={styles.weekLabel}>{week.weekLabel}</Text>
              <View style={styles.weekRow}>
                {week.days.map((day) => {
                  const iso = toISODate(day)
                  return (
                    <DayCell
                      key={iso}
                      date={day}
                      entry={entriesByDate.get(iso)}
                      onPress={handleDayPress}
                    />
                  )
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {pickerDate && (
        <RecipePicker
          visible={pickerDate !== null}
          date={pickerDateStr}
          currentRecipeId={pickerCurrentRecipeId}
          recipes={recipes}
          onPick={handlePickRecipe}
          onRemove={handleRemoveEntry}
          onClose={handleClosePicker}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: '#dc2626', fontSize: 15, textAlign: 'center' },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  arrowBtn: { padding: 8 },
  arrowText: { fontSize: 24, color: '#374151', lineHeight: 28 },
  monthTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  scroll: { flex: 1 },
  weekBlock: { marginTop: 12, marginHorizontal: 12 },
  weekLabel: { fontSize: 11, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  weekRow: { flexDirection: 'row', gap: 4 },
  dayCell: {
    flex: 1,
    minHeight: 72,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dayCellToday: { borderColor: '#2563eb', borderWidth: 2 },
  dayCellHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  dayName: { fontSize: 10, color: '#9ca3af', fontWeight: '500' },
  dayNum: { fontSize: 13, fontWeight: '700', color: '#374151' },
  dayNumToday: { color: '#2563eb' },
  dayRecipe: { fontSize: 10, color: '#374151', lineHeight: 13 },
  dayEmpty: { fontSize: 18, color: '#d1d5db', textAlign: 'center', marginTop: 4 },
  // picker
  pickerContainer: { flex: 1, backgroundColor: '#fff' },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  pickerTitle: { fontSize: 17, fontWeight: '700', color: '#111', flex: 1 },
  pickerDate: { fontSize: 14, color: '#6b7280' },
  pickerClose: { padding: 4 },
  pickerCloseText: { fontSize: 15, color: '#2563eb', fontWeight: '500' },
  pickerSearch: {
    margin: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#f9fafb',
  },
  removeButton: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
    alignItems: 'center',
  },
  removeButtonText: { color: '#dc2626', fontWeight: '500', fontSize: 14 },
  pickerList: { flex: 1 },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerItemActive: { backgroundColor: '#ede9fe' },
  pickerItemText: { fontSize: 15, color: '#111' },
  pickerItemTextActive: { color: '#7c3aed', fontWeight: '600' },
  pickerEmpty: { flex: 1, padding: 40, alignItems: 'center' },
  pickerEmptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
})

export default MealPlanScreen
