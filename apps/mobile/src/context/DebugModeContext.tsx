import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

type DebugModeContextValue = {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

const DebugModeContext = createContext<DebugModeContextValue>({
  enabled: false,
  setEnabled: () => {},
})

const STORAGE_KEY = 'debug-mode-enabled'

export const DebugModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [enabled, setEnabledState] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'true') setEnabledState(true)
    })
  }, [])

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next)
    void AsyncStorage.setItem(STORAGE_KEY, next ? 'true' : 'false')
  }, [])

  return (
    <DebugModeContext.Provider value={{ enabled, setEnabled }}>
      {children}
    </DebugModeContext.Provider>
  )
}

export const useDebugMode = () => useContext(DebugModeContext)
