import os

# --- Google Cloud Settings ---
PROJECT_ID = os.getenv("GCP_PROJECT", "your-project-id")
BUCKET_NAME = os.getenv("GCS_BUCKET", "your-bucket-name")
REGION = "us-central1" 

# --- GCS Paths (Centralized) ---
# Raw data from scraper
GCS_RAW_DATA = f"gs://{BUCKET_NAME}/raw_jobs_scraped.json"

# Processed data (Vectors + PCA)
GCS_PROCESSED_DATA = f"gs://{BUCKET_NAME}/jobs_with_vectors_and_pca.json"

# Final Model Artifacts
GCS_KMEANS_MODEL = f"gs://{BUCKET_NAME}/saved_model/kmeans_model.joblib"
GCS_CLUSTERS_PROFILES = f"gs://{BUCKET_NAME}/saved_model/cluster_profiles.json"
GCS_PCA_MODEL = f"gs://{BUCKET_NAME}/saved_model/pca_model.joblib"

# --- Model Config ---
TRANSFORMER_MODEL = 'all-MiniLM-L6-v2'
PCA_VARIANCE = 0.95
N_CLUSTERS = 8