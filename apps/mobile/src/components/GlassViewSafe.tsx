import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect'
import type { ComponentProps } from 'react'
import { View } from 'react-native'
import { useResolvedColorScheme } from '../context/ColorSchemeContext'

export const glassAvailable = isGlassEffectAPIAvailable()

const GlassViewSafe = (props: ComponentProps<typeof GlassView>) => {
  const resolvedColorScheme = useResolvedColorScheme()
  return glassAvailable ? (
    <GlassView colorScheme={resolvedColorScheme} {...props} />
  ) : (
    <View style={[props.style, { backgroundColor: props.tintColor }]} />
  )
}

export default GlassViewSafe
