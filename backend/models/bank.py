from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import BYTEA
from datetime import datetime
from sqlalchemy.orm import relationship
from core.base import Base

class BankAccount(Base):
    __tablename__ = "bank_accounts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    bank_name = Column(String(100))
    account_name = Column(String(100), nullable=True)  
    account_mask = Column(String(10), nullable=True)   
    account_type = Column(String(50), nullable=True)   
    account_number = Column(BYTEA, nullable=True)      
    access_token = Column(String(500), nullable=True)  
    plaid_account_id = Column(String(100), nullable=True, index=True)   
    plaid_item_id = Column(String(100), nullable=True) 
    last_sync = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)  
    
    # Relationships
    user = relationship("User", back_populates="bank_account")
