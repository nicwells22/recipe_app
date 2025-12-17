from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr

from ..database import get_db
from ..models import User
from ..schemas import (
    UserResponse, Token, TokenRefresh, MessageResponse
)
from ..auth import (
    create_access_token, create_refresh_token, verify_token, get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class EmailLogin(BaseModel):
    email: EmailStr

@router.post("/login", response_model=Token)
async def login(data: EmailLogin, db: Session = Depends(get_db)):
    """Login or register with just an email address."""
    user = db.query(User).filter(User.email == data.email).first()
    
    # If user doesn't exist, create them automatically
    if not user:
        # Generate username from email
        username = data.email.split('@')[0]
        # Ensure unique username
        base_username = username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1
        
        user = User(
            email=data.email,
            username=username,
            hashed_password=""  # No password needed
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    return Token(access_token=access_token, refresh_token=refresh_token)

@router.post("/refresh", response_model=Token)
async def refresh_token(token_data: TokenRefresh, db: Session = Depends(get_db)):
    payload = verify_token(token_data.refresh_token, "refresh")
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    return Token(access_token=access_token, refresh_token=refresh_token)

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user
