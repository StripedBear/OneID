from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from app.crud import user as crud_user
from app.schemas.auth import UserLogin, UserRegister, TokenResponse
from app.core.security import create_access_token
from app.api.deps import get_current_user
from app.core.image_utils import is_safe_image_file, process_avatar_image, cleanup_temp_file, get_avatar_url
from app.db.deps import get_db
from app.models.user import User
import tempfile
import os

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

@router.post("/register", response_model=TokenResponse)
async def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    try:
        user = crud_user.create_user(db, user_data)
        access_token = create_access_token(subject=user.id)
        return TokenResponse(access_token=access_token, token_type="bearer")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=TokenResponse)
async def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = crud_user.authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(subject=user.id)
    return TokenResponse(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=dict)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "display_name": current_user.display_name,
        "avatar_url": current_user.avatar_url,
        "bio": current_user.bio,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload and update user avatar with comprehensive security checks.
    """
    try:
        # Validate file type
        if not file.content_type or file.content_type not in ['image/jpeg', 'image/png', 'image/webp']:
            raise HTTPException(
                status_code=400, 
                detail="Only JPEG, PNG and WebP images are allowed"
            )
        
        # Check file size (5MB limit)
        if file.size and file.size > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=400, 
                detail="File size must be less than 5MB"
            )
        
        # Create temporary file for processing
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            # Write uploaded content to temp file
            content = await file.read()
            temp_file.write(content)
            temp_file.flush()
            
            try:
                # Security validation
                if not is_safe_image_file(temp_file.name, file.content_type):
                    raise HTTPException(
                        status_code=400, 
                        detail="Invalid or unsafe image file"
                    )
                
                # Process and save image
                filename, file_path = process_avatar_image(temp_file.name, current_user.id)
                avatar_url = get_avatar_url(filename)
                
                # Update user's avatar_url in database
                crud_user.update_user_avatar(db, current_user.id, avatar_url)
                
                return {
                    "message": "Avatar uploaded successfully",
                    "avatar_url": avatar_url,
                    "filename": filename
                }
                
            finally:
                # Clean up temporary file
                cleanup_temp_file(temp_file.name)
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to upload avatar: {str(e)}"
        )
