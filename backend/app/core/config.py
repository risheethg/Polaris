# backend/app/core/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict
import logging

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables from a .env file.
    """
    
    LOGGER: int = logging.INFO  # Default to INFO level
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# Create a single instance to be used across the application
settings = Settings()