import calendar as cal
import uuid
from datetime import date as DateType

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.database import get_async_session
from api.models import MealPlanEntry, MealPlanEntryOut, MealPlanSetRequest, Recipe
from api.routes.context import get_active_household_id
from api.users import User, current_active_user

router = APIRouter(prefix="/meal-plan", tags=["meal-plan"])


def _entry_filter(user_id: uuid.UUID, household_id: uuid.UUID | None, date: DateType):
    if household_id is not None:
        return and_(MealPlanEntry.household_id == household_id, MealPlanEntry.date == date)
    return and_(
        MealPlanEntry.user_id == user_id,
        MealPlanEntry.household_id.is_(None),
        MealPlanEntry.date == date,
    )


def _recipe_access_filter(user_id: uuid.UUID, household_id: uuid.UUID | None, recipe_id: uuid.UUID):
    if household_id is not None:
        return and_(Recipe.id == recipe_id, Recipe.household_id == household_id)
    return and_(
        Recipe.id == recipe_id,
        Recipe.user_id == user_id,
        or_(Recipe.household_id.is_(None), Recipe.shared_to_personal.is_(True)),
    )


@router.get("", response_model=list[MealPlanEntryOut])
async def list_meal_plan(
    month: str,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
    household_id: uuid.UUID | None = Depends(get_active_household_id),
) -> list[MealPlanEntryOut]:
    try:
        year, m = int(month.split("-")[0]), int(month.split("-")[1])
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail="Invalid month format, use YYYY-MM")

    last_day = cal.monthrange(year, m)[1]
    start = DateType(year, m, 1)
    end = DateType(year, m, last_day)

    if household_id is not None:
        where = and_(
            MealPlanEntry.household_id == household_id,
            MealPlanEntry.date >= start,
            MealPlanEntry.date <= end,
        )
    else:
        where = and_(
            MealPlanEntry.user_id == user.id,
            MealPlanEntry.household_id.is_(None),
            MealPlanEntry.date >= start,
            MealPlanEntry.date <= end,
        )

    result = await session.execute(select(MealPlanEntry).where(where))
    return [MealPlanEntryOut.model_validate(e) for e in result.scalars().all()]


@router.put("/{date_str}", response_model=MealPlanEntryOut)
async def set_meal_plan_entry(
    date_str: str,
    body: MealPlanSetRequest,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
    household_id: uuid.UUID | None = Depends(get_active_household_id),
) -> MealPlanEntryOut:
    try:
        date = DateType.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")

    recipe_result = await session.execute(
        select(Recipe).where(_recipe_access_filter(user.id, household_id, body.recipe_id))
    )
    if recipe_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Recipe not found")

    result = await session.execute(
        select(MealPlanEntry).where(_entry_filter(user.id, household_id, date))
    )
    entry = result.scalar_one_or_none()
    if entry is None:
        entry = MealPlanEntry(
            user_id=user.id,
            household_id=household_id,
            date=date,
            recipe_id=body.recipe_id,
        )
        session.add(entry)
    else:
        entry.recipe_id = body.recipe_id

    await session.commit()
    await session.refresh(entry)
    return MealPlanEntryOut.model_validate(entry)


@router.delete("/{date_str}", status_code=204)
async def delete_meal_plan_entry(
    date_str: str,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
    household_id: uuid.UUID | None = Depends(get_active_household_id),
) -> None:
    try:
        date = DateType.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")

    result = await session.execute(
        select(MealPlanEntry).where(_entry_filter(user.id, household_id, date))
    )
    entry = result.scalar_one_or_none()
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    await session.delete(entry)
    await session.commit()
