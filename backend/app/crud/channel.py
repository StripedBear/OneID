from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.channel import Channel
from app.models.user import User


def list_for_user(db: Session, user_id: int) -> List[Channel]:
    stmt = select(Channel).where(Channel.user_id == user_id).order_by(Channel.sort_order, Channel.id)
    return list(db.scalars(stmt).all())


def get(db: Session, channel_id: int) -> Optional[Channel]:
    return db.get(Channel, channel_id)


def create(db: Session, *, user: User, **data) -> Channel:
    ch = Channel(user_id=user.id, **data)
    db.add(ch)
    db.commit()
    db.refresh(ch)
    return ch


def update(db: Session, ch: Channel, **data) -> Channel:
    for k, v in data.items():
        if v is not None:
            setattr(ch, k, v)
    db.add(ch)
    db.commit()
    db.refresh(ch)
    return ch


def delete(db: Session, ch: Channel) -> None:
    db.delete(ch)
    db.commit()

