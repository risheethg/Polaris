import json
import os
import re
import joblib
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.decomposition import PCA
import gcsfs

# --- Configuration with GCS and Local Fallback ---
# Set GCS_BUCKET as an environment variable, or it will default and use local paths.
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET", "your-gcs-bucket-name-here")

# Define Local Paths
LOCAL_INPUT_FILE = 'scrapped_job.json'
LOCAL_OUTPUT_FILE = 'jobs_with_vectors_and_pca.json'
LOCAL_PCA_MODEL_PATH = 'pca_model.joblib'

# Define GCS Paths
GCS_INPUT_FILE = f"gs://{GCS_BUCKET_NAME}/{LOCAL_INPUT_FILE}"
GCS_OUTPUT_FILE = f"gs://{GCS_BUCKET_NAME}/{LOCAL_OUTPUT_FILE}"
GCS_PCA_MODEL_PATH = f"gs://{GCS_BUCKET_NAME}/{LOCAL_PCA_MODEL_PATH}"

# Model Configuration
MODEL_NAME = 'all-MiniLM-L6-v2'
PCA_VARIANCE_TO_KEEP = 0.95

# --- RIASEC Keyword Dictionary (remains the same) ---
RIASEC_KEYWORDS = {
    'R': ['hands-on', 'mechanical', 'engineer', 'site', 'physical', 'tools', 'machinery', 'outdoors', 'construction', 'operate', 'technician', 'plant', 'manufacturing', 'logistics', 'equipment'],
    'I': ['analysis', 'research', 'data', 'investigate', 'science', 'problem-solving', 'thinker', 'analytical', 'models', 'algorithms', 'diagnose', 'experimental', 'software', 'test', 'theory'],
    'A': ['creative', 'design', 'art', 'writing', 'content', 'unstructured', 'ui/ux', 'visual', 'express', 'media', 'music', 'journalism', 'marketing', 'storytelling', 'graphic'],
    'S': ['social', 'help', 'teach', 'collaboration', 'teamwork', 'patient', 'customer', 'empathy', 'community', 'communication', 'counseling', 'nurse', 'human resources', 'support'],
    'E': ['enterprising', 'lead', 'sell', 'persuade', 'business', 'manage', 'negotiate', 'client', 'targets', 'growth', 'supervise', 'finance', 'investment', 'consulting', 'entrepreneur'],
    'C': ['conventional', 'organize', 'process', 'structure', 'detail', 'rules', 'compliance', 'financial', 'record-keeping', 'clerical', 'audit', 'database', 'routine', 'accurate', 'analyst']
}

def load_data():
    """Tries to load data from GCS, falls back to local file."""
    try:
        print(f"Attempting to load data from GCS path: {GCS_INPUT_FILE}")
        fs = gcsfs.GCSFileSystem()
        with fs.open(GCS_INPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print("Successfully loaded data from GCS.")
        return data
    except Exception as e:
        print(f"GCS load failed: {e}. Falling back to local file: {LOCAL_INPUT_FILE}")
        try:
            with open(LOCAL_INPUT_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print("Successfully loaded data from local file.")
            return data
        except FileNotFoundError:
            print(f"Error: Local file '{LOCAL_INPUT_FILE}' not found. Aborting.")
            return None

def save_json(data, local_path, gcs_path):
    """Saves a JSON file locally and attempts to save to GCS."""
    # Always save locally
    with open(local_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print(f"Successfully saved data locally to '{local_path}'.")
    
    # Attempt to save to GCS
    try:
        fs = gcsfs.GCSFileSystem()
        with fs.open(gcs_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"Successfully saved data to GCS at '{gcs_path}'.")
    except Exception as e:
        print(f"Could not save data to GCS: {e}. A local copy is available.")

def save_model(model, local_path, gcs_path):
    """Saves a joblib model file locally and attempts to save to GCS."""
    # Always save locally
    joblib.dump(model, local_path)
    print(f"Successfully saved model locally to '{local_path}'.")
    
    # Attempt to save to GCS
    try:
        fs = gcsfs.GCSFileSystem()
        with fs.open(gcs_path, 'wb') as f:
            joblib.dump(model, f)
        print(f"Successfully saved model to GCS at '{gcs_path}'.")
    except Exception as e:
        print(f"Could not save model to GCS: {e}. A local copy is available.")

def calculate_riasec_scores(text_blob):
    """Calculates and normalizes RIASEC scores based on keyword frequency."""
    scores = {code: 0 for code in RIASEC_KEYWORDS}
    text_blob_lower = text_blob.lower()
    for code, keywords in RIASEC_KEYWORDS.items():
        for keyword in keywords:
            scores[code] += len(re.findall(r'\b' + re.escape(keyword) + r'\b', text_blob_lower))
    total_score = sum(scores.values())
    if total_score == 0:
        return {code: 0 for code in RIASEC_KEYWORDS}
    return {code: round(score / total_score, 4) for code, score in scores.items()}

def main():
    """Main function to load jobs, generate vectors, apply PCA, and save the updated data."""
    jobs_data = load_data()
    if not jobs_data:
        return
        
    print(f"\nLoading sentence transformer model: '{MODEL_NAME}'...")
    model = SentenceTransformer(MODEL_NAME)
    print("Model loaded.")

    print("\n--- Pass 1: Generating full-dimensional vectors ---")
    full_content_vectors = []
    for i, job in enumerate(jobs_data):
        text_fields = [
            job.get('title', ''),
            job.get('description', ''),
            ' '.join(job.get('required_skills', {}).get('technical', [])),
            ' '.join(job.get('required_skills', {}).get('soft', [])),
            ' '.join(job.get('side_hobbies', [])),
            job.get('work_pressure', '')
        ]
        combined_text = ' '.join(filter(None, text_fields))
        
        content_vector = model.encode(combined_text)
        full_content_vectors.append(content_vector)
        jobs_data[i]['job_riasec_vector'] = calculate_riasec_scores(combined_text)
        jobs_data[i]['job_content_vector'] = content_vector.tolist()

    feature_matrix = np.array(full_content_vectors)
    original_dims = feature_matrix.shape[1]
    print(f"Generated {len(full_content_vectors)} full vectors with {original_dims} dimensions.")

    print("\n--- PCA Step: Training PCA model ---")
    pca = PCA(n_components=PCA_VARIANCE_TO_KEEP)
    pca.fit(feature_matrix)
    reduced_dims = pca.n_components_
    print(f"PCA trained. It will reduce dimensions from {original_dims} to {reduced_dims}.")
    
    save_model(pca, LOCAL_PCA_MODEL_PATH, GCS_PCA_MODEL_PATH)

    print("\n--- Pass 2: Transforming vectors and finalizing data ---")
    for i, job in enumerate(jobs_data):
        full_vector = np.array(job['job_content_vector']).reshape(1, -1)
        reduced_vector = pca.transform(full_vector)
        job['reduced_content_vector'] = reduced_vector.flatten().tolist()

    print("\n--- Final Step: Saving comprehensive JSON file ---")
    save_json(jobs_data, LOCAL_OUTPUT_FILE, GCS_OUTPUT_FILE)
    
    print("\nProcessing complete.")

if __name__ == "__main__":
    main()