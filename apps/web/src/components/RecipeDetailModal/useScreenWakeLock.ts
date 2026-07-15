import { useCallback, useEffect, useRef } from 'react'
import { useCookingMode } from '../../context/CookingModeContext'

export const useScreenWakeLock = (recipeIsOpen: boolean) => {
  const { enabled: active, setEnabled } = useCookingMode()
  const sentinelRef = useRef<WakeLockSentinel | null>(null)
  const shouldKeepScreenAwake = active && recipeIsOpen

  useEffect(() => {
    if (!shouldKeepScreenAwake) {
      sentinelRef.current?.release().catch(() => {})
      sentinelRef.current = null

      return
    }

    let stale = false
    navigator.wakeLock
      ?.request('screen')
      .then((s) => {
        if (stale) {
          s.release()

          return
        }
        sentinelRef.current = s
      })
      .catch(() => {})

    return () => {
      stale = true
      sentinelRef.current?.release().catch(() => {})
      sentinelRef.current = null
    }
  }, [shouldKeepScreenAwake])

  useEffect(() => {
    const onVisible = () => {
      if (
        document.visibilityState === 'visible' &&
        shouldKeepScreenAwake &&
        !sentinelRef.current
      ) {
        navigator.wakeLock
          ?.request('screen')
          .then((s) => {
            sentinelRef.current = s
          })
          .catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [shouldKeepScreenAwake])

  const toggle = useCallback(() => {
    setEnabled(!active)
  }, [active, setEnabled])

  return {
    active,
    toggle,
  }
}
