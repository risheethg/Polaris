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

# --- Configuration ---
# The input file is now the one with the pre-computed reduced vectors
GCS_INPUT_PATH = os.getenv("GCS_DATA_PATH", "gs://your-bucket-name/jobs_with_vectors_and_pca.json")
# The output directory for the trained model and its artifacts
AIP_MODEL_DIR = os.getenv("AIP_MODEL_DIR", "gs://your-bucket-name/job-cluster-model-v2")

N_CLUSTERS = 8 # Number of job clusters to create

def load_vectorized_data(bucket_path: str) -> pd.DataFrame:
    """Loads job data with pre-computed vectors from a JSON file in GCS."""
    print(f"Attempting to load data from: {bucket_path}")
    try:
        with gcsfs.GCSFileSystem().open(bucket_path, 'r') as f:
            data = json.load(f)
        print(f"Successfully loaded {len(data)} job records.")
        return pd.DataFrame(data)
    except Exception as e:
        print(f"Fatal Error: Could not load or parse data from GCS. {e}")
        return pd.DataFrame()

# --- Main Execution ---
jobs_df = load_vectorized_data(GCS_INPUT_PATH)

# Check for the new 'reduced_content_vector' column
if jobs_df.empty or 'reduced_content_vector' not in jobs_df.columns or 'job_riasec_vector' not in jobs_df.columns:
    print("Aborting clustering. Input data is missing, empty, or lacks the required 'reduced_content_vector' column.")
else:
    # 1. Simplified Feature Engineering
    print("Starting feature engineering...")
    
    riasec_order = ['R', 'I', 'A', 'S', 'E', 'C']
    riasec_vectors = jobs_df['job_riasec_vector'].apply(lambda d: [d.get(k, 0) for k in riasec_order])
    
    # Combine the REDUCED content vector with the RIASEC vector
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
        # No Pipeline is needed as PCA is already done. We train KMeans directly.
        print(f"Training KMeans model directly with {N_CLUSTERS} clusters...")
        kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=42, n_init='auto')
        kmeans.fit(feature_matrix)
        
        jobs_df['cluster_label'] = kmeans.labels_
        print("Model training complete.")

        # 3. Save Model Artifacts to GCS
        print(f"Saving model artifacts to: {AIP_MODEL_DIR}")
        fs = gcsfs.GCSFileSystem()
        if not fs.exists(AIP_MODEL_DIR):
            fs.mkdirs(AIP_MODEL_DIR)

        # Save the trained KMeans model
        model_path = os.path.join(AIP_MODEL_DIR, 'model.joblib')
        with fs.open(model_path, 'wb') as f:
            joblib.dump(kmeans, f)
        print(f"KMeans model saved to {model_path}")
        
        # 4. Create and Save Cluster Profiles
        cluster_profiles = []
        cluster_centers = kmeans.cluster_centers_
        
        for i, center in enumerate(cluster_centers):
            # The last 6 elements of each center correspond to the RIASEC scores
            avg_riasec_vector = center[-6:]
            profile = {
                'cluster_label': i,
                'riasec_profile': {code: round(float(score), 4) for code, score in zip(riasec_order, avg_riasec_vector)}
            }
            cluster_profiles.append(profile)

        profiles_path = os.path.join(AIP_MODEL_DIR, 'cluster_profiles.json')
        with fs.open(profiles_path, 'w') as f:
            json.dump(cluster_profiles, f, indent=2)
        print(f"Cluster personality profiles saved to {profiles_path}")

        # 5. Cluster Analysis (for logging)
        print("\n--- Interpreting Cluster Personas & Content ---")
        for i in range(N_CLUSTERS):
            cluster_jobs_df = jobs_df[jobs_df['cluster_label'] == i]
            profile = next(p for p in cluster_profiles if p['cluster_label'] == i)
            persona = max(profile['riasec_profile'], key=profile['riasec_profile'].get)
            
            print(f"\n## Cluster {i} (Dominant Persona: {persona})")
            print(f"   Avg. RIASEC Profile: {profile['riasec_profile']}")
            sample_titles = cluster_jobs_df['title'].head(3).tolist()
            print(f"   Sample Jobs: {', '.join(sample_titles)}")