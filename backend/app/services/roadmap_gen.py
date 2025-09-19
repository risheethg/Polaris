import json
from typing import Dict, List
import vertexai
from vertexai.generative_models import GenerativeModel
from pydantic import BaseModel

# TODO: Replace with your Google Cloud project details
PROJECT_ID = "your-gcp-project-id"
LOCATION = "your-gcp-region"  # e.g., "us-central1"

# Initialize the Vertex AI client and Gemini model
# Note: This should ideally be initialized once at the app's startup
try:
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    model = GenerativeModel("gemini-1.0-pro")
except Exception as e:
    # Handle the case where the project or location is not configured
    print(f"Vertex AI initialization failed: {e}")
    model = None

# Pydantic model to enforce the structure of the LLM's response
class RoadmapResponse(BaseModel):
    level: str
    level_justification: str
    roadmap: Dict[str, List[str]]

async def generate_personalized_roadmap(job_title: str, user_score_percentage: int, performance_breakdown: dict) -> RoadmapResponse:
    """
    Generates a skill level assessment and a personalized roadmap using the Gemini model.

    Args:
        job_title (str): The job title the user was assessed on.
        user_score_percentage (int): The user's total score percentage.
        performance_breakdown (dict): A breakdown of the user's correct and total answers by difficulty.

    Returns:
        RoadmapResponse: A Pydantic object containing the assessed level, justification, and roadmap.
    """
    if not model:
        return RoadmapResponse(level="Unknown", level_justification="LLM model not initialized.", roadmap={})

    prompt = f"""
    A user has completed a skill assessment for the role of "{job_title}".
    They scored {user_score_percentage}% overall.
    Their performance breakdown by difficulty was: {json.dumps(performance_breakdown, indent=2)}.

    Based on this, perform two tasks:

    1.  **Assess the user's current skill level.** Assign a single level: 'Beginner', 'Intermediate', or 'Advanced'. Justify your decision briefly, focusing on their performance across difficulty levels.
    2.  **Generate a personalized roadmap.** Create a three-part roadmap (Beginner, Intermediate, Advanced) for this user to progress in the "{job_title}" field. Each part should contain 3-5 concise, actionable steps. The roadmap should start from their assessed level. For example, if they are 'Beginner', the roadmap's 'Beginner' section should focus on the next logical steps for them, not the absolute basics.

    Format your response as a single JSON object with the following keys:
    {{
      "level": "string",
      "level_justification": "string",
      "roadmap": {{
        "Beginner": ["step1", "step2"],
        "Intermediate": ["step1", "step2"],
        "Advanced": ["step1", "step2"]
      }}
    }}
    """
    try:
        response = await model.generate_content_async(prompt)
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        roadmap_data = json.loads(cleaned_response)
        
        # Use Pydantic for validation
        return RoadmapResponse(**roadmap_data)
    except Exception as e:
        print(f"Error generating assessment and roadmap: {e}")
        # Return a default, empty roadmap on failure
        return RoadmapResponse(
            level="Unknown",
            level_justification="Could not generate a personalized assessment.",
            roadmap={}
        )
