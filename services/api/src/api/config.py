from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    scrapecreators_api_key: str
    gemini_api_key: str
    allowed_origins: str = "http://localhost:5173"
    database_url: str = "postgresql+asyncpg://platekeeper:platekeeper@localhost:5432/platekeeper"
    secret: str = "CHANGE-ME-IN-PRODUCTION-USE-LONG-RANDOM-STRING"

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


settings = Settings()  # type: ignore[call-arg]
