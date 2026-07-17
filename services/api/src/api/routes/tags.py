import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.database import get_async_session
from api.models import Tag, TagCreate, TagOut
from api.routes.context import get_active_household_id
from api.users import User, current_active_user

router = APIRouter(prefix="/tags", tags=["tags"])
MAX_USER_TAGS = 50


def _tag_filter(user_id: uuid.UUID, household_id: uuid.UUID | None):
    if household_id is not None:
        return or_(Tag.is_default.is_(True), Tag.household_id == household_id)
    return or_(Tag.is_default.is_(True), and_(Tag.user_id == user_id, Tag.household_id.is_(None)))


@router.get("", response_model=list[TagOut])
async def list_tags(user: User = Depends(current_active_user), session: AsyncSession = Depends(get_async_session), household_id: uuid.UUID | None = Depends(get_active_household_id)) -> list[TagOut]:
    result = await session.execute(select(Tag).where(_tag_filter(user.id, household_id)).order_by(Tag.is_default.desc(), Tag.name))
    return [TagOut.model_validate(tag) for tag in result.scalars().all()]


@router.post("", response_model=TagOut, status_code=201)
async def create_tag(body: TagCreate, user: User = Depends(current_active_user), session: AsyncSession = Depends(get_async_session), household_id: uuid.UUID | None = Depends(get_active_household_id)) -> TagOut:
    name = body.name.strip()[:30]
    if not name:
        raise HTTPException(status_code=400, detail="Tag name required")
    if household_id is None:
        count = await session.scalar(select(func.count()).select_from(Tag).where(Tag.user_id == user.id, Tag.household_id.is_(None)))
        if (count or 0) >= MAX_USER_TAGS:
            raise HTTPException(status_code=400, detail=f"Maximum {MAX_USER_TAGS} custom tags reached")
    existing = await session.scalar(select(Tag).where(_tag_filter(user.id, household_id), Tag.name.ilike(name)))
    if existing is not None:
        raise HTTPException(status_code=409, detail="Tag already exists")
    tag = Tag(name=name, is_default=False, user_id=None if household_id else user.id, household_id=household_id)
    session.add(tag)
    await session.commit()
    await session.refresh(tag)
    return TagOut.model_validate(tag)
