import os
import tempfile
from typing import Optional, Tuple
from supabase import create_client, Client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class SupabaseStorage:
    """Supabase Storage client for file operations."""
    
    def __init__(self):
        self.client: Optional[Client] = None
        self.bucket_name = settings.SUPABASE_BUCKET
        
        # Initialize Supabase client if credentials are provided
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                logger.info("Supabase Storage client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                self.client = None
        else:
            logger.warning("Supabase credentials not provided, using local storage")
    
    def is_available(self) -> bool:
        """Check if Supabase Storage is available."""
        # Temporarily disable Supabase Storage due to connection issues
        return False
    
    async def upload_avatar(self, file_path: str, user_id: int, filename: str) -> Optional[str]:
        """
        Upload avatar to Supabase Storage.
        
        Args:
            file_path: Path to the local file
            user_id: User ID for unique path
            filename: Generated filename
            
        Returns:
            Optional[str]: Public URL if successful, None otherwise
        """
        if not self.is_available():
            logger.warning("Supabase Storage not available, falling back to local storage")
            return None
        
        try:
            # Create path in Supabase Storage
            storage_path = f"avatars/{user_id}/{filename}"
            
            # Read file content
            with open(file_path, 'rb') as f:
                file_content = f.read()
            
            # Upload to Supabase Storage
            response = self.client.storage.from_(self.bucket_name).upload(
                path=storage_path,
                file=file_content,
                file_options={
                    "content-type": "image/jpeg",
                    "cache-control": "3600"
                }
            )
            
            if response:
                # Get public URL
                public_url = self.client.storage.from_(self.bucket_name).get_public_url(storage_path)
                logger.info(f"Avatar uploaded to Supabase: {public_url}")
                return public_url
            else:
                logger.error("Failed to upload avatar to Supabase")
                return None
                
        except Exception as e:
            logger.error(f"Error uploading avatar to Supabase: {e}")
            return None
    
    async def delete_avatar(self, user_id: int, filename: str) -> bool:
        """
        Delete avatar from Supabase Storage.
        
        Args:
            user_id: User ID
            filename: Filename to delete
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.is_available():
            return False
        
        try:
            storage_path = f"avatars/{user_id}/{filename}"
            
            # Delete from Supabase Storage
            response = self.client.storage.from_(self.bucket_name).remove([storage_path])
            
            if response:
                logger.info(f"Avatar deleted from Supabase: {storage_path}")
                return True
            else:
                logger.error(f"Failed to delete avatar from Supabase: {storage_path}")
                return False
                
        except Exception as e:
            logger.error(f"Error deleting avatar from Supabase: {e}")
            return False
    
    def get_public_url(self, user_id: int, filename: str) -> Optional[str]:
        """
        Get public URL for avatar from Supabase Storage.
        
        Args:
            user_id: User ID
            filename: Filename
            
        Returns:
            Optional[str]: Public URL if available, None otherwise
        """
        if not self.is_available():
            return None
        
        try:
            storage_path = f"avatars/{user_id}/{filename}"
            public_url = self.client.storage.from_(self.bucket_name).get_public_url(storage_path)
            return public_url
        except Exception as e:
            logger.error(f"Error getting public URL from Supabase: {e}")
            return None

# Global instance
supabase_storage = SupabaseStorage()
