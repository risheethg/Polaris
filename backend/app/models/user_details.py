from pydantic import BaseModel, Field
from typing import Optional

class FinancialStatus(BaseModel):
    current_salary: Optional[int] = Field(None, description="Current annual salary in USD")
    target_salary: Optional[int] = Field(None, description="Target annual salary in USD")
    risk_tolerance: Optional[str] = Field(None, description="Risk tolerance for career changes (e.g., 'low', 'medium', 'high')")

class UserDetailsUpdate(BaseModel):
    current_role: Optional[str] = Field(None, description="Current job title or role")
    years_of_experience: Optional[int] = Field(None, ge=0, description="Years of professional experience")
    education_level: Optional[str] = Field(None, description="Highest level of education completed")
    financial_status: Optional[FinancialStatus] = None

    class Config:
        populate_by_name = True
