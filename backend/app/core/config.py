from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Municipal Revenue Leakage Intelligence System"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    # No default — app raises ValidationError on startup if SECRET_KEY is unset.
    secret_key: str = Field()
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:8000"]

    database_url: str = "postgresql+asyncpg://municipal:municipal@postgres:5432/municipal_revenue"
    redis_url: str = "redis://redis:6379/0"
    redis_password: str | None = None
    qdrant_url: str = "http://qdrant:6333"
    qdrant_api_key: str | None = None

    # --- LLM providers (evidence narratives) ---
    # Preference order: groq (if key present) -> ollama -> rule-based text.
    # Nothing is mandatory; the system runs fully offline on Ollama with no keys.
    groq_api_key: str | None = None
    groq_model: str = "llama-3.3-70b-versatile"

    ollama_base_url: str = "http://ollama:11434"
    ollama_chat_model: str = "llama3.2"
    ollama_embed_model: str = "nomic-embed-text"

    # --- Semantic duplicate detection (Qdrant) ---
    qdrant_collection: str = "properties"
    embedding_dim: int = 768  # nomic-embed-text outputs 768-dim vectors
    duplicate_similarity_threshold: float = 0.80


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
