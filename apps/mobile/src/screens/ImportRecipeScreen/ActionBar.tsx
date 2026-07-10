import { Pressable, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import PrimaryButton from './PrimaryButton'
import { styles } from './styles'

const ActionBar = ({
  editable,
  showImportBtn,
  showImportShareBtn,
  showExtractBtn,
  saving,
  loading,
  url,
  pastedText,
  bottomInset,
  onDiscard,
  onSave,
  onImportUrl,
  onImportText,
}: {
  editable: boolean
  showImportBtn: boolean
  showImportShareBtn: boolean
  showExtractBtn: boolean
  saving: boolean
  loading: boolean
  url: string
  pastedText: string
  bottomInset: number
  onDiscard: () => void
  onSave: () => void
  onImportUrl: () => void
  onImportText: () => void
}) => {
  const { t } = useTranslation()

  if (!editable && !showImportBtn && !showImportShareBtn && !showExtractBtn) return null

  return (
    <View style={[styles.actionBar, { paddingBottom: Math.max(bottomInset, 16) }]}>
      {editable ? (
        <>
          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, styles.flex, pressed && { opacity: 0.7 }]}
            onPress={onDiscard}
            disabled={saving}
            accessibilityLabel={t('addRecipe.discard')}
          >
            <Text style={styles.secondaryBtnText}>{t('addRecipe.discard')}</Text>
          </Pressable>
          <PrimaryButton
            style={styles.flex}
            onPress={onSave}
            disabled={saving}
            loading={saving}
            label={t('common.save')}
            accessibilityLabel={t('common.save')}
          />
        </>
      ) : showImportBtn || showImportShareBtn ? (
        <PrimaryButton
          style={styles.flex}
          onPress={onImportUrl}
          disabled={!url.trim() || loading}
          loading={loading}
          label={t('addRecipe.import')}
          accessibilityLabel={t('addRecipe.import')}
        />
      ) : showExtractBtn ? (
        <PrimaryButton
          style={styles.flex}
          onPress={onImportText}
          disabled={!pastedText.trim() || loading}
          loading={loading}
          label={t('addRecipe.extractRecipe')}
          accessibilityLabel={t('addRecipe.extractRecipe')}
        />
      ) : null}
    </View>
  )
}

export default ActionBar
