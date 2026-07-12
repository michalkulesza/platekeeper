import type { ChangeEvent, CSSProperties, FocusEventHandler } from 'react'
import { useTranslation } from 'react-i18next'

interface RecipeNotesSectionProps {
  value: string
  onChange: (v: string) => void
  onBlur: FocusEventHandler<HTMLTextAreaElement>
  saving: boolean
  fontSizeIndex: number
}

const TEXT_SIZE_CLASSES = [
  'text-sm',
  'text-base',
  'text-[17px]',
  'text-xl',
  'text-2xl',
] as const

const textareaStyle: CSSProperties = {
  minHeight: '4rem',
  fieldSizing: 'content',
} as CSSProperties

const RecipeNotesSection = ({
  value,
  onChange,
  onBlur,
  saving,
  fontSizeIndex,
}: RecipeNotesSectionProps) => {
  const { t } = useTranslation()
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    onChange(e.target.value)

  return (
    <div className="pt-2 pb-4 border-b border-zinc-100">
      <p className="text-xs font-semibold uppercase text-zinc-400 mb-1.5">
        {t('recipes.notes')}
        {saving && (
          <span className="ml-2 font-normal normal-case text-zinc-400">
            {t('common.saving')}
          </span>
        )}
      </p>
      <textarea
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={t('common.tapToAddNotes')}
        rows={3}
        className={`w-full ${TEXT_SIZE_CLASSES[fontSizeIndex]} bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary resize-none leading-relaxed placeholder:text-zinc-400`}
        style={textareaStyle}
      />
    </div>
  )
}

export default RecipeNotesSection
