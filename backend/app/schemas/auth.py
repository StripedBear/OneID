from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    # Для MVP считаем, что логин по email + password
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
