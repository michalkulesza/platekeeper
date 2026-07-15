import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

type CookingModeContextValue = {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

type CookingModeProviderProps = {
  children: React.ReactNode
}

const STORAGE_KEY = 'wakelock-default'

const CookingModeContext = createContext<CookingModeContextValue>({
  enabled: false,
  setEnabled: () => {},
})

export const CookingModeProvider = ({ children }: CookingModeProviderProps) => {
  const [enabled, setEnabledState] = useState(
    () => localStorage.getItem(STORAGE_KEY) === '1'
  )

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next)
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  }, [])

  const value = useMemo(() => ({ enabled, setEnabled }), [enabled, setEnabled])

  return (
    <CookingModeContext.Provider value={value}>
      {children}
    </CookingModeContext.Provider>
  )
}

export const useCookingMode = () => useContext(CookingModeContext)
