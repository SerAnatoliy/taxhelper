from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from docstrange import DocumentExtractor  
import os
from datetime import datetime
import tempfile  
import re 

from database import get_db, User, Transaction
from auth import get_current_user

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
            
            
            fields = result.extract_data(
                specified_fields=[
                    "total_amount", "due_date", "vendor_name", "invoice_number",
                    "line_items", "description"
                ]
            )
            
            content = fields.get('extracted_fields', {}).get('content', {})
            metadata = fields.get('extracted_fields', {}).get('metadata', {})
            
            amount_str = content.get('total_amount', '0.0')
            amount = float(amount_str.replace(',', '.')) if amount_str != '0.0' else 0.0
            
            date_str = content.get('due_date', '')
            date = datetime.fromisoformat(date_str) if date_str else datetime.now()
            
            description = content.get('vendor_name', 'Unknown invoice')
            invoice_id = content.get('invoice_number', file.filename)
            
            line_items = content.get('line_items', [])
            if line_items:
                items_desc = ", ".join([item.get('description', '') for item in line_items[:4]])  # Top 4
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