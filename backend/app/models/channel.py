from datetime import datetime
from enum import Enum
from sqlalchemy import String, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class ChannelType(str, Enum):
    phone = "phone"
    email = "email"
    telegram = "telegram"
    whatsapp = "whatsapp"
    signal = "signal"
    instagram = "instagram"
    twitter = "twitter"
    facebook = "facebook"
    linkedin = "linkedin"
    website = "website"
    github = "github"
    custom = "custom"


class Channel(Base):
    __tablename__ = "channels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    # тип канала и значение (для фронта делаем deeplink/mailto/tel)
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # используем значения из ChannelType
    label: Mapped[str | None] = mapped_column(String(100), nullable=True)  # например: "Личный", "Рабочий"
    value: Mapped[str] = mapped_column(String(255), nullable=False)  # телефон/емейл/@handle/URL

    is_public: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # обратная связь к пользователю
    user: Mapped["User"] = relationship(back_populates="channels")
    # связь многие-ко-многим с группами
    groups: Mapped[list["Group"]] = relationship("Group", secondary="channel_groups", back_populates="channels")
