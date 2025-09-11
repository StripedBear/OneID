from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.crud.contact import (
    create_contact, 
    get_user_contacts, 
    remove_contact, 
    search_users,
    is_contact
)
from app.schemas.user import UserPublic

router = APIRouter()


@router.get("/search")
async def search_users_endpoint(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(20, ge=1, le=50, description="Maximum number of results"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Поиск пользователей для добавления в контакты"""
    if len(q.strip()) < 2:
        raise HTTPException(status_code=400, detail="Search query must be at least 2 characters")
    
    users = search_users(db, q.strip(), limit)
    
    # Исключаем текущего пользователя из результатов
    users = [user for user in users if user.id != current_user.id]
    
    # Добавляем информацию о том, является ли пользователь уже контактом
    result = []
    for user in users:
        user_data = UserPublic.model_validate(user).model_dump()
        user_data["is_contact"] = is_contact(db, current_user.id, user.id)
        result.append(user_data)
    
    return {"users": result}


@router.get("/")
async def get_contacts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить список контактов пользователя"""
    contacts = get_user_contacts(db, current_user.id)
    
    result = []
    for contact in contacts:
        user_data = UserPublic.model_validate(contact.contact_user).model_dump()
        user_data["contact_id"] = contact.id
        user_data["added_at"] = contact.created_at
        result.append(user_data)
    
    return {"contacts": result}


@router.post("/add/{user_id}")
async def add_contact(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Добавить пользователя в контакты"""
    try:
        contact = create_contact(db, current_user.id, user_id)
        return {"message": "Contact added successfully", "contact_id": contact.id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/remove/{user_id}")
async def remove_contact_endpoint(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удалить пользователя из контактов"""
    success = remove_contact(db, current_user.id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    return {"message": "Contact removed successfully"}
