import { AppState } from 'react-native'
import { useEffect, useState } from 'react'

export const useIsAppActive = () => {
  const [isAppActive, setIsAppActive] = useState(AppState.currentState === 'active')

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      setIsAppActive(nextState === 'active')
    })

    return () => subscription.remove()
  }, [])

  return isAppActive
}
