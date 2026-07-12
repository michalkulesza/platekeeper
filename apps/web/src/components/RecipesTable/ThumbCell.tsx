import { proxyUrl } from '../../utils/imageUtils'
import NetworkImage from '../NetworkImage'

interface ThumbCellProps {
  url: string | null
  title: string
}

const ThumbCell = ({ url, title }: ThumbCellProps) => {
  const proxied = proxyUrl(url)

  if (!proxied) {
    return (
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 shrink-0 flex items-center justify-center text-zinc-200 text-xl">
        🍽
      </div>
    )
  }

  return (
    <NetworkImage
      src={proxied}
      alt={title}
      className="w-12 h-12 rounded-lg shrink-0"
    />
  )
}

export default ThumbCell
