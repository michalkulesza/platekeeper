import { useCallback, useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ALLERGEN_KEYS, INTOLERANCE_KEYS } from '@carrot/shared/utils/allergenKeys'
import { iKey } from './helpers'
import { styles } from './styles'

type ExpandedSection = 'allergens' | 'intolerances' | null

const AccordionGroup = ({
  keysList,
  namespace,
  sectionKey,
  label,
  expanded,
  onToggleExpand,
  predefined,
  onToggleKey,
}: {
  keysList: string[]
  namespace: 'allergens' | 'intolerances'
  sectionKey: 'allergens' | 'intolerances'
  label: string
  expanded: ExpandedSection
  onToggleExpand: (key: ExpandedSection) => void
  predefined: string[]
  onToggleKey: (key: string) => void
}) => {
  const { t } = useTranslation()
  const isExpanded = expanded === sectionKey

  return (
    <View style={styles.accordionBlock}>
      <Pressable
        style={({ pressed }) => [styles.accordionHeader, pressed && { opacity: 0.7 }]}
        onPress={() => onToggleExpand(isExpanded ? null : sectionKey)}
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
      >
        <Text style={styles.accordionLabel}>{label}</Text>
        <Text style={styles.accordionChevron}>{isExpanded ? '▲' : '▼'}</Text>
      </Pressable>
      {isExpanded && (
        <View style={styles.accordionBody}>
          {keysList.map((key) => {
            const k = iKey(key)
            const desc = t(`${namespace}.${k}_desc`, { defaultValue: '' })
            const isSelected = predefined.includes(key)
            return (
              <Pressable
                key={key}
                style={({ pressed }) => [styles.checkRow, pressed && { opacity: 0.7 }]}
                onPress={() => onToggleKey(key)}
                accessibilityLabel={t(`${namespace}.${k}`)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.checkContent}>
                  <Text style={styles.checkLabel}>{t(`${namespace}.${k}`)}</Text>
                  {desc ? <Text style={styles.checkDesc}>{desc}</Text> : null}
                </View>
              </Pressable>
            )
          })}
        </View>
      )}
    </View>
  )
}

const AllergenSection = ({
  allergens,
  scopeLabel,
  onSave,
  onReanalyze,
}: {
  allergens: string[]
  scopeLabel: string
  onSave: (data: string[]) => Promise<void>
  onReanalyze: (callbacks: {
    onStart: (total: number) => void
    onProgress: (done: number, total: number) => void
    onComplete: (analyzed: number) => void
    onError: (msg: string) => void
  }) => void
}) => {
  const { t } = useTranslation()
  const [predefined, setPredefined] = useState<string[]>(allergens ?? [])
  const [saving, setSaving] = useState(false)
  const [reanalyzing, setReanalyzing] = useState(false)
  const [reanalyzeProgress, setReanalyzeProgress] = useState<{ done: number; total: number } | null>(null)
  const [expanded, setExpanded] = useState<ExpandedSection>(null)

  const togglePredefined = useCallback((key: string) => {
    setPredefined((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    )
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await onSave(predefined)
      Alert.alert(t('common.ok'), t('settings.allergensSaved'))
    } catch (e) {
      Alert.alert(t('common.ok'), e instanceof Error ? e.message : t('settings.failedToSave'))
    } finally {
      setSaving(false)
    }
  }, [onSave, predefined, t])

  const handleReanalyze = useCallback(() => {
    setReanalyzing(true)
    setReanalyzeProgress({ done: 0, total: 0 })
    onReanalyze({
      onStart: (total) => setReanalyzeProgress({ done: 0, total }),
      onProgress: (done, total) => setReanalyzeProgress({ done, total }),
      onComplete: (analyzed) => {
        setReanalyzing(false)
        setReanalyzeProgress(null)
        Alert.alert(t('common.ok'), t('settings.reanalyzedRecipes', { count: analyzed }))
      },
      onError: (msg) => {
        setReanalyzing(false)
        setReanalyzeProgress(null)
        Alert.alert(t('common.ok'), msg)
      },
    })
  }, [onReanalyze, t])

  const reanalyzeButtonLabel = reanalyzing
    ? reanalyzeProgress && reanalyzeProgress.total > 0
      ? t('settings.analyzingProgress', {
          done: reanalyzeProgress.done,
          total: reanalyzeProgress.total,
        })
      : t('settings.starting')
    : t('settings.reAnalyzeRecipes')

  return (
    <View>
      <Text style={styles.scopeLabel}>{scopeLabel}</Text>
      <Text style={styles.allergenDisclaimer}>{t('settings.allergenDisclaimer')}</Text>

      <AccordionGroup
        keysList={ALLERGEN_KEYS}
        namespace="allergens"
        sectionKey="allergens"
        label={t('settings.allergens')}
        expanded={expanded}
        onToggleExpand={setExpanded}
        predefined={predefined}
        onToggleKey={togglePredefined}
      />
      <AccordionGroup
        keysList={INTOLERANCE_KEYS}
        namespace="intolerances"
        sectionKey="intolerances"
        label={t('settings.intolerances')}
        expanded={expanded}
        onToggleExpand={setExpanded}
        predefined={predefined}
        onToggleKey={togglePredefined}
      />

      <Pressable
        style={({ pressed }) => [styles.saveBtn, saving && styles.saveBtnDisabled, pressed && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={saving}
        accessibilityLabel={t('common.save')}
        accessibilityRole="button"
      >
        <Text style={styles.saveBtnText}>
          {saving ? t('common.saving') : t('common.save')}
        </Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.reanalyzeBtn, reanalyzing && styles.saveBtnDisabled, pressed && { opacity: 0.7 }]}
        onPress={handleReanalyze}
        disabled={reanalyzing}
        accessibilityLabel={t('settings.reAnalyzeRecipes')}
        accessibilityRole="button"
      >
        <Text style={styles.reanalyzeBtnText}>{reanalyzeButtonLabel}</Text>
      </Pressable>
    </View>
  )
}

export default AllergenSection
