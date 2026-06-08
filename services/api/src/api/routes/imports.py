import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.database import get_async_session
from api.models import Household, ImportRequest, ImportResult, Tag, UserPreferences
from api.services.pipeline import run_import, run_import_stream
from api.users import User, current_active_user

router = APIRouter(prefix="/imports", tags=["imports"])


@router.post("", response_model=ImportResult)
async def create_import(body: ImportRequest) -> ImportResult:
    return await run_import(body.url)


@router.get("/stream")
async def stream_import(
    url: str,
    model: str = "gemini-2.5-flash-lite",
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> StreamingResponse:
    result = await session.execute(
        select(Tag).where(or_(Tag.is_default.is_(True), Tag.user_id == user.id))
    )
    available_tags = [t.name for t in result.scalars().all()]

    allergens: list[str] = []
    if user.active_household_id:
        household = await session.get(Household, user.active_household_id)
        if household and household.allergens:
            a = household.allergens
            allergens = list(a.get("predefined") or []) + list(a.get("custom") or [])
    else:
        prefs_result = await session.execute(
            select(UserPreferences).where(UserPreferences.user_id == user.id)
        )
        prefs = prefs_result.scalar_one_or_none()
        if prefs and prefs.personal_allergens:
            a = prefs.personal_allergens
            allergens = list(a.get("predefined") or []) + list(a.get("custom") or [])

    async def generate():
        async for event in run_import_stream(url, model=model, available_tags=available_tags, allergens=allergens or None):
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
