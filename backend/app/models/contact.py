from sqlalchemy import Column, Integer, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    
    # User who owns this contact
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # User who is being added as contact
    contact_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # When the contact was added
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Whether the contact is active (not deleted)
    is_active = Column(Boolean, default=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="contacts")
    contact_user = relationship("User", foreign_keys=[contact_user_id], back_populates="contacted_by")
