from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean
from datetime import datetime
from sqlalchemy.orm import relationship
from core.base import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    conversation_id = Column(String(50), index=True)  
    role = Column(String(20))  
    content = Column(Text)  
    response_data = Column(JSON, nullable=True)
    is_off_topic = Column(Boolean, default=False)
    tokens_used = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="chat_messages")