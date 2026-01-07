from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
import tempfile
import io
import os
import base64

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_RIGHT, TA_CENTER

from database import get_db, User, Invoice, InvoiceItem
from auth import get_current_user

from verifactu import (
    VerifactuService,
    VerifactuRecordData,
    VerifactuRecordType,
    VerifactuEventType,
)

try:
    from docstrange import DocumentExtractor
    HAS_DOCSTRANGE = True
except ImportError:
    HAS_DOCSTRANGE = False

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


@router.post("/upload", response_model=List[UploadIncomeResponse])
async def upload_income_documents(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = []
    
    for file in files:
        if not file.content_type.startswith('image/') and file.content_type != 'application/pdf':
            raise HTTPException(status_code=400, detail="Only images or PDF allowed")
        
        import uuid
        from datetime import datetime
        
        invoice_number = f"INC-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
        
        if HAS_DOCSTRANGE:
            file_content = await file.read()
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
                temp_path = temp_file.name
                temp_file.write(file_content)
            
            try:
                extractor = DocumentExtractor(api_key=os.getenv("DOCSTRANGE_API_KEY"))
                result = extractor.extract(temp_path)
                
                fields = result.extract_data(
                    specified_fields=[
                        "total_amount", "due_date", "vendor_name", "invoice_number",
                        "client_name", "description"
                    ]
                )
                
                content = fields.get('extracted_fields', {}).get('content', {})
                
                amount_str = str(content.get('total_amount', '0.0'))
                amount = float(amount_str.replace(',', '.')) if amount_str != '0.0' else 0.0
                
                date_str = str(content.get('due_date', ''))
                invoice_date = datetime.fromisoformat(date_str) if date_str else datetime.now()
                
                client_name = str(content.get('client_name', '')) or str(content.get('vendor_name', '')) or 'Unknown Client'
                description = str(content.get('description', '')) or f"Uploaded: {file.filename}"
                
                parsed_invoice_num = content.get('invoice_number')
                if parsed_invoice_num:
                    invoice_number = str(parsed_invoice_num)
                
            finally:
                os.unlink(temp_path)
        else:
            amount = 0.0
            invoice_date = datetime.now()
            client_name = "Unknown Client"
            description = f"Uploaded: {file.filename}"
        
        existing = db.query(Invoice).filter(
            Invoice.user_id == current_user.id,
            Invoice.invoice_number == invoice_number
        ).first()
        
        if existing:
            invoice_number = f"{invoice_number}-{str(uuid.uuid4())[:4].upper()}"
        
        db_invoice = Invoice(
            user_id=current_user.id,
            business_name=current_user.full_name or "My Business",
            client_name=client_name,
            invoice_number=invoice_number,
            invoice_date=invoice_date,
            service_description=description,
            total=amount,
            status="created"
        )
        
        db.add(db_invoice)
        db.commit()
        db.refresh(db_invoice)
        
        if amount > 0:
            db_item = InvoiceItem(
                invoice_id=db_invoice.id,
                description=description,
                quantity=1,
                unit_price=amount,
                amount=amount
            )
            db.add(db_item)
            db.commit()
        
        results.append(UploadIncomeResponse(
            invoice_id=db_invoice.id,
            amount=amount,
            description=description,
            date=invoice_date.isoformat(),
            client_name=client_name
        ))
    
    return results


def generate_invoice_pdf(invoice: Invoice, items: List[InvoiceItem]) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20*mm,
        leftMargin=20*mm,
        topMargin=20*mm,
        bottomMargin=25*mm  
    )
    
    styles = getSampleStyleSheet()
    elements = []
    
    # === STYLES ===
    title_style = ParagraphStyle(
        'InvoiceTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=colors.HexColor('#0162BB'),
        alignment=TA_RIGHT,
        spaceAfter=10
    )
    
    heading_style = ParagraphStyle(
        'HeadingStyle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#333333'),
        spaceAfter=5
    )
    
    normal_style = ParagraphStyle(
        'NormalStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#333333'),
        leading=14
    )
    
    small_style = ParagraphStyle(
        'SmallStyle',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#666666'),
        leading=12
    )
    
    # VERIFACTU badge style
    verifactu_style = ParagraphStyle(
        'VerifactuStyle',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#02B0C2'),
        leading=10,
        alignment=TA_CENTER
    )
    
    verifactu_legal_style = ParagraphStyle(
        'VerifactuLegalStyle',
        parent=styles['Normal'],
        fontSize=7,
        textColor=colors.HexColor('#666666'),
        leading=9,
        alignment=TA_CENTER
    )
    
    # === HEADER ===
    header_data = [
        [
            Paragraph(f"<b>{invoice.business_name}</b>", heading_style),
            Paragraph("INVOICE", title_style)
        ],
        [
            Paragraph(invoice.registration_number or '', small_style),
            Paragraph(f"#{invoice.invoice_number}", normal_style)
        ],
        [
            Paragraph(invoice.business_address or '', small_style),
            Paragraph(f"Date: {invoice.invoice_date.strftime('%d/%m/%Y')}", small_style)
        ],
        [
            Paragraph(invoice.city_region or '', small_style),
            Paragraph(f"Ref: {invoice.reference_number or '-'}", small_style)
        ],
    ]
    
    if invoice.representative:
        rep_text = f"Rep: {invoice.representative}"
        if invoice.department:
            rep_text += f" | {invoice.department}"
        header_data.append([Paragraph(rep_text, small_style), Paragraph('', small_style)])
    
    header_table = Table(header_data, colWidths=[100*mm, 70*mm])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 15))
    
    # === CLIENT INFO ===
    elements.append(Paragraph("<b>BILL TO:</b>", heading_style))
    elements.append(Paragraph(f"<b>{invoice.client_name}</b>", normal_style))
    if invoice.client_address:
        elements.append(Paragraph(invoice.client_address, small_style))
    if invoice.client_contact:
        elements.append(Paragraph(invoice.client_contact, small_style))
    elements.append(Spacer(1, 15))
    
    # === ITEMS TABLE ===
    items_data = [['Description', 'Qty', 'Unit Price', 'Amount']]
    for item in items:
        items_data.append([
            item.description,
            f"{float(item.quantity):.0f}" if float(item.quantity) == int(item.quantity) else f"{float(item.quantity):.2f}",
            f"€{float(item.unit_price):,.2f}",
            f"€{float(item.amount):,.2f}"
        ])
    
    items_table = Table(items_data, colWidths=[85*mm, 20*mm, 30*mm, 35*mm])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f5f5f5')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#333333')),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, colors.HexColor('#e5e7eb')),
        ('LINEBELOW', (0, -1), (-1, -1), 1, colors.HexColor('#e5e7eb')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 15))
    
    # === TOTAL ===
    total = sum(float(item.quantity) * float(item.unit_price) for item in items)
    total_data = [[f"Total: €{total:,.2f}"]]
    total_table = Table(total_data, colWidths=[60*mm])
    total_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f5f5f5')),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 14),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#333333')),
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 15),
        ('RIGHTPADDING', (0, 0), (-1, -1), 15),
    ]))
    
    total_wrapper = Table([[total_table]], colWidths=[170*mm])
    total_wrapper.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
    ]))
    elements.append(total_wrapper)
    elements.append(Spacer(1, 20))
    
    # === FOOTER DIVIDER ===
    footer_divider = Table([['']], colWidths=[170*mm])
    footer_divider.setStyle(TableStyle([
        ('LINEABOVE', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
    ]))
    elements.append(footer_divider)
    elements.append(Spacer(1, 10))
    
    # === SERVICE & PAYMENT INFO ===
    if invoice.service_description:
        elements.append(Paragraph(f"<b>Service:</b> {invoice.service_description}", small_style))
    if invoice.payment_terms:
        elements.append(Paragraph(f"<b>Payment Terms:</b> {invoice.payment_terms}", small_style))
    elements.append(Paragraph(
        f"Please reference invoice #{invoice.invoice_number} with your payment.",
        small_style
    ))
    
    # VERIFACTU SECTION
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
            
            verifactu_badge = Paragraph(
                "<b>VERI*FACTU</b>",
                verifactu_style
            )
            
            verifactu_text = Paragraph(
                VerifactuService.get_legal_text("es"),
                verifactu_legal_style
            )
            
            hash_display = ""
            if hasattr(invoice, 'verifactu_hash') and invoice.verifactu_hash:
                hash_display = f"Huella: {invoice.verifactu_hash[:16]}..."
            
            hash_text = Paragraph(hash_display, verifactu_legal_style)
            
            verifactu_content = Table([
                [
                    qr_image,
                    Table([
                        [verifactu_badge],
                        [verifactu_text],
                        [hash_text],
                    ], colWidths=[140*mm])
                ]
            ], colWidths=[30*mm, 140*mm])
            
            verifactu_content.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                ('ALIGN', (1, 0), (1, 0), 'LEFT'),
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
            elements.append(Paragraph(
                f"<b>VERI*FACTU Compliant</b> - {VerifactuService.get_legal_text('es')}",
                verifactu_style
            ))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer


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
    
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "")[:500]
    
    event = InvoiceVerifactuEvent(
        user_id=current_user.id,
        invoice_id=db_invoice.id,
        event_type=VerifactuEventType.INVOICE_CREATED.value,
        event_code="ALTA",
        description=f"Invoice {invoice_data.invoice_number} created",
        hash_before=None, 
        hash_after=hash_result.hash_value,
        ip_address=client_ip,
        user_agent=user_agent,
        event_data={
            "invoice_number": invoice_data.invoice_number,
            "total": float(total),
            "client_name": invoice_data.client_name,
            "previous_chain_hash": previous_hash,
        }
    )
    db.add(event)
    
    db.commit()
    
    return InvoiceResponse(
        id=db_invoice.id,
        invoice_number=db_invoice.invoice_number,
        invoice_date=db_invoice.invoice_date,
        business_name=db_invoice.business_name,
        client_name=db_invoice.client_name,
        total=float(db_invoice.total),
        status=db_invoice.status,
        created_at=db_invoice.created_at,
        verifactu_hash=db_invoice.verifactu_hash,
        verifactu_submitted=db_invoice.verifactu_submitted,
    )


@router.get("/", response_model=List[InvoiceResponse])
async def get_invoices(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoices = db.query(Invoice).filter(
        Invoice.user_id == current_user.id
    ).order_by(Invoice.created_at.desc()).offset(offset).limit(limit).all()
    
    return [
        InvoiceResponse(
            id=inv.id,
            invoice_number=inv.invoice_number,
            invoice_date=inv.invoice_date,
            business_name=inv.business_name,
            client_name=inv.client_name,
            total=float(inv.total),
            status=inv.status,
            created_at=inv.created_at,
            verifactu_hash=inv.verifactu_hash,
            verifactu_submitted=inv.verifactu_submitted or False,
        )
        for inv in invoices
    ]


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
        verifactu_submitted=invoice.verifactu_submitted or False,
        qr_code_base64=invoice.qr_code_data,
        verifactu_legal_text=VerifactuService.get_legal_text("es") if invoice.verifactu_hash else None,
    )


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


@router.delete("/{invoice_id}")
async def delete_invoice(
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
    
    db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice_id).delete()
    
    db.delete(invoice)
    db.commit()
    
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