import { useCallback, useEffect, useState, type SyntheticEvent } from 'react'

interface NetworkImageProps {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  onError?: (e: SyntheticEvent<HTMLImageElement>) => void
}

const NetworkImage = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  onError,
}: NetworkImageProps) => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => setLoaded(false), [src])

  const handleLoad = useCallback(() => setLoaded(true), [])

  const handleError = useCallback(
    (e: SyntheticEvent<HTMLImageElement>) => {
      setLoaded(true)
      onError?.(e)
    },
    [onError]
  )

  return (
    <div className={`relative overflow-hidden bg-zinc-100 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-zinc-200" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
      />
    </div>
  )
}

export default NetworkImage
