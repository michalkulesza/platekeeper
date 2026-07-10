import { useEffect, useRef } from 'react'
import { Animated, Easing, PlatformColor, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { styles } from './styles'

const useSkeletonPulse = () => {
  const pulse = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [pulse])

  return pulse
}

const INGREDIENT_BONE_WIDTHS = ['92%', '78%', '85%', '64%', '80%'] as const
const STEP_BONE_COUNT = 3

// Mirrors RecipeFormView's exact layout so the transition into real content doesn't jump.
const RecipeImportSkeleton = ({ progress }: { progress: Animated.Value }) => {
  const opacity = useSkeletonPulse()

  return (
    <View>
      <View style={[styles.previewHeroImage, styles.skeletonHeroWrap]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.skeletonBone, { opacity }]} />
        <View style={styles.skeletonProgressCard}>
          <Ionicons name="restaurant-outline" size={22} color={PlatformColor('secondaryLabel') as unknown as string} />
          <View style={styles.skeletonProgressTrack}>
            <Animated.View
              style={[
                styles.skeletonProgressFill,
                { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
              ]}
            />
          </View>
        </View>
      </View>
      <View style={styles.previewCard}>
        <Animated.View style={[styles.skeletonBone, styles.skeletonTitleLine, { opacity, width: '70%' }]} />
        <Animated.View style={[styles.skeletonBone, styles.skeletonTitleLine, { opacity, width: '42%', marginBottom: 14 }]} />

        <View style={styles.previewTagRow}>
          {[54, 68, 46].map((w, i) => (
            <Animated.View key={i} style={[styles.skeletonBone, styles.skeletonTag, { opacity, width: w }]} />
          ))}
        </View>

        <View style={styles.skeletonMetaRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={styles.skeletonMetaBox}>
              <Animated.View style={[styles.skeletonBone, styles.skeletonMetaNumber, { opacity }]} />
              <Animated.View style={[styles.skeletonBone, styles.skeletonMetaLabel, { opacity }]} />
            </View>
          ))}
        </View>

        <View style={styles.previewSection}>
          <Animated.View style={[styles.skeletonBone, styles.skeletonLabel, { opacity }]} />
          {INGREDIENT_BONE_WIDTHS.map((w, i) => (
            <View key={i} style={styles.previewIngredientRow}>
              <Animated.View style={[styles.skeletonBone, styles.skeletonBullet, { opacity }]} />
              <Animated.View style={[styles.skeletonBone, styles.skeletonIngredientLine, { opacity, width: w }]} />
            </View>
          ))}
        </View>

        <View style={styles.previewSection}>
          <Animated.View style={[styles.skeletonBone, styles.skeletonLabel, { opacity }]} />
          {Array.from({ length: STEP_BONE_COUNT }).map((_, i) => (
            <View key={i} style={styles.previewStepRow}>
              <Animated.View style={[styles.skeletonBone, styles.skeletonStepNum, { opacity }]} />
              <View style={styles.flex}>
                <Animated.View style={[styles.skeletonBone, styles.skeletonStepLine, { opacity, width: '100%', marginBottom: 6 }]} />
                <Animated.View style={[styles.skeletonBone, styles.skeletonStepLine, { opacity, width: '58%' }]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default RecipeImportSkeleton
