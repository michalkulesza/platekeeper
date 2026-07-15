import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

type CookingModeContextValue = {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

const STORAGE_KEY = 'recipe-keep-screen-default'

const CookingModeContext = createContext<CookingModeContextValue>({
  enabled: false,
  setEnabled: () => {},
})

export const CookingModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [enabled, setEnabledState] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      setEnabledState(value === '1')
    })
  }, [])

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next)
    void AsyncStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  }, [])

  const value = useMemo(() => ({ enabled, setEnabled }), [enabled, setEnabled])

  return <CookingModeContext.Provider value={value}>{children}</CookingModeContext.Provider>
}

export const useCookingMode = () => useContext(CookingModeContext)
