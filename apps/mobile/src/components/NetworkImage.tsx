import { useCallback, useEffect, useState } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { Image, ImageContentFit, ImageProps } from 'expo-image'
import ImageShimmer from './ImageShimmer'

const NetworkImage = ({
  uri,
  style,
  contentFit = 'cover',
  cachePolicy = 'memory-disk',
  recyclingKey,
  accessibilityLabel,
  onError,
}: {
  uri: string
  style: StyleProp<ViewStyle>
  contentFit?: ImageContentFit
  cachePolicy?: ImageProps['cachePolicy']
  recyclingKey?: string | null
  accessibilityLabel?: string
  onError?: () => void
}) => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => setLoaded(false), [uri])

  const handleLoad = useCallback(() => setLoaded(true), [])

  const handleError = useCallback(() => {
    setLoaded(true)
    onError?.()
  }, [onError])

  return (
    <View style={[style, styles.wrapper]}>
      {!loaded && <ImageShimmer />}
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        cachePolicy={cachePolicy}
        recyclingKey={recyclingKey}
        accessibilityLabel={accessibilityLabel}
        transition={220}
        onLoad={handleLoad}
        onError={handleError}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { overflow: 'hidden' },
})

export default NetworkImage
