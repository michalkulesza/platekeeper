import type { MealPlanEntry } from '../types'

export interface AggregatedIngredient {
  key: string
  name: string
  qtySummary: string
}

const parseIngStr = (raw: string): { qty: string; name: string } => {
  const clean = raw.replace(/\(.*?\)/g, '').trim()
  const parts = clean.split(/\s+/)
  let idx = 0
  let qty = ''
  if (parts[idx] && /^[\d¼½¾⅓⅔⅛⅜⅝⅞.,/]+$/.test(parts[idx])) {
    qty = parts[idx++]
  }
  if (parts[idx] && parts[idx].length <= 6 && /^[a-z]+$/.test(parts[idx])) {
    qty = [qty, parts[idx++]].filter(Boolean).join(' ')
  }
  return { qty, name: parts.slice(idx).join(' ') }
}

export const aggregateIngredients = (entries: MealPlanEntry[]): AggregatedIngredient[] => {
  const map = new Map<string, { qty: string[]; name: string }>()
  for (const entry of entries) {
    for (const component of entry.recipe.components) {
      for (const ingStr of component.ingredients) {
        if (!ingStr.trim()) continue
        const { qty, name } = parseIngStr(ingStr)
        if (!name) continue
        const normalised = name.toLowerCase()
        const existing = map.get(normalised)
        if (existing) {
          if (qty) existing.qty.push(qty)
        } else {
          map.set(normalised, { qty: qty ? [qty] : [], name })
        }
      }
    }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { name, qty }]) => ({
      key,
      name,
      qtySummary: qty.join(', '),
    }))
}
