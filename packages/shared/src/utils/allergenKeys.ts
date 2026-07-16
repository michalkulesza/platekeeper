// EU-14 allergens plus common intolerances. Must stay in sync with
// ALLERGENS in services/api/src/api/constants.py — the backend always
// checks recipes against this full list, regardless of user preferences.
export const ALLERGEN_KEYS = [
  'gluten',
  'crustaceans',
  'tree nuts',
  'celery',
  'mustard',
  'sulphites',
  'lupin',
  'molluscs',
  'eggs',
  'fish',
  'peanuts',
  'soybeans',
  'milk',
  'sesame',
]

export const INTOLERANCE_KEYS = [
  'lactose',
  'ncgs',
  'fructose',
  'histamine',
  'fodmap',
  'caffeine',
  'sulphite-sensitivity',
  'sorbitol',
  'salicylates',
  'msg',
]

export const normalizeAllergenKey = (key: string) => key.replace(/[- ]/g, '_')
