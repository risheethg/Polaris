from fastapi import APIRouter, Depends, status

from app.core.security import get_current_active_user
from app.models.assessment import AssessmentAnswers
from app.models.user import User
from app.repos.users_repo import users_repo
# Import the new service
from app.services.assessment_service import calculate_riasec_vector

router = APIRouter(tags=["Assessments"])

@router.post("", status_code=status.HTTP_200_OK)
async def submit_assessment(
    assessment_answers: AssessmentAnswers,
    current_user: User = Depends(get_current_active_user)
):
    """
    Receives assessment answers, uses the assessment service to calculate scores,
    and updates the user's profile with the resulting RIASEC vector.
    """
    riasec_vector = calculate_riasec_vector(assessment_answers)
    
    # Update the user document in Firestore with the calculated scores
    await users_repo.update(current_user.uid, {"personality": riasec_vector})

    return {"message": "Assessment completed successfully!", "personality_scores": riasec_vector}