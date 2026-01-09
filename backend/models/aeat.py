from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean
from datetime import datetime
from sqlalchemy.orm import relationship
from core.base import Base

class AEATSubmission(Base):
    __tablename__ = "aeat_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    submission_type = Column(String(20), nullable=False)  
    entity_id = Column(Integer, nullable=False)  
    
    environment = Column(String(20), default="sandbox")  
    endpoint_url = Column(String(500), nullable=True)
    
    xml_sent = Column(Text, nullable=True) 
    xml_hash = Column(String(64), nullable=True)  
    
    success = Column(Boolean, default=False)
    csv_code = Column(String(50), nullable=True) 
    response_code = Column(String(20), nullable=True)
    response_message = Column(Text, nullable=True)
    response_raw = Column(Text, nullable=True)  
    
    error_codes = Column(JSON, nullable=True)  
    
    submitted_at = Column(DateTime, default=datetime.utcnow, index=True)
    response_received_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, nullable=True)  
    
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    certificate_fingerprint = Column(String(64), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="aeat_submissions")
