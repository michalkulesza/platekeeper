# Allergies & Intolerances Feature Plan

## Summary

Users (and households) declare their allergens. When a recipe is added or analyzed, Gemini flags dangerous ingredients and suggests substitutes. Each user controls whether substitutes are applied automatically or manually.

---

## Decisions

| Area | Decision |
|---|---|
| Allergen scope | Per-household (applies to all shared recipes). Personal fallback in `UserPreferences` for users without a household |
| Allergen data model | Big 14 EU allergens (checkboxes) + free-text custom tags |
| Auto-substitute toggle | Per-user preference (stored in `UserPreferences`) |
| Ingredient storage | Extend existing ingredient JSON with `allergen`, `substitute`, `substitute_applied` fields |
| Gemini call at import | Merged into the existing extraction call — no extra round-trip |
| Gemini call retroactive | Separate call; triggered by a manual "Re-analyze all recipes" button in Settings |
| Substitute count | Single best substitute per flagged ingredient; `null` if no substitute exists |
| Recipe list view | No indicator on cards — allergy info visible inside recipe only |
| AddRecipeModal | Allergy flags shown before saving (applies to both URL import and manual entry) |
| Info icon behavior | Always present on flagged ingredients even after substitution is accepted; never dismissable |
| Interaction pattern | Popover on ⚠️ icon click — [Replace] / [Keep original] |
| Warning persistence | Always re-warns; acknowledgement is not stored — warning reflects current allergy list |

---

## Data Model Changes

### `households` table
```
allergens: JSON  -- { predefined: ["gluten", "dairy", ...], custom: ["MSG", "nightshades"] }
```

### `user_preferences` table
```
auto_substitute:      bool   (default false)
personal_allergens:   JSON   -- same shape as households.allergens; used when user has no household
```

### Ingredient JSON (inside `recipes.components`)
Each ingredient object gains optional fields:
```json
{
  "qty": "2",
  "unit": "cup",
  "name": "wheat flour",
  "note": null,
  "allergen": "gluten",
  "substitute": "oat flour",
  "substitute_applied": true
}
```

- `allergen`: the allergen that triggered the flag, or `null`
- `substitute`: Gemini's suggested replacement, or `null` if none found
- `substitute_applied`: `true` if the user accepted the substitution (original name preserved in `name`, substitute displayed)

---

## Gemini Integration

### At import / manual save
- Household (or personal) allergen list is injected into the existing extraction prompt
- Extraction schema extended to return `allergen` and `substitute` per ingredient
- No additional API call

### Retroactive re-analysis
- Triggered by "Re-analyze all recipes" button in Settings after allergen list changes
- Separate Gemini call per recipe: send ingredient list + allergen list, receive updated flags
- Progress indicator shown in Settings during the batch run

---

## UI

### Settings page — new "Allergies & Intolerances" section
- Big 14 EU allergen checkboxes (celery, cereals containing gluten, crustaceans, eggs, fish, lupin, milk, molluscs, mustard, peanuts, sesame, soybeans, sulphur dioxide, tree nuts)
- Custom allergen tag input (free-text)
- Label clarifies scope: "Applied to [Household Name]" or "Applied to your personal recipes" when no household
- "Re-analyze all recipes" button with progress feedback

### Preferences section — existing section
- `auto_substitute` toggle: "Automatically apply suggested substitutes when adding recipes"

### AddRecipeModal — before save
- Flagged ingredients highlighted with ⚠️ icon inline
- In auto mode: substitutes already applied, icons show applied state
- In manual mode: icons show pending state; user opens popover to decide per-ingredient

### RecipeDetailModal — ingredient list
- ⚠️ icon always shown on flagged ingredients
- Popover states:
  - Pending: "Contains [allergen]. Suggested substitute: **X**. [Replace] [Keep original]"
  - No substitute: "Contains [allergen]. No substitute available."
  - Applied: "Originally **X**, replaced with **Y** due to [allergen]."
- Warning always re-appears on open — no permanent dismiss

---

## Build Phases

1. **Settings UI** — Allergies section in Settings, allergen fields on `households` + `UserPreferences`, auto-substitute toggle in Preferences
2. **Gemini integration** — Extend extraction prompt + schema; wire allergen fields into ingredient JSON on save
3. **AddRecipeModal flags** — Show ⚠️ icons + popover before save; handle auto vs manual mode
4. **RecipeDetailModal flags** — Show ⚠️ icons + popover in detail view; always-visible reference
5. **Retroactive analysis** — "Re-analyze all recipes" button + batch Gemini call + progress indicator
