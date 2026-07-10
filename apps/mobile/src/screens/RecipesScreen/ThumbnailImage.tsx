import { useState } from 'react'
import { Image } from 'expo-image'
import { proxyThumbnailUrl, PLACEHOLDER_URL } from '../../api/thumbnailUrl'

const ThumbnailImage = ({ url, style }: { url: string; style: object }) => {
  const [errored, setErrored] = useState(false)
  const fallbackUri = PLACEHOLDER_URL || undefined
  if (errored && fallbackUri) {
    return <Image source={{ uri: fallbackUri }} style={style} contentFit="cover" />
  }
  return (
    <Image
      source={{ uri: proxyThumbnailUrl(url)! }}
      style={style}
      contentFit="cover"
      cachePolicy="memory-disk"
      recyclingKey={url}
      onError={() => setErrored(true)}
    />
  )
}

export default ThumbnailImage
