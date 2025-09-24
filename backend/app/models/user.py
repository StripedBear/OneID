from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    # Храним только хэш пароля (будем заполнять в шаге авторизации)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # OAuth провайдеры
    google_id: Mapped[str | None] = mapped_column(String(100), unique=True, index=True, nullable=True)
    github_id: Mapped[str | None] = mapped_column(String(100), unique=True, index=True, nullable=True)
    discord_id: Mapped[str | None] = mapped_column(String(100), unique=True, index=True, nullable=True)

    # Для публичного профиля — аватар и имя (опционально)
    display_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    first_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    bio: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Recovery fields
    otp_code: Mapped[str | None] = mapped_column(String(10), nullable=True)
    otp_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    recovery_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    recovery_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Связанные каналы связи
    channels: Mapped[list["Channel"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    # Группы контактов
    groups: Mapped[list["Group"]] = relationship(
        "Group",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    # Контакты пользователя
    contacts: Mapped[list["Contact"]] = relationship(
        "Contact",
        foreign_keys="Contact.user_id",
        back_populates="user"
    )
    
    # Пользователи, которые добавили этого пользователя в контакты
    contacted_by: Mapped[list["Contact"]] = relationship(
        "Contact", 
        foreign_keys="Contact.contact_user_id",
        back_populates="contact_user"
    )

    def get_login_methods(self) -> list[str]:
        """Get list of connected login methods."""
        methods = []
        if self.password_hash:
            methods.append("email")
        if self.google_id:
            methods.append("google")
        if self.github_id:
            methods.append("github")
        if self.discord_id:
            methods.append("discord")
        return methods

    def get_security_level(self) -> dict:
        """Get security level information."""
        methods = self.get_login_methods()
        total_methods = 5  # email, google, github, discord, telegram (future)
        connected = len(methods)
        
        return {
            "connected": connected,
            "total": total_methods,
            "methods": methods,
            "level": "high" if connected >= 3 else "medium" if connected >= 2 else "low"
        }
