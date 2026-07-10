import { PlatformColor, Pressable, Text, TextInput, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import PrimaryButton from './PrimaryButton'
import { styles } from './styles'

const QuickUrlInputRow = ({
  url,
  onUrlChange,
  onPaste,
  onImport,
}: {
  url: string
  onUrlChange: (v: string) => void
  onPaste: () => void
  onImport: () => void
}) => {
  const { t } = useTranslation()

  return (
    <View style={styles.quickUrlSection}>
      <View style={styles.urlInputGroup}>
        <TextInput
          style={styles.urlInput}
          value={url}
          onChangeText={onUrlChange}
          placeholder={t('addRecipe.urlPlaceholder')}
          placeholderTextColor={PlatformColor('placeholderText') as unknown as string}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="go"
          onSubmitEditing={onImport}
          accessibilityLabel={t('addRecipe.recipeUrl')}
          textContentType="URL"
        />
        <Pressable
          style={({ pressed }) => [styles.pasteIconBtn, pressed && { opacity: 0.7 }]}
          onPress={onPaste}
          accessibilityLabel={t('addRecipe.paste')}
          hitSlop={8}
        >
          <Text style={styles.pasteIconBtnText}>{t('addRecipe.paste')}</Text>
        </Pressable>
      </View>
      <PrimaryButton
        onPress={onImport}
        disabled={!url.trim()}
        label={t('addRecipe.import')}
        accessibilityLabel={t('addRecipe.import')}
      />
    </View>
  )
}

export default QuickUrlInputRow
