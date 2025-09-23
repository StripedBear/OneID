from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.user import User
from app.models.channel import Channel
from app.models.group import Group
from app.schemas.user import UserPublic
from app.schemas.channel import ChannelPublic
from app.schemas.group import Group

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/{username}", summary="Публичный профиль по username")
def public_profile(username: str, db: Session = Depends(get_db)) -> dict:
    # Находим пользователя
    user = db.scalar(select(User).where(User.username == username))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Публичные каналы (is_public = true), сортировка
    channels = list(
        db.scalars(
            select(Channel)
            .where(Channel.user_id == user.id, Channel.is_public == True)  # noqa: E712
            .order_by(Channel.sort_order, Channel.id)
        ).all()
    )

    # Группы пользователя
    groups = list(
        db.scalars(
            select(Group)
            .where(Group.user_id == user.id)
            .order_by(Group.sort_order, Group.name)
        ).all()
    )

    # Возвращаем минимально необходимую публичную инфу (без email)
    user_data = UserPublic.model_validate(user).model_dump()
    user_data.pop("email", None)

    return {
        "user": user_data,
        "channels": [ChannelPublic.model_validate(ch).model_dump() for ch in channels],
        "groups": [Group.model_validate(g).model_dump() for g in groups],
    }
