from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class RecoveryStartRequest(BaseModel):
    email: EmailStr


class RecoveryStartResponse(BaseModel):
    message: str
    available_methods: List[str]
    warning: Optional[str] = None


class RecoveryVerifyRequest(BaseModel):
    email: EmailStr
    method: str  # "email" or "oauth"
    code: Optional[str] = None  # For email OTP
    oauth_token: Optional[str] = None  # For OAuth verification


class RecoveryVerifyResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    message: str


class SecurityInfo(BaseModel):
    connected: int
    total: int
    methods: List[str]
    level: str  # "low", "medium", "high"
    recommendation: str


class OTPRequest(BaseModel):
    email: EmailStr


class OTPResponse(BaseModel):
    message: str
    expires_in: int  # seconds
