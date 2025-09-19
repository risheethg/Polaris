# In run_job.py

from google.cloud import aiplatform

# --- Configuration ---
# Updated with your specific Project ID
PROJECT_ID = "ivory-vim-472211-s1" 
REGION = "us-central1" # IMPORTANT: Ensure this is the region of your bucket
BUCKET_NAME = "career_planner_bucket"

# --- Initialize the Vertex AI SDK ---
# The staging_bucket is where Vertex AI will store temporary job artifacts
aiplatform.init(
    project=PROJECT_ID, 
    location=REGION, 
    staging_bucket=f"gs://{BUCKET_NAME}"
)

# --- Define the Custom Training Job ---
# This job will take your local script, package it, and run it on Vertex AI
job = aiplatform.CustomTrainingJob(
    display_name="career-planner-kmeans-training",
    script_path="scripts/train.py", # Path to your local training script
    container_uri="us-docker.pkg.dev/vertex-ai/training/scikit-learn-cpu.0-23:latest",
    requirements=["gcsfs", "pandas"], # Extra packages to install in the container
    model_serving_container_image_uri="us-docker.pkg.dev/vertex-ai/prediction/scikit-learn-cpu.0-23:latest"
)

# --- Run the Job and Get the Model ---
# We pass the bucket name as an argument to our train.py script
model = job.run(
    args=[f"--bucket_name={BUCKET_NAME}"],
    sync=True # This makes the script wait until the job is finished
)

print(f"Training job finished. Model resource name: {model.resource_name}")