from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import verify_password, create_access_token
from app.crud import user as crud_user
from app.db.deps import get_db
from app.schemas.auth import Token, LoginRequest
from app.schemas.user import UserCreate, UserPublic
from app.api.deps import get_current_user  # ✅ импортируем саму функцию (callable)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED, summary="Регистрация нового пользователя")
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    # Проверяем уникальность email / username
    if crud_user.get_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if crud_user.get_by_username(db, payload.username):
        raise HTTPException(status_code=400, detail="Username already taken")

    user = crud_user.create(
        db,
        email=payload.email,
        username=payload.username,
        password=payload.password,
        display_name=payload.display_name,
        avatar_url=payload.avatar_url,
        bio=payload.bio,
    )
    return user


@router.post("/login", response_model=Token, summary="Логин по email и паролю")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = crud_user.get_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    token = create_access_token(subject=user.id, expires_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(access_token=token)


@router.get("/me", response_model=UserPublic, summary="Текущий пользователь (по JWT)")
def me(current_user=Depends(get_current_user)):  # ✅ передаём callable, а не строку
    return current_user
