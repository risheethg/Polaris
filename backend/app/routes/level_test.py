import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from app.core.response import Response
from google.auth import default as google_auth_default
import vertexai
from vertexai.generative_models import GenerativeModel

# --- Initialization ---

# TODO: Replace with your Google Cloud project details
PROJECT_ID = "ivory-vim-472211-s1"
LOCATION = "us-central1"

credentials, project_id = google_auth_default()
vertexai.init(project=PROJECT_ID, location=LOCATION, credentials=credentials)

# Initialize the Gemini model
model = GenerativeModel("gemini-1.0-pro")
router = APIRouter()


# --- Pydantic Models for Data Validation ---
class QuizRequest(BaseModel):
    job_title: str

class UserAnswer(BaseModel):
    question_text: str
    selected_answer: str

class SubmissionRequest(BaseModel):
    user_id: str
    job_title: str
    answers: List[UserAnswer]


# --- Helper Functions ---
def generate_quiz_from_llm(job_title: str):
    """Generates a quiz using the Gemini model on Vertex AI asynchronously."""
    prompt = f"""
    You are an expert technical assessor responsible for creating a skills quiz for a candidate interested in the role of a "{job_title}".

    Your task is to generate a 5-question multiple-choice quiz. The quiz should have a mix of difficulties:
    - 2 "Beginner" questions
    - 2 "Intermediate" questions
    - 1 "Advanced" question

    For each question, provide 4 options and clearly indicate the correct answer.

    You MUST return the output as a single, minified JSON object with no markdown formatting.
    The JSON object should have two keys: "title" and "questions".
    The "title" should be a string like "Technical Assessment: [Job Title]".
    The "questions" key should be an array of question objects. Each question object must have the following keys:
    - "question_text": The full text of the question.
    - "options": An array of 4 strings representing the possible answers.
    - "difficulty": A string, either "Beginner", "Intermediate", or "Advanced".
    - "correct_answer": The string that exactly matches the correct option.

    Example for a single question object:
    {{
      "question_text": "What is the primary purpose of a 'key' prop in a list of React components?",
      "options": ["To style the component", "To uniquely identify elements for efficient updates", "To pass data to child components", "To handle click events"],
      "difficulty": "Beginner",
      "correct_answer": "To uniquely identify elements for efficient updates"
    }}
    """
    # Use the sync version of the SDK method
    response = model.generate_content(prompt)
    cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
    return cleaned_response

def evaluate_score_with_llm(job_title: str, score_percentage: int, performance_breakdown: dict):
    """Uses the LLM to provide qualitative feedback based on the user's score."""
    prompt = f"""
    A user has completed a skill assessment for the role of "{job_title}".
    Their overall score was {score_percentage}%.
    Their performance breakdown by difficulty was: {json.dumps(performance_breakdown)}

    Based on this, determine their proficiency level and provide brief, encouraging feedback.
    The level should be one of: "Beginner", "Intermediate", "Advanced".
    The feedback should be a short paragraph (2-3 sentences) acknowledging their effort and suggesting what to focus on next.

    You MUST return the output as a single, minified JSON object with two keys: "level" and "feedback".
    """
    response = model.generate_content(prompt)
    cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
    return cleaned_response


# --- API Routes ---
@router.post("/generate-quiz")
async def generate_quiz_route(request: QuizRequest):
    job_title = request.job_title
    db = firestore.client()
    quiz_id = job_title.lower().replace(" ", "_")
    
    try:
        # NOTE: The firebase-admin SDK is synchronous. In a high-traffic app,
        # you might run this in a thread pool to avoid blocking the event loop.
        quiz_ref = db.collection('quizzes').document(quiz_id)
        quiz_doc = quiz_ref.get()

        if quiz_doc.exists:
            return Response.success(quiz_doc.to_dict(), "Quiz retrieved from cache.")
        else:
            quiz_json_str = generate_quiz_from_llm(job_title)
            quiz_data = json.loads(quiz_json_str)
            quiz_ref.set(quiz_data)
            return Response.success(quiz_data, "Quiz generated successfully.")

    except Exception as e:
        return Response.failure(message="Failed to generate or retrieve quiz.", status_code=500, error_details=str(e))


@router.post("/submit-quiz")
async def submit_quiz_route(submission: SubmissionRequest):
    try:
        db = firestore.client()
        quiz_id = submission.job_title.lower().replace(" ", "_")
        quiz_ref = db.collection('quizzes').document(quiz_id)
        quiz_doc = quiz_ref.get()

        if not quiz_doc.exists:
            return Response.failure(message=f"Quiz for {submission.job_title} not found.", status_code=404)

        questions = quiz_doc.to_dict().get('questions', [])
        
        # --- Scoring Logic --- (This part remains the same)
        total_score, max_score, performance = 0, 0, {
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

        # --- Get Qualitative Evaluation from LLM ---
        evaluation_json_str = evaluate_score_with_llm(submission.job_title, score_percentage, performance)
        evaluation_data = json.loads(evaluation_json_str)

        # --- Save result to Firestore ---
        assessment_result = {
            "userId": submission.user_id,
            "quizId": quiz_id,
            "score": score_percentage,
            **evaluation_data, # Merges 'level' and 'feedback' keys
            "submittedAt": firestore.SERVER_TIMESTAMP
        }
        db.collection('userAssessments').add(assessment_result)

        return Response.success(assessment_result, "Quiz submitted and evaluated successfully.")

    except Exception as e:
        return Response.failure(message="Failed to submit quiz.", status_code=500, error_details=str(e))