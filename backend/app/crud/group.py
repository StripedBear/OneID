from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
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


def get_group_by_name(db: Session, name: str, user_id: int) -> Optional[Group]:
    """Get a group by name for a user."""
    stmt = select(Group).where(Group.name == name, Group.user_id == user_id)
    return db.scalar(stmt)


def create_group(db: Session, group_data: GroupCreate, user_id: int) -> Group:
    """Create a new group for a user."""
    # Check if group with this name already exists for this user
    existing_group = get_group_by_name(db, group_data.name, user_id)
    if existing_group:
        raise ValueError(f"Group with name '{group_data.name}' already exists")
    
    db_group = Group(
        name=group_data.name,
        description=group_data.description,
        sort_order=group_data.sort_order,
        user_id=user_id
    )
    db.add(db_group)
    try:
        db.commit()
        db.refresh(db_group)
        return db_group
    except IntegrityError:
        db.rollback()
        raise ValueError(f"Group with name '{group_data.name}' already exists")


def update_group(db: Session, group_id: int, group_data: GroupUpdate, user_id: int) -> Optional[Group]:
    """Update a group."""
    group = get_group(db, group_id, user_id)
    if not group:
        return None
    
    update_data = group_data.model_dump(exclude_unset=True)
    
    # Check if new name conflicts with existing group
    if 'name' in update_data and update_data['name'] != group.name:
        existing_group = get_group_by_name(db, update_data['name'], user_id)
        if existing_group:
            raise ValueError(f"Group with name '{update_data['name']}' already exists")
    
    for field, value in update_data.items():
        setattr(group, field, value)
    
    try:
        db.commit()
        db.refresh(group)
        return group
    except IntegrityError:
        db.rollback()
        raise ValueError(f"Group with name '{update_data.get('name', group.name)}' already exists")


def delete_group(db: Session, group_id: int, user_id: int) -> bool:
    """Delete a group."""
    group = get_group(db, group_id, user_id)
    if not group:
        return False
    
    db.delete(group)
    db.commit()
    return True
