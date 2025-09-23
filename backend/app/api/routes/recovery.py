from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.recovery import (
    RecoveryStartRequest, RecoveryStartResponse,
    RecoveryVerifyRequest, RecoveryVerifyResponse,
    SecurityInfo, OTPRequest, OTPResponse
)
from app.crud import recovery as crud_recovery
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["recovery"])


@router.post("/recover", response_model=RecoveryStartResponse)
def start_recovery(
    request: RecoveryStartRequest,
    db: Session = Depends(get_db)
):
    """Start account recovery process."""
    try:
        result = crud_recovery.start_recovery(db, request.email)
        return RecoveryStartResponse(**result)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/verify", response_model=RecoveryVerifyResponse)
def verify_recovery(
    request: RecoveryVerifyRequest,
    db: Session = Depends(get_db)
):
    """Verify recovery code or OAuth token."""
    try:
        user = crud_recovery.verify_recovery(
            db, 
            request.email, 
            request.method, 
            request.code, 
            request.oauth_token
        )
        
        # Generate new access token
        access_token = create_access_token(subject=user.id)
        
        return RecoveryVerifyResponse(
            access_token=access_token,
            token_type="bearer",
            message="Recovery successful. We recommend adding more login methods for reliability."
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/security", response_model=SecurityInfo)
def get_security_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's security information."""
    try:
        security = crud_recovery.get_security_info(db, current_user.id)
        return SecurityInfo(**security)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post("/otp", response_model=OTPResponse)
def send_otp(
    request: OTPRequest,
    db: Session = Depends(get_db)
):
    """Send OTP code to email."""
    try:
        result = crud_recovery.start_recovery(db, request.email)
        return OTPResponse(
            message="OTP code sent to your email",
            expires_in=600  # 10 minutes
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
