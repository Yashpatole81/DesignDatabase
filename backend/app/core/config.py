from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "QueryNest - AI Database Architect"
    API_V1_STR: str = "/api/v1"

    LLM_API_URL: str = "http://wiphackxlw49hx.cloudloka.com:8000/v1/chat/completions"
    MODEL_NAME: str = "Qwen/Qwen3-8B"

    SCHEMA_ONLY_MODE: bool = True

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
