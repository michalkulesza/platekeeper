import type { ChangeEvent, RefObject } from 'react'
import { Calendar, Edit2, Link, ShoppingCart, Star, Trash2 } from 'react-feather'
import { useTranslation } from 'react-i18next'
import type { RecipeOut, Tag } from '@carrot/shared/types'
import { proxyUrl, PLACEHOLDER_URL } from '../../utils/imageUtils'
import NetworkImage from '../NetworkImage'
import TagRow from '../TagRow'
import { getHeaderBg, type EditState, type Mode } from './helpers'
import EditLine from './EditLine'

interface RecipeHeroSectionProps {
  recipe: RecipeOut
  draft: EditState
  mode: Mode
  onTitleChange: (v: string) => void
  localTags: Tag[]
  allTags: Tag[]
  onTagAdd: (tag: Tag) => void
  onTagRemove: (tagId: string) => void
  onTagCreate: (name: string) => Promise<Tag>
  fileInputRef: RefObject<HTMLInputElement | null>
  onThumbnailFile: (e: ChangeEvent<HTMLInputElement>) => void
  imgUploading: boolean
  addMode: boolean
  onToggleAddMode: () => void
  onOpenMealPlan: () => void
  onToggleFavourite: () => void
  onEdit: () => void
  onDelete: () => void
}

const RecipeHeroSection = ({
  recipe,
  draft,
  mode,
  onTitleChange,
  localTags,
  allTags,
  onTagAdd,
  onTagRemove,
  onTagCreate,
  fileInputRef,
  onThumbnailFile,
  imgUploading,
  addMode,
  onToggleAddMode,
  onOpenMealPlan,
  onToggleFavourite,
  onEdit,
  onDelete,
}: RecipeHeroSectionProps) => {
  const { t } = useTranslation()
  const r = recipe
  const displayThumb =
    mode === 'editing' ? draft.thumbnail_url : r.thumbnail_url
  const proxied = proxyUrl(displayThumb)
  const headerBg = getHeaderBg(mode)

  const tagRow = (
    <div className="mt-2">
      <TagRow
        tags={localTags}
        allTags={allTags}
        onAdd={onTagAdd}
        onRemove={onTagRemove}
        onCreateTag={onTagCreate}
        editable={mode === 'editing'}
        addable
      />
    </div>
  )

  const toolbar = mode === 'view' && (
    <div className="absolute top-3 right-3 flex gap-1 z-10">
      <button
        type="button"
        onClick={onToggleAddMode}
        aria-label={t('shoppingList.addToList')}
        aria-pressed={addMode}
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
          addMode
            ? 'bg-primary text-primary-foreground'
            : 'bg-white/90 text-zinc-600 hover:bg-white shadow-sm'
        }`}
      >
        <ShoppingCart className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onOpenMealPlan}
        aria-label={t('mealPlan.addToMealPlan')}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-zinc-600 hover:bg-white shadow-sm transition-colors"
      >
        <Calendar className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onEdit}
        aria-label={t('common.edit')}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-zinc-600 hover:bg-white shadow-sm transition-colors"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={t('recipes.remove')}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-danger hover:bg-danger-50 shadow-sm transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )

  return (
    <div className={`relative ${headerBg}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onThumbnailFile}
      />

      {proxied && (
        <NetworkImage
          src={proxied}
          alt={r.title}
          className="w-full h-64 object-cover"
          onError={(e) => {
            if (PLACEHOLDER_URL)
              (e.target as HTMLImageElement).src = PLACEHOLDER_URL
          }}
        />
      )}

      {toolbar}

      {mode === 'editing' && proxied && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={imgUploading}
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/40 text-white text-xs font-semibold hover:bg-black/60 transition-colors backdrop-blur-sm disabled:opacity-60"
        >
          {imgUploading ? t('common.uploading') : t('common.changePhoto')}
        </button>
      )}

      <div className={`px-5 pb-1 ${proxied ? 'pt-5' : 'pt-14'}`}>
        <div className="flex items-start gap-2">
          {mode === 'view' && (
            <button
              type="button"
              onClick={onToggleFavourite}
              aria-label={
                r.is_favourite
                  ? t('recipes.removeFromFavourites')
                  : t('recipes.addToFavourites')
              }
              className={`mt-0.5 shrink-0 p-1 transition-colors ${
                r.is_favourite
                  ? 'text-amber-400'
                  : 'text-zinc-300 hover:text-amber-400'
              }`}
            >
              <Star
                className="w-6 h-6"
                fill={r.is_favourite ? 'currentColor' : 'none'}
              />
            </button>
          )}
          {mode === 'editing' ? (
            <EditLine
              value={draft.title}
              onChange={onTitleChange}
              className="flex-1 text-2xl font-bold leading-snug"
              multiline
            />
          ) : r.source_url ? (
            <a
              href={r.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-1.5 text-2xl font-bold leading-snug text-zinc-900 hover:text-primary transition-colors"
            >
              <span>{r.title}</span>
              <Link className="mt-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
            </a>
          ) : (
            <h2 className="text-2xl font-bold leading-snug">{r.title}</h2>
          )}
        </div>
        {tagRow}
      </div>

      {mode === 'editing' && !proxied && (
        <div className="px-5 pt-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={imgUploading}
            className="text-sm text-primary underline disabled:opacity-60"
          >
            {imgUploading ? t('common.uploading') : t('common.addPhoto')}
          </button>
        </div>
      )}
    </div>
  )
}

export default RecipeHeroSection
