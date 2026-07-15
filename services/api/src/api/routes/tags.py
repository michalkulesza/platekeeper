import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.database import get_async_session
from api.models import Tag, TagOut
from api.routes.context import get_active_household_id
from api.users import User, current_active_user

router = APIRouter(prefix="/tags", tags=["tags"])


def _tag_filter(user_id: uuid.UUID, household_id: uuid.UUID | None):
    if household_id is not None:
        return or_(Tag.is_default.is_(True), Tag.household_id == household_id)
    return or_(
        Tag.is_default.is_(True),
        and_(Tag.user_id == user_id, Tag.household_id.is_(None)),
    )


@router.get("", response_model=list[TagOut])
async def list_tags(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
    household_id: uuid.UUID | None = Depends(get_active_household_id),
) -> list[TagOut]:
    result = await session.execute(
        select(Tag)
        .where(_tag_filter(user.id, household_id))
        .order_by(Tag.is_default.desc(), Tag.name)
    )
    return [TagOut.model_validate(t) for t in result.scalars().all()]


@router.delete("/{tag_id}", status_code=204)
async def delete_tag(
    tag_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
    household_id: uuid.UUID | None = Depends(get_active_household_id),
) -> None:
    if household_id is not None:
        filter_clause = and_(Tag.id == tag_id, Tag.household_id == household_id)
    else:
        filter_clause = and_(Tag.id == tag_id, Tag.user_id == user.id, Tag.household_id.is_(None))

    result = await session.execute(select(Tag).where(filter_clause))
    tag = result.scalar_one_or_none()
    if tag is None:
        raise HTTPException(status_code=404, detail="Tag not found or not deletable")
    await session.delete(tag)
    await session.commit()
