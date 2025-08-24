from datetime import datetime
from pydantic import BaseModel, Field


class ChannelBase(BaseModel):
    type: str = Field(description="Тип канала (phone, email, telegram, ...)")
    value: str = Field(description="Значение: телефон/емейл/@handle/URL")
    label: str | None = None
    is_public: bool = True
    is_primary: bool = False
    sort_order: int = 0


class ChannelCreate(ChannelBase):
    pass


class ChannelUpdate(BaseModel):
    type: str | None = None
    value: str | None = None
    label: str | None = None
    is_public: bool | None = None
    is_primary: bool | None = None
    sort_order: int | None = None


class ChannelPublic(BaseModel):
    id: int
    user_id: int
    type: str
    value: str
    label: str | None
    is_public: bool
    is_primary: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
