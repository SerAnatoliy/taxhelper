from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Text, Boolean
from datetime import datetime
from sqlalchemy.orm import relationship
from core.base import Base   

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    
    business_name = Column(String(200), nullable=False)
    registration_number = Column(String(50), nullable=True)
    business_address = Column(String(300), nullable=True)
    city_region = Column(String(100), nullable=True)
    representative = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    
    client_name = Column(String(200), nullable=False)
    client_address = Column(String(300), nullable=True)
    client_contact = Column(String(200), nullable=True)
    reference_number = Column(String(50), nullable=True)
    
    invoice_number = Column(String(50), nullable=False, index=True)
    invoice_date = Column(DateTime, nullable=False)
    
    service_description = Column(Text, nullable=True)
    payment_terms = Column(Text, nullable=True)
    
    total = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), default="created")  
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime, nullable=True)
    
    verifactu_hash = Column(String(64), nullable=True, index=True)
    previous_hash = Column(String(64), nullable=True, index=True)
    
    qr_code_data = Column(Text, nullable=True)
    
    verifactu_timestamp = Column(DateTime, nullable=True)
    
    verifactu_record_type = Column(String(10), default="F1")
    
    verifactu_submitted = Column(Boolean, default=False, nullable=False)
    
    aeat_response_code = Column(String(20), nullable=True)
    aeat_csv = Column(String(30), nullable=True)
    aeat_submitted_at = Column(DateTime, nullable=True)
    aeat_environment = Column(String(20), nullable=True)  
    
    verifactu_xml = Column(Text, nullable=True)
    
    # Relationships
    verifactu_events = relationship("InvoiceVerifactuEvent", back_populates="invoice", cascade="all, delete-orphan")
    user = relationship("User", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    verifactu_chain_records = relationship("VerifactuChainRecord", back_populates="invoice")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), index=True)
    
    description = Column(String(500), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    
    # Relationships
    invoice = relationship("Invoice", back_populates="items")
