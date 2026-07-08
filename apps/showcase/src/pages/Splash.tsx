import { useTranslation } from 'react-i18next'
import carrotLogo from '../assets/carrot-logo.svg'
import { HERO_BACKGROUND } from '../constants'

const Splash = () => {
  const { t } = useTranslation()

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-1 px-6 py-16 text-center"
      style={{ backgroundImage: HERO_BACKGROUND }}
    >
      <img src={carrotLogo} alt="Carrot" className="h-[87px] w-[228px]" />
      <p className="max-w-[369px] text-[27px] font-bold text-[#111111]">
        {t('hero.tagline')}
      </p>
    </div>
  )
}

export default Splash
