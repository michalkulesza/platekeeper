"""Predefined allergen/intolerance keys checked against every imported recipe.

Must stay in sync with ALLERGEN_KEYS/INTOLERANCE_KEYS in
packages/shared/src/constants/allergens.ts.
"""

ALLERGENS: list[str] = [
    # EU-14 allergens
    "gluten", "crustaceans", "tree nuts", "celery", "mustard", "sulphites",
    "lupin", "molluscs", "eggs", "fish", "peanuts", "soybeans", "milk", "sesame",
    # Intolerances
    "lactose", "ncgs", "fructose", "histamine", "fodmap", "caffeine",
    "sulphite-sensitivity", "sorbitol", "salicylates", "msg",
]
