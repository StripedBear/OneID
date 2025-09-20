from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=128)
    first_name: str | None = None
    last_name: str | None = None
    display_name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Legacy schemas for backward compatibility
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    # Для MVP считаем, что логин по email + password
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


# OAuth схемы
class OAuthUserInfo(BaseModel):
    provider: str  # google, github, discord
    provider_id: str
    email: str
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    display_name: Optional[str] = None


class OAuthCallback(BaseModel):
    code: str
    state: Optional[str] = None
