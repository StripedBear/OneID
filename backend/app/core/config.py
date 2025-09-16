from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "HumanDNS API"
    API_V1_PREFIX: str = "/api/v1"

    # Database configuration
    DATABASE_URL: str = "sqlite:///./human_dns.db"
    # Supabase PostgreSQL example:
    # postgresql+psycopg://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

    # JWT Configuration
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS Configuration
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_BUCKET: str = "avatars"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
