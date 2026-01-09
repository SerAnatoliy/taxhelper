from sqlalchemy import Column, Integer, String, DateTime, Boolean, Date
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import BYTEA
from datetime import datetime
from sqlalchemy.orm import relationship
from core.base import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    family_status = Column(String(20))  
    num_children = Column(Integer, default=0)
    business_address = Column(String(300), nullable=True)
    city = Column(String(100), nullable=True)
    region = Column(String(50), index=True)
    nie_dni = Column(String(20), nullable=True)  
    verified_kyc = Column(Boolean, default=False)  
    veriff_session_id = Column(String(100), nullable=True)  
    veriff_status = Column(String(50), nullable=True)       
    kyc_verified_at = Column(DateTime, nullable=True)       
    kyc_skipped = Column(Boolean, default=False)           
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)
    subscription_status = Column(String(50), nullable=True)
    subscription_end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    nif = Column(String(15))  
    registration_date = Column(Date) 

    
    # Relationships
    bank_account = relationship("BankAccount", back_populates="user", uselist=False)
    transactions = relationship("Transaction", back_populates="user")
    reports = relationship("Report", back_populates="user")
    reminders = relationship("Reminder", back_populates="user")
    chat_messages = relationship("ChatMessage", back_populates="user")
    invoices = relationship("Invoice", back_populates="user")
    reports = relationship("Report", back_populates="user")
    report_records = relationship("ReportRecord", back_populates="user")
    invoice_verifactu_events = relationship("InvoiceVerifactuEvent", back_populates="user")
    verifactu_events = relationship("VerifactuEvent", back_populates="user")
    certificate = relationship("UserCertificate", back_populates="user", uselist=False)
    aeat_submissions = relationship("AEATSubmission", back_populates="user")

class UserCertificate(Base):
    __tablename__ = "user_certificates"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    
    certificate_type = Column(String(50), default="FNMT")  
    subject_cn = Column(String(255), nullable=True)  
    subject_nif = Column(String(20), nullable=True)  
    issuer = Column(String(255), nullable=True)
    serial_number = Column(String(100), nullable=True)
    
    valid_from = Column(DateTime, nullable=True)
    valid_until = Column(DateTime, nullable=True)
    
    certificate_data_encrypted = Column(BYTEA, nullable=False)
    
    password_encrypted = Column(BYTEA, nullable=False)
    
    encryption_salt = Column(BYTEA, nullable=False)
    
    fingerprint = Column(String(64), nullable=False, index=True)
    
    is_active = Column(Boolean, default=True)
    is_expired = Column(Boolean, default=False)
    last_used_at = Column(DateTime, nullable=True)
    use_count = Column(Integer, default=0)
    
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    uploaded_ip = Column(String(45), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="certificate")
