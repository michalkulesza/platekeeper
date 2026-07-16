from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.database import get_async_session
from api.models import Tag, TagOut
from api.users import User, current_active_user

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=list[TagOut])
async def list_tags(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> list[TagOut]:
    result = await session.execute(select(Tag).order_by(Tag.name))
    return [TagOut.model_validate(t) for t in result.scalars().all()]
