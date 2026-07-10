import { PlatformColor, Pressable, Text, TextInput, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { styles } from './styles'

const ShareView = ({
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
    <View style={styles.inputSection}>
      <View style={styles.shareTipCard}>
        <Text style={styles.shareTipText}>{t('addRecipe.shareTitle')}{'\n'}{t('addRecipe.shareInstructions')}</Text>
      </View>
      <Text style={styles.shareUrlLabel}>{t('addRecipe.shareUrlLabel')}</Text>
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
          accessibilityLabel={t('addRecipe.shareUrlLabel')}
          textContentType="URL"
        />
        <Pressable
          style={({ pressed }) => [styles.pasteBtn, pressed && { opacity: 0.7 }]}
          onPress={onPaste}
          accessibilityLabel={t('addRecipe.paste')}
          hitSlop={4}
        >
          <Text style={styles.pasteBtnText}>{t('addRecipe.paste')}</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default ShareView
