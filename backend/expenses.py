from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from docstrange import DocumentExtractor  
import os
from datetime import datetime, timedelta
import tempfile  
import re 
from openai import OpenAI
import json
import logging

from database import get_db, User, Transaction
from auth import get_current_user

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/expenses", tags=["expenses"])

from dotenv import load_dotenv

load_dotenv()


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
    advice: str
    deductions: dict
    estimated_tax: float
    suggestions: List[str]
    confidence: float

@router.post("/upload", response_model=List[UploadResponse])
async def upload_invoices(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    extractor = DocumentExtractor(api_key=os.getenv("DOCSTRANGE_API_KEY"))  
    results = []
    
    for file in files:
        if not file.content_type.startswith('image/') and not file.content_type == 'application/pdf':
            raise HTTPException(status_code=400, detail="Only images or PDF allowed")
        
        
        file_content = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            temp_path = temp_file.name
            temp_file.write(file_content)
        
        try:
           
            result = extractor.extract(temp_path)
            full_text = str(result)
            print("DEBUG FULL_TEXT:", full_text)
            print("FULL_TEXT FOR ADVICE:", full_text)

            fields = result.extract_data(
                specified_fields=[
                    "total_amount", "due_date", "vendor_name", "invoice_number",
                    "line_items", "description"
                ]
            )
            print("DEBUG FIELDS:", fields)
            
            content = fields.get('extracted_fields', {}).get('content', {})
            metadata = fields.get('extracted_fields', {}).get('metadata', {})
            
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
                amount_match = re.search(r'Total\s*([\d,]+\.?\d*\s*€)', full_text, re.IGNORECASE | re.DOTALL)
                amount_str = amount_match.group(1).replace(',', '.') if amount_match else '0.0'
                amount = float(amount_str.replace(' €', '')) if amount_str != '0.0' else 0.0
                
                date_match = re.search(r'Date\s*(\d{1,2}/\d{1,2}/\d{4})', full_text, re.IGNORECASE | re.DOTALL)
                date_str = date_match.group(1) if date_match else datetime.now().isoformat()
                date = datetime.strptime(date_str, '%d/%m/%Y') if '/' in date_str else datetime.now()
                
                description_match = re.search(r'Bill To\s*\[([^\]]+)\]|Service/Product:\s*([^\n]+)', full_text, re.IGNORECASE | re.DOTALL)
                if description_match:
                    description = description_match.group(1) or description_match.group(2) or 'Unknown invoice'
                else:
                    description = 'Unknown invoice'
                
                invoice_match = re.search(r'Invoice Number\s*(\d+)', full_text, re.IGNORECASE | re.DOTALL)
                invoice_id = invoice_match.group(1) if invoice_match else file.filename
            
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

client = OpenAI(
    api_key=os.getenv("GROK_API_KEY"),
    base_url="https://api.x.ai/v1",
)

@router.post("/advice", response_model=AdviceResponse)
async def get_ai_advice(
    request: AdviceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prompt = f"""
    You are a tax advisor for Spanish autónomos. Analyze this invoice text and give advice for IRPF/IVA deductions.
    User: {current_user.full_name}, region: {request.user_region}, family_status: {request.user_family_status}, children: {current_user.num_children}.
    Invoice text: {request.full_text}
    
    Extract and advise:
    - Category: deductible/non-deductible (e.g., office supplies deductible).
    - Deductions: IRPF % (21-47%), IVA reclaim % (21% for services).
    - Estimated tax owed: calculate based on amount.
    - Advice: 2-3 sentences on how to report (e.g., "Deduct 21% IRPF for business expense in Q4 2025").
    
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
        raise HTTPException(status_code=500, detail="Grok response invalid JSON")
    
    return AdviceResponse(**parsed)

@router.post("/advice/general", response_model=GeneralAdviceResponse)
async def get_general_tax_advice(
    request: GeneralAdviceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
   
    from_date = datetime.now() - timedelta(days=180)
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= from_date
    ).all()
    
    
    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expenses = sum(t.amount for t in transactions if t.type == "expense")
    recent_invoices = [t.description for t in transactions if t.type == "expense"][:5]  
    
    logger.info(f"User stats: Income {total_income}€, Expenses {total_expenses}€, Recent: {recent_invoices}")
    
    prompt = f"""
    You are a tax advisor for Spanish autónomos. User asks: "{request.query}"
    
    User profile: {current_user.full_name}, region: {current_user.region}, family_status: {current_user.family_status}, children: {current_user.num_children}.
    
    Financials (last 6 months): Income {total_income}€, Expenses {total_expenses}€.
    Recent invoices: {', '.join(recent_invoices)}.
    
    Provide advice:
    - If user asks a question answer directly in one sentance.
    - Advice: 3-5 sentences on how to reduce IRPF/IVA based on query.
    - Deductions: % rates for IRPF/IVA based on region/income.
    - Estimated tax: Calculate owed (income - expenses * deduction_rate).
    - Suggestions: 3 bullet points (e.g., "Add more expenses for higher deduction").
    
    Respond in JSON only:
    {{
      "advice": "Detailed advice text",
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
    logger.info(f"Grok response for '{request.query}': {advice_json[:300]}...")
    
    try:
        parsed = json.loads(advice_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Grok response invalid JSON")
    
    return GeneralAdviceResponse(**parsed)