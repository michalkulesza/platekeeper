import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react'
import { Appearance } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type AppearanceMode = 'light' | 'dark' | 'system'

type ColorSchemeContextValue = {
  mode: AppearanceMode
  setMode: (mode: AppearanceMode) => void
}

const ColorSchemeContext = createContext<ColorSchemeContextValue>({
  mode: 'light',
  setMode: () => {},
})

const STORAGE_KEY = 'color-scheme-preference'

const applyAppearanceMode = (mode: AppearanceMode) => {
  const colorScheme = mode === 'system' ? null : mode
  Appearance.setColorScheme(colorScheme as never)
}

export const ColorSchemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setModeState] = useState<AppearanceMode>('light')

  useLayoutEffect(() => {
    applyAppearanceMode('light')
  }, [])

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'light' || val === 'dark' || val === 'system') {
        setModeState(val)
        applyAppearanceMode(val)
      }
    })
  }, [])

  const setMode = useCallback((newMode: AppearanceMode) => {
    setModeState(newMode)
    void AsyncStorage.setItem(STORAGE_KEY, newMode)
    applyAppearanceMode(newMode)
  }, [])

  return (
    <ColorSchemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ColorSchemeContext.Provider>
  )
}

export const useAppearanceMode = () => useContext(ColorSchemeContext)
