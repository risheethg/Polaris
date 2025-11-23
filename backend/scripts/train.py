import pandas as pd
import json
import os
import joblib
import numpy as np
import gcsfs
import warnings
from sklearn.cluster import KMeans
from scripts import config

# Ignore warnings
warnings.filterwarnings("ignore", category=UserWarning)

def save_to_gcs(data, gcs_path, is_json=True):
    """Helper to save JSON or Joblib to GCS"""
    fs = gcsfs.GCSFileSystem()
    try:
        mode = 'w' if is_json else 'wb'
        with fs.open(gcs_path, mode) as f:
            if is_json:
                json.dump(data, f, indent=2)
            else:
                joblib.dump(data, f)
        print(f"   💾 Saved to {gcs_path}")
    except Exception as e:
        print(f"   ⚠️ Save failed for {gcs_path}: {e}")

def run_training(jobs_data):
    """
    Receives a list of job dictionaries (with 'reduced_vector' and 'job_riasec_vector').
    Trains K-Means and saves the model + profiles.
    """
    print("🔄 [Train] Starting Model Training...")
    
    # 1. Convert to DataFrame for easier manipulation
    jobs_df = pd.DataFrame(jobs_data)

    # 2. Validation
    # Note: In preprocess.py, we saved the key as 'reduced_vector'
    if jobs_df.empty or 'reduced_vector' not in jobs_df.columns:
        print("   ❌ Aborting: Data empty or missing 'reduced_vector'.")
        return

    # 3. Feature Engineering (Stacking PCA + RIASEC)
    print("   🛠️  Feature Engineering (PCA + RIASEC)...")
    riasec_order = ['R', 'I', 'A', 'S', 'E', 'C']
    
    # Ensure riasec vector is clean
    try:
        riasec_vectors = jobs_df['job_riasec_vector'].apply(
            lambda d: [d.get(k, 0) for k in riasec_order] if isinstance(d, dict) else [0]*6
        )
        
        # Combine lists: [PCA features] + [R, I, A, S, E, C]
        combined_vectors = [
            list(reduced_vec) + list(riasec_vec)
            for reduced_vec, riasec_vec in zip(jobs_df['reduced_vector'], riasec_vectors)
        ]
        
        feature_matrix = np.array(combined_vectors)
        print(f"   📊 Feature Matrix Shape: {feature_matrix.shape}")
        
    except Exception as e:
        print(f"   ❌ Error during feature engineering: {e}")
        return

    # 4. Train K-Means
    if len(jobs_df) < config.N_CLUSTERS:
        print(f"   ⚠️ Not enough data ({len(jobs_df)}) for {config.N_CLUSTERS} clusters.")
        return

    print(f"   🤖 Training KMeans ({config.N_CLUSTERS} Clusters)...")
    kmeans = KMeans(n_clusters=config.N_CLUSTERS, random_state=42, n_init='auto')
    kmeans.fit(feature_matrix)
    
    # Assign labels back to DataFrame
    jobs_df['cluster_label'] = kmeans.labels_

    # 5. Create Cluster Profiles
    print("   📝 Generatng Cluster Profiles...")
    cluster_profiles = []
    
    # Cluster centers have shape (n_clusters, n_features)
    # The last 6 features are the RIASEC scores
    for i, center in enumerate(kmeans.cluster_centers_):
        avg_riasec_vector = center[-6:] # Grab last 6
        profile = {
            'cluster_label': i,
            'riasec_profile': {
                code: round(float(score), 4) 
                for code, score in zip(riasec_order, avg_riasec_vector)
            }
        }
        cluster_profiles.append(profile)

    # 6. Save Artifacts (Using Config Paths)
    print("   ☁️  Uploading Artifacts to GCS...")
    
    # A. Save The Model
    save_to_gcs(kmeans, config.GCS_KMEANS_MODEL, is_json=False)
    
    # B. Save The Profiles
    save_to_gcs(cluster_profiles, config.GCS_CLUSTERS_PROFILES, is_json=True)
    
    # C. Save The Final Dataset (With Cluster Labels)
    final_data_list = jobs_df.to_dict(orient='records')
    save_to_gcs(final_data_list, config.GCS_PROCESSED_DATA, is_json=True)

    # 7. Quick Analysis Log
    print("\n   --- Cluster Analysis ---")
    for i in range(config.N_CLUSTERS):
        cluster_subset = jobs_df[jobs_df['cluster_label'] == i]
        if not cluster_subset.empty:
            profile = next(p for p in cluster_profiles if p['cluster_label'] == i)
            persona = max(profile['riasec_profile'], key=profile['riasec_profile'].get)
            print(f"   🔹 Cluster {i} [{persona}]: {len(cluster_subset)} jobs")
            print(f"      Example: {cluster_subset.iloc[0]['title']}")

    print("✅ [Train] Training Complete.")