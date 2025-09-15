from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any

class UserBase(BaseModel):
    """
    Represents a user's data retrieved from the authentication token.
    This model is used as the response_model in API endpoints.
    """
    uid: str = Field(..., description="The unique user ID from Firebase.")
    email: Optional[EmailStr] = Field(None, description="The user's email address.")
    name: Optional[str] = Field(None, description="The user's display name.")
    picture: Optional[str] = Field(None, description="URL to the user's profile picture.")
    email_verified: bool = Field(False, description="Whether the user's email is verified.")

    class Config:
        # This allows the model to be created from dictionary keys that match field names.
        from_attributes = True

class UserCreate(UserBase):
    pass

class User(UserBase):
    is_active: bool = Field(True)
    
    # Example fields for your application's data
    interests: List[str] = []
    personality_results: Optional[Dict[str, Any]] = None
    career_map: Optional[Dict[str, Any]] = None