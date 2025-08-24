from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import get_password_hash


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
