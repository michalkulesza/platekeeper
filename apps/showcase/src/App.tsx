import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import carrotLogo from './assets/carrot-logo.svg'
import IosTestflightModal from './components/IosTestflightModal'

const WEB_APP_URL = 'https://app.carrot.xcxz.xyz/'

const HERO_BACKGROUND = [
  'radial-gradient(circle at 12% 18%, rgba(255,203,163,0.85) 0%, rgba(255,203,163,0) 45%)',
  'radial-gradient(circle at 88% 12%, rgba(255,201,77,0.75) 0%, rgba(255,201,77,0) 42%)',
  'radial-gradient(circle at 15% 90%, rgba(111,170,72,0.5) 0%, rgba(111,170,72,0) 45%)',
  'radial-gradient(circle at 90% 85%, rgba(255,138,61,0.6) 0%, rgba(255,138,61,0) 50%)',
].join(', ')

const CTA_CARD_CLASS =
  'flex min-w-[200px] max-w-[280px] flex-1 flex-col items-center justify-center gap-2 rounded-3xl bg-[#FF8A3D] px-5 py-9 text-center shadow-[0_10px_24px_-8px_rgba(255,138,61,0.55)] transition-all hover:-translate-y-0.5 hover:bg-[#F17A29] hover:shadow-[0_14px_28px_-8px_rgba(255,138,61,0.65)]'

const App = () => {
  const { t } = useTranslation()
  const [iosModalOpen, setIosModalOpen] = useState(false)

  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center gap-14 px-6 py-16"
      style={{ backgroundColor: '#FFFDF8', backgroundImage: HERO_BACKGROUND }}
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <img src={carrotLogo} alt="Carrot" className="h-[87px] w-[228px]" />
        <p className="max-w-[369px] text-[27px] font-bold text-[#111111]">
          {t('hero.tagline')}
        </p>
      </div>

      <div className="flex w-full max-w-[920px] flex-wrap items-stretch justify-center gap-5">
        <a
          href={WEB_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={CTA_CARD_CLASS}
        >
          <span className="text-xl font-extrabold text-white">
            {t('cta.web.title')}
          </span>
          <span className="text-sm font-semibold text-white/85">
            {t('cta.web.subtitle')}
          </span>
        </a>

        <button
          type="button"
          onClick={() => setIosModalOpen(true)}
          className={CTA_CARD_CLASS}
        >
          <span className="text-xl font-extrabold text-white">
            {t('cta.ios.title')}
          </span>
          <span className="text-sm font-semibold text-white/85">
            {t('cta.ios.subtitle')}
          </span>
        </button>

        <div className="flex min-w-[200px] max-w-[280px] flex-1 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-[#F3C9A6] bg-[#FFF6EE] px-5 py-9 text-center">
          <span className="text-xl font-extrabold text-[#D9A87A]">
            {t('cta.android.title')}
          </span>
          <span className="text-sm font-semibold text-[#D9A87A]">
            {t('cta.android.subtitle')}
          </span>
        </div>
      </div>

      <IosTestflightModal
        open={iosModalOpen}
        onClose={() => setIosModalOpen(false)}
        webAppUrl={WEB_APP_URL}
      />
    </div>
  )
}

export default App
