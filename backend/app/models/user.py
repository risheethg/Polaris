from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any

# Import the FinancialStatus model to be used as a nested model
from app.models.user_details import FinancialStatus

class UserBase(BaseModel):
    """
    Represents a user's data retrieved from the authentication token.
    This model is used as the response_model in API endpoints.
    """
    uid: str = Field(..., description="The unique user ID from Firebase.")
    email: Optional[str] = Field(None, description="The user's email address.")
    name: Optional[str] = Field(None, description="The user's display name.")
    picture: Optional[str] = Field(None, description="URL to the user's profile picture.")
    email_verified: bool = Field(False, description="Whether the user's email is verified.")
    
    @field_validator('email', mode='before')
    @classmethod
    def validate_email(cls, v):
        # Allow None, empty string, or any string value
        # This prevents EmailStr validation errors
        if v is None or v == "":
            return None
        return str(v) if v else None

    class Config:
        # This allows the model to be created from dictionary keys that match field names.
        from_attributes = True

class UserCreate(UserBase):
    pass

class User(UserBase):
    is_active: bool = Field(True)
    
    # Example fields for your application's data
    interests: List[str] = []
    personality: Optional[Dict[str, Any]] = None
    career_map: Optional[Dict[str, Any]] = None

    # Add the new optional fields for personal and financial details
    current_role: Optional[str] = Field(None, description="Current job title or role")
    years_of_experience: Optional[int] = Field(None, ge=0, description="Years of professional experience")
    education_level: Optional[str] = Field(None, description="Highest level of education completed")
    financial_status: Optional[FinancialStatus] = Field(None, description="User's financial situation")