import { useCallback, useLayoutEffect } from 'react'
import { Alert, PlatformColor, Pressable, Text, View } from 'react-native'
import type { NavigationProp, NavigationState } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { Feather } from '@expo/vector-icons'
import BugReportButton from '../../components/BugReportButton'
import type { EditableRecipe, ImportMode } from './helpers'
import { isBlankRecipe } from './helpers'
import { styles } from './styles'

const EditableHeaderRight = ({ onEditPress }: { onEditPress: () => void }) => {
  const { t } = useTranslation()

  return (
    <View style={styles.headerBtns}>
      <Pressable
        onPress={onEditPress}
        hitSlop={8}
        style={({ pressed }) => [styles.headerEditBtn, pressed && { opacity: 0.5 }]}
        accessibilityLabel={t('common.edit')}
        accessibilityRole="button"
      >
        <Feather name="edit-2" size={22} color={PlatformColor('secondaryLabel') as unknown as string} />
      </Pressable>
      <BugReportButton />
    </View>
  )
}

export const useImportRecipeHeader = ({
  navigation,
  mode,
  editable,
  previewMode,
  loading,
  t,
  reset,
  setMode,
  setPreviewMode,
}: {
  navigation: Omit<NavigationProp<ReactNavigation.RootParamList>, 'getState'> & {
    getState(): NavigationState | undefined
  }
  mode: ImportMode | null
  editable: EditableRecipe | null
  previewMode: boolean
  loading: boolean
  t: ReturnType<typeof useTranslation>['t']
  reset: () => void
  setMode: (mode: ImportMode | null) => void
  setPreviewMode: (preview: boolean) => void
}) => {
  const renderBackButton = useCallback(
    (onPress: () => void) => () => (
      <Pressable
        onPress={onPress}
        hitSlop={8}
        style={({ pressed }) => [styles.headerBackBtnWrap, pressed && { opacity: 0.5 }]}
        accessibilityLabel={t('common.back')}
      >
        <Feather name="chevron-left" size={24} color={PlatformColor('label') as unknown as string} style={styles.headerBackChevron} />
        <Text style={styles.headerBackBtn}>{t('common.back')}</Text>
      </Pressable>
    ),
    [t],
  )

  const handleEditableBackPress = useCallback(() => {
    if (!editable) return
    if (!previewMode && mode !== 'scratch') {
      setPreviewMode(true)
      return
    }
    if (isBlankRecipe(editable)) {
      reset()
      setMode(null)
      return
    }
    Alert.alert(t('addRecipe.discard'), t('addRecipe.discardMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('addRecipe.discard'), style: 'destructive', onPress: () => { reset(); setMode(null) } },
    ])
  }, [editable, previewMode, mode, setPreviewMode, reset, setMode, t])

  const handleModeBackPress = useCallback(() => {
    reset()
    if (loading) {
      navigation.goBack()
    } else {
      setMode(null)
    }
  }, [reset, loading, navigation, setMode])

  const handleEditPress = useCallback(() => setPreviewMode(false), [setPreviewMode])

  useLayoutEffect(() => {
    if (editable) {
      const editableHeaderOptions = {
        gestureEnabled: false,
        headerTransparent: true,
        headerTitle: '',
        headerShadowVisible: false,
        headerLeft: renderBackButton(handleEditableBackPress),
        headerRight: previewMode
          ? () => <EditableHeaderRight onEditPress={handleEditPress} />
          : () => <BugReportButton />,
      }
      navigation.setOptions(editableHeaderOptions)
    } else if (mode) {
      const modeHeaderOptions = {
        gestureEnabled: true,
        headerTransparent: false,
        headerTitle: t('addRecipe.addRecipe'),
        headerShadowVisible: false,
        headerLeft: renderBackButton(handleModeBackPress),
        headerRight: () => <BugReportButton />,
      }
      navigation.setOptions(modeHeaderOptions)
    } else {
      const defaultHeaderOptions = {
        gestureEnabled: true,
        headerTransparent: false,
        headerTitle: t('addRecipe.addRecipe'),
        headerShadowVisible: false,
        headerLeft: renderBackButton(() => navigation.goBack()),
        headerRight: () => <BugReportButton />,
      }
      navigation.setOptions(defaultHeaderOptions)
    }
  }, [navigation, mode, editable, previewMode, t, renderBackButton, handleEditableBackPress, handleModeBackPress, handleEditPress])
}
