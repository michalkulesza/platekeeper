import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useRecipes } from '@platekeeper/shared/hooks/useRecipes'
import { useTags } from '@platekeeper/shared/hooks/useTags'
import type { RecipeOut, Tag } from '@platekeeper/shared/types'
import type { RecipesStackParamList } from '../navigation/RecipesStack'

type Props = NativeStackScreenProps<RecipesStackParamList, 'RecipesList'>

const RecipesScreen = ({ navigation }: Props) => {
  const { t } = useTranslation()
  const { recipes, isLoading, error } = useRecipes()
  const { tags } = useTags()
  const [query, setQuery] = useState('')
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('ImportRecipe')}
          style={styles.headerAddBtn}
          accessibilityLabel={t('nav.addRecipe')}
          accessibilityRole="button"
        >
          <Text style={styles.headerAddText}>+</Text>
        </TouchableOpacity>
      ),
    })
  }, [navigation, t])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return recipes.filter((r) => {
      const matchesQuery = !q || r.title.toLowerCase().includes(q)
      const matchesTag = !selectedTagId || r.tags.some((tag) => tag.id === selectedTagId)
      return matchesQuery && matchesTag
    })
  }, [recipes, query, selectedTagId])

  const handleTagPress = useCallback(
    (tagId: string) => {
      setSelectedTagId((prev) => (prev === tagId ? null : tagId))
    },
    [],
  )

  const handleRecipePress = useCallback(
    (recipe: RecipeOut) => {
      navigation.navigate('RecipeDetail', { recipeId: recipe.id, title: recipe.title })
    },
    [navigation],
  )

  const renderTag = useCallback(
    ({ item }: ListRenderItemInfo<Tag>) => {
      const isSelected = item.id === selectedTagId
      return (
        <TouchableOpacity
          onPress={() => handleTagPress(item.id)}
          style={[styles.chip, isSelected && styles.chipSelected]}
          accessibilityLabel={item.name}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
        >
          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{item.name}</Text>
        </TouchableOpacity>
      )
    },
    [selectedTagId, handleTagPress],
  )

  const renderRecipe = useCallback(
    ({ item }: ListRenderItemInfo<RecipeOut>) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleRecipePress(item)}
        accessibilityLabel={item.title}
        accessibilityRole="button"
      >
        {item.thumbnail_url ? (
          <Image source={{ uri: item.thumbnail_url }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.cardImagePlaceholder} />
        )}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.tags.length > 0 && (
            <Text style={styles.cardTags} numberOfLines={1}>
              {item.tags.map((t) => t.name).join(', ')}
            </Text>
          )}
          {item.servings != null && (
            <Text style={styles.cardMeta}>
              {t('recipes.serves')}: {item.servings}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    ),
    [handleRecipePress, t],
  )

  const listHeader = useMemo(
    () => (
      <View>
        <TextInput
          style={styles.searchInput}
          placeholder={t('recipes.searchPlaceholder')}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          accessibilityLabel={t('recipes.searchPlaceholder')}
        />
        {tags.length > 0 && (
          <FlatList
            data={tags}
            keyExtractor={(item) => item.id}
            renderItem={renderTag}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagList}
            contentContainerStyle={styles.tagListContent}
          />
        )}
      </View>
    ),
    [t, query, tags, renderTag],
  )

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" accessibilityLabel={t('common.loading')} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={renderRecipe}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {selectedTagId ? t('recipes.noRecipesWithTag') : t('recipes.noRecipesYet')}
          </Text>
          {selectedTagId && (
            <TouchableOpacity
              onPress={() => setSelectedTagId(null)}
              accessibilityLabel={t('recipes.clearFilter')}
              accessibilityRole="button"
            >
              <Text style={styles.clearFilter}>{t('recipes.clearFilter')}</Text>
            </TouchableOpacity>
          )}
        </View>
      }
      style={styles.list}
      contentContainerStyle={styles.listContent}
    />
  )
}

const styles = StyleSheet.create({
  headerAddBtn: { paddingHorizontal: 4, paddingVertical: 2 },
  headerAddText: { fontSize: 26, color: '#7c3aed', lineHeight: 30, fontWeight: '400' },
  list: { flex: 1, backgroundColor: '#f9fafb' },
  listContent: { paddingBottom: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: '#dc2626', fontSize: 15, textAlign: 'center' },
  searchInput: {
    margin: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  tagList: { marginBottom: 8 },
  tagListContent: { paddingHorizontal: 12, gap: 8 },
  chip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  chipSelected: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 12,
    marginTop: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardImage: { width: 80, height: 80 },
  cardImagePlaceholder: { width: 80, height: 80, backgroundColor: '#e5e7eb' },
  cardBody: { flex: 1, padding: 12, justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 4 },
  cardTags: { fontSize: 12, color: '#7c3aed', marginBottom: 2 },
  cardMeta: { fontSize: 12, color: '#9ca3af' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 12 },
  clearFilter: { fontSize: 14, color: '#2563eb', fontWeight: '500' },
})

export default RecipesScreen
