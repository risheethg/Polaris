import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from fastapi import FastAPI, HTTPException, APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

import vertexai
from vertexai.generative_models import GenerativeModel

# --- Initialization ---
# Ensure your GOOGLE_APPLICATION_CREDENTIALS env var is set
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred)
db = firestore.client()

# TODO: Replace with your Google Cloud project details
PROJECT_ID = "your-gcp-project-id"
LOCATION = "your-gcp-region" # e.g., "us-central1"
vertexai.init(project=PROJECT_ID, location=LOCATION)

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

# IMPORT the new roadmap generation function and its model
from app.services.roadmap_gen import generate_personalized_roadmap, RoadmapResponse


# --- Helper Functions ---
async def generate_quiz_from_llm(job_title: str):
    """Generates a quiz using the Gemini model on Vertex AI asynchronously."""
    prompt = f"""
    You are an expert technical assessor... (Use the full prompt from the previous answer)
    ...for the role of a "{job_title}".
    ...
    """
    # Use the async version of the SDK method
    response = await model.generate_content_async(prompt)
    cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
    return cleaned_response

async def evaluate_score_with_llm(job_title: str, score_percentage: int, performance_breakdown: dict):
    """Uses the LLM to provide qualitative feedback based on the user's score."""
    prompt = f"""
    A user has completed a skill assessment for the role of "{job_title}"... (Use the full evaluation prompt)
    """
    response = await model.generate_content_async(prompt)
    cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
    return cleaned_response


# --- API Routes ---
@router.post("/generate-quiz")
async def generate_quiz_route(request: QuizRequest):
    job_title = request.job_title
    quiz_id = job_title.lower().replace(" ", "_")
    
    try:
        # NOTE: The firebase-admin SDK is synchronous. In a high-traffic app,
        # you might run this in a thread pool to avoid blocking the event loop.
        quiz_ref = db.collection('quizzes').document(quiz_id)
        quiz_doc = quiz_ref.get()

        if quiz_doc.exists:
            return quiz_doc.to_dict()
        else:
            quiz_json_str = await generate_quiz_from_llm(job_title)
            quiz_data = json.loads(quiz_json_str)
            quiz_ref.set(quiz_data)
            return quiz_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/submit-quiz")
async def submit_quiz_route(submission: SubmissionRequest):
    try:
        quiz_id = submission.job_title.lower().replace(" ", "_")
        quiz_ref = db.collection('quizzes').document(quiz_id)
        quiz_doc = quiz_ref.get()

        if not quiz_doc.exists:
            raise HTTPException(status_code=404, detail=f"Quiz for {submission.job_title} not found.")

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

        # --- Get Qualitative Assessment and Roadmap from LLM ---
        # This is the new call to the service function
        assessment_and_roadmap = await generate_personalized_roadmap(
            submission.job_title,
            score_percentage,
            performance
        )

        # --- Save result to Firestore ---
        assessment_result = {
            "userId": submission.user_id,
            "quizId": quiz_id,
            "score": score_percentage,
            "level": assessment_and_roadmap.level,
            "levelJustification": assessment_and_roadmap.level_justification,
            "submittedAt": firestore.SERVER_TIMESTAMP
        }
        db.collection('userAssessments').add(assessment_result)

        # --- Save the personalized roadmap to a new collection ---
        roadmap_data = {
            "userId": submission.user_id,
            "jobTitle": submission.job_title,
            "level": assessment_and_roadmap.level,
            "roadmap": assessment_and_roadmap.roadmap,
            "generatedAt": firestore.SERVER_TIMESTAMP
        }
        db.collection('userRoadmaps').add(roadmap_data)

        # Return a combined response to the user
        return {
            "assessmentResult": assessment_result,
            "roadmap": roadmap_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
