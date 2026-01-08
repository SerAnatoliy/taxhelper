from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
import tempfile
import io
import os
import base64
import logging

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_RIGHT, TA_CENTER

from database import get_db, User, Invoice, InvoiceItem, InvoiceVerifactuEvent
from auth import get_current_user

from verifactu import (
    VerifactuService,
    VerifactuRecordData,
    VerifactuRecordType,
    VerifactuEventType,
)
from verifactu_events import VerifactuEventService

try:
    from docstrange import DocumentExtractor
    HAS_DOCSTRANGE = True
except ImportError:
    HAS_DOCSTRANGE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/invoices", tags=["invoices"])


class InvoiceItemCreate(BaseModel):
    description: str
    quantity: float
    unit_price: float


class InvoiceItemResponse(BaseModel):
    id: int
    description: str
    quantity: float
    unit_price: float
    amount: float


class InvoiceCreate(BaseModel):
    business_name: str
    registration_number: Optional[str] = None
    business_address: Optional[str] = None
    city_region: Optional[str] = None
    representative: Optional[str] = None
    department: Optional[str] = None
    
    client_name: str
    client_address: Optional[str] = None
    client_contact: Optional[str] = None
    reference_number: Optional[str] = None

    invoice_number: str
    invoice_date: datetime
    
    service_description: Optional[str] = None
    payment_terms: Optional[str] = None
    
    items: List[InvoiceItemCreate]


class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    invoice_date: datetime
    business_name: str
    client_name: str
    total: float
    status: str
    created_at: datetime
    verifactu_hash: Optional[str] = None
    verifactu_submitted: bool = False
    
    class Config:
        from_attributes = True


class InvoiceDetailResponse(BaseModel):
    id: int
    business_name: str
    registration_number: Optional[str]
    business_address: Optional[str]
    city_region: Optional[str]
    representative: Optional[str]
    department: Optional[str]
    client_name: str
    client_address: Optional[str]
    client_contact: Optional[str]
    reference_number: Optional[str]
    invoice_number: str
    invoice_date: datetime
    service_description: Optional[str]
    payment_terms: Optional[str]
    total: float
    status: str
    items: List[InvoiceItemResponse]
    created_at: datetime
    verifactu_hash: Optional[str] = None
    verifactu_submitted: bool = False
    qr_code_base64: Optional[str] = None
    verifactu_legal_text: Optional[str] = None
    
    class Config:
        from_attributes = True

class VerifactuEventResponse(BaseModel):
    id: int
    event_type: str
    event_code: Optional[str]
    description: Optional[str]
    hash_before: Optional[str]
    hash_after: str
    created_at: datetime
    ip_address: Optional[str]


class UploadIncomeResponse(BaseModel):
    invoice_id: int
    amount: float
    description: str
    date: str
    client_name: str

def get_client_info(request: Request) -> tuple[Optional[str], Optional[str]]:
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "")[:500]
    return client_ip, user_agent

@router.post("/", response_model=InvoiceResponse)
async def create_invoice(
    invoice_data: InvoiceCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Invoice).filter(
        Invoice.user_id == current_user.id,
        Invoice.invoice_number == invoice_data.invoice_number
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Invoice number {invoice_data.invoice_number} already exists"
        )
    
    total = sum(item.quantity * item.unit_price for item in invoice_data.items)
    vat_amount = total * Decimal("0.21")
    
    last_invoice = db.query(Invoice).filter(
        Invoice.user_id == current_user.id,
        Invoice.verifactu_hash.isnot(None)
    ).order_by(desc(Invoice.created_at)).first()
    
    previous_hash = last_invoice.verifactu_hash if last_invoice else None
    
    record_data = VerifactuRecordData(
        nif=current_user.nif or current_user.email,
        document_number=invoice_data.invoice_number,
        document_date=invoice_data.invoice_date.date() if isinstance(invoice_data.invoice_date, datetime) else invoice_data.invoice_date,
        total_amount=Decimal(str(total)),
        vat_amount=vat_amount,
        vat_rate=21.0,
        record_type=VerifactuRecordType.INVOICE_ISSUED,
        recipient_name=invoice_data.client_name,
    )
    
    hash_result = VerifactuService.generate_hash(record_data, previous_hash)
    qr_result = VerifactuService.generate_qr_code(record_data, hash_result.hash_value)
    
    db_invoice = Invoice(
        user_id=current_user.id,
        business_name=invoice_data.business_name,
        registration_number=invoice_data.registration_number,
        business_address=invoice_data.business_address,
        city_region=invoice_data.city_region,
        representative=invoice_data.representative,
        department=invoice_data.department,
        client_name=invoice_data.client_name,
        client_address=invoice_data.client_address,
        client_contact=invoice_data.client_contact,
        reference_number=invoice_data.reference_number,
        invoice_number=invoice_data.invoice_number,
        invoice_date=invoice_data.invoice_date,
        service_description=invoice_data.service_description,
        payment_terms=invoice_data.payment_terms,
        total=total,
        status="created",
        verifactu_hash=hash_result.hash_value,
        previous_hash=previous_hash,
        qr_code_data=qr_result.qr_base64,
        verifactu_timestamp=hash_result.timestamp,
        verifactu_record_type=VerifactuRecordType.INVOICE_ISSUED.value,
        verifactu_submitted=False,
    )
    
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    
    for item in invoice_data.items:
        db_item = InvoiceItem(
            invoice_id=db_invoice.id,
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price,
            amount=item.quantity * item.unit_price
        )
        db.add(db_item)
    
    client_ip, user_agent = get_client_info(request)
    
    VerifactuEventService.log_invoice_event(
        db=db,
        user_id=current_user.id,
        invoice_id=db_invoice.id,
        event_type=VerifactuEventType.INVOICE_CREATED,
        hash_after=hash_result.hash_value,
        hash_before=previous_hash,
        ip_address=client_ip,
        user_agent=user_agent,
        event_data={
            "invoice_number": invoice_data.invoice_number,
            "total_amount": str(total),
            "vat_amount": str(vat_amount),
            "client_name": invoice_data.client_name,
            "qr_generated": True,
            "verification_url": qr_result.verification_url
        }
    )
    
    VerifactuEventService.log_invoice_event(
        db=db,
        user_id=current_user.id,
        invoice_id=db_invoice.id,
        event_type=VerifactuEventType.HASH_GENERATED,
        hash_after=hash_result.hash_value,
        hash_before=previous_hash,
        ip_address=client_ip,
        user_agent=user_agent,
        event_data={
            "hash_input": hash_result.hash_input,
            "algorithm": "SHA-256"
        }
    )
    
    db.commit()
    
    logger.info(f"Invoice {db_invoice.invoice_number} created with VeriFactu hash: {hash_result.hash_value[:16]}...")
    
    return db_invoice


@router.get("/", response_model=List[InvoiceResponse])
async def get_invoices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoices = db.query(Invoice).filter(
        Invoice.user_id == current_user.id
    ).order_by(desc(Invoice.created_at)).all()
    
    return invoices


@router.get("/{invoice_id}", response_model=InvoiceDetailResponse)
async def get_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice_id).all()
    
    return InvoiceDetailResponse(
        id=invoice.id,
        business_name=invoice.business_name,
        registration_number=invoice.registration_number,
        business_address=invoice.business_address,
        city_region=invoice.city_region,
        representative=invoice.representative,
        department=invoice.department,
        client_name=invoice.client_name,
        client_address=invoice.client_address,
        client_contact=invoice.client_contact,
        reference_number=invoice.reference_number,
        invoice_number=invoice.invoice_number,
        invoice_date=invoice.invoice_date,
        service_description=invoice.service_description,
        payment_terms=invoice.payment_terms,
        total=float(invoice.total),
        status=invoice.status,
        items=[
            InvoiceItemResponse(
                id=item.id,
                description=item.description,
                quantity=float(item.quantity),
                unit_price=float(item.unit_price),
                amount=float(item.amount)
            )
            for item in items
        ],
        created_at=invoice.created_at,
        verifactu_hash=invoice.verifactu_hash,
        verifactu_submitted=invoice.verifactu_submitted,
        qr_code_base64=invoice.qr_code_data,
        verifactu_legal_text=VerifactuService.get_legal_text("es")
    )


@router.delete("/{invoice_id}")
async def delete_invoice(
    invoice_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    client_ip, user_agent = get_client_info(request)
    
    VerifactuEventService.log_invoice_event(
        db=db,
        user_id=current_user.id,
        invoice_id=invoice.id,
        event_type=VerifactuEventType.INVOICE_CANCELLED,
        hash_after=invoice.verifactu_hash,
        hash_before=invoice.verifactu_hash,
        ip_address=client_ip,
        user_agent=user_agent,
        event_data={
            "invoice_number": invoice.invoice_number,
            "total_amount": str(invoice.total),
            "reason": "User requested deletion"
        }
    )
    
    db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice_id).delete()
    
    db.delete(invoice)
    db.commit()
    
    logger.info(f"Invoice {invoice.invoice_number} cancelled and deleted")
    
    return {"message": "Invoice deleted successfully"}


@router.get("/{invoice_id}/verifactu-events", response_model=List[VerifactuEventResponse])
async def get_invoice_verifactu_events(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    events = db.query(InvoiceVerifactuEvent).filter(
        InvoiceVerifactuEvent.invoice_id == invoice_id
    ).order_by(InvoiceVerifactuEvent.created_at.asc()).all()
    
    return [
        VerifactuEventResponse(
            id=e.id,
            event_type=e.event_type,
            event_code=e.event_code,
            description=e.description,
            hash_before=e.hash_before,
            hash_after=e.hash_after,
            created_at=e.created_at,
            ip_address=e.ip_address,
        )
        for e in events
    ]

@router.get("/{invoice_id}/pdf")
async def download_invoice_pdf(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice_id).all()
    
    pdf_buffer = generate_invoice_pdf(invoice, items)
    
    filename = f"invoice_{invoice.invoice_number}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

def generate_invoice_pdf(invoice, items):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20*mm, bottomMargin=20*mm)
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=24, spaceAfter=12)
    header_style = ParagraphStyle('Header', parent=styles['Normal'], fontSize=12, spaceAfter=6)
    small_style = ParagraphStyle('Small', parent=styles['Normal'], fontSize=9)
    verifactu_style = ParagraphStyle('Verifactu', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#02B0C2'))
    verifactu_legal_style = ParagraphStyle('VerifactuLegal', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#666666'))
    
    elements = []
    
    elements.append(Paragraph(invoice.business_name, title_style))
    elements.append(Paragraph(f"Invoice #{invoice.invoice_number}", header_style))
    elements.append(Paragraph(f"Date: {invoice.invoice_date.strftime('%d/%m/%Y')}", small_style))
    elements.append(Spacer(1, 20))
    
    elements.append(Paragraph(f"<b>Client:</b> {invoice.client_name}", small_style))
    if invoice.client_address:
        elements.append(Paragraph(f"Address: {invoice.client_address}", small_style))
    elements.append(Spacer(1, 20))
    
    table_data = [['Description', 'Qty', 'Unit Price', 'Amount']]
    for item in items:
        table_data.append([
            item.description,
            f"{item.quantity:.2f}",
            f"€{item.unit_price:.2f}",
            f"€{item.amount:.2f}"
        ])
    
    subtotal = sum(float(item.amount) for item in items)
    vat = subtotal * 0.21
    total = subtotal + vat
    
    table_data.append(['', '', 'Subtotal:', f"€{subtotal:.2f}"])
    table_data.append(['', '', 'IVA (21%):', f"€{vat:.2f}"])
    table_data.append(['', '', 'TOTAL:', f"€{total:.2f}"])
    
    table = Table(table_data, colWidths=[90*mm, 20*mm, 30*mm, 30*mm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#02B0C2')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -4), 1, colors.black),
        ('FONTNAME', (2, -3), (3, -1), 'Helvetica-Bold'),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 20))
    
    if hasattr(invoice, 'qr_code_data') and invoice.qr_code_data:
        elements.append(Spacer(1, 20))
        
        verifactu_divider = Table([['']], colWidths=[170*mm])
        verifactu_divider.setStyle(TableStyle([
            ('LINEABOVE', (0, 0), (-1, -1), 1, colors.HexColor('#02B0C2')),
        ]))
        elements.append(verifactu_divider)
        elements.append(Spacer(1, 10))
        
        try:
            qr_image_data = base64.b64decode(invoice.qr_code_data)
            qr_buffer = io.BytesIO(qr_image_data)
            qr_image = Image(qr_buffer, width=25*mm, height=25*mm)
            
            verifactu_badge = Paragraph("<b>VERI*FACTU</b>", verifactu_style)
            verifactu_text = Paragraph(VerifactuService.get_legal_text("es"), verifactu_legal_style)
            
            hash_display = ""
            if hasattr(invoice, 'verifactu_hash') and invoice.verifactu_hash:
                hash_display = f"Huella: {invoice.verifactu_hash[:16]}..."
            
            hash_text = Paragraph(hash_display, verifactu_legal_style)
            
            verifactu_content = Table([
                [qr_image, Table([[verifactu_badge], [verifactu_text], [hash_text]], colWidths=[140*mm])]
            ], colWidths=[30*mm, 140*mm])
            
            verifactu_content.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                ('LEFTPADDING', (1, 0), (1, 0), 10),
            ]))
            
            verifactu_box = Table([[verifactu_content]], colWidths=[170*mm])
            verifactu_box.setStyle(TableStyle([
                ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#02B0C2')),
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0fafb')),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ]))
            
            elements.append(verifactu_box)
            
        except Exception as e:
            logger.error(f"Error generating VeriFactu section: {e}")
            elements.append(Paragraph(
                f"<b>VERI*FACTU Compliant</b> - {VerifactuService.get_legal_text('es')}",
                verifactu_style
            ))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer

@router.post("/upload", response_model=List[UploadIncomeResponse])
async def upload_income_documents(
    files: List[UploadFile] = File(...),
    request: Request = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = []
    
    for file in files:
        if not file.content_type.startswith('image/') and file.content_type != 'application/pdf':
            raise HTTPException(status_code=400, detail="Only images or PDF allowed")
        
        import uuid
        
        invoice_number = f"INC-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
        
        invoice = Invoice(
            user_id=current_user.id,
            business_name=current_user.full_name or "Business",
            client_name="Uploaded Document",
            invoice_number=invoice_number,
            invoice_date=datetime.now(),
            total=Decimal("0.00"),
            status="draft",
        )
        
        db.add(invoice)
        db.commit()
        db.refresh(invoice)
        
        results.append(UploadIncomeResponse(
            invoice_id=invoice.id,
            amount=0.0,
            description=f"Uploaded: {file.filename}",
            date=datetime.now().isoformat(),
            client_name="Pending extraction"
        ))
    
    return results