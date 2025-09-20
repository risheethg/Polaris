# In scripts/train.py

import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib
import argparse
import os

# --- 1. Argument Parsing ---
# This allows Vertex AI to pass arguments to your script, like where to save the model
parser = argparse.ArgumentParser()
parser.add_argument('--bucket_name', type=str, required=True)
args = parser.parse_args()

# --- 2. Load and Process Data ---
file_path = f"gs://{args.bucket_name}/scraped_job.json"
df = pd.read_json(file_path)
features = df[['skill_score', 'experience_years']]
scaler = StandardScaler()
scaled_features = scaler.fit_transform(features)

# --- 3. Train Model ---
kmeans = KMeans(n_clusters=5, random_state=42)
kmeans.fit(scaled_features)
print("Model training script finished.")

# --- 4. Save and Upload Model ---
# Vertex AI Training Jobs provide an environment variable pointing to a GCS location
# where the model artifact should be saved. This is the best practice.
model_dir = os.environ.get("AIP_MODEL_DIR")
joblib.dump(kmeans, "model.joblib")

# Create the model directory in GCS if it doesn't exist and upload
from google.cloud import storage
storage_client = storage.Client()
# The model directory path is like 'gs://your-bucket/some-folder/'
bucket_name, blob_prefix = model_dir[5:].split('/', 1)
bucket = storage_client.bucket(bucket_name)
blob = bucket.blob(os.path.join(blob_prefix, "model.joblib"))

blob.upload_from_filename("model.joblib")
print(f"Model artifact uploaded to {model_dir}")