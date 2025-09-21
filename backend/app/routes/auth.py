from fastapi import APIRouter, Depends, status, HTTPException, Request
from pydantic import BaseModel
from typing import Optional

# Import the correct dependencies from your updated security.py
from app.core.security import get_current_user_token, get_current_active_user

# Import the models and the repository
from app.models.user import User, UserCreate
from app.models.user_details import UserDetailsUpdate
from app.repos.users_repo import users_repo

router = APIRouter(tags=["Users"])

class UserRegistrationData(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None  # Allow email to be sent from frontend
    picture: Optional[str] = None

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=User)
async def register_user(
    request: Request,  # Get raw request to debug
    decoded_token: dict = Depends(get_current_user_token)
):
    """
    Handles first-time user registration.
    It takes a valid Firebase ID token AND optional user data from the request body,
    and creates a new user profile document in Firestore.
    """
    import logging
    import json
    logger = logging.getLogger(__name__)
    
    # Get request body manually
    try:
        body = await request.body()
        registration_data = json.loads(body) if body else {}
        logger.info(f"Raw request body: {body}")
        logger.info(f"Parsed registration data: {registration_data}")
    except Exception as e:
        logger.error(f"Failed to parse request body: {e}")
        registration_data = {}
    
    user_uid = decoded_token.get("uid")
    
    # Debug logging
    logger.info(f"Registration attempt - UID: {user_uid}")
    logger.info(f"Token data: {decoded_token}")
    
    # Check if the user already exists in Firestore
    if await users_repo.get(user_uid):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This user has already been registered."
        )

    # Create user data combining token info and request body data
    try:
        user_data = UserCreate(
            uid=user_uid,
            email=registration_data.get("email") or decoded_token.get("email"),  # Prefer frontend data, fall back to token
            name=registration_data.get("name"),  # From request body
            picture=registration_data.get("picture"),  # From request body
            email_verified=decoded_token.get("email_verified", False)
        )
        logger.info(f"UserCreate data: {user_data.model_dump()}")
    except Exception as e:
        logger.error(f"UserCreate validation error: {e}")
        logger.error(f"Registration data: {registration_data}")
        logger.error(f"Token data: {decoded_token}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {str(e)}"
        )
    
    try:
        logger.info("Attempting to create user in Firestore...")
        created_user = await users_repo.create(obj_in=user_data)
        logger.info(f"User created successfully: {created_user.uid}")
        return created_user
    except Exception as e:
        logger.error(f"Firestore creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.post("/token", response_model=User)
async def login_user(
    # This dependency handles everything: token validation AND fetching the user from Firestore.
    current_user: User = Depends(get_current_active_user)
):
    """
    Handles user "login" for our backend. If the token is valid and the
    user exists in our Firestore DB, this returns their profile.
    """
    return current_user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout_user():
    """
    Client-side responsibility. This endpoint is a placeholder.
    """
    return {"message": "Logout successful. Please discard your token on the client-side."}


@router.get("/me", response_model=User)
async def read_current_user(
    # Just like /login, this requires a fully authenticated and registered user.
    current_user: User = Depends(get_current_active_user)
):
    """
    Fetches the profile for the currently authenticated user from Firestore.
    The dependency `get_current_active_user` does all the work.
    """
    return current_user


@router.patch("/me", response_model=User)
async def update_user_details(
    details: UserDetailsUpdate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Update personal details for the currently authenticated user.
    """
    updated_user = await users_repo.update(
        uid=current_user.uid,
        data_to_update=details.model_dump(exclude_unset=True, by_alias=False)
    )
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )
    return updated_user