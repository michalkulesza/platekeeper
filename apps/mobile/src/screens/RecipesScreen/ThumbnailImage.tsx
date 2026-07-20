import { useState } from 'react'
import NetworkImage from '../../components/NetworkImage'
import { proxyThumbnailUrl, PLACEHOLDER_URL } from '../../api/thumbnailUrl'

const ThumbnailImage = ({ url, style }: { url: string | null; style: object }) => {
  const [errored, setErrored] = useState(false)
  const fallbackUri = PLACEHOLDER_URL || undefined
  if (errored && fallbackUri) {
    return <NetworkImage uri={fallbackUri} style={style} />
  }
  return (
    <NetworkImage
      uri={proxyThumbnailUrl(url)!}
      style={style}
      recyclingKey={url}
      onError={() => setErrored(true)}
    />
  )
}

export default ThumbnailImage
