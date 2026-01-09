from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean
from datetime import datetime
from sqlalchemy.orm import relationship 
from core.base import Base

class InvoiceVerifactuEvent(Base):
    __tablename__ = "invoice_verifactu_events"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False, index=True)
    
    event_type = Column(String(50), nullable=False)  
    event_code = Column(String(20), nullable=True)
    description = Column(Text, nullable=True)
    
    hash_before = Column(String(64), nullable=True)  
    hash_after = Column(String(64), nullable=False)   
    
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    event_data = Column(JSON, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="invoice_verifactu_events")
    invoice = relationship("Invoice", back_populates="verifactu_events")


class VerifactuEvent(Base):
    __tablename__ = "verifactu_events"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    event_type = Column(String(50), nullable=False)
    
    event_code = Column(String(20))
    description = Column(Text)

    report_id = Column(Integer, ForeignKey("reports.id"), index=True)
    record_id = Column(String(36))

    hash_before = Column(String(64))
    hash_after = Column(String(64))
    ip_address = Column(String(45))
    user_agent = Column(String(255))
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User", back_populates="verifactu_events")
    report = relationship("Report", back_populates="verifactu_events")

class VerifactuChainRecord(Base):
    __tablename__ = "verifactu_chain_records"
    
    id = Column(Integer, primary_key=True, index=True)
    
    nif = Column(String(15), nullable=False, index=True)
    software_id = Column(String(50), default="01", index=True)  
    
    invoice_number = Column(String(50), nullable=False)
    invoice_date = Column(DateTime, nullable=False)
    invoice_type = Column(String(10), nullable=False)  
    
    hash_value = Column(String(64), nullable=False, index=True)
    previous_hash = Column(String(64), nullable=True)  
    hash_input = Column(Text, nullable=True)  
    
    csv_code = Column(String(30), nullable=True)
    aeat_accepted = Column(Boolean, default=False)
    aeat_submitted_at = Column(DateTime, nullable=True)
    aeat_environment = Column(String(20), nullable=True)  
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True, index=True)
    
    # Relationships
    invoice = relationship("Invoice", back_populates="verifactu_chain_records")
