import os
from fastapi import FastAPI

# Import the routers from the new 'routes' directory
from routes.search_router import router as scraping_router
from routes.analysis_router import router as analysis_router
import google.generativeai as genai

# --- App Initialization ---
app = FastAPI(
    title="Career Planner API",
    description="An API to search for job information and analyze job roles using Tavily and Gemini.",
    version="1.0.0",
)

# --- API Key Configuration ---
@app.on_event("startup")
def startup_event():
    """
    On startup, check for necessary API keys and configure the Gemini client.
    """
    tavily_api_key = os.getenv("TAVILY_API_KEY")
    google_api_key = os.getenv("GOOGLE_API_KEY")
    if not tavily_api_key or not google_api_key:
        raise RuntimeError("API keys for Tavily and/or Google are not set in environment variables.")
    genai.configure(api_key=google_api_key)
    print("FastAPI server started. API keys loaded and Gemini client configured.")

# --- Include Routers in the Main App ---
app.include_router(scraping_router)
app.include_router(analysis_router)
