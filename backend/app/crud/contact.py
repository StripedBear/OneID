from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.contact import Contact
from app.models.user import User
from typing import List, Optional


def create_contact(db: Session, user_id: int, contact_user_id: int) -> Contact:
    """Создать новый контакт"""
    # Проверяем, что пользователь не добавляет сам себя
    if user_id == contact_user_id:
        raise ValueError("Cannot add yourself as a contact")
    
    # Проверяем, что контакт уже не существует
    existing_contact = db.query(Contact).filter(
        and_(
            Contact.user_id == user_id,
            Contact.contact_user_id == contact_user_id,
            Contact.is_active == True
        )
    ).first()
    
    if existing_contact:
        raise ValueError("Contact already exists")
    
    # Проверяем, что пользователь существует
    contact_user = db.query(User).filter(User.id == contact_user_id).first()
    if not contact_user:
        raise ValueError("User not found")
    
    contact = Contact(
        user_id=user_id,
        contact_user_id=contact_user_id
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


def get_user_contacts(db: Session, user_id: int) -> List[Contact]:
    """Получить все контакты пользователя"""
    return db.query(Contact).filter(
        and_(
            Contact.user_id == user_id,
            Contact.is_active == True
        )
    ).all()


def remove_contact(db: Session, user_id: int, contact_user_id: int) -> bool:
    """Удалить контакт (пометить как неактивный)"""
    contact = db.query(Contact).filter(
        and_(
            Contact.user_id == user_id,
            Contact.contact_user_id == contact_user_id,
            Contact.is_active == True
        )
    ).first()
    
    if not contact:
        return False
    
    contact.is_active = False
    db.commit()
    return True


def search_users(db: Session, query: str, limit: int = 20) -> List[User]:
    """Поиск пользователей по имени, фамилии, username или email"""
    search_term = f"%{query.lower()}%"
    
    return db.query(User).filter(
        User.username.ilike(search_term) |
        User.first_name.ilike(search_term) |
        User.last_name.ilike(search_term) |
        User.display_name.ilike(search_term) |
        User.email.ilike(search_term)
    ).limit(limit).all()


def is_contact(db: Session, user_id: int, contact_user_id: int) -> bool:
    """Проверить, является ли пользователь контактом"""
    contact = db.query(Contact).filter(
        and_(
            Contact.user_id == user_id,
            Contact.contact_user_id == contact_user_id,
            Contact.is_active == True
        )
    ).first()
    
    return contact is not None
