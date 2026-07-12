import NetworkImage from '../../components/NetworkImage'

interface RecipeThumbProps {
  src: string
  alt: string
  className?: string
}

const RecipeThumb = ({ src, alt, className = '' }: RecipeThumbProps) => (
  <NetworkImage src={src} alt={alt} className={className} />
)

export default RecipeThumb
