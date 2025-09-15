from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Import the core analysis function
from scraping.gemini import analyze_job_role

# --- Pydantic Models & Router for Analysis ---
class JobAnalysisRequest(BaseModel):
    job_title: str

router = APIRouter(
    prefix="/analyze",
    tags=["Analysis"],
)

@router.post("/job-role")
async def analyze_job_role_endpoint(request: JobAnalysisRequest):
    """
    Analyzes a job role by searching the web and using Gemini for evaluation.
    Note: This is a long-running task.
    """
    try:
        analysis_result = analyze_job_role(job_title=request.job_title)
        if "error" in analysis_result:
            raise HTTPException(status_code=500, detail=analysis_result["error"])
        return analysis_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")