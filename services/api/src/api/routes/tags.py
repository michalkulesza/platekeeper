import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.database import get_async_session
from api.models import Tag, TagCreate, TagOut
from api.users import User, current_active_user

router = APIRouter(prefix="/tags", tags=["tags"])

MAX_USER_TAGS = 50


@router.get("", response_model=list[TagOut])
async def list_tags(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> list[TagOut]:
    result = await session.execute(
        select(Tag)
        .where(or_(Tag.is_default.is_(True), Tag.user_id == user.id))
        .order_by(Tag.is_default.desc(), Tag.name)
    )
    return [TagOut.model_validate(t) for t in result.scalars().all()]


@router.post("", response_model=TagOut, status_code=201)
async def create_tag(
    body: TagCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> TagOut:
    name = body.name.strip()[:30]
    if not name:
        raise HTTPException(status_code=400, detail="Tag name required")

    count_result = await session.execute(
        select(func.count()).select_from(Tag).where(Tag.user_id == user.id)
    )
    if (count_result.scalar() or 0) >= MAX_USER_TAGS:
        raise HTTPException(status_code=400, detail=f"Maximum {MAX_USER_TAGS} custom tags reached")

    existing = await session.execute(
        select(Tag).where(
            or_(Tag.is_default.is_(True), Tag.user_id == user.id),
            Tag.name.ilike(name),
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Tag already exists")

    tag = Tag(name=name, is_default=False, user_id=user.id)
    session.add(tag)
    await session.commit()
    await session.refresh(tag)
    return TagOut.model_validate(tag)


@router.delete("/{tag_id}", status_code=204)
async def delete_tag(
    tag_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> None:
    result = await session.execute(
        select(Tag).where(Tag.id == tag_id, Tag.user_id == user.id)
    )
    tag = result.scalar_one_or_none()
    if tag is None:
        raise HTTPException(status_code=404, detail="Tag not found or not deletable")
    await session.delete(tag)
    await session.commit()
