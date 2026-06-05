import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from api.models import ImportRequest, ImportResult
from api.services.pipeline import run_import, run_import_stream

router = APIRouter(prefix="/imports", tags=["imports"])


@router.post("", response_model=ImportResult)
async def create_import(body: ImportRequest) -> ImportResult:
    return await run_import(body.url)


@router.get("/stream")
async def stream_import(url: str) -> StreamingResponse:
    async def generate():
        async for event in run_import_stream(url):
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
