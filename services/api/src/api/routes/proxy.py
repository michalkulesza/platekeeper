from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/proxy", tags=["proxy"])

_ALLOWED_HOSTS = {
    "scontent-sjc6-1.cdninstagram.com",
    "scontent-lax3-2.cdninstagram.com",
    "scontent-sea1-1.cdninstagram.com",
    "scontent-atl3-2.cdninstagram.com",
    "scontent-dfw5-2.cdninstagram.com",
    "scontent-ord6-2.cdninstagram.com",
    "scontent-iad3-2.cdninstagram.com",
    "scontent-mia3-2.cdninstagram.com",
}

# Match any cdninstagram.com or tiktokcdn.com subdomain
def _allowed(url: str) -> bool:
    host = urlparse(url).hostname or ""
    return host.endswith(".cdninstagram.com") or host.endswith(".tiktokcdn.com")


@router.get("/image")
async def proxy_image(url: str) -> StreamingResponse:
    if not _allowed(url):
        raise HTTPException(status_code=403, detail="URL not allowed")

    async def stream():
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            async with client.stream("GET", url, headers={"User-Agent": "Mozilla/5.0"}) as r:
                r.raise_for_status()
                async for chunk in r.aiter_bytes(8192):
                    yield chunk

    async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
        head = await client.head(url, headers={"User-Agent": "Mozilla/5.0"})
        content_type = head.headers.get("content-type", "image/jpeg")

    return StreamingResponse(stream(), media_type=content_type)
