from fastapi import FastAPI, HTTPException, APIRouter
from pydantic import BaseModel, Field
from typing import List, Dict
import joblib
import gcsfs
import numpy as np
from sentence_transformers import SentenceTransformer
import os
import json

# --- Pydantic Models for Data Validation ---

class RiascScore(BaseModel):
    R: float = Field(..., ge=0, le=1, description="Realistic score")
    I: float = Field(..., ge=0, le=1, description="Investigative score")
    A: float = Field(..., ge=0, le=1, description="Artistic score")
    S: float = Field(..., ge=0, le=1, description="Social score")
    E: float = Field(..., ge=0, le=1, description="Enterprising score")
    C: float = Field(..., ge=0, le=1, description="Conventional score")

class Job(BaseModel):
    title: str
    description: str

class RecommendationResponse(BaseModel):
    best_cluster_id: int
    recommendations: List[Job]

class NewJob(BaseModel):
    title: str
    description: str

class ClassificationResponse(BaseModel):
    assigned_cluster_id: int
    job_title: str


router = APIRouter(tags=["Machine Learning"])

# --- Globals for loaded artifacts ---
all_jobs_data = []
cluster_profiles = []
pca_model = None
kmeans_model = None
embedding_model = None

def load_ml_artifacts():
    """Loads all ML artifacts from local disk."""
    global all_jobs_data, cluster_profiles, pca_model, kmeans_model, embedding_model
    # --- GCS Configuration ---
    # Set these environment variables or replace the default values
    GCS_BUCKET = os.getenv("GCS_BUCKET", "your-bucket-name")
    PROCESSED_DATA_PATH = f"gs://{GCS_BUCKET}/jobs_with_vectors_and_pca.json"
    # The PCA model is local as requested
    PCA_MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'scripts', 'pca_model.joblib')
    # The KMeans model and profiles are from GCS
    KMEANS_MODEL_PATH = f"gs://{GCS_BUCKET}/job-cluster-model-v2/model.joblib"
    CLUSTER_PROFILES_PATH = f"gs://{GCS_BUCKET}/job-cluster-model-v2/cluster_profiles.json"

    print("Initializing API and loading models...")
    try:
        fs = gcsfs.GCSFileSystem()

        with fs.open(PROCESSED_DATA_PATH, 'r') as f: all_jobs_data = json.load(f)
        with fs.open(CLUSTER_PROFILES_PATH, 'r') as f: cluster_profiles = json.load(f)
        # Load local PCA model
        with open(PCA_MODEL_PATH, 'rb') as f: pca_model = joblib.load(f)
        # Load GCS KMeans model
        with fs.open(KMEANS_MODEL_PATH, 'rb') as f: kmeans_model = joblib.load(f)
        
        embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Pre-calculate cluster labels
        riasec_order = ['R', 'I', 'A', 'S', 'E', 'C']
        for job in all_jobs_data:
            riasec_vec = [job['job_riasec_vector'].get(k, 0) for k in riasec_order]
            combined_vec = np.array(job['reduced_content_vector'] + riasec_vec).reshape(1, -1)
            job['cluster_label'] = int(kmeans_model.predict(combined_vec)[0])

        print("✅ All models and data loaded successfully.")
    except Exception as e:
        print(f"❌ Critical Error: Could not load models on startup. {e}")

@router.post("/recommend-jobs", response_model=RecommendationResponse)
def recommend_jobs_for_user(user_scores: RiascScore):
    if not all_jobs_data:
        raise HTTPException(status_code=503, detail="Service unavailable: Models not loaded.")

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
        Job(title=job['title'], description=job['description'])
        for job in all_jobs_data if job.get('cluster_label') == best_cluster_id
    ]

    return RecommendationResponse(best_cluster_id=best_cluster_id, recommendations=recommended_jobs[:5])

@router.post("/classify-job", response_model=ClassificationResponse)
def classify_new_job(job: NewJob):
    if not all([kmeans_model, pca_model, embedding_model]):
        raise HTTPException(status_code=503, detail="Service unavailable: Models not loaded.")

    combined_text = f"{job.title} {job.description}"
    full_embedding = embedding_model.encode(combined_text).reshape(1, -1)
    reduced_embedding = pca_model.transform(full_embedding)
    
    # For pure classification, a vector of zeros is acceptable for the personality part.
    dummy_riasec = np.zeros((1, 6))
    feature_vector = np.concatenate([reduced_embedding, dummy_riasec], axis=1)
    
    predicted_cluster = kmeans_model.predict(feature_vector)[0]

    return ClassificationResponse(
        assigned_cluster_id=int(predicted_cluster),
        job_title=job.title
    )