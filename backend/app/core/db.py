from firebase_admin import firestore

def get_firestore_client():
    """
    Returns an authenticated Firestore client instance.
    
    The firebase_admin.initialize_app() call in main.py handles the
    authentication, so we can just get the client here.
    
    Note: Firebase Admin SDK uses a synchronous client that works fine
    with FastAPI's async functions.
    """
    return firestore.client()