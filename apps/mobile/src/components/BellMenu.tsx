import { useCallback, useMemo } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { MenuView } from '@react-native-menu/menu'
import { useTranslation } from 'react-i18next'
import { Feather } from '@expo/vector-icons'
import { colors } from '../theme/colors'
import {
  useTimers,
  getRemainingSeconds,
  formatCountdown,
} from '../context/TimerContext'
import { useNotificationHistory } from '../context/NotificationHistoryContext'
import { useHousehold } from '../context/HouseholdContext'
import { useApiClient } from '@platekeeper/shared/api/context'

const BellMenu = () => {
  const { t } = useTranslation()
  const { timers, pauseTimer, resumeTimer, cancelTimer } = useTimers()
  const { items: notifHistory, clearAll: clearNotifHistory } = useNotificationHistory()
  const { invitations, refetchHouseholds, refetchInvitations } = useHousehold()
  const api = useApiClient()

  const timerList = useMemo(() => [...timers.values()], [timers])
  const totalCount = timerList.length + invitations.length + notifHistory.length

  const actions = useMemo(() => {
    if (totalCount === 0) {
      return [{ id: 'empty', title: t('bell.noNotifications'), attributes: { disabled: true } }]
    }

    const items = []

    for (const timer of timerList) {
      const remaining = getRemainingSeconds(timer)
      const isRunning = timer.status === 'running'
      items.push({
        id: `timer-${timer.id}`,
        title: timer.recipeTitle,
        subtitle: isRunning
          ? formatCountdown(remaining)
          : `${t('timers.timerPaused')} · ${formatCountdown(remaining)}`,
        image: 'timer',
        subactions: [
          isRunning
            ? { id: `timer-pause-${timer.id}`, title: t('common.pause'), image: 'pause.circle' }
            : { id: `timer-resume-${timer.id}`, title: t('common.resume'), image: 'play.circle' },
          {
            id: `timer-cancel-${timer.id}`,
            title: t('common.cancel'),
            image: 'xmark.circle',
            attributes: { destructive: true },
          },
        ],
      })
    }

    for (const inv of invitations) {
      items.push({
        id: `inv-${inv.id}`,
        title: inv.household_name,
        subtitle: t('bell.from', { name: inv.invited_by_nickname || inv.invited_by_email }),
        image: 'house',
        subactions: [
          { id: `inv-accept-${inv.id}`, title: t('common.accept'), image: 'checkmark.circle' },
          {
            id: `inv-decline-${inv.id}`,
            title: t('common.decline'),
            image: 'xmark.circle',
            attributes: { destructive: true },
          },
        ],
      })
    }

    if (notifHistory.length > 0) {
      items.push({
        id: 'clear-history',
        title: t('common.clearAll'),
        image: 'trash',
        attributes: { destructive: true },
      })
    }

    return items
  }, [timerList, invitations, notifHistory, totalCount, t])

  const handleAction = useCallback(
    async ({ nativeEvent }: { nativeEvent: { event: string } }) => {
      const id = nativeEvent.event
      if (id.startsWith('timer-pause-')) {
        pauseTimer(id.slice('timer-pause-'.length))
      } else if (id.startsWith('timer-resume-')) {
        resumeTimer(id.slice('timer-resume-'.length))
      } else if (id.startsWith('timer-cancel-')) {
        cancelTimer(id.slice('timer-cancel-'.length))
      } else if (id.startsWith('inv-accept-')) {
        try {
          await api.acceptInvitation(id.slice('inv-accept-'.length))
          refetchInvitations()
          refetchHouseholds()
        } catch (e) {
          Alert.alert(t('common.ok'), e instanceof Error ? e.message : 'Error')
        }
      } else if (id.startsWith('inv-decline-')) {
        try {
          await api.declineInvitation(id.slice('inv-decline-'.length))
          refetchInvitations()
        } catch {
          // ignore
        }
      } else if (id === 'clear-history') {
        clearNotifHistory()
      }
    },
    [pauseTimer, resumeTimer, cancelTimer, api, refetchInvitations, refetchHouseholds, clearNotifHistory, t],
  )

  return (
    <MenuView
      title={t('bell.notifications')}
      actions={actions}
      onPressAction={handleAction}
    >
      <View style={styles.bellBtn}>
        <Feather name="bell" size={22} color={colors.secondaryLabel} />
        {totalCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalCount > 9 ? '9+' : totalCount}</Text>
          </View>
        )}
      </View>
    </MenuView>
  )
}

const styles = StyleSheet.create({
  bellBtn: { padding: 4, position: 'relative' },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: colors.background, fontSize: 11, fontWeight: '700' },
})

export default BellMenu
