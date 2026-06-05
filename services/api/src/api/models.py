from __future__ import annotations

from enum import StrEnum
from typing import Annotated

from pydantic import BaseModel, HttpUrl


# ── Gemini extraction schema ──────────────────────────────────────────────────

class Ingredient(BaseModel):
    qty: str | None = None
    unit: str | None = None
    name: str
    note: str | None = None


class RecipeComponent(BaseModel):
    role: str = "main"
    name: str | None = None
    yield_note: str | None = None
    ingredients: list[Ingredient] = []
    steps: list[str] = []


class RecipeExtraction(BaseModel):
    title: str | None = None
    servings: int | None = None
    kcal_per_serving: int | None = None
    components: list[RecipeComponent] = []


# ── API request / response ────────────────────────────────────────────────────

class ImportRequest(BaseModel):
    url: str


class ImportMetadata(BaseModel):
    creator_handle: str | None = None
    thumbnail_url: str | None = None
    source_url: str


class ImportStage(StrEnum):
    DESCRIPTION = "description"
    LINK = "link"
    TRANSCRIPT = "transcript"
    FAILED = "failed"


class ImportResult(BaseModel):
    stage: ImportStage
    recipe: RecipeExtraction | None = None
    metadata: ImportMetadata
    error: str | None = None
