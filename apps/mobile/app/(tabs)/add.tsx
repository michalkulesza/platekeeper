import { useCallback, useRef } from 'react'
import { View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'

export default function AddTab() {
  const router = useRouter()
  const pushedModal = useRef(false)
  const shouldRedirect = useRef(false)

  useFocusEffect(
    useCallback(() => {
      if (shouldRedirect.current) {
        // Modal was dismissed — navigate away from the Add tab
        shouldRedirect.current = false
        router.navigate('/(tabs)/')
        return
      }
      // First focus: open the import-recipe modal
      pushedModal.current = true
      router.push('/import-recipe')

      return () => {
        if (pushedModal.current) {
          // Screen lost focus because the modal we pushed is opening
          shouldRedirect.current = true
          pushedModal.current = false
        }
      }
    }, [router])
  )

  return <View style={{ flex: 1 }} />
}
