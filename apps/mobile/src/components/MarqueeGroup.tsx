import { ReactNode, useCallback, useEffect, useState } from 'react'

export type MarqueeTurn = {
  turn: number | null
  onOverflowChange: (overflows: boolean) => void
  onDone: () => void
}

type Props = {
  count: number
  children: (turns: MarqueeTurn[]) => ReactNode
}

// Coordinates a fixed set of marquee-style children (e.g. a recipe card's
// title and its tag row) so only one scrolls at a time: the active slot runs
// one full pause-scroll-pause-scroll-back cycle, then hands the turn to the
// next slot that actually has overflowing content, looping forever. Slots
// that never overflow are skipped instead of stalling the rotation.
const MarqueeGroup = ({ count, children }: Props) => {
  const [overflows, setOverflows] = useState<boolean[]>(() => Array(count).fill(false))
  const [activeIndex, setActiveIndex] = useState(0)
  const [turn, setTurn] = useState(0)

  const setOverflow = useCallback((index: number, value: boolean) => {
    setOverflows((prev) => (prev[index] === value ? prev : prev.map((v, i) => (i === index ? value : v))))
  }, [])

  const advance = useCallback(() => {
    setActiveIndex((prev) => {
      for (let step = 1; step <= count; step++) {
        const next = (prev + step) % count
        if (overflows[next]) return next
      }
      return prev
    })
    setTurn((t) => t + 1)
  }, [count, overflows])

  useEffect(() => {
    if (!overflows[activeIndex]) advance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overflows, activeIndex])

  const turns: MarqueeTurn[] = Array.from({ length: count }, (_, index) => ({
    turn: activeIndex === index ? turn : null,
    onOverflowChange: (value: boolean) => setOverflow(index, value),
    onDone: () => {
      if (activeIndex === index) advance()
    },
  }))

  return <>{children(turns)}</>
}

export default MarqueeGroup
