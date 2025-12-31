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

try:
    from openai import OpenAI
    client = OpenAI(
        api_key=os.getenv("GROK_API_KEY"),
        base_url="https://api.x.ai/v1",
    )
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False
    logger.warning("openai not installed - AI advice disabled")

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

@router.get("/", response_model=List[ExpenseResponse])
async def get_expenses(
    date_from: Optional[str] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    type: Optional[str] = Query(None, description="Filter by type: invoice or receipt"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type.in_(["expense", "invoice", "receipt"])
    )
    
    if date_from:
        try:
            from_date = datetime.strptime(date_from, "%Y-%m-%d")
            query = query.filter(Transaction.date >= from_date)
        except ValueError:
            pass
    
    if date_to:
        try:
            to_date = datetime.strptime(date_to, "%Y-%m-%d")
            query = query.filter(Transaction.date <= to_date)
        except ValueError:
            pass
    
    if type:
        query = query.filter(Transaction.type == type)
    
    expenses = query.order_by(Transaction.date.desc()).offset(offset).limit(limit).all()
    
    return [
        ExpenseResponse(
            id=exp.id,
            date=exp.date,
            amount=float(exp.amount) if exp.amount else 0.0,
            type=exp.type or "invoice",
            category=exp.category,
            description=exp.description,
            invoice_id=exp.invoice_id,
            created_at=exp.created_at
        )
        for exp in expenses
    ]


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
        Transaction.user_id == current_user.id
    ).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    db.delete(expense)
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


@router.post("/advice", response_model=AdviceResponse)
async def get_ai_advice(
    request: AdviceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not HAS_OPENAI:
        return AdviceResponse(
            advice="AI advice not available. Please configure API keys.",
            deductions={"IRPF": 21, "IVA": 21},
            category="deductible",
            estimated_tax=0.0,
            confidence=0.0
        )
    
    prompt = f"""
    You are a tax advisor for Spanish autónomos.
    Analyze this invoice text and give advice for IRPF/IVA deductions.
    User: {current_user.full_name}, region: {request.user_region}, family_status: {request.user_family_status}, children: {current_user.num_children}.
    Invoice text: {request.full_text}
    
    Respond in JSON only:
    {{
      "advice": "Short advice text",
      "deductions": {{"IRPF": 21, "IVA": 10}},
      "category": "deductible",
      "estimated_tax": 195.75,
      "confidence": 0.95
    }}
    """
    
    response = client.chat.completions.create(
        model="grok-3",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=300
    )
    
    advice_json = response.choices[0].message.content.strip()
    try:
        parsed = json.loads(advice_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid AI response")
    
    return AdviceResponse(**parsed)


@router.post("/advice/general", response_model=GeneralAdviceResponse)
async def get_general_tax_advice(
    request: GeneralAdviceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not HAS_OPENAI:
        return GeneralAdviceResponse(
            answer="AI advice not available.",
            advice="Please configure API keys.",
            deductions={},
            estimated_tax=0.0,
            suggestions=[],
            confidence=0.0
        )
    
    from_date = datetime.now() - timedelta(days=180)
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= from_date
    ).all()
    
    total_income = sum(float(t.amount) for t in transactions if t.type == "income")
    total_expenses = sum(float(t.amount) for t in transactions if t.type in ["expense", "invoice", "receipt"])
    recent_invoices = [t.description for t in transactions if t.type in ["expense", "invoice", "receipt"]][:5]
    
    prompt = f"""
    You are a tax advisor for Spanish autónomos. User asks: "{request.query}"
    
    User profile: {current_user.full_name}, region: {current_user.region}, family_status: {current_user.family_status}.
    Financials (last 6 months): Income {total_income}€, Expenses {total_expenses}€.
    
    Respond in JSON only:
    {{
      "answer": "Direct answer",
      "advice": "General advice",
      "deductions": {{"IRPF": 21, "IVA": 10}},
      "estimated_tax": 5000.0,
      "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
      "confidence": 0.95
    }}
    """
    
    response = client.chat.completions.create(
        model="grok-3",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=400
    )
    
    advice_json = response.choices[0].message.content.strip()
    try:
        parsed = json.loads(advice_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid AI response")
    
    return GeneralAdviceResponse(**parsed)