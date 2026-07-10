import type { MutableRefObject } from 'react'
import { useCallback } from 'react'
import { Alert } from 'react-native'
import * as Notifications from 'expo-notifications'
import type { useRouter } from 'expo-router'
import type { useTranslation } from 'react-i18next'
import type { useApiClient } from '@carrot/shared/api/context'
import type { ImportJobKind } from '@carrot/shared/types'
import type { NotificationItem } from '../../context/NotificationHistoryContext'

export const useHighDemandJob = ({
  api,
  router,
  t,
  pushNotif,
  highDemandJobRef,
  highDemandOfferedRef,
  streamDoneRef,
  cancelRef,
  skipGuardRef,
}: {
  api: ReturnType<typeof useApiClient>
  router: ReturnType<typeof useRouter>
  t: ReturnType<typeof useTranslation>['t']
  pushNotif: (item: Omit<NotificationItem, 'id' | 'timestamp'>) => void
  highDemandJobRef: MutableRefObject<{ kind: ImportJobKind; input: Record<string, string> } | null>
  highDemandOfferedRef: MutableRefObject<boolean>
  streamDoneRef: MutableRefObject<boolean>
  cancelRef: MutableRefObject<(() => void) | null>
  skipGuardRef: MutableRefObject<boolean>
}) =>
  useCallback(async () => {
    if (highDemandOfferedRef.current || !highDemandJobRef.current || streamDoneRef.current) return
    highDemandOfferedRef.current = true

    const job = highDemandJobRef.current

    Alert.alert(
      t('addRecipe.highDemandTitle'),
      t('addRecipe.highDemandMessage'),
      [
        { text: t('addRecipe.highDemandWait'), style: 'cancel' },
        {
          text: t('addRecipe.highDemandAccept'),
          onPress: () => {
            // The foreground stream may have finished on its own while this alert was
            // sitting on screen (React Native can't auto-dismiss a native Alert) — if so,
            // the result is already applied, so don't enqueue a redundant background job.
            if (streamDoneRef.current) return

            cancelRef.current?.()
            skipGuardRef.current = true
            // Navigate home immediately rather than back()/dismissTo(): the "open in
            // browser" fallback can leave a second import-recipe screen underneath this
            // one, and dismissTo needs an exact route-name match that proved unreliable
            // here. dismissAll() + replace() lands on home the same way the auth-redirect
            // flow does elsewhere (app/_layout.tsx).
            router.dismissAll()
            router.replace('/(tabs)')

            // Push token + enqueue happen after navigation so neither delays landing on
            // home; this screen is unmounted by the time they resolve, so failures surface
            // via a plain Alert rather than local error state.
            void (async () => {
              let devicePushToken: string | null = null
              try {
                // Simulators commonly never resolve/reject this (no real APNs registration
                // is possible) — race against a timeout so that can't block the job.
                const tokenData = await Promise.race([
                  Notifications.getDevicePushTokenAsync(),
                  new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
                ])
                devicePushToken = tokenData.data
              } catch {
                // Push token unavailable or timed out — job will run silently
              }

              try {
                const enqueued = await api.enqueueImportJob({
                  kind: job.kind,
                  input: job.input,
                  device_push_token: devicePushToken,
                })
                pushNotif({
                  type: 'recipe_importing',
                  title: t('bell.recipeImporting'),
                  body: t('bell.recipeImportingBody'),
                  job_id: enqueued.id,
                  job_kind: job.kind,
                  job_input: job.input,
                })
              } catch (err) {
                Alert.alert(
                  t('addRecipe.importFailed'),
                  err instanceof Error ? err.message : t('addRecipe.failedToEnqueueJob'),
                )
              }
            })()
          },
        },
      ],
    )
  }, [api, pushNotif, router, t, cancelRef, highDemandJobRef, highDemandOfferedRef, skipGuardRef, streamDoneRef])
