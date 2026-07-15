import sentry_sdk

from api.config import settings


def init_sentry() -> None:
    """Enable Sentry only when a DSN has been configured."""
    if settings.sentry_dsn:
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            environment=settings.sentry_environment,
            traces_sample_rate=0,
        )


def report_recipe_import_failure(
    *,
    input_kind: str,
    reason: str,
    source_url: str | None = None,
    input_size: int | None = None,
    error: Exception | None = None,
) -> None:
    """Report a terminal import failure without sending pasted recipe contents."""
    with sentry_sdk.new_scope() as scope:
        scope.set_tag("operation", "recipe_import")
        scope.set_tag("input_kind", input_kind)
        scope.set_context("recipe_import", {
            "source_url": source_url,
            "input_size": input_size,
            "reason": reason,
        })
        if error is not None:
            sentry_sdk.capture_exception(error)
        else:
            sentry_sdk.capture_message(f"Recipe import failed: {reason}", level="error")
