import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import * as Haptics from 'expo-haptics'
import * as ImagePicker from 'expo-image-picker'
import type { TFunction } from 'i18next'
import { useQueryClient } from '@tanstack/react-query'
import type { ApiClient } from '@carrot/shared/api/client'
import type { RecipeOut, Tag } from '@carrot/shared/types'
import { serializeIngredient, type StructuredIngredient } from '@carrot/shared/utils/ingredientUtils'
import { uploadThumbnailImage } from '../../api/uploadThumbnail'
import { buildDraft, type EditComponent, type EditDraft } from './helpers'

export const useEditDraft = ({
  recipe,
  recipeId,
  autoEditParam,
  api,
  t,
  createTag,
}: {
  recipe: RecipeOut | undefined
  recipeId: string
  autoEditParam: string | undefined
  api: ApiClient
  t: TFunction
  createTag: (name: string) => Promise<Tag>
}) => {
  const qc = useQueryClient()

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<EditDraft | null>(null)
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [saving, setSaving] = useState(false)
  const [unitPickerTarget, setUnitPickerTarget] = useState<{ ci: number; ii: number } | null>(null)
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [thumbErrored, setThumbErrored] = useState(false)
  const savedDraftRef = useRef<EditDraft | null>(null)
  const savedTagsRef = useRef<Tag[]>([])

  const handleEdit = useCallback(() => {
    if (!recipe) return
    const initial = buildDraft(recipe)
    setDraft(initial)
    savedDraftRef.current = initial
    setSelectedTags(recipe.tags)
    savedTagsRef.current = recipe.tags
    setThumbErrored(false)
    setEditing(true)
  }, [recipe])

  const autoEditAppliedRef = useRef(false)
  useEffect(() => {
    if (autoEditParam === '1' && recipe && !autoEditAppliedRef.current) {
      autoEditAppliedRef.current = true
      handleEdit()
    }
  }, [autoEditParam, recipe, handleEdit])

  const isEditDirty = useCallback(() => {
    const isStateDirty = JSON.stringify(draft) !== JSON.stringify(savedDraftRef.current)
    const isTagsDirty =
      selectedTags.map((tag) => tag.id).sort().join(',') !==
      savedTagsRef.current.map((tag) => tag.id).sort().join(',')
    return isStateDirty || isTagsDirty
  }, [draft, selectedTags])

  const handleCancelEdit = useCallback(() => {
    if (!isEditDirty()) {
      setEditing(false)
      return
    }
    Alert.alert(t('addRecipe.discardChangesTitle'), t('addRecipe.discardChangesMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('addRecipe.discard'), style: 'destructive', onPress: () => setEditing(false) },
    ])
  }, [isEditDirty, t])

  const updateComp = useCallback((ci: number, patch: Partial<EditComponent>) => {
    setDraft((prev) => prev && { ...prev, components: prev.components.map((c, i) => (i === ci ? { ...c, ...patch } : c)) })
  }, [])

  const setIngredient = useCallback((ci: number, ii: number, val: StructuredIngredient) => {
    setDraft((prev) => prev && {
      ...prev,
      components: prev.components.map((c, i) =>
        i === ci ? { ...c, ingredients: c.ingredients.map((ing, j) => (j === ii ? val : ing)) } : c,
      ),
    })
  }, [])

  const addIngredient = useCallback((ci: number) => {
    setDraft((prev) => prev && {
      ...prev,
      components: prev.components.map((c, i) =>
        i === ci ? { ...c, ingredients: [...c.ingredients, { qty: '', unit: '', name: '' }] } : c,
      ),
    })
  }, [])

  const removeIngredient = useCallback((ci: number, ii: number) => {
    setDraft((prev) => {
      if (!prev) return prev
      if (prev.components[ci].ingredients.length <= 1) return prev
      return {
        ...prev,
        components: prev.components.map((c, i) =>
          i === ci ? { ...c, ingredients: c.ingredients.filter((_, j) => j !== ii) } : c,
        ),
      }
    })
  }, [])

  const setStep = useCallback((ci: number, si: number, val: string) => {
    setDraft((prev) => prev && {
      ...prev,
      components: prev.components.map((c, i) =>
        i === ci ? { ...c, steps: c.steps.map((s, j) => (j === si ? val : s)) } : c,
      ),
    })
  }, [])

  const addStep = useCallback((ci: number) => {
    setDraft((prev) => prev && {
      ...prev,
      components: prev.components.map((c, i) => (i === ci ? { ...c, steps: [...c.steps, ''] } : c)),
    })
  }, [])

  const removeStep = useCallback((ci: number, si: number) => {
    setDraft((prev) => {
      if (!prev) return prev
      if (prev.components[ci].steps.length <= 1) return prev
      return {
        ...prev,
        components: prev.components.map((c, i) => (i === ci ? { ...c, steps: c.steps.filter((_, j) => j !== si) } : c)),
      }
    })
  }, [])

  const currentUnit = unitPickerTarget != null
    ? (draft?.components[unitPickerTarget.ci]?.ingredients[unitPickerTarget.ii]?.unit ?? '')
    : ''

  const handleUnitSelect = useCallback((unit: string) => {
    if (unitPickerTarget == null || !draft) return
    setIngredient(unitPickerTarget.ci, unitPickerTarget.ii, {
      ...draft.components[unitPickerTarget.ci].ingredients[unitPickerTarget.ii],
      unit,
    })
  }, [unitPickerTarget, draft, setIngredient])

  const handleNutritionChange = useCallback((index: number, value: string) => {
    const key = (['servings', 'kcal', 'protein', 'fat', 'carbs'] as const)[index]
    setDraft((prev) => prev && { ...prev, [key]: value })
  }, [])

  const handleTagAdd = useCallback((tag: Tag) => setSelectedTags((prev) => [...prev, tag]), [])
  const handleTagRemove = useCallback((id: string) => setSelectedTags((prev) => prev.filter((tag) => tag.id !== id)), [])
  const handleTagCreate = useCallback(
    async (name: string): Promise<Tag> => createTag(name),
    [createTag],
  )

  const handlePickThumbnail = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: false,
    })
    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]
    setUploadingThumb(true)
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    try {
      const data = await uploadThumbnailImage(recipeId, asset)
      setDraft((prev) => prev && { ...prev, thumbnail_url: data.url })
      setThumbErrored(false)
    } catch {
      Alert.alert(t('common.ok'), t('common.uploadFailed'))
    } finally {
      setUploadingThumb(false)
    }
  }, [recipeId, t])

  const handleSaveEdit = useCallback(async () => {
    if (!draft || !recipe) return
    setSaving(true)
    try {
      const updated = await api.updateRecipe(recipeId, {
        title: draft.title,
        servings: draft.servings !== '' ? Number(draft.servings) : null,
        kcal_per_serving: draft.kcal !== '' ? Number(draft.kcal) : null,
        protein_per_serving: draft.protein !== '' ? Number(draft.protein) : null,
        fat_per_serving: draft.fat !== '' ? Number(draft.fat) : null,
        carbs_per_serving: draft.carbs !== '' ? Number(draft.carbs) : null,
        thumbnail_url: draft.thumbnail_url || null,
        source_url: recipe.source_url ?? null,
        notes: draft.notes || null,
        creator_handle: recipe.creator_handle ?? null,
        components: draft.components.map((c) => ({
          name: c.name ?? '',
          yield_note: c.yield_note ?? '',
          ingredients: c.ingredients.filter((ing) => ing.name).map(serializeIngredient),
          steps: c.steps.filter(Boolean),
          ingredient_flags: [],
          step_ingredient_refs: null,
        })),
        tag_ids: selectedTags.map((tag) => tag.id),
      })
      qc.setQueryData<RecipeOut[]>(['recipes'], (prev) =>
        prev ? prev.map((r) => (r.id === updated.id ? updated : r)) : prev,
      )
      setEditing(false)
    } catch {
      Alert.alert(t('common.ok'), t('addRecipe.saveError'))
    } finally {
      setSaving(false)
    }
  }, [draft, recipe, api, recipeId, selectedTags, qc, t])

  return {
    editing,
    draft,
    setDraft,
    selectedTags,
    saving,
    unitPickerTarget,
    setUnitPickerTarget,
    showTagPicker,
    setShowTagPicker,
    uploadingThumb,
    thumbErrored,
    setThumbErrored,
    currentUnit,
    handleEdit,
    handleCancelEdit,
    handleUnitSelect,
    handleNutritionChange,
    updateComp,
    setIngredient,
    addIngredient,
    removeIngredient,
    setStep,
    addStep,
    removeStep,
    handleTagAdd,
    handleTagRemove,
    handleTagCreate,
    handlePickThumbnail,
    handleSaveEdit,
  }
}
