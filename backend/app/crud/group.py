from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.group import Group
from app.schemas.group import GroupCreate, GroupUpdate


def get_groups(db: Session, user_id: int) -> List[Group]:
    """Get all groups for a user."""
    stmt = select(Group).where(Group.user_id == user_id).order_by(Group.sort_order, Group.name)
    return list(db.scalars(stmt).all())


def get_group(db: Session, group_id: int, user_id: int) -> Optional[Group]:
    """Get a specific group by ID for a user."""
    stmt = select(Group).where(Group.id == group_id, Group.user_id == user_id)
    return db.scalar(stmt)


def create_group(db: Session, group_data: GroupCreate, user_id: int) -> Group:
    """Create a new group for a user."""
    db_group = Group(
        name=group_data.name,
        description=group_data.description,
        sort_order=group_data.sort_order,
        user_id=user_id
    )
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group


def update_group(db: Session, group_id: int, group_data: GroupUpdate, user_id: int) -> Optional[Group]:
    """Update a group."""
    group = get_group(db, group_id, user_id)
    if not group:
        return None
    
    update_data = group_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(group, field, value)
    
    db.commit()
    db.refresh(group)
    return group


def delete_group(db: Session, group_id: int, user_id: int) -> bool:
    """Delete a group."""
    group = get_group(db, group_id, user_id)
    if not group:
        return False
    
    db.delete(group)
    db.commit()
    return True
