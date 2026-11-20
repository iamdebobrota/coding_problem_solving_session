import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv


load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")


class Settings:
    def __init__(self) -> None:
        self.database_url = os.getenv("DATABASE_URL", "").strip()
        if not self.database_url:
            raise RuntimeError("DATABASE_URL is required for the Supabase PostgreSQL database")

        self.jwt_secret = os.getenv("JWT_SECRET", "change-this-in-production").strip()
        self.jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256").strip()
        self.jwt_expire_minutes = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))
        self.cors_origins = os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5500,http://127.0.0.1:5500,http://localhost:4173,http://127.0.0.1:4173",
        )

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


def get_settings() -> Settings:
    return Settings()
