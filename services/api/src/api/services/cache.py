from __future__ import annotations

import re

from api.models import ImportResult

_store: dict[str, ImportResult] = {}

# instagram.com/reel/<id>  or  /p/<id>  or  /tv/<id>
_IG_RE = re.compile(r"instagram\.com/(?:reel|p|tv)/([A-Za-z0-9_-]+)", re.IGNORECASE)
# tiktok.com/@handle/video/<id>
_TT_RE = re.compile(r"tiktok\.com/@[^/]+/video/(\d+)", re.IGNORECASE)


def get(url: str) -> ImportResult | None:
    return _store.get(_key(url))


def set(url: str, result: ImportResult) -> None:
    _store[_key(url)] = result


def _key(url: str) -> str:
    for pattern in (_IG_RE, _TT_RE):
        m = pattern.search(url)
        if m:
            return m.group(1)
    # fallback for unrecognised or short-link URLs
    return url.strip().rstrip("/")
