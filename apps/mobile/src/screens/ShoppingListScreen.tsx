import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import * as Sharing from 'expo-sharing'
import { File, Paths } from 'expo-file-system'
import { useMealPlan } from '@platekeeper/shared/hooks/useMealPlan'
import type { MealPlanEntry } from '@platekeeper/shared/types'
import { getToken } from '../api/client'
import { toYYYYMM, formatMonthYear } from '@platekeeper/shared/utils/dateUtils'
import { aggregateIngredients, type AggregatedIngredient } from '@platekeeper/shared/utils/ingredientUtils'

// ─── Screen ──────────────────────────────────────────────────────────────────

const ShoppingListScreen = () => {
  const { t, i18n } = useTranslation()
  const [currentDate] = useState(() => new Date())
  const month = useMemo(() => toYYYYMM(currentDate), [currentDate])
  const { entries, isLoading, error } = useMealPlan(month)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const ingredients = useMemo(() => aggregateIngredients(entries as MealPlanEntry[]), [entries])

  const handleExportPdf = useCallback(async () => {
    setExportError(null)
    setExporting(true)
    try {
      const baseUrl = (process.env.EXPO_PUBLIC_API_URL as string | undefined) ?? ''
      const token = getToken()
      const headers: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {}

      const res = await fetch(`${baseUrl}/api/export/meal-plan.pdf?month=${month}`, {
        headers,
        credentials: 'omit',
      })
      if (!res.ok) throw new Error(t('shoppingList.exportError'))

      const arrayBuffer = await res.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)

      const file = new File(Paths.cache, `meal-plan-${month}.pdf`)
      file.write(bytes)

      const canShare = await Sharing.isAvailableAsync()
      if (!canShare) throw new Error(t('shoppingList.exportError'))
      await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' })
    } catch (e) {
      setExportError(e instanceof Error ? e.message : t('shoppingList.exportError'))
    } finally {
      setExporting(false)
    }
  }, [month, t])

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AggregatedIngredient>) => (
      <View style={styles.row}>
        <Text style={styles.name}>{item.name}</Text>
        {item.qtySummary ? (
          <Text style={styles.qty}>{item.qtySummary}</Text>
        ) : null}
      </View>
    ),
    [],
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthLabel}>
          {formatMonthYear(currentDate, i18n.language)}
        </Text>
        <TouchableOpacity
          style={[styles.exportBtn, exporting && styles.exportBtnDisabled]}
          onPress={handleExportPdf}
          disabled={exporting}
          accessibilityLabel={t('shoppingList.exportPdf')}
          accessibilityRole="button"
        >
          <Text style={styles.exportBtnText}>
            {exporting ? t('shoppingList.exporting') : t('shoppingList.exportPdf')}
          </Text>
        </TouchableOpacity>
      </View>

      {exportError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{exportError}</Text>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" accessibilityLabel={t('common.loading')} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      ) : ingredients.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{t('shoppingList.emptyList')}</Text>
        </View>
      ) : (
        <FlatList
          data={ingredients}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  monthLabel: { fontSize: 17, fontWeight: '700', color: '#111' },
  exportBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  exportBtnDisabled: { backgroundColor: '#93c5fd' },
  exportBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderBottomWidth: 1,
    borderBottomColor: '#fca5a5',
    padding: 12,
  },
  errorBannerText: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: '#dc2626', fontSize: 15, textAlign: 'center' },
  emptyText: { color: '#6b7280', fontSize: 15, textAlign: 'center' },
  list: { flex: 1 },
  listContent: { paddingTop: 8, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  name: { fontSize: 15, color: '#111', flex: 1 },
  qty: { fontSize: 13, color: '#6b7280', marginLeft: 12 },
})

export default ShoppingListScreen
