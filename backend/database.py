from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text, JSON, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import BYTEA 
import os
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password@localhost:5432/taxhelper"

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
    region = Column(String(50), index=True)
    nie_dni = Column(BYTEA)
    stripe_customer_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    bank_account = relationship("BankAccount", back_populates="user", uselist=False)
    transactions = relationship("Transaction", back_populates="user")
    reports = relationship("Report", back_populates="user")

class BankAccount(Base):
    __tablename__ = "bank_accounts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    bank_name = Column(String(50))
    account_number = Column(BYTEA)
    access_token = Column(String(500))
    last_sync = Column(DateTime)
    
    user = relationship("User", back_populates="bank_account")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    date = Column(DateTime, index=True)
    amount = Column(Numeric(10, 2))
    type = Column(String(20))  
    category = Column(String(50))
    description = Column(Text)
    invoice_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="transactions")

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    type = Column(String(20))  
    period = Column(String(20), index=True)
    pdf_path = Column(String(255))
    owed_amount = Column(Numeric(10, 2))
    status = Column(String(20))
    tracking_id = Column(String(50), nullable=True)
    explain_metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="reports")

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

        
