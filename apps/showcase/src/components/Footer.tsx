import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className="flex w-full items-center justify-center px-6 py-6">
      <Link
        to="/privacy-policy"
        className="text-sm font-medium text-[#8A8A8A] transition-colors hover:text-[#111111]"
      >
        {t('footer.privacyPolicy')}
      </Link>
    </footer>
  )
}

export default Footer
