from sqlalchemy import Table, Column, Integer, ForeignKey
from app.db.base import Base

# Промежуточная таблица для связи многие-ко-многим между каналами и группами
channel_groups = Table(
    'channel_groups',
    Base.metadata,
    Column('channel_id', Integer, ForeignKey('channels.id', ondelete='CASCADE'), primary_key=True),
    Column('group_id', Integer, ForeignKey('groups.id', ondelete='CASCADE'), primary_key=True)
)
