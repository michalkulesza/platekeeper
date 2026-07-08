import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

type Section = { heading: string; body: string }

const PrivacyPolicy = () => {
  const { t } = useTranslation()
  const sections = t('privacyPolicy.sections', {
    returnObjects: true,
  }) as Section[]

  return (
    <div className="flex flex-1 justify-center px-6 py-16">
      <div className="flex w-full max-w-[720px] flex-col gap-6">
        <Link
          to="/"
          className="text-sm font-semibold text-[#FF8A3D] hover:underline"
        >
          {t('privacyPolicy.back')}
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] font-extrabold text-[#111111]">
            {t('privacyPolicy.title')}
          </h1>
          <p className="text-sm text-[#8A8A8A]">{t('privacyPolicy.updated')}</p>
        </div>
        <p className="text-base leading-relaxed text-[#333333]">
          {t('privacyPolicy.intro')}
        </p>
        {sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-[#111111]">
              {section.heading}
            </h2>
            <p className="text-base leading-relaxed text-[#333333]">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  )
}

export default PrivacyPolicy
