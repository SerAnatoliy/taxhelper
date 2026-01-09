from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Text, Boolean
from datetime import datetime
from sqlalchemy.orm import relationship
from core.base import Base

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    date = Column(DateTime, index=True)
    amount = Column(Numeric(10, 2))
    type = Column(String(20))  
    category = Column(String(50))
    provider = Column(String(20), default="nanonets")
    description = Column(Text)
    invoice_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    plaid_transaction_id = Column(String(100), nullable=True, unique=True, index=True) 
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="transactions")
