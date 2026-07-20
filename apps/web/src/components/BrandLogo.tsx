interface BrandLogoProps {
  className?: string
}

const BrandLogo = ({ className }: BrandLogoProps) => (
  <div className={`flex items-center justify-center gap-3 ${className ?? ''}`}>
    <img src="/favicon.svg" alt="" className="size-12" />
    <span className="text-3xl font-bold tracking-tight">Carrot</span>
  </div>
)

export default BrandLogo
