from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import string
from app.models.user import User
from app.schemas.recovery import RecoveryStartRequest, RecoveryVerifyRequest


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email."""
    stmt = select(User).where(User.email == email)
    return db.scalar(stmt)


def generate_otp_code() -> str:
    """Generate a 6-digit OTP code."""
    return ''.join(secrets.choice(string.digits) for _ in range(6))


def generate_recovery_token() -> str:
    """Generate a secure recovery token."""
    return secrets.token_urlsafe(32)


def start_recovery(db: Session, email: str) -> dict:
    """Start recovery process for user."""
    user = get_user_by_email(db, email)
    if not user:
        raise ValueError("User not found")
    
    # Get available login methods
    methods = user.get_login_methods()
    
    if not methods:
        raise ValueError("No login methods available")
    
    # Generate OTP code for email recovery
    otp_code = generate_otp_code()
    user.otp_code = otp_code
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # Generate recovery token
    recovery_token = generate_recovery_token()
    user.recovery_token = recovery_token
    user.recovery_expires_at = datetime.utcnow() + timedelta(hours=1)
    
    db.commit()
    
    # TODO: Send OTP via email
    print(f"OTP for {email}: {otp_code}")  # For development
    
    response = {
        "message": "Recovery process started",
        "available_methods": methods,
        "recovery_token": recovery_token
    }
    
    # Add warning if only one method
    if len(methods) == 1:
        response["warning"] = "We recommend adding more login methods in security settings"
    
    return response


def verify_recovery(db: Session, email: str, method: str, code: Optional[str] = None, oauth_token: Optional[str] = None) -> User:
    """Verify recovery and return user."""
    user = get_user_by_email(db, email)
    if not user:
        raise ValueError("User not found")
    
    if method == "email":
        if not code:
            raise ValueError("OTP code required for email recovery")
        
        if not user.otp_code or user.otp_code != code:
            raise ValueError("Invalid OTP code")
        
        if not user.otp_expires_at or user.otp_expires_at < datetime.utcnow():
            raise ValueError("OTP code expired")
        
        # Clear OTP after successful verification
        user.otp_code = None
        user.otp_expires_at = None
    
    elif method in ["google", "github", "discord"]:
        if not oauth_token:
            raise ValueError("OAuth token required")
        
        # Verify OAuth token (simplified - in real app would verify with provider)
        # For now, just check if user has this method connected
        if method == "google" and not user.google_id:
            raise ValueError("Google login not connected")
        elif method == "github" and not user.github_id:
            raise ValueError("GitHub login not connected")
        elif method == "discord" and not user.discord_id:
            raise ValueError("Discord login not connected")
    
    else:
        raise ValueError("Invalid recovery method")
    
    # Clear recovery token
    user.recovery_token = None
    user.recovery_expires_at = None
    
    db.commit()
    return user


def get_security_info(db: Session, user_id: int) -> dict:
    """Get security information for user."""
    user = db.get(User, user_id)
    if not user:
        raise ValueError("User not found")
    
    security = user.get_security_level()
    
    # Add recommendation
    if security["connected"] < 3:
        security["recommendation"] = "We recommend connecting at least 3 login methods for account recovery"
    else:
        security["recommendation"] = "Your account security is strong"
    
    return security
