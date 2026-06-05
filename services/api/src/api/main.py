import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.config import settings
from api.routes.imports import router as imports_router
from api.routes.proxy import router as proxy_router

logging.basicConfig(level=logging.DEBUG)

app = FastAPI(title="PlateKeeper API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(imports_router, prefix="/api")
app.include_router(proxy_router, prefix="/api")


@app.get("/healthz")
async def health() -> dict[str, str]:
    return {"status": "ok"}
