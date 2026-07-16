import { useMemo, useState } from 'react'
import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useRecipes } from '@carrot/shared/hooks/useRecipes'
import { useRelatedRecipes } from '@carrot/shared/hooks/useRelatedRecipes'
import { proxyThumbnailUrl, PLACEHOLDER_URL } from '../../api/thumbnailUrl'
import { styles } from './styles'

const RelatedRecipesSection = ({ recipeId }: { recipeId: string }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { recipes } = useRecipes()
  const { relatedRecipes, save } = useRelatedRecipes(recipeId)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selected, setSelected] = useState(() => new Set<string>())
  const selectedIds = useMemo(() => new Set(relatedRecipes.map((recipe) => recipe.id)), [relatedRecipes])
  const openPicker = () => { setSelected(new Set(selectedIds)); setPickerOpen(true) }
  const toggle = (id: string) => setSelected((current) => {
    const next = new Set(current)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })
  const done = async () => { await save.mutateAsync([...selected]); setPickerOpen(false) }
  const candidates = recipes.filter((recipe) => recipe.id !== recipeId)
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{t('relatedRecipes.title')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedRecipesRow}>
        {relatedRecipes.map((recipe) => {
          const uri = proxyThumbnailUrl(recipe.thumbnail_url) || PLACEHOLDER_URL
          return <Pressable key={recipe.id} style={styles.relatedRecipeCard} onPress={() => router.push(`/recipe/${recipe.id}`)}>
            {uri ? <Image source={{ uri }} style={styles.relatedRecipeImage} /> : <View style={styles.relatedRecipeImage} />}
            <Text numberOfLines={1} style={styles.relatedRecipeTitle}>{recipe.title}</Text>
            <Pressable onPress={() => void save.mutateAsync(relatedRecipes.filter((item) => item.id !== recipe.id).map((item) => item.id))} accessibilityLabel={t('common.remove')}><Feather name="x" size={16} color="#fff" style={styles.relatedRecipeRemove} /></Pressable>
          </Pressable>
        })}
        <Pressable style={styles.relatedRecipeAdd} onPress={openPicker} accessibilityLabel={t('common.add')}><Feather name="plus" size={24} color="#007aff" /><Text style={styles.relatedRecipeAddText}>{t('common.add')}</Text></Pressable>
      </ScrollView>
      <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.relatedPicker}>
          <Text style={styles.relatedPickerTitle}>{t('relatedRecipes.add')}</Text>
          <ScrollView>{candidates.map((recipe) => <Pressable key={recipe.id} style={styles.relatedPickerRow} onPress={() => toggle(recipe.id)}><Text style={styles.relatedPickerRowTitle}>{recipe.title}</Text><Feather name={selected.has(recipe.id) ? 'check-circle' : 'circle'} size={22} color="#007aff" /></Pressable>)}</ScrollView>
          <Pressable style={styles.relatedPickerDone} onPress={() => void done()}><Text style={styles.relatedPickerDoneText}>{t('common.done')}</Text></Pressable>
        </View>
      </Modal>
    </View>
  )
}

export default RelatedRecipesSection
