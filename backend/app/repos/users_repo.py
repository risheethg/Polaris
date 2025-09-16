from typing import Optional
from app.models.user import UserCreate, User
from app.core.db import get_firestore_client

class UserRepository:
    
    async def get(self, uid: str) -> Optional[User]:
        """
        Get a user profile from Firestore using their Firebase Auth UID.
        The UID is the document ID.
        """
        db = get_firestore_client()
        user_doc_ref = db.collection("users").document(uid)
        user_doc = user_doc_ref.get()

        if user_doc.exists:
            # Pass the UID into the model since it's the document's ID
            user_data = user_doc.to_dict()
            user_data["uid"] = uid
            return User(**user_data)
        return None
    
    async def create(self, *, obj_in: UserCreate) -> User:
        """
        Create a new user document in Firestore.
        The document ID will be the user's Firebase Auth UID.
        """
        db = get_firestore_client()
        user_data = obj_in.model_dump()
        user_data['is_active'] = True
        
        # We explicitly use the UID as the document ID
        uid = user_data.pop("uid")
        
        # set() creates or overwrites a document
        db.collection("users").document(uid).set(user_data)
        
        # Re-fetch the created user to return a consistent object
        created_user = await self.get(uid)
        return created_user

    async def update(self, uid: str, data_to_update: dict) -> Optional[User]:
        """
        Update a user's document in Firestore.
        """
        db = get_firestore_client()
        user_doc_ref = db.collection("users").document(uid)
        
        # update() merges data into an existing document
        await user_doc_ref.update(data_to_update)
        
        updated_user = await self.get(uid)
        return updated_user

users_repo = UserRepository()