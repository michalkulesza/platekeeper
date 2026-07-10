import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type CopyField = 'email' | 'password' | null

const TESTFLIGHT_EMAIL = 'showcase@demo.com'
const TESTFLIGHT_PASSWORD = 'showcase'

type IosTestflightModalProps = {
  open: boolean
  onClose: () => void
  webAppUrl: string
}

type CopyRowProps = {
  field: 'email' | 'password'
  label: string
  value: string
  copiedField: CopyField
  onCopy: (field: 'email' | 'password', value: string) => void
}

const CopyRow = ({
  field,
  label,
  value,
  copiedField,
  onCopy,
}: CopyRowProps) => {
  const { t } = useTranslation()
  const isCopied = copiedField === field
  const handleClick = () => onCopy(field, value)

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center justify-between gap-3 rounded-2xl border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-3.5 text-left"
    >
      <span className="flex flex-col gap-0.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#B3B3B3]">
          {label}
        </span>
        <span className="text-[15px] font-bold text-[#111111]">{value}</span>
      </span>
      <span className="text-xs font-bold text-[#FF8A3D]">
        {isCopied ? t('modal.copied') : t('modal.copy')}
      </span>
    </button>
  )
}

const IosTestflightModal = ({
  open,
  onClose,
  webAppUrl,
}: IosTestflightModalProps) => {
  const { t } = useTranslation()
  const [copiedField, setCopiedField] = useState<CopyField>(null)
  const copyTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const copyField = useCallback(
    (field: 'email' | 'password', value: string) => {
      navigator.clipboard?.writeText(value).catch(() => {})
      setCopiedField(field)
      clearTimeout(copyTimeout.current)
      copyTimeout.current = setTimeout(() => setCopiedField(null), 1500)
    },
    []
  )

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] rounded-[28px] bg-white p-9 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('modal.close')}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F4F4] text-base font-bold text-[#666666] transition-colors hover:bg-[#EAEAEA]"
        >
          ×
        </button>

        <h2
          id="ios-modal-title"
          className="mb-2.5 text-[22px] font-extrabold text-[#111111]"
        >
          {t('modal.title')}
        </h2>
        <p className="mb-6 text-[15px] font-medium leading-normal text-[#666666]">
          {t('modal.description')}
        </p>

        <div className="mb-7 flex flex-col gap-2.5">
          <CopyRow
            field="email"
            label={t('modal.email')}
            value={TESTFLIGHT_EMAIL}
            copiedField={copiedField}
            onCopy={copyField}
          />
          <CopyRow
            field="password"
            label={t('modal.password')}
            value={TESTFLIGHT_PASSWORD}
            copiedField={copiedField}
            onCopy={copyField}
          />
        </div>

        <a
          href={webAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center rounded-2xl bg-[#FF8A3D] px-4 py-4 text-base font-extrabold text-white transition-colors hover:bg-[#F17A29]"
        >
          {t('modal.openTestflight')}
        </a>
      </div>
    </div>
  )
}

export default IosTestflightModal
