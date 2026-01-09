from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

DATABASE_HOST = os.getenv("DATABASE_HOST", "localhost")
DATABASE_USERNAME = os.getenv("DATABASE_USERNAME", "postgres")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD", "password")
DATABASE_NAME = os.getenv("DATABASE_NAME", "taxhelper")
DATABASE_PORT = os.getenv("DATABASE_PORT", "5432")

SQLALCHEMY_DATABASE_URL = f"postgresql://{DATABASE_USERNAME}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


from models import (
    User, BankAccount, Transaction, Invoice, InvoiceItem,
    Report, ReportRecord, Reminder, VerifactuEvent, InvoiceVerifactuEvent, ChatMessage, UserCertificate, AEATSubmission, VerifactuChainRecord
)
