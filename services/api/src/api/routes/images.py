import asyncio

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from api.config import settings
from api.services import r2
from api.users import User, current_active_user

router = APIRouter(prefix="/images", tags=["images"])


@router.post("/thumbnail")
async def upload_thumbnail(
    recipe_id: str,
    file: UploadFile = File(...),
    user: User = Depends(current_active_user),
) -> dict:
    if not settings.r2_configured:
        raise HTTPException(status_code=503, detail="Image storage not configured")
    data = await file.read()
    url = await asyncio.to_thread(r2.upload_image, data, recipe_id)
    return {"url": url}
