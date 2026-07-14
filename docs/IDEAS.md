# Ideas

## Features

### Useful Home screen
A focused dashboard showing tonight's planned meal, expiring pantry items, active timers, unfinished imports, and recently cooked recipes. Gives users a useful starting point instead of dropping them directly into a feature-specific tab.

### Visual recipe library
Let users switch between the current compact list and a photo-forward card or grid view. Rich thumbnails, key tags, cooking time, and favourite status would make browsing more inviting while preserving the fast, information-dense option.

### Cook Mode — step-by-step full-screen view
Big-type, swipeable step cards for hands-free cooking. Keeps the screen awake, auto-detects timers from step text (e.g. "simmer 10 min" → tappable timer), and lets you check off ingredients as you go.

### Ingredient scaling
A serving-size stepper on the recipe screen that recomputes all ingredient quantities live (½×, 2×, custom). Mostly a display transform over the already-structured quantities.

### Interactive ingredient checkoff while cooking
Tap ingredients to strike them through as you add them during cooking. State resets per cooking session.

### Cook journal
Record when a recipe was cooked, who cooked it, a rating, photos, modifications, and private “change this next time” notes. Build a useful history for each recipe while supplying richer data for personal stats and recommendations.

### Delightful empty/loading states
Extend the existing shimmer (`ImageShimmer`) to recipe lists and the meal plan grid, with friendly empty states for recipes, plans, and shopping. Add a restrained Carrot mascot, clearer import-stage animations, subtle haptics, and small celebratory moments when meaningful tasks finish.

### Haptics + native context menus
Long-press a recipe for an iOS context menu (Favourite / Add to plan / Share / Delete) with a peek preview, plus haptic feedback on meaningful interactions.

### "Cook from what I have" / pantry
Track pantry staples, then rank recipes by how few missing ingredients they need. Auto-diff the shopping list against what's already in the pantry.

### Calendar & reminders integration
Push planned meals to the iOS Calendar and send timely notifications ("start cooking", "defrost the chicken"), building on the existing notification system.

### Round-up display for fractional shopping list quantities
Round fractional counts of whole items up for display while tracking the real underlying value. E.g. adding 0.5 onion shows "1 onion" (you can't buy half), but stores 0.5 behind the scenes; adding another 0.5 still shows "1 onion" with a true value of 1. Prevents over-buying while keeping the list realistic.

## Portfolio / showcase

### Weekly meal-plan generator
One tap to auto-fill the week honoring allergens/preferences and variety, then generate the shopping list from it. The app's standout "wow" moment.

### Polished stats/insights dashboard
Charts of cooking habits built on the existing `/stats` endpoint — recipes cooked, most-cooked cuisine, streaks, imports over time. Genuinely screenshot-worthy for a portfolio README.

### Operational import dashboard
An internal dashboard for import-pipeline latency, queue depth, cost, cache-hit rate, failure stages, retry volume, and model usage. Add filters and per-job traces so production issues can be diagnosed quickly while showcasing the reliability and observability of the AI pipeline.

### Semantic recipe search
pgvector embeddings so natural-language queries like "something warm and spicy for a cold night" return real matches, not just keyword hits. One killer differentiating feature.
