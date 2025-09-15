from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    FIREBASE_CREDENTIALS_PATH: str

    model_config = SettingsConfigDict(env_file=".env")

# Create a single instance to be used across the application
settings = Settings()