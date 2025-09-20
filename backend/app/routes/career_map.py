import os
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from firebase_admin import firestore
from typing import List, Literal

from app.core.security import get_current_active_user
from app.models.user import User
from app.core.response import Response

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser

# --- Initialization ---
model = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"))
router = APIRouter(tags=["Career Map Generation"])

# --- Pydantic Models for Career Map ---

class CareerMapStep(BaseModel):
    step_number: int
    title: str
    type: Literal["EXPERIENCE", "SPECIALIZATION", "PIVOT"]
    duration: str
    description: str
    tasks_to_complete: List[str]
    next_steps: List['CareerMapStep'] = []

# Update forward reference
CareerMapStep.model_rebuild()

class CareerMapData(BaseModel):
    startJobTitle: str
    steps: List[CareerMapStep]

class CareerMapRequest(BaseModel):
    target_job_title: str = Field(..., description="The job title the user wants a career map for.")

# --- LLM Prompt and Chain ---

json_parser = JsonOutputParser(pydantic_object=CareerMapData)

prompt_template = PromptTemplate(
    template="""
    You are an expert career strategist. Your task is to generate a detailed, step-by-step career map for a user who wants to transition into a new role.

    **User's Current Profile:**
    - Current Role: {current_role}
    - Years of Experience: {years_of_experience}
    - Highest Education: {education_level}
    - Financial Situation:
        - Current Salary (USD): {current_salary}
        - Household Income (USD): {household_income}
        - Monthly Expenses (USD): {monthly_expenses}
        - Risk Tolerance for career change: {risk_tolerance}
        - Target Salary (USD): {target_salary}
    - RIASEC Personality Profile (scores from 0 to 1): {personality}

    **User's Skill Assessment for the Target Role:**
    - Proficiency Level: {proficiency_level}
    - Feedback Received: {proficiency_feedback}

    **Target Role:** {target_job_title}

    **Instructions:**
    1.  Create a realistic, actionable career map starting from the user's current situation.
    2.  The map should be a series of nested steps. The first step should be based on their current role or a very close starting point.
    3.  For each step, define a clear title, a realistic duration, a description of the goal for that step, and a list of 2-3 concrete tasks to complete.
    4.  At each step, generate multiple, diverse `next_steps` to create a branching, tree-like structure. These branches should represent different specializations, alternative paths (pivots), or levels of seniority.
    5.  Consider the user's risk tolerance. A 'low' risk tolerance means suggesting smaller, more stable steps, while 'high' can include more ambitious pivots or starting a business.
    6.  The entire output MUST be a single, minified JSON object that strictly follows this format: {format_instructions}

    **Example of a single step object:**
    {{
      "step_number": 1,
      "title": "Graduate Software Engineer",
      "type": "EXPERIENCE",
      "duration": "1-2 years",
      "description": "Build a strong foundation...",
      "tasks_to_complete": ["Contribute to 2-3 major features..."],
      "next_steps": [ {{...another step object...}} ]
    }}
    """,
    input_variables=["current_role", "years_of_experience", "education_level", "current_salary", "household_income", "monthly_expenses", "risk_tolerance", "personality", "target_job_title", "proficiency_level", "proficiency_feedback"],
    partial_variables={"format_instructions": json_parser.get_format_instructions()}
)

chain = prompt_template | model | json_parser

# --- API Endpoint ---

@router.post("/generate", response_model=CareerMapData)
async def generate_career_map(
    request: CareerMapRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Generates a personalized career map for the user based on their profile
    and a target job title.
    """
    if not all([current_user.current_role, current_user.personality, current_user.financial_status]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User profile is incomplete. Please fill out personal details and complete the assessment first."
        )

    # Fetch the user's skill assessment result for the target job
    proficiency_level = "Not Assessed"
    proficiency_feedback = "No assessment taken for this role."
    try:
        db = firestore.client()
        quiz_id = request.target_job_title.lower().replace(" ", "_")
        assessment_ref = db.collection('users').document(current_user.uid).collection('assessments').document(quiz_id)
        assessment_doc = assessment_ref.get()
        if assessment_doc.exists:
            assessment_data = assessment_doc.to_dict()
            proficiency_level = assessment_data.get("level", "Not Assessed")
            proficiency_feedback = assessment_data.get("feedback", "No feedback available.")
    except Exception as e:
        print(f"⚠️  Could not fetch skill assessment for user {current_user.uid}: {e}")

    try:
        career_map_data = chain.invoke({
            "current_role": current_user.current_role,
            "years_of_experience": current_user.years_of_experience,
            "education_level": current_user.education_level,
            "current_salary": current_user.financial_status.current_salary,
            "household_income": current_user.financial_status.household_income,
            "monthly_expenses": current_user.financial_status.monthly_expenses,
            "risk_tolerance": current_user.financial_status.risk_tolerance,
            "target_salary": current_user.financial_status.target_salary,
            "personality": current_user.personality,
            "target_job_title": request.target_job_title,
            "proficiency_level": proficiency_level,
            "proficiency_feedback": proficiency_feedback
        })

        if not career_map_data:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="The AI model failed to generate a valid career map. This might be a temporary issue. Please try again."
            )

        return career_map_data
    except Exception as e:
        print(f"🔥🔥🔥 LLM CAREER MAP ERROR: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate career map from LLM. Error: {e}"
        )