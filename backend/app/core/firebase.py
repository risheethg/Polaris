import firebase_admin
from firebase_admin import credentials
import os

def initialize_firebase():
    """
    Initializes the Firebase Admin SDK using the credential file
    mounted by Cloud Run from Secret Manager.
    """
    # Idempotent: if already initialized, skip
    if firebase_admin._apps:
        print("Firebase already initialized; skipping re-init.")
        return

    print("Attempting to initialize Firebase App...")

    # This is the path inside the container where Cloud Run mounts the secret file.
    # It must match the path you specify in the 'gcloud run deploy' command.
 # Prefer env var, fall back to default secret mount path
    creds_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "/var/secrets/firebase-key.json")

    try:
        if os.path.exists(creds_path):
            cred = credentials.Certificate(creds_path)
            firebase_admin.initialize_app(cred)
            print("✅ Firebase initialized from secret volume.")
        else:
            print("Credential file not found at secret path. Falling back to default credentials...")
            firebase_admin.initialize_app()
            print("✅ Firebase initialized using default credentials.")
    except Exception as e:
        print(f"❌ Critical Error: Could not initialize Firebase. {e}")
# --- In your main application startup logic ---
# You would call this function when your FastAPI app starts.
# For example, in main.py:
#
# from fastapi import FastAPI
# from your_firebase_module import initialize_firebase
#
# app = FastAPI()
#
# @app.on_event("startup")
# def on_startup():
#     initialize_firebase()