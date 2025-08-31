from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import get_password_hash, verify_password
from app.schemas.auth import UserRegister


def get(db: Session, user_id: int) -> Optional[User]:
    return db.get(User, user_id)


def get_by_email(db: Session, email: str) -> Optional[User]:
    stmt = select(User).where(User.email == email)
    return db.scalar(stmt)


def get_by_username(db: Session, username: str) -> Optional[User]:
    stmt = select(User).where(User.username == username)
    return db.scalar(stmt)


def create(db: Session, *, email: str, username: str, password: str,
           display_name: str | None = None,
           avatar_url: str | None = None,
           bio: str | None = None) -> User:
    user = User(
        email=email,
        username=username,
        password_hash=get_password_hash(password),
        display_name=display_name,
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
