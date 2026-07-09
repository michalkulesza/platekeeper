import { useCallback, useEffect, useState } from 'react'
import { LayoutChangeEvent, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native'
import Reanimated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

const PAUSE_MS = 1200
const SPEED_PX_PER_SEC = 28

type Props = {
  text: string
  style?: StyleProp<TextStyle>
  containerStyle?: StyleProp<ViewStyle>
}

// Single-line text that scrolls back and forth (like a K.I.T. scanner) when it
// doesn't fit its container, instead of wrapping or truncating with an ellipsis.
//
// The visible text is given an explicit numeric width (measured via an
// invisible copy) rather than left to "auto". A plain `maxWidth` clamp on
// the measuring Text itself is not enough: Yoga still derives the "available
// space" it measures an auto-width node against from the real (narrow)
// ancestor, and a local maxWidth only ever shrinks that bound further, never
// widens it. To get the text's true, uncapped single-line width, the
// measurer needs an ancestor whose width is *explicit* (not auto) and large
// — explicit dimensions are resolved directly, without consulting outer
// constraints — so the inner Text's own available-space bound comes from
// that generous explicit width instead of the real container.
const MEASURE_MAX_WIDTH = 2000
const MarqueeText = ({ text, style, containerStyle }: Props) => {
  const [containerWidth, setContainerWidth] = useState(0)
  const [textWidth, setTextWidth] = useState(0)
  const translateX = useSharedValue(0)

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width)
  }, [])

  const onTextLayout = useCallback((e: LayoutChangeEvent) => {
    setTextWidth(e.nativeEvent.layout.width)
  }, [])

  useEffect(() => {
    const overflow = textWidth - containerWidth
    if (overflow > 0 && containerWidth > 0) {
      const duration = (overflow / SPEED_PX_PER_SEC) * 1000
      translateX.value = 0
      translateX.value = withRepeat(
        withSequence(
          withDelay(PAUSE_MS, withTiming(-overflow, { duration, easing: Easing.linear })),
          withDelay(PAUSE_MS, withTiming(0, { duration, easing: Easing.linear })),
        ),
        -1,
      )
    } else {
      cancelAnimation(translateX)
      translateX.value = 0
    }
    return () => cancelAnimation(translateX)
  }, [textWidth, containerWidth, translateX])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  return (
    <View style={[{ overflow: 'hidden' }, containerStyle]} onLayout={onContainerLayout}>
      <View
        style={{
          position: 'absolute',
          opacity: 0,
          width: MEASURE_MAX_WIDTH,
          height: 0,
          overflow: 'hidden',
        }}
      >
        <Text
          numberOfLines={1}
          style={[style, { alignSelf: 'flex-start' }]}
          onLayout={onTextLayout}
        >
          {text}
        </Text>
      </View>
      <Reanimated.View style={[{ flexDirection: 'row' }, animatedStyle]}>
        <Text
          numberOfLines={1}
          style={[style, textWidth > 0 ? { width: textWidth } : null]}
        >
          {text}
        </Text>
      </Reanimated.View>
    </View>
  )
}

export default MarqueeText
