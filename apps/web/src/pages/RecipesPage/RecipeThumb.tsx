import NetworkImage from '../../components/NetworkImage'

interface RecipeThumbProps {
  src: string
  alt: string
}

const RecipeThumb = ({ src, alt }: RecipeThumbProps) => (
  <NetworkImage src={src} alt={alt} className="w-16 h-16 rounded-lg shrink-0" />
)

export default RecipeThumb
