from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.deps import get_db
from app.schemas.channel import ChannelCreate, ChannelUpdate, ChannelPublic
from app.crud import channel as crud_channel

router = APIRouter(prefix="/channels", tags=["channels"])


@router.get("", response_model=list[ChannelPublic], summary="Список каналов текущего пользователя")
def list_my_channels(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items = crud_channel.list_for_user(db, current_user.id)
    return items


@router.post("", response_model=ChannelPublic, status_code=status.HTTP_201_CREATED, summary="Создать канал")
def create_channel(
    payload: ChannelCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    ch = crud_channel.create(
        db, user=current_user,
        type=payload.type,
        value=payload.value,
        label=payload.label,
        is_public=payload.is_public,
        is_primary=payload.is_primary,
        sort_order=payload.sort_order,
        group_id=payload.group_id,
    )
    return ch


@router.get("/{channel_id}", response_model=ChannelPublic, summary="Получить канал по id (только свой)")
def get_channel(
    channel_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    ch = crud_channel.get(db, channel_id)
    if not ch or ch.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Channel not found")
    return ch


@router.put("/{channel_id}", response_model=ChannelPublic, summary="Обновить канал (только свой)")
def update_channel(
    channel_id: int,
    payload: ChannelUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    ch = crud_channel.get(db, channel_id)
    if not ch or ch.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Channel not found")
    ch = crud_channel.update(
        db, ch,
        type=payload.type,
        value=payload.value,
        label=payload.label,
        is_public=payload.is_public,
        is_primary=payload.is_primary,
        sort_order=payload.sort_order,
        group_id=payload.group_id,
    )
    return ch


@router.delete("/{channel_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Удалить канал (только свой)")
def delete_channel(
    channel_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    ch = crud_channel.get(db, channel_id)
    if not ch or ch.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Channel not found")
    crud_channel.delete(db, ch)
    return None
