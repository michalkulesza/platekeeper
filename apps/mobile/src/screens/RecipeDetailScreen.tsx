import { useMemo } from 'react'
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useRecipes } from '@platekeeper/shared/hooks/useRecipes'
import type { RecipesStackParamList } from '../navigation/RecipesStack'
import type { RecipeOut, SaveComponent, Ingredient } from '@platekeeper/shared/types'

type Props = NativeStackScreenProps<RecipesStackParamList, 'RecipeDetail'>

const IngredientRow = ({ ingredient }: { ingredient: Ingredient }) => {
  const parts = [ingredient.qty, ingredient.unit, ingredient.name].filter(Boolean).join(' ')
  const note = ingredient.note ? ` (${ingredient.note})` : ''
  return (
    <View style={styles.ingredientRow}>
      <Text style={styles.bullet}>{'•'}</Text>
      <Text style={styles.ingredientText}>{parts}{note}</Text>
    </View>
  )
}

const ComponentSection = ({ component, index }: { component: SaveComponent; index: number }) => {
  const { t } = useTranslation()
  const ingredients = useMemo(
    () =>
      component.ingredients.map((raw, i) => {
        if (typeof raw === 'string') {
          return { qty: null, unit: null, name: raw, note: null } as Ingredient
        }
        return raw as Ingredient
      }),
    [component.ingredients],
  )

  return (
    <View style={styles.componentBlock}>
      {component.name ? (
        <Text style={styles.componentName}>{component.name}</Text>
      ) : null}

      {ingredients.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('recipes.sectionIngredients')}</Text>
          {ingredients.map((ing, i) => (
            <IngredientRow key={i} ingredient={ing} />
          ))}
        </View>
      )}

      {component.steps.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('recipes.steps')}</Text>
          {component.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Text style={styles.stepNum}>{i + 1}.</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const RecipeDetailScreen = ({ route }: Props) => {
  const { recipeId } = route.params
  const { t } = useTranslation()
  const { recipes, isLoading, error } = useRecipes()

  const recipe: RecipeOut | undefined = useMemo(
    () => recipes.find((r) => r.id === recipeId),
    [recipes, recipeId],
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

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{t('recipes.noResults')}</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {recipe.thumbnail_url ? (
        <Image
          source={{ uri: recipe.thumbnail_url }}
          style={styles.thumbnail}
          accessibilityLabel={recipe.title}
          resizeMode="cover"
        />
      ) : null}

      <Text style={styles.title}>{recipe.title}</Text>

      {recipe.tags.length > 0 && (
        <View style={styles.tagRow}>
          {recipe.tags.map((tag) => (
            <View key={tag.id} style={styles.tag}>
              <Text style={styles.tagText}>{tag.name}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.metaRow}>
        {recipe.servings != null && (
          <Text style={styles.metaItem}>
            {t('recipes.serves')}: {recipe.servings}
          </Text>
        )}
        {recipe.kcal_per_serving != null && (
          <Text style={styles.metaItem}>
            {recipe.kcal_per_serving} {t('recipes.kcalPerServing')}
          </Text>
        )}
      </View>

      {recipe.source_url ? (
        <Text style={styles.source} numberOfLines={1}>
          {t('recipes.source')}: {recipe.source_url}
        </Text>
      ) : null}

      {recipe.notes ? (
        <View style={styles.notesBlock}>
          <Text style={styles.sectionLabel}>{t('recipes.notes')}</Text>
          <Text style={styles.notesText}>{recipe.notes}</Text>
        </View>
      ) : null}

      {recipe.components.map((component, i) => (
        <ComponentSection key={i} component={component} index={i} />
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: '#dc2626', fontSize: 15, textAlign: 'center' },
  thumbnail: { width: '100%', height: 220 },
  title: { fontSize: 22, fontWeight: '700', color: '#111', marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, marginBottom: 10, gap: 6 },
  tag: { backgroundColor: '#ede9fe', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { color: '#7c3aed', fontSize: 12, fontWeight: '500' },
  metaRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, gap: 16 },
  metaItem: { fontSize: 13, color: '#6b7280' },
  source: { fontSize: 12, color: '#9ca3af', marginHorizontal: 16, marginBottom: 12 },
  notesBlock: { marginHorizontal: 16, marginBottom: 12 },
  notesText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  componentBlock: { marginHorizontal: 16, marginTop: 12 },
  componentName: { fontSize: 17, fontWeight: '600', color: '#111', marginBottom: 8 },
  section: { marginBottom: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  ingredientRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  bullet: { color: '#9ca3af', marginRight: 8, marginTop: 1 },
  ingredientText: { flex: 1, fontSize: 15, color: '#111', lineHeight: 22 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  stepNum: { fontSize: 15, fontWeight: '700', color: '#2563eb', width: 28, marginTop: 1 },
  stepText: { flex: 1, fontSize: 15, color: '#111', lineHeight: 22 },
})

export default RecipeDetailScreen
