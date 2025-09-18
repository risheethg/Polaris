from pydantic import BaseModel, Field
from typing import List

class AssessmentAnswers(BaseModel):
    """
    Represents the answers submitted from the frontend personality assessment.
    The answers are a list of numbers, where each number corresponds to the
    user's agreement with a question (e.g., 0-4 for Disagree to Agree).
    """
    answers: List[int] = Field(..., min_items=48, max_items=48)