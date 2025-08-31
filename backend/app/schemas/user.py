from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    display_name: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserPublic(BaseModel):
    id: int
    email: EmailStr
    username: str
    display_name: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # pydantic v2: поддержка ORM-объектов
