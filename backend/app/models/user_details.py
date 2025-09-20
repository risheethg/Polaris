from pydantic import BaseModel, Field
from typing import Optional

class FinancialStatus(BaseModel):
    current_salary: Optional[int] = Field(None, description="Current annual salary in USD")
    household_income: Optional[int] = Field(None, alias="householdIncome", description="Total annual household income in USD")
    monthly_expenses: Optional[int] = Field(None, alias="monthlyExpenses", description="Average monthly expenses in USD")
    dependents: Optional[int] = Field(None, ge=0, description="Number of dependents")
    target_salary: Optional[int] = Field(None, description="Target annual salary in USD")
    risk_tolerance: Optional[str] = Field(None, description="Risk tolerance for career changes (e.g., 'low', 'medium', 'high')")

    class Config:
        populate_by_name = True
        from_attributes = True

class UserDetailsUpdate(BaseModel):
    current_role: Optional[str] = Field(None, description="Current job title or role")
    years_of_experience: Optional[int] = Field(None, ge=0, description="Years of professional experience")
    education_level: Optional[str] = Field(None, description="Highest level of education completed")
    financial_status: Optional[FinancialStatus] = Field(None, description="User's financial situation")

    class Config:
        populate_by_name = True # Allows using alias for populating model
