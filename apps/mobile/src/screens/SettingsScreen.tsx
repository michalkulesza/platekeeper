import { useCallback } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { usePreferences } from '@platekeeper/shared/hooks/usePreferences'
import { useAuth } from '../context/AuthContext'
import type { UserPreferences } from '@platekeeper/shared/types'

const LANGUAGES: { code: string; labelKey: string }[] = [
  { code: 'en', labelKey: 'languages.en' },
  { code: 'de', labelKey: 'languages.de' },
  { code: 'pl', labelKey: 'languages.pl' },
  { code: 'fr', labelKey: 'languages.fr' },
  { code: 'es', labelKey: 'languages.es' },
]

const WEEK_START_OPTIONS: { value: number; labelKey: string }[] = [
  { value: 0, labelKey: 'settings.sunday' },
  { value: 1, labelKey: 'settings.monday' },
  { value: 6, labelKey: 'settings.saturday' },
]

const SectionHeader = ({ label }: { label: string }) => (
  <Text style={styles.sectionHeader}>{label}</Text>
)

const SettingsScreen = () => {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const { preferences, isLoading, error, update } = usePreferences()

  const handleLanguageChange = useCallback(
    (code: string) => {
      void i18n.changeLanguage(code)
      update.mutate({ language: code } as Partial<UserPreferences>)
    },
    [i18n, update],
  )

  const handleUnitSystemToggle = useCallback(
    (isMetric: boolean) => {
      update.mutate({ unit_system: isMetric ? 'metric' : 'imperial' } as Partial<UserPreferences>)
    },
    [update],
  )

  const handleWeekStartChange = useCallback(
    (value: number) => {
      update.mutate({ week_start_day: value } as Partial<UserPreferences>)
    },
    [update],
  )

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Account */}
      <SectionHeader label={t('settings.account')} />
      <View style={styles.card}>
        {user && (
          <View style={styles.row}>
            <Text style={styles.label}>{t('auth.email')}</Text>
            <Text style={styles.value} numberOfLines={1}>{user.email}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.logoutRow}
          onPress={logout}
          accessibilityLabel={t('settings.logOut')}
          accessibilityRole="button"
        >
          <Text style={styles.logoutText}>{t('settings.logOut')}</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences */}
      <SectionHeader label={t('settings.preferences')} />

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator accessibilityLabel={t('common.loading')} />
        </View>
      ) : error ? (
        <View style={styles.card}>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      ) : (
        <>
          {/* Language */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t('settings.language')}</Text>
            <View style={styles.chipRow}>
              {LANGUAGES.map(({ code, labelKey }) => {
                const isSelected = (preferences?.language ?? i18n.language) === code
                return (
                  <TouchableOpacity
                    key={code}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => handleLanguageChange(code)}
                    accessibilityLabel={t(labelKey)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {t(labelKey)}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* Unit system */}
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <Text style={styles.cardLabel}>{t('settings.unitSystem')}</Text>
              <View style={styles.unitToggleRow}>
                <Text
                  style={[
                    styles.unitLabel,
                    preferences?.unit_system !== 'metric' && styles.unitLabelActive,
                  ]}
                >
                  {t('settings.imperial')}
                </Text>
                <Switch
                  value={preferences?.unit_system !== 'imperial'}
                  onValueChange={handleUnitSystemToggle}
                  accessibilityLabel={t('settings.unitSystem')}
                  trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                  thumbColor={preferences?.unit_system !== 'imperial' ? '#2563eb' : '#9ca3af'}
                />
                <Text
                  style={[
                    styles.unitLabel,
                    preferences?.unit_system !== 'imperial' && styles.unitLabelActive,
                  ]}
                >
                  {t('settings.metric')}
                </Text>
              </View>
            </View>
          </View>

          {/* Week start day */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t('settings.weekStartsOn')}</Text>
            <View style={styles.chipRow}>
              {WEEK_START_OPTIONS.map(({ value, labelKey }) => {
                const isSelected = (preferences?.week_start_day ?? 1) === value
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => handleWeekStartChange(value)}
                    accessibilityLabel={t(labelKey)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {t(labelKey)}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { paddingBottom: 48 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 4,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: { fontSize: 15, color: '#374151' },
  value: { fontSize: 14, color: '#6b7280', maxWidth: '60%' },
  logoutRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'flex-start',
  },
  logoutText: { color: '#dc2626', fontSize: 15, fontWeight: '500' },
  loadingRow: { padding: 24, alignItems: 'center' },
  errorText: { color: '#dc2626', fontSize: 14, padding: 16 },
  cardLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  chip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#f9fafb',
  },
  chipSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  chipTextSelected: { color: '#fff' },
  switchRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  unitToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  unitLabel: { fontSize: 14, color: '#9ca3af', fontWeight: '500' },
  unitLabelActive: { color: '#2563eb' },
})

export default SettingsScreen
