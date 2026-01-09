from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
import tempfile
import re
import json
import logging

from database import get_db, User, Transaction
from auth import get_current_user

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/expenses", tags=["expenses"])

from dotenv import load_dotenv
load_dotenv()

try:
    from docstrange import DocumentExtractor
    HAS_DOCSTRANGE = True
except ImportError:
    HAS_DOCSTRANGE = False
    logger.warning("docstrange not installed - document parsing disabled")

class ExpenseCreate(BaseModel):
    date: str
    amount: float
    type: str = "invoice" 
    category: str = "deductible"  
    description: Optional[str] = None
    vendor: Optional[str] = None
    invoice_number: Optional[str] = None


class ExpenseUpdate(BaseModel):
    date: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    vendor: Optional[str] = None
    invoice_number: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: int
    date: datetime
    amount: float
    type: str
    category: Optional[str]
    description: Optional[str]
    invoice_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    transaction_id: int
    amount: float
    description: str
    date: str
    invoice_id: str
    verified: bool = True


class AdviceRequest(BaseModel):
    full_text: str
    user_region: str
    user_family_status: str

class AdviceResponse(BaseModel):
    advice: str
    deductions: dict
    category: str
    estimated_tax: float
    confidence: float


class GeneralAdviceRequest(BaseModel):
    query: str


class GeneralAdviceResponse(BaseModel):
    answer: str
    advice: str
    deductions: dict
    estimated_tax: float
    suggestions: List[str]
    confidence: float

@router.get("/")
async def get_expenses(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    type: Optional[str] = None,
    include_deleted: bool = False, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type.in_(["expense", "invoice", "receipt"])  # CHANGED!
    )
    
    if not include_deleted:
        query = query.filter(Transaction.is_deleted == False)
    
    if date_from:
        query = query.filter(Transaction.date >= datetime.fromisoformat(date_from))
    if date_to:
        query = query.filter(Transaction.date <= datetime.fromisoformat(date_to))
    
    if type:
        query = query.filter(Transaction.type == type)
    
    expenses = query.order_by(Transaction.date.desc()).all()
    
    expense_list = [
        ExpenseResponse(
            id=exp.id,
            date=exp.date,
            amount=float(exp.amount) if exp.amount else 0.0,
            type=exp.type,
            category=exp.category,
            description=exp.description,
            invoice_id=exp.invoice_id,
            created_at=exp.created_at
        )
        for exp in expenses
    ]
    
    return {"expenses": expense_list}

@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Transaction).filter(
        Transaction.id == expense_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    return ExpenseResponse(
        id=expense.id,
        date=expense.date,
        amount=float(expense.amount) if expense.amount else 0.0,
        type=expense.type or "invoice",
        category=expense.category,
        description=expense.description,
        invoice_id=expense.invoice_id,
        created_at=expense.created_at
    )


@router.post("/", response_model=ExpenseResponse)
async def create_expense(
    expense_data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        expense_date = datetime.strptime(expense_data.date, "%Y-%m-%d")
    except ValueError:
        try:
            expense_date = datetime.fromisoformat(expense_data.date.replace('Z', '+00:00'))
        except ValueError:
            expense_date = datetime.now()
    
    description = expense_data.description or ""
    if expense_data.vendor:
        description = f"{expense_data.vendor} | {description}" if description else expense_data.vendor
    
    expense = Transaction(
        user_id=current_user.id,
        date=expense_date,
        amount=expense_data.amount,
        type=expense_data.type,
        category=expense_data.category,
        description=description,
        invoice_id=expense_data.invoice_number,
        provider="manual"
    )
    
    db.add(expense)
    db.commit()
    db.refresh(expense)
    
    return ExpenseResponse(
        id=expense.id,
        date=expense.date,
        amount=float(expense.amount) if expense.amount else 0.0,
        type=expense.type or "invoice",
        category=expense.category,
        description=expense.description,
        invoice_id=expense.invoice_id,
        created_at=expense.created_at
    )


@router.patch("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: int,
    expense_data: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Transaction).filter(
        Transaction.id == expense_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    if expense_data.date:
        try:
            expense.date = datetime.strptime(expense_data.date, "%Y-%m-%d")
        except ValueError:
            pass
    
    if expense_data.amount is not None:
        expense.amount = expense_data.amount
    
    if expense_data.type:
        expense.type = expense_data.type
    
    if expense_data.category:
        expense.category = expense_data.category
    
    if expense_data.description is not None:
        description = expense_data.description
        if expense_data.vendor:
            description = f"{expense_data.vendor} | {description}" if description else expense_data.vendor
        expense.description = description
    
    if expense_data.invoice_number is not None:
        expense.invoice_id = expense_data.invoice_number
    
    db.commit()
    db.refresh(expense)
    
    return ExpenseResponse(
        id=expense.id,
        date=expense.date,
        amount=float(expense.amount) if expense.amount else 0.0,
        type=expense.type or "invoice",
        category=expense.category,
        description=expense.description,
        invoice_id=expense.invoice_id,
        created_at=expense.created_at
    )

@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Transaction).filter(
        Transaction.id == expense_id,
        Transaction.user_id == current_user.id,
        Transaction.is_deleted == False  
    ).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense.is_deleted = True
    expense.deleted_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Expense deleted successfully", "id": expense_id}

@router.post("/upload", response_model=List[UploadResponse])
async def upload_invoices(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not HAS_DOCSTRANGE:
        # Fallback: create basic transaction without parsing
        results = []
        for file in files:
            if not file.content_type.startswith('image/') and file.content_type != 'application/pdf':
                raise HTTPException(status_code=400, detail="Only images or PDF allowed")
            
            transaction = Transaction(
                user_id=current_user.id,
                date=datetime.now(),
                amount=0.0,
                type="expense",
                category="deductible",
                description=f"Uploaded: {file.filename}",
                invoice_id=file.filename,
                provider="upload"
            )
            db.add(transaction)
            db.commit()
            db.refresh(transaction)
            
            results.append(UploadResponse(
                transaction_id=transaction.id,
                amount=0.0,
                description=f"Uploaded: {file.filename}",
                date=datetime.now().isoformat(),
                invoice_id=file.filename
            ))
        return results
    
    extractor = DocumentExtractor(api_key=os.getenv("DOCSTRANGE_API_KEY"))
    results = []
    
    for file in files:
        if not file.content_type.startswith('image/') and file.content_type != 'application/pdf':
            raise HTTPException(status_code=400, detail="Only images or PDF allowed")
        
        file_content = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            temp_path = temp_file.name
            temp_file.write(file_content)
        
        try:
            result = extractor.extract(temp_path)
            full_text = str(result)
            
            fields = result.extract_data(
                specified_fields=[
                    "total_amount", "due_date", "vendor_name", "invoice_number",
                    "line_items", "description"
                ]
            )
            
            content = fields.get('extracted_fields', {}).get('content', {})
            
            amount_str = str(content.get('total_amount', '0.0'))
            amount = float(amount_str.replace(',', '.')) if amount_str != '0.0' else 0.0
            
            date_str = str(content.get('due_date', ''))
            date = datetime.fromisoformat(date_str) if date_str else datetime.now()
            
            description = str(content.get('vendor_name', 'Unknown invoice'))
            invoice_id = content.get('invoice_number', file.filename)
            
            line_items = content.get('line_items', [])
            if line_items:
                items_desc = ", ".join([str(item.get('description', '')) for item in line_items[:4]])
                description += f" | Items: {items_desc}"
            
            if amount == 0.0:
                amount_match = re.search(r'Total\s*([\d,]+\.?\d*\s*€)', full_text, re.IGNORECASE)
                if amount_match:
                    amount_str = amount_match.group(1).replace(',', '.').replace(' €', '')
                    amount = float(amount_str)
            
            transaction = Transaction(
                user_id=current_user.id,
                date=date,
                amount=amount,
                type="expense",
                category="deductible",
                description=description,
                invoice_id=invoice_id,
                provider="docstrange"
            )
            db.add(transaction)
            db.commit()
            db.refresh(transaction)
            
            results.append(UploadResponse(
                transaction_id=transaction.id,
                amount=amount,
                description=description,
                date=date.isoformat(),
                invoice_id=invoice_id
            ))
        finally:
            os.unlink(temp_path)
    
    return results

@router.post("/{expense_id}/restore")
async def restore_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Transaction).filter(
        Transaction.id == expense_id,
        Transaction.user_id == current_user.id,
        Transaction.is_deleted == True
    ).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Deleted expense not found")
    
    expense.is_deleted = False
    expense.deleted_at = None
    
    db.commit()
    
    return {"message": "Expense restored successfully", "id": expense_id}
