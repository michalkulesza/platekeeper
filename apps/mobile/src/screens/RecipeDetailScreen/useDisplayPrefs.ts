import { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import * as KeepAwake from 'expo-keep-awake'
import { FONT_SIZE_STORAGE_KEY, KEEP_AWAKE_RECIPE_TAG, SHOW_STEP_QTY_STORAGE_KEY } from './helpers'
import { useCookingMode } from '../../context/CookingModeContext'

export const useDisplayPrefs = () => {
  const { enabled: keepScreenOn, setEnabled: setKeepScreenOn } = useCookingMode()
  const [showStepQty, setShowStepQty] = useState(true)
  const [fontSizeIndex, setFontSizeIndex] = useState(2)

  useEffect(() => {
    AsyncStorage.getItem(SHOW_STEP_QTY_STORAGE_KEY).then((val) => {
      if (val !== null) setShowStepQty(val === '1')
    })
    AsyncStorage.getItem(FONT_SIZE_STORAGE_KEY).then((val) => {
      if (val !== null) setFontSizeIndex(Number(val))
    })
    return () => {
      KeepAwake.deactivateKeepAwake(KEEP_AWAKE_RECIPE_TAG)
    }
  }, [])

  useEffect(() => {
    if (keepScreenOn) void KeepAwake.activateKeepAwakeAsync(KEEP_AWAKE_RECIPE_TAG)
    else KeepAwake.deactivateKeepAwake(KEEP_AWAKE_RECIPE_TAG)
  }, [keepScreenOn])

  const handleToggleKeepScreenOn = useCallback(
    (val: boolean) => {
      setKeepScreenOn(val)
    },
    [setKeepScreenOn],
  )

  const handleFontSizeChange = useCallback((index: number) => {
    setFontSizeIndex(index)
    void AsyncStorage.setItem(FONT_SIZE_STORAGE_KEY, String(index))
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)
  }, [])

  return {
    keepScreenOn,
    showStepQty,
    fontSizeIndex,
    handleToggleKeepScreenOn,
    handleFontSizeChange,
  }
}
