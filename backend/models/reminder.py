from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from datetime import datetime
from sqlalchemy.orm import relationship
from core.base import Base

class Reminder(Base):
    __tablename__ = "reminders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=False, index=True)
    reminder_type = Column(String(50), default="custom")  
    modelo = Column(String(20), nullable=True)  
    is_completed = Column(Boolean, default=False)
    is_removed = Column(Boolean, default=False)
    notify_days_before = Column(Integer, default=7)  
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="reminders")