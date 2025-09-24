from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import get_password_hash, verify_password
from app.schemas.auth import UserRegister, OAuthUserInfo


def get(db: Session, user_id: int) -> Optional[User]:
    return db.get(User, user_id)


def get_by_email(db: Session, email: str) -> Optional[User]:
    stmt = select(User).where(User.email == email)
    return db.scalar(stmt)


def get_by_username(db: Session, username: str) -> Optional[User]:
    stmt = select(User).where(User.username == username)
    return db.scalar(stmt)


def get_by_oauth_id(db: Session, provider: str, provider_id: str) -> Optional[User]:
    """Get user by OAuth provider ID."""
    if provider == "google":
        stmt = select(User).where(User.google_id == provider_id)
    elif provider == "github":
        stmt = select(User).where(User.github_id == provider_id)
    elif provider == "discord":
        stmt = select(User).where(User.discord_id == provider_id)
    else:
        return None
    return db.scalar(stmt)


def create(db: Session, *, email: str, username: str, password: str,
           display_name: str | None = None,
           first_name: str | None = None,
           last_name: str | None = None,
           avatar_url: str | None = None,
           bio: str | None = None) -> User:
    user = User(
        email=email,
        username=username,
        password_hash=get_password_hash(password),
        display_name=display_name,
        first_name=first_name,
        last_name=last_name,
        avatar_url=avatar_url,
        bio=bio,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_user(db: Session, user_data: UserRegister) -> User:
    """Create a new user with hashed password."""
    # Check if email already exists
    if get_by_email(db, user_data.email):
        raise ValueError("Email already registered")
    
    # Check if username already exists
    if get_by_username(db, user_data.username):
        raise ValueError("Username already taken")
    
    # Create user with hashed password
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=hashed_password,
        display_name=user_data.display_name,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        avatar_url=user_data.avatar_url,
        bio=user_data.bio
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    """Authenticate user with email and password."""
    user = get_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def update_user_avatar(db: Session, user_id: int, avatar_url: str) -> User:
    """Update user's avatar URL."""
    user = get(db, user_id)
    if not user:
        raise ValueError("User not found")
    
    user.avatar_url = avatar_url
    db.commit()
    db.refresh(user)
    return user


def create_oauth_user(db: Session, oauth_data: OAuthUserInfo) -> User:
    """Create a new user from OAuth data."""
    # Check if user already exists by OAuth ID
    existing_user = get_by_oauth_id(db, oauth_data.provider, oauth_data.provider_id)
    if existing_user:
        return existing_user
    
    # Check if email already exists
    existing_email_user = get_by_email(db, oauth_data.email)
    if existing_email_user:
        # Link OAuth account to existing user
        if oauth_data.provider == "google":
            existing_email_user.google_id = oauth_data.provider_id
        elif oauth_data.provider == "github":
            existing_email_user.github_id = oauth_data.provider_id
        elif oauth_data.provider == "discord":
            existing_email_user.discord_id = oauth_data.provider_id
        
        db.commit()
        db.refresh(existing_email_user)
        return existing_email_user
    
    # Create new user
    db_user = User(
        email=oauth_data.email,
        username=oauth_data.username,
        password_hash=None,  # OAuth users don't have passwords
        display_name=oauth_data.display_name,
        first_name=oauth_data.first_name,
        last_name=oauth_data.last_name,
        avatar_url=oauth_data.avatar_url,
        bio=None
    )
    
    # Set OAuth provider ID
    if oauth_data.provider == "google":
        db_user.google_id = oauth_data.provider_id
    elif oauth_data.provider == "github":
        db_user.github_id = oauth_data.provider_id
    elif oauth_data.provider == "discord":
        db_user.discord_id = oauth_data.provider_id
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user_profile(db: Session, user_id: int, profile_data: dict) -> User:
    """Update user's profile information."""
    user = get(db, user_id)
    if not user:
        raise ValueError("User not found")
    
    # Update allowed fields
    if 'first_name' in profile_data:
        user.first_name = profile_data['first_name']
    if 'last_name' in profile_data:
        user.last_name = profile_data['last_name']
    if 'display_name' in profile_data:
        user.display_name = profile_data['display_name']
    if 'bio' in profile_data:
        user.bio = profile_data['bio']
    
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> bool:
    """Delete user and all associated data."""
    user = get(db, user_id)
    if not user:
        return False
    
    db.delete(user)
    db.commit()
    return True