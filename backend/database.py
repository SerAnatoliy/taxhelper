from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text, JSON, Numeric, Boolean, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import BYTEA 
import os
from datetime import datetime

DATABASE_HOST = os.getenv("DATABASE_HOST", "localhost")
DATABASE_USERNAME = os.getenv("DATABASE_USERNAME", "postgres")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD", "password")
DATABASE_NAME = os.getenv("DATABASE_NAME", "taxhelper")
DATABASE_PORT = os.getenv("DATABASE_PORT", "5432")

SQLALCHEMY_DATABASE_URL = f"postgresql://{DATABASE_USERNAME}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models 
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
    
    user = relationship("User", back_populates="bank_account")

    
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
    
    user = relationship("User", back_populates="transactions")

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
    
    user = relationship("User", back_populates="reminders")

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
    
    user = relationship("User", back_populates="chat_messages")

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
    
    verifactu_xml = Column(Text, nullable=True)
    
    verifactu_events = relationship("InvoiceVerifactuEvent", back_populates="invoice", cascade="all, delete-orphan")
    user = relationship("User", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), index=True)
    
    description = Column(String(500), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    
    invoice = relationship("Invoice", back_populates="items")
    
class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    report_type = Column(String(50), nullable=False) 
    period = Column(String(20), nullable=False)  
    modelo = Column(String(10))  
    
    status = Column(String(20), default="Draft") 
    deadline = Column(Date, nullable=False)
    submit_date = Column(Date)
    
    total_tax = Column(Numeric(12, 2))
    calculation_data = Column(Text)  

    verifactu_hash = Column(String(64))  
    verifactu_mode = Column(Boolean, default=True)  
    xml_submission = Column(Text)  
    csv_code = Column(String(20))  

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    submitted_by_ip = Column(String(45))
    
    # Relationships
    user = relationship("User", back_populates="reports")
    records = relationship("ReportRecord", back_populates="report")
    verifactu_events = relationship("VerifactuEvent", back_populates="report")


class ReportRecord(Base):
    __tablename__ = "report_records"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), index=True)
    
    record_id = Column(String(36), unique=True)  
    record_type = Column(String(20))  

    invoice_number = Column(String(50))
    invoice_date = Column(Date)
    nif_issuer = Column(String(15))
    nif_recipient = Column(String(15))
    
    base_amount = Column(Numeric(12, 2))
    vat_amount = Column(Numeric(12, 2))
    vat_rate = Column(Numeric(5, 2))
    total_amount = Column(Numeric(12, 2))

    hash_chain = Column(String(64), nullable=False)  
    previous_hash = Column(String(64))  
    signature = Column(Text)  

    xml_content = Column(Text)

    aeat_response_code = Column(String(10))
    aeat_response_message = Column(Text)
    aeat_csv = Column(String(20))  
    
    created_at = Column(DateTime, default=datetime.utcnow)
    submitted_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="report_records")
    report = relationship("Report", back_populates="records")
    
    
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
    
    user = relationship("User", back_populates="verifactu_events")
    report = relationship("Report", back_populates="verifactu_events")

# Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()