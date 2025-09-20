from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List
import joblib
import gcsfs
import numpy as np
import json
import os

# --- Pydantic Models for this specific router ---
class RiascScore(BaseModel):
    R: float = Field(..., ge=0, le=1)
    I: float = Field(..., ge=0, le=1)
    A: float = Field(..., ge=0, le=1)
    S: float = Field(..., ge=0, le=1)
    E: float = Field(..., ge=0, le=1)
    C: float = Field(..., ge=0, le=1)

class Job(BaseModel):
    title: str
    description: str
    cluster_label: int

class RecommendationResponse(BaseModel):
    best_cluster_id: int
    recommendations: List[Job]

# --- Pydantic Models for Cluster Profile Endpoint ---

class RiascProfile(BaseModel):
    R: float
    I: float
    A: float
    S: float
    E: float
    C: float

class ClusterProfile(BaseModel):
    cluster_label: int
    riasec_profile: RiascProfile
    
# --- Router Setup ---
router = APIRouter(
    prefix="/jobs",
    tags=["Job Recommendations"]
)

# --- Load Artifacts for this router ---
# This data is loaded once when the application starts
GCS_BUCKET = os.getenv("GCS_BUCKET", "job-rec-pipeline-artifacts")
PROCESSED_DATA_PATH = f"gs://{GCS_BUCKET}/data/processed/jobs_with_vectors_and_pca.json"
CLUSTER_PROFILES_PATH = f"gs://{GCS_BUCKET}/models/cluster_profiles.json"
KMEANS_MODEL_PATH = f"gs://{GCS_BUCKET}/models/kmeans_model.joblib" # Needed for pre-calculating labels

all_jobs_data = []
cluster_profiles = []

try:
    fs = gcsfs.GCSFileSystem()
    with fs.open(PROCESSED_DATA_PATH, 'r') as f:
        all_jobs_data = json.load(f)
    with fs.open(CLUSTER_PROFILES_PATH, 'r') as f:
        cluster_profiles = json.load(f)
    with fs.open(KMEANS_MODEL_PATH, 'rb') as f:
        kmeans_model = joblib.load(f)

    # Pre-calculate cluster labels for fast lookups
    for job in all_jobs_data:
        combined_vec = np.array(job['reduced_content_vector'] + [job['job_riasec_vector'].get(k, 0) for k in ['R', 'I', 'A', 'S', 'E', 'C']]).reshape(1, -1)
        job['cluster_label'] = int(kmeans_model.predict(combined_vec)[0])
    print("✅ Job recommendation models loaded successfully.")
except Exception as e:
    print(f"❌ Error loading job recommendation models: {e}")

# --- API Endpoint ---
@router.post("/recommend", response_model=RecommendationResponse)
def recommend_jobs_for_user(user_scores: RiascScore):
    """
    Accepts a user's RIASEC personality vector and returns a list of recommended jobs.
    """
    if not all_jobs_data:
        raise HTTPException(status_code=503, detail="Service unavailable: Job models not loaded.")

    riasec_order = ['R', 'I', 'A', 'S', 'E', 'C']
    user_vec_np = np.array([getattr(user_scores, k) for k in riasec_order])

    smallest_distance = float('inf')
    best_cluster_id = -1
    for profile in cluster_profiles:
        profile_vec_np = np.array([profile['riasec_profile'].get(k, 0) for k in riasec_order])
        distance = np.linalg.norm(user_vec_np - profile_vec_np)
        if distance < smallest_distance:
            smallest_distance = distance
            best_cluster_id = profile['cluster_label']

    recommended_jobs = [
        job for job in all_jobs_data 
        if job.get('cluster_label') == best_cluster_id
    ]

    return RecommendationResponse(best_cluster_id=best_cluster_id, recommendations=recommended_jobs)


# --- API Endpoint to Get Cluster Profiles ---

@router.get("/cluster-profiles", response_model=List[ClusterProfile])
def get_cluster_profiles():
    """
    Returns the average RIASEC personality profile for each job cluster.
    """
    if not cluster_profiles:
        raise HTTPException(status_code=503, detail="Service unavailable: Cluster profiles not loaded.")
    
    return cluster_profiles

@router.get("/all", response_model=List[Job])
def get_all_jobs():
    """
    Returns all jobs with their assigned cluster labels.
    """
    if not all_jobs_data:
        raise HTTPException(status_code=503, detail="Service unavailable: Job models not loaded.")
    
    return all_jobs_data