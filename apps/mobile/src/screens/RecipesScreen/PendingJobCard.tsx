import { useMemo } from 'react'
import { ActivityIndicator, PlatformColor, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors } from '../../theme/colors'
import type { NotificationItem } from '../../context/NotificationHistoryContext'
import { styles } from './styles'

const PendingJobCard = ({ notif }: { notif: NotificationItem }) => {
  const { t } = useTranslation()
  const sourceKey = `recipes.extractingFrom_${notif.job_kind ?? 'image'}` as const
  const startedAt = useMemo(() => {
    const d = new Date(notif.timestamp)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }, [notif.timestamp])
  return (
    <View style={styles.pendingCard}>
      <View style={styles.pendingImageWrap}>
        <Feather name="clock" size={28} color={PlatformColor('secondaryLabel') as unknown as string} />
      </View>
      <View style={styles.pendingBody}>
        <Text style={styles.pendingTitle}>{t('recipes.extractingRecipe')}</Text>
        <Text style={styles.pendingMeta}>{t(sourceKey)}  ·  {startedAt}</Text>
      </View>
      <View style={styles.pendingSpinnerWrap}>
        <ActivityIndicator size="small" color={colors.brand} />
      </View>
    </View>
  )
}

export default PendingJobCard
