from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "HumanDNS API"
    API_V1_PREFIX: str = "/api/v1"

    # База данных: по умолчанию SQLite для локальной разработки
    DATABASE_URL: str = "sqlite:///./human_dns.db"
    # Пример для Postgres (на проде/стейдже):
    # postgresql+psycopg://user:password@host:5432/dbname

    # JWT
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 дней

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
