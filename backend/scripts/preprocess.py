import json
import joblib
import numpy as np
import gcsfs
import re
from sentence_transformers import SentenceTransformer
from sklearn.decomposition import PCA
from scripts import config

# --- HELPER: RIASEC Calculation (From your original script) ---
RIASEC_KEYWORDS = {
    'R': ['hands-on', 'mechanical', 'engineer', 'site', 'physical', 'tools', 'machinery', 'outdoors', 'construction', 'operate', 'technician', 'plant', 'manufacturing', 'logistics', 'equipment'],
    'I': ['analysis', 'research', 'data', 'investigate', 'science', 'problem-solving', 'thinker', 'analytical', 'models', 'algorithms', 'diagnose', 'experimental', 'software', 'test', 'theory'],
    'A': ['creative', 'design', 'art', 'writing', 'content', 'unstructured', 'ui/ux', 'visual', 'express', 'media', 'music', 'journalism', 'marketing', 'storytelling', 'graphic'],
    'S': ['social', 'help', 'teach', 'collaboration', 'teamwork', 'patient', 'customer', 'empathy', 'community', 'communication', 'counseling', 'nurse', 'human resources', 'support'],
    'E': ['enterprising', 'lead', 'sell', 'persuade', 'business', 'manage', 'negotiate', 'client', 'targets', 'growth', 'supervise', 'finance', 'investment', 'consulting', 'entrepreneur'],
    'C': ['conventional', 'organize', 'process', 'structure', 'detail', 'rules', 'compliance', 'financial', 'record-keeping', 'clerical', 'audit', 'database', 'routine', 'accurate', 'analyst']
}

def calculate_riasec_scores(text_blob):
    """Calculates and normalizes RIASEC scores based on keyword frequency."""
    if not text_blob: return {code: 0 for code in RIASEC_KEYWORDS}
    
    scores = {code: 0 for code in RIASEC_KEYWORDS}
    text_blob_lower = text_blob.lower()
    
    for code, keywords in RIASEC_KEYWORDS.items():
        for keyword in keywords:
            # Simple keyword counting
            scores[code] += len(re.findall(r'\b' + re.escape(keyword) + r'\b', text_blob_lower))
            
    total_score = sum(scores.values())
    if total_score == 0:
        return {code: 0 for code in RIASEC_KEYWORDS}
    
    return {code: round(score / total_score, 4) for code, score in scores.items()}

# --- MAIN PREPROCESSING FUNCTION ---
def run_preprocess(new_jobs_data):
    """
    1. Loads old raw data from GCS.
    2. Merges with new data.
    3. Vectorizes text (SentenceTransformer).
    4. Calculates RIASEC scores.
    5. Applies PCA (Here is where PCA happens!).
    6. Returns the full list of jobs with 'reduced_vector' added.
    """
    print("🧠 [Preprocess] Starting Feature Extraction...")
    
    # 1. Load Old Raw Data (to keep the model robust)
    fs = gcsfs.GCSFileSystem()
    try:
        with fs.open(config.GCS_RAW_DATA, 'r') as f:
            all_jobs = json.load(f)
        print(f"   📂 Loaded {len(all_jobs)} existing jobs from history.")
    except:
        all_jobs = []
        print("   📂 No existing history found. Starting fresh.")

    # Merge with new data (if any)
    if new_jobs_data:
        all_jobs.extend(new_jobs_data)

    if not all_jobs:
        print("   ⚠️ No data to process.")
        return [], None

    # 2. Vectorization Loop
    print(f"   Generating embeddings for {len(all_jobs)} jobs using {config.TRANSFORMER_MODEL}...")
    model = SentenceTransformer(config.TRANSFORMER_MODEL)
    
    full_vectors = []
    
    for i, job in enumerate(all_jobs):
        # combine fields exactly as you did in your script
        text_fields = [
            job.get('title', ''),
            job.get('description', ''),
            ' '.join(job.get('required_skills', {}).get('technical', [])),
            ' '.join(job.get('required_skills', {}).get('soft', [])),
            ' '.join(job.get('side_hobbies', [])),
            job.get('work_pressure', '')
        ]
        combined_text = ' '.join(filter(None, text_fields))
        
        # A. Create Vector
        vector = model.encode(combined_text)
        full_vectors.append(vector)
        
        # B. Calculate RIASEC (and store it in the job dict)
        job['job_riasec_vector'] = calculate_riasec_scores(combined_text)
        
        # Note: We don't save the full 384-dim vector to JSON to save space, 
        # unless you really need it. We only save the PCA reduced version below.

    feature_matrix = np.array(full_vectors)
    print(f"   ✅ Vectors Generated. Matrix Shape: {feature_matrix.shape}")

    # 3. PCA (Principal Component Analysis)
    # THIS IS THE PART YOU WERE LOOKING FOR
    print(f"   📉 Training PCA (Variance: {config.PCA_VARIANCE})...")
    
    pca = PCA(n_components=config.PCA_VARIANCE)
    reduced_vectors = pca.fit_transform(feature_matrix)
    
    print(f"   ✅ PCA Reduced dimensions from {feature_matrix.shape[1]} to {reduced_vectors.shape[1]}")
    
    # 4. Save the PCA Model (for later use if needed)
    with fs.open(config.GCS_PCA_MODEL, 'wb') as f:
        joblib.dump(pca, f)
    print("   💾 PCA Model saved to GCS.")

    # 5. Inject Reduced Vectors back into the Job Objects
    for i, job in enumerate(all_jobs):
        job['reduced_vector'] = reduced_vectors[i].tolist()
        
    # Save the consolidated RAW data (with vectors) back to GCS
    # This becomes the "history" for the next run
    with fs.open(config.GCS_RAW_DATA, 'w') as f:
        json.dump(all_jobs, f, indent=2)

    return all_jobs, reduced_vectors