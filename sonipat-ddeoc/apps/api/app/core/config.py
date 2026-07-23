from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sonipat D-DEOC"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql://sonipat_admin:sonipat_password_2022@localhost:5432/sonipat_ddeoc"
    POSTGRES_DB: str = "sonipat_ddeoc"
    POSTGRES_USER: str = "sonipat_admin"
    POSTGRES_PASSWORD: str = "sonipat_password_2022"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Keycloak
    KEYCLOAK_SERVER_URL: str = "http://localhost:8080"
    KEYCLOAK_REALM: str = "sonipat-ddeoc"
    KEYCLOAK_CLIENT_ID: str = "sonipat-api"
    KEYCLOAK_CLIENT_SECRET: str = "sonipat-api-secret"
    
    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "sonipat_minio"
    MINIO_SECRET_KEY: str = "minio_password_2022"
    MINIO_SECURE: bool = False
    
    # Security
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    SECRET_KEY: str = "sonipat-ddeoc-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    # Timezone
    TIMEZONE: str = "Asia/Kolkata"
    
    # File Upload
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_FILE_TYPES: List[str] = [
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain", "text/csv",
        "application/geojson", "application/json"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
