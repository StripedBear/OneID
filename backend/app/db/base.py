from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass

# Импортируй модели здесь, чтобы Alembic/создание таблиц "видели" их
# (импорты ниже не используются напрямую, но регистрируют таблицы в метаданных)
from app.models.user import User  # noqa: F401
from app.models.channel import Channel  # noqa: F401
