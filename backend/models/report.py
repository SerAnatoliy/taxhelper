from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Text, Date, Boolean
from datetime import datetime
from sqlalchemy.orm import relationship
from core.base import Base

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
    
    aeat_submitted_at = Column(DateTime, nullable=True)
    aeat_environment = Column(String(20), nullable=True) 

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
