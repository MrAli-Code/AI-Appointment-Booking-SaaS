from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "AI Booking SaaS"
    ENV: str = "development"
    DEBUG: bool = True

    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "ai_booking"

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def DATABASE_URL_SYNC(self) -> str:
        return f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    REDIS_URL: str = "redis://localhost:6379/0"
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"

    JWT_SECRET: str = "super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 1440

    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4"

    SENTRY_DSN: Optional[str] = None

    CORS_ORIGINS: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
