import { useEffect, useMemo, useRef } from 'react'
import {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

const PAUSE_MS = 1200
const SPEED_PX_PER_SEC = 28

// Reports completion via onDone so MarqueeSyncProvider can hand the turn to the next participant instead of every marquee scrolling at once.
export const useMarqueeAnimation = (
  contentWidth: number,
  containerWidth: number,
  turn: number | null,
  onOverflowChange: (overflows: boolean) => void,
  onDone: () => void,
) => {
  const translateX = useSharedValue(0)
  const onOverflowChangeRef = useRef(onOverflowChange)
  onOverflowChangeRef.current = onOverflowChange
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  const overflow = useMemo(() => contentWidth - containerWidth, [contentWidth, containerWidth])
  const overflows = useMemo(() => overflow > 0 && containerWidth > 0, [overflow, containerWidth])

  useEffect(() => {
    onOverflowChangeRef.current(overflows)
  }, [overflows])

  useEffect(() => {
    if (turn === null || !overflows) {
      cancelAnimation(translateX)
      translateX.value = 0
      return
    }

    translateX.value = 0

    const duration = (overflow / SPEED_PX_PER_SEC) * 1000
    const handleReturnComplete = (finished?: boolean) => {
      if (finished) runOnJS(onDoneRef.current)()
    }

    translateX.value = withSequence(
      withDelay(PAUSE_MS, withTiming(-overflow, { duration, easing: Easing.linear })),
      withDelay(PAUSE_MS, withTiming(0, { duration, easing: Easing.linear }, handleReturnComplete)),
    )

    return () => cancelAnimation(translateX)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overflow, overflows, turn])

  return useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))
}
