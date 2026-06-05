from __future__ import annotations

import json
import logging

from google import genai
from google.genai import types

from api.config import settings
from api.models import RecipeExtraction

log = logging.getLogger(__name__)

_DEFAULT_MODEL = "gemini-2.5-flash"

_SYSTEM = """\
You are a recipe extraction assistant. Given text from a social media caption,
a webpage, or a video transcript, extract all recipe information you can find.
The text may be in any language — extract faithfully in the original language.

Return JSON matching the provided schema. If no recipe content is present, return
an object with null title and empty components array.

For ingredients, always try to separate qty/unit/name/note. Examples:
  "2 cups flour" → qty="2", unit="cup", name="flour"
  "3 cloves garlic, minced" → qty="3", unit="clove", name="garlic", note="minced"
  "salt to taste" → qty=null, unit=null, name="salt", note="to taste"

For multi-component recipes (e.g. "for the sauce:", "for the marinade:"),
create a separate component for each section.

servings: extract from the text if stated. If not stated, estimate a reasonable
serving count based on the ingredient quantities and dish type.

kcal_per_serving: extract from the text if stated. If not stated, estimate based
on the ingredients and typical preparation. Provide a realistic round number.
"""


def _build_client() -> genai.Client:
    return genai.Client(api_key=settings.gemini_api_key)


async def extract_recipe(text: str, source_hint: str = "", model: str = _DEFAULT_MODEL) -> RecipeExtraction:
    prompt = f"Source: {source_hint}\n\n{text}" if source_hint else text

    client = _build_client()
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=_SYSTEM,
            response_mime_type="application/json",
            response_schema=RecipeExtraction,
        ),
    )

    raw = response.text
    log.debug("Gemini raw response (%s): %s", source_hint, raw[:500])
    data = json.loads(raw)
    return RecipeExtraction.model_validate(data)
