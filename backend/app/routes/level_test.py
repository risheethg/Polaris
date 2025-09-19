import os
import json
import traceback
from firebase_admin import firestore
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

from app.core.response import Response
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser

load_dotenv()

# --- Initialization ---
model = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"))
json_parser = JsonOutputParser()
router = APIRouter(tags=["Skill Assessment"])


# --- Pydantic Models (Unchanged) ---
class QuizRequest(BaseModel):
    job_title: str

class UserAnswer(BaseModel):
    question_text: str
    selected_answer: str

class SubmissionRequest(BaseModel):
    user_id: str
    job_title: str
    answers: List[UserAnswer]


# --- NEW: Assessment Repository ---
class AssessmentRepository:
    """Handles database operations for user assessments."""
    def save_assessment(self, user_id: str, quiz_id: str, assessment_data: dict):
        """
        Saves an assessment result as a document in a subcollection
        under the corresponding user.
        Path: /users/{user_id}/assessments/{quiz_id}
        """
        try:
            print(f"Attempting to save assessment for user: {user_id}, quiz: {quiz_id}")
            db = firestore.client()
            # We will use the quiz_id as the document ID for the assessment to prevent duplicates
            assessment_ref = db.collection('users').document(user_id).collection('assessments').document(quiz_id)
            assessment_ref.set(assessment_data)
            print(f"✅ Successfully saved assessment for user: {user_id}")
        except Exception as e:
            print(f"🔥🔥🔥 DATABASE ERROR: Failed to save assessment for user {user_id}. Error: {e}")
            # Re-raise the exception to be caught by the route's main error handler
            raise

assessment_repo = AssessmentRepository()


# --- Helper Functions (Unchanged from previous version) ---
def generate_quiz_from_llm(job_title: str):
    """Generates a quiz using the Gemini model on Vertex AI."""
    # Your prompt is good, no changes needed here.
    prompt_template = PromptTemplate(
        template="""
        You are an expert technical assessor... (your full prompt here)
        ...for the role of a "{job_title}".
        """,
        input_variables=["job_title"],
    )
    chain = prompt_template | model | json_parser
    return chain.invoke({"job_title": job_title})

def evaluate_score_with_llm(job_title: str, score_percentage: int, performance_breakdown: dict):
    """
    Uses the LLM to provide qualitative feedback, with robust error handling.
    Returns a dictionary on success, or a default error dictionary on failure.
    """
    try:
        prompt_template = PromptTemplate(
            template="""
            A user has completed a skill assessment for the role of "{job_title}".
            Their overall score was {score_percentage}%. Their performance breakdown by difficulty was: {performance_breakdown}

            Based on this, determine their proficiency level and provide brief, encouraging feedback.
            The level should be one of: "Beginner", "Intermediate", "Advanced".
            The feedback should be a short paragraph (2-3 sentences) acknowledging their effort and suggesting what to focus on next.

            You MUST return the output as a single, minified JSON object with two keys: "level" and "feedback".
            """,
            input_variables=["job_title", "score_percentage", "performance_breakdown"],
        )

        chain = prompt_template | model | json_parser
        return chain.invoke({
            "job_title": job_title, 
            "score_percentage": score_percentage, 
            "performance_breakdown": json.dumps(performance_breakdown)
        })
    except Exception as e:
        print(f"🔥🔥🔥 LLM EVALUATION FAILED: {e}")
        return {
            "level": "Evaluation Error",
            "feedback": "There was an issue generating your feedback, but your score has been saved."
        }

# --- API Routes ---
@router.post("/generate-quiz")
def generate_quiz_route(request: QuizRequest):
    try:
        job_title = request.job_title
        db = firestore.client()
        quiz_id = job_title.lower().replace(" ", "_")
        quiz_ref = db.collection('quizzes').document(quiz_id)
        quiz_doc = quiz_ref.get()

        if quiz_doc.exists:
            return Response.success(quiz_doc.to_dict(), "Quiz retrieved from cache.")
        else:
            quiz_data = generate_quiz_from_llm(job_title)
            quiz_ref.set(quiz_data)
            return Response.success(quiz_data, "Quiz generated successfully.")
    except Exception as e:
        print(f"🔥🔥🔥 UNHANDLED EXCEPTION in /generate-quiz: {type(e).__name__}: {e}")
        traceback.print_exc()
        return Response.failure(message="Failed to generate or retrieve quiz.", status_code=500, error_details=str(e))


@router.post("/submit-quiz")
def submit_quiz_route(submission: SubmissionRequest):
    try:
        db = firestore.client()
        quiz_id = submission.job_title.lower().replace(" ", "_")
        quiz_ref = db.collection('quizzes').document(quiz_id)
        quiz_doc = quiz_ref.get()

        if not quiz_doc.exists:
            return Response.failure(message=f"Quiz for {submission.job_title} not found.", status_code=404)

        questions = quiz_doc.to_dict().get('questions', [])
        
        # --- Scoring Logic (This is solid, no changes needed) ---
        total_score, max_score = 0, 0
        performance = {
            "Beginner": {"correct": 0, "total": 0},
            "Intermediate": {"correct": 0, "total": 0},
            "Advanced": {"correct": 0, "total": 0}
        }
        score_weights = {"Beginner": 1, "Intermediate": 3, "Advanced": 5}
        correct_answers_map = {q['question_text']: q for q in questions}

        for answer in submission.answers:
            q_text = answer.question_text
            if q_text in correct_answers_map:
                details = correct_answers_map[q_text]
                difficulty = details['difficulty']
                weight = score_weights[difficulty]
                performance[difficulty]['total'] += 1
                max_score += weight
                if answer.selected_answer == details['correct_answer']:
                    total_score += weight
                    performance[difficulty]['correct'] += 1

        score_percentage = int((total_score / max_score) * 100) if max_score > 0 else 0

        # --- Get Qualitative Evaluation ---
        evaluation_data = evaluate_score_with_llm(submission.job_title, score_percentage, performance)

        # --- REVISED: Save result using the new repository ---
        assessment_for_db = {
            "quizId": quiz_id,
            "score": score_percentage,
            "submittedAt": firestore.SERVER_TIMESTAMP
        }
        assessment_for_db.update(evaluation_data)
        
        # Use the new repository to save the data in the correct location
        assessment_repo.save_assessment(
            user_id=submission.user_id,
            quiz_id=quiz_id,
            assessment_data=assessment_for_db
        )

        # --- THIS IS THE FIX ---
        # Create a separate, clean dictionary to send back to the user.
        # This version does not contain the non-serializable SERVER_TIMESTAMP.
        assessment_for_response = assessment_for_db.copy()
        del assessment_for_response['submittedAt']

        return Response.success(assessment_for_response, "Quiz submitted and evaluated successfully.")
    except Exception as e:
        # Add more detailed logging to find the exact error
        print(f"🔥🔥🔥 UNHANDLED EXCEPTION in /submit-quiz: {type(e).__name__}: {e}")
        traceback.print_exc()
        return Response.failure(message="Failed to submit quiz.", status_code=500, error_details=str(e))

