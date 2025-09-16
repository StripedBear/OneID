import os
import hashlib
import secrets
from pathlib import Path
from typing import Tuple, Optional
from PIL import Image, UnidentifiedImageError
import magic
from app.core.supabase_storage import supabase_storage

# Configuration
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
ALLOWED_MIME_TYPES = {'image/jpeg', 'image/png', 'image/webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_IMAGE_DIMENSIONS = (2048, 2048)  # Max width/height
AVATAR_SIZE = (400, 400)  # Avatar dimensions
UPLOAD_DIR = Path("uploads")
AVATAR_DIR = UPLOAD_DIR / "avatars"

# Ensure upload directories exist
UPLOAD_DIR.mkdir(exist_ok=True)
AVATAR_DIR.mkdir(exist_ok=True)

def is_safe_image_file(file_path: str, content_type: str) -> bool:
    """
    Comprehensive security check for uploaded image files.
    
    Args:
        file_path: Path to the uploaded file
        content_type: MIME type from request
    
    Returns:
        bool: True if file is safe, False otherwise
    """
    try:
        # Check file extension
        file_ext = Path(file_path).suffix.lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            return False
        
        # Check MIME type
        if content_type not in ALLOWED_MIME_TYPES:
            return False
        
        # Check file size
        if os.path.getsize(file_path) > MAX_FILE_SIZE:
            return False
        
        # Use python-magic to check actual file content (not just extension)
        mime_type = magic.from_file(file_path, mime=True)
        if mime_type not in ALLOWED_MIME_TYPES:
            return False
        
        # Try to open with PIL to validate it's actually an image
        with Image.open(file_path) as img:
            # Check dimensions
            if img.width > MAX_IMAGE_DIMENSIONS[0] or img.height > MAX_IMAGE_DIMENSIONS[1]:
                return False
            
            # Check if image can be processed
            img.verify()
        
        return True
        
    except (UnidentifiedImageError, OSError, ValueError):
        return False

async def process_avatar_image(file_path: str, user_id: int) -> Tuple[str, str]:
    """
    Process and save avatar image with security measures.
    Uploads to Supabase Storage if available, otherwise saves locally.
    
    Args:
        file_path: Path to the uploaded file
        user_id: User ID for unique filename
    
    Returns:
        Tuple[str, str]: (filename, avatar_url)
    """
    try:
        # Generate secure filename
        random_token = secrets.token_urlsafe(16)
        file_ext = Path(file_path).suffix.lower()
        filename = f"avatar_{user_id}_{random_token}{file_ext}"
        
        # Create temporary file for processing
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            # Open and process image
            with Image.open(file_path) as img:
                # Convert to RGB if necessary (for JPEG compatibility)
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Resize image maintaining aspect ratio
                img.thumbnail(AVATAR_SIZE, Image.Resampling.LANCZOS)
                
                # Save processed image to temp file
                if file_ext == '.png':
                    img.save(temp_file.name, 'PNG', optimize=True)
                elif file_ext == '.webp':
                    img.save(temp_file.name, 'WEBP', quality=85, optimize=True)
                else:  # JPEG
                    img.save(temp_file.name, 'JPEG', quality=85, optimize=True)
            
            # Try to upload to Supabase Storage first
            if supabase_storage.is_available():
                avatar_url = await supabase_storage.upload_avatar(temp_file.name, user_id, filename)
                if avatar_url:
                    # Clean up temp file
                    os.unlink(temp_file.name)
                    return filename, avatar_url
            
            # Fallback to local storage
            output_path = AVATAR_DIR / filename
            os.rename(temp_file.name, output_path)
            avatar_url = get_avatar_url(filename)
            
            return filename, avatar_url
        
    except Exception as e:
        raise ValueError(f"Failed to process image: {str(e)}")

def cleanup_temp_file(file_path: str) -> None:
    """Clean up temporary uploaded file."""
    try:
        if os.path.exists(file_path):
            os.unlink(file_path)
    except OSError:
        pass  # Ignore cleanup errors

def get_avatar_url(filename: str) -> str:
    """Generate avatar URL from filename."""
    # Get base URL from environment or use default
    base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
    return f"{base_url}/uploads/avatars/{filename}"

def validate_image_dimensions(file_path: str) -> bool:
    """Validate image dimensions are reasonable."""
    try:
        with Image.open(file_path) as img:
            return (img.width <= MAX_IMAGE_DIMENSIONS[0] and 
                   img.height <= MAX_IMAGE_DIMENSIONS[1] and
                   img.width > 0 and img.height > 0)
    except Exception:
        return False

