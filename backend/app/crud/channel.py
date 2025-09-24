from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.channel import Channel
from app.models.user import User
from app.models.group import Group


def list_for_user(db: Session, user_id: int) -> List[Channel]:
    stmt = select(Channel).where(Channel.user_id == user_id).order_by(Channel.sort_order, Channel.id)
    return list(db.scalars(stmt).all())


def get(db: Session, channel_id: int) -> Optional[Channel]:
    return db.get(Channel, channel_id)


def create(db: Session, *, user: User, group_ids: List[int] = None, **data) -> Channel:
    ch = Channel(user_id=user.id, **data)
    db.add(ch)
    db.flush()  # Flush to get the channel ID
    
    # Add to groups if specified
    if group_ids:
        groups = db.query(Group).filter(Group.id.in_(group_ids), Group.user_id == user.id).all()
        ch.groups.extend(groups)
    
    db.commit()
    db.refresh(ch)
    return ch


def update(db: Session, ch: Channel, group_ids: List[int] = None, **data) -> Channel:
    # Update basic fields
    for k, v in data.items():
        if v is not None:
            setattr(ch, k, v)
    
    # Update groups if specified
    if group_ids is not None:
        # Clear existing groups
        ch.groups.clear()
        # Add new groups
        if group_ids:
            groups = db.query(Group).filter(Group.id.in_(group_ids), Group.user_id == ch.user_id).all()
            ch.groups.extend(groups)
    
    db.add(ch)
    db.commit()
    db.refresh(ch)
    return ch


def delete(db: Session, ch: Channel) -> None:
    db.delete(ch)
    db.commit()


def remove_from_group(db: Session, channel_id: int, group_id: int, user_id: int) -> bool:
    """Remove channel from specific group."""
    ch = get(db, channel_id)
    if not ch or ch.user_id != user_id:
        return False
    
    group = db.get(Group, group_id)
    if not group or group.user_id != user_id:
        return False
    
    if group in ch.groups:
        ch.groups.remove(group)
        db.commit()
        return True
    
    return False

