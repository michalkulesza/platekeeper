import { ReactNode, useCallback, useState } from 'react'
import { LayoutChangeEvent, StyleProp, View, ViewStyle } from 'react-native'
import Reanimated from 'react-native-reanimated'
import { useMarqueeAnimation } from './useMarqueeAnimation'

type Props = {
  children: ReactNode
  containerStyle?: StyleProp<ViewStyle>
  gap?: number
  turn: number | null
  onOverflowChange: (overflows: boolean) => void
  onDone: () => void
}

const MarqueeRow = ({ children, containerStyle, gap = 0, turn, onOverflowChange, onDone }: Props) => {
  const [containerWidth, setContainerWidth] = useState(0)
  const [contentWidth, setContentWidth] = useState(0)

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width)
  }, [])

  const onContentLayout = useCallback((e: LayoutChangeEvent) => {
    setContentWidth(e.nativeEvent.layout.width)
  }, [])

  const animatedStyle = useMarqueeAnimation(contentWidth, containerWidth, turn, onOverflowChange, onDone)

  const measuredWidthStyle = contentWidth > 0 ? { width: contentWidth } : null

  return (
    <View style={[{ overflow: 'hidden' }, containerStyle]} onLayout={onContainerLayout}>
      {/* Invisible copy reports intrinsic width, since Yoga would otherwise clamp an in-flow row to the overflow:hidden container's width. */}
      <View
        style={{ position: 'absolute', opacity: 0, flexDirection: 'row', gap }}
        onLayout={onContentLayout}
      >
        {children}
      </View>
      <Reanimated.View style={[{ flexDirection: 'row', gap }, animatedStyle, measuredWidthStyle]}>
        {children}
      </Reanimated.View>
    </View>
  )
}

export default MarqueeRow
