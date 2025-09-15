import firebase_admin
from firebase_admin import credentials
from app.core.config import settings

def initialize_firebase():
    """
    Initializes the Firebase Admin SDK using credentials from the path
    specified in the environment variables.
    """
    try:
        # Check if the app is already initialized to prevent re-initialization error
        firebase_admin.get_app()
    except ValueError:
        print("Initializing Firebase App...")
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
        print("Firebase App initialized successfully.")