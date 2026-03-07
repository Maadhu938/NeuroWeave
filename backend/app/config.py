from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    database_url: str
    groq_api_key: str = ""
    cors_origins: str = '["http://localhost:5173"]'
    embedding_model: str = "all-MiniLM-L6-v2"
    host: str = "0.0.0.0"
    port: int = 8000
    environment: str = "development"  # "production" on Render
    firebase_project_id: str = ""
    firebase_service_account: str = ""  # file path OR raw JSON string

    @property
    def origins(self) -> List[str]:
        return json.loads(self.cors_origins)

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
