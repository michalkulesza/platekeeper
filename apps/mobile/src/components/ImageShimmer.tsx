import { useEffect } from 'react'
import { StyleSheet, ViewStyle } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'
import { colors } from '../theme/colors'

const ImageShimmer = ({ style }: { style?: ViewStyle }) => {
  const opacity = useSharedValue(0.4)

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }), -1, true)
  }, [opacity])

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return <Animated.View style={[StyleSheet.absoluteFill, styles.bone, style, animatedStyle]} />
}

const styles = StyleSheet.create({
  bone: { backgroundColor: colors.gray5 },
})

export default ImageShimmer
