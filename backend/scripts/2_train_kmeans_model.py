import pandas as pd
import json
import os
import warnings
from sklearn.cluster import KMeans
import numpy as np
import gcsfs
import joblib

# Ignore the KMeans convergence warning
warnings.filterwarnings("ignore", category=UserWarning)

# --- Configuration with GCS and Local Fallback ---
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET", "your-gcs-bucket-name-here")

# Define Local Paths
LOCAL_INPUT_PATH = 'jobs_with_vectors_and_pca.json'
LOCAL_MODEL_DIR = 'saved_model' # Local directory to save models
LOCAL_KMEANS_PATH = os.path.join(LOCAL_MODEL_DIR, 'kmeans_model.joblib')
LOCAL_PROFILES_PATH = os.path.join(LOCAL_MODEL_DIR, 'cluster_profiles.json')

# Define GCS Paths
GCS_INPUT_PATH = f"gs://{GCS_BUCKET_NAME}/{LOCAL_INPUT_PATH}"
GCS_MODEL_DIR = f"gs://{GCS_BUCKET_NAME}/{LOCAL_MODEL_DIR}"
GCS_KMEANS_PATH = os.path.join(GCS_MODEL_DIR, 'kmeans_model.joblib')
GCS_PROFILES_PATH = os.path.join(GCS_MODEL_DIR, 'cluster_profiles.json')

N_CLUSTERS = 8 # Number of job clusters to create

def load_vectorized_data(gcs_path: str, local_path: str) -> pd.DataFrame:
    """Tries to load data from GCS, falls back to local file."""
    try:
        print(f"Attempting to load data from GCS path: {gcs_path}")
        with gcsfs.GCSFileSystem().open(gcs_path, 'r') as f:
            data = json.load(f)
        print("Successfully loaded data from GCS.")
        return pd.DataFrame(data)
    except Exception as e:
        print(f"GCS load failed: {e}. Falling back to local file: {local_path}")
        try:
            df = pd.read_json(local_path)
            print("Successfully loaded data from local file.")
            return df
        except Exception as local_e:
            print(f"Fatal Error: Could not load data from local path either. {local_e}")
            return pd.DataFrame()

def save_json(data, local_path, gcs_path):
    """Saves a JSON file locally and attempts to save to GCS."""
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    with open(local_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print(f"Successfully saved JSON locally to '{local_path}'.")
    try:
        fs = gcsfs.GCSFileSystem()
        with fs.open(gcs_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"Successfully saved JSON to GCS at '{gcs_path}'.")
    except Exception as e:
        print(f"Could not save JSON to GCS: {e}. A local copy is available.")

def save_model(model, local_path, gcs_path):
    """Saves a joblib model file locally and attempts to save to GCS."""
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    joblib.dump(model, local_path)
    print(f"Successfully saved model locally to '{local_path}'.")
    try:
        fs = gcsfs.GCSFileSystem()
        with fs.open(gcs_path, 'wb') as f:
            joblib.dump(model, f)
        print(f"Successfully saved model to GCS at '{gcs_path}'.")
    except Exception as e:
        print(f"Could not save model to GCS: {e}. A local copy is available.")

# --- Main Execution ---
jobs_df = load_vectorized_data(GCS_INPUT_PATH, LOCAL_INPUT_PATH)

if jobs_df.empty or 'reduced_content_vector' not in jobs_df.columns or 'job_riasec_vector' not in jobs_df.columns:
    print("Aborting clustering. Input data is missing, empty, or lacks the required 'reduced_content_vector' column.")
else:
    # 1. Simplified Feature Engineering
    print("Starting feature engineering...")
    riasec_order = ['R', 'I', 'A', 'S', 'E', 'C']
    riasec_vectors = jobs_df['job_riasec_vector'].apply(lambda d: [d.get(k, 0) for k in riasec_order])
    combined_vectors = [
        reduced_vec + riasec_vec 
        for reduced_vec, riasec_vec in zip(jobs_df['reduced_content_vector'], riasec_vectors)
    ]
    feature_matrix = np.vstack(combined_vectors)
    print(f"Feature matrix created with shape: {feature_matrix.shape}")

    # 2. Simplified Model Training: Run KMeans directly
    if len(jobs_df) < N_CLUSTERS:
        print(f"Cannot run KMeans. Need at least {N_CLUSTERS} samples, but only have {len(jobs_df)}.")
    else:
        print(f"Training KMeans model directly with {N_CLUSTERS} clusters...")
        kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=42, n_init='auto')
        kmeans.fit(feature_matrix)
        jobs_df['cluster_label'] = kmeans.labels_
        print("Model training complete.")

        # 3. Save Model Artifacts
        print("\n--- Saving model artifacts ---")
        save_model(kmeans, LOCAL_KMEANS_PATH, GCS_KMEANS_PATH)
        
        # 4. Create and Save Cluster Profiles
        cluster_profiles = []
        for i, center in enumerate(kmeans.cluster_centers_):
            avg_riasec_vector = center[-6:]
            profile = {
                'cluster_label': i,
                'riasec_profile': {code: round(float(score), 4) for code, score in zip(riasec_order, avg_riasec_vector)}
            }
            cluster_profiles.append(profile)
        save_json(cluster_profiles, LOCAL_PROFILES_PATH, GCS_PROFILES_PATH)

        # 5. Cluster Analysis (for logging)
        print("\n--- Interpreting Cluster Personas & Content ---")
        for i in range(N_CLUSTERS):
            cluster_jobs_df = jobs_df[jobs_df['cluster_label'] == i]
            if not cluster_jobs_df.empty:
                profile = next(p for p in cluster_profiles if p['cluster_label'] == i)
                persona = max(profile['riasec_profile'], key=profile['riasec_profile'].get)
                print(f"\n## Cluster {i} (Dominant Persona: {persona})")
                print(f"   Avg. RIASEC Profile: {profile['riasec_profile']}")
                sample_titles = cluster_jobs_df['title'].head(3).tolist()
                print(f"   Sample Jobs: {', '.join(sample_titles)}")