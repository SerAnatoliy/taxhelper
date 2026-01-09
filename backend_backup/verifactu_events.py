from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, func
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from decimal import Decimal
from enum import Enum
import hashlib
import json
import logging

from database import (
    get_db, User, Invoice, InvoiceVerifactuEvent, 
    VerifactuEvent, Report, ReportRecord
)
from auth import get_current_user
from verifactu import VerifactuEventType

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/verifactu/events", tags=["verifactu-events"])

class EventLogCreate(BaseModel):
    event_type: str
    event_code: Optional[str] = None
    description: Optional[str] = None
    invoice_id: Optional[int] = None
    report_id: Optional[int] = None
    hash_before: Optional[str] = None
    hash_after: str
    event_data: Optional[Dict[str, Any]] = None


class EventLogResponse(BaseModel):
    id: int
    event_type: str
    event_code: Optional[str]
    description: Optional[str]
    invoice_id: Optional[int]
    invoice_number: Optional[str]
    report_id: Optional[int]
    hash_before: Optional[str]
    hash_after: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime
    event_data: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True


class EventListResponse(BaseModel):
    events: List[EventLogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class EventSummary(BaseModel):
    total_events: int
    events_by_type: Dict[str, int]
    first_event_date: Optional[datetime]
    last_event_date: Optional[datetime]
    chain_integrity: bool
    chain_integrity_details: Optional[str]


class EventExportResponse(BaseModel):
    export_date: datetime
    user_nif: str
    total_records: int
    date_from: date
    date_to: date
    events: List[Dict[str, Any]]
    hash_chain_valid: bool
    signature: str

class VerifactuEventService:
    EVENT_CODES = {
        VerifactuEventType.INVOICE_CREATED.value: "EVT001",
        VerifactuEventType.INVOICE_CANCELLED.value: "EVT002",
        VerifactuEventType.INVOICE_CORRECTED.value: "EVT003",
        VerifactuEventType.REPORT_CREATED.value: "EVT010",
        VerifactuEventType.REPORT_SUBMITTED.value: "EVT011",
        VerifactuEventType.HASH_GENERATED.value: "EVT020",
        VerifactuEventType.QR_GENERATED.value: "EVT021",
        VerifactuEventType.SYSTEM_ERROR.value: "EVT999",
    }
    
    EVENT_DESCRIPTIONS = {
        VerifactuEventType.INVOICE_CREATED.value: "Alta de factura en el sistema",
        VerifactuEventType.INVOICE_CANCELLED.value: "Anulación de factura",
        VerifactuEventType.INVOICE_CORRECTED.value: "Rectificación de factura",
        VerifactuEventType.REPORT_CREATED.value: "Creación de declaración",
        VerifactuEventType.REPORT_SUBMITTED.value: "Envío de declaración a AEAT",
        VerifactuEventType.HASH_GENERATED.value: "Generación de huella digital",
        VerifactuEventType.QR_GENERATED.value: "Generación de código QR",
        VerifactuEventType.SYSTEM_ERROR.value: "Error del sistema",
    }
    
    @staticmethod
    def log_invoice_event(
        db: Session,
        user_id: int,
        invoice_id: int,
        event_type: VerifactuEventType,
        hash_after: str,
        hash_before: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        event_data: Optional[Dict[str, Any]] = None,
        description: Optional[str] = None
    ) -> InvoiceVerifactuEvent:
        event_type_value = event_type.value if isinstance(event_type, VerifactuEventType) else event_type
        
        event = InvoiceVerifactuEvent(
            user_id=user_id,
            invoice_id=invoice_id,
            event_type=event_type_value,
            event_code=VerifactuEventService.EVENT_CODES.get(event_type_value),
            description=description or VerifactuEventService.EVENT_DESCRIPTIONS.get(event_type_value),
            hash_before=hash_before,
            hash_after=hash_after,
            ip_address=ip_address,
            user_agent=user_agent[:500] if user_agent else None,
            event_data=event_data or {}
        )
        
        db.add(event)
        db.commit()
        db.refresh(event)
        
        logger.info(f"VeriFactu event logged: {event_type_value} for invoice {invoice_id}")
        
        return event
    
    @staticmethod
    def log_report_event(
        db: Session,
        user_id: int,
        report_id: int,
        event_type: VerifactuEventType,
        hash_after: str,
        hash_before: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        event_data: Optional[Dict[str, Any]] = None
    ) -> VerifactuEvent:
        event_type_value = event_type.value if isinstance(event_type, VerifactuEventType) else event_type
        
        event = VerifactuEvent(
            user_id=user_id,
            report_id=report_id,
            event_type=event_type_value,
            event_code=VerifactuEventService.EVENT_CODES.get(event_type_value),
            description=VerifactuEventService.EVENT_DESCRIPTIONS.get(event_type_value),
            hash_before=hash_before,
            hash_after=hash_after,
            ip_address=ip_address,
            user_agent=user_agent[:255] if user_agent else None,
        )
        
        db.add(event)
        db.commit()
        db.refresh(event)
        
        logger.info(f"VeriFactu event logged: {event_type_value} for report {report_id}")
        
        return event
    
    @staticmethod
    def log_system_event(
        db: Session,
        user_id: int,
        event_type: VerifactuEventType,
        hash_after: str,
        record_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        description: Optional[str] = None
    ) -> VerifactuEvent:
        event_type_value = event_type.value if isinstance(event_type, VerifactuEventType) else event_type
        
        event = VerifactuEvent(
            user_id=user_id,
            event_type=event_type_value,
            event_code=VerifactuEventService.EVENT_CODES.get(event_type_value),
            description=description or VerifactuEventService.EVENT_DESCRIPTIONS.get(event_type_value),
            record_id=record_id,
            hash_after=hash_after,
            ip_address=ip_address,
        )
        
        db.add(event)
        db.commit()
        db.refresh(event)
        
        return event
    
    @staticmethod
    def verify_chain_integrity(
        db: Session,
        user_id: int,
        entity_type: str = "invoice"
    ) -> tuple[bool, Optional[str]]:
        if entity_type == "invoice":
            events = db.query(InvoiceVerifactuEvent).filter(
                InvoiceVerifactuEvent.user_id == user_id
            ).order_by(InvoiceVerifactuEvent.created_at.asc()).all()
        else:
            events = db.query(VerifactuEvent).filter(
                VerifactuEvent.user_id == user_id
            ).order_by(VerifactuEvent.created_at.asc()).all()
        
        if not events:
            return True, None
        
        chains = {}
        for event in events:
            key = getattr(event, 'invoice_id', None) or getattr(event, 'report_id', None) or 'system'
            if key not in chains:
                chains[key] = []
            chains[key].append(event)
        
        for entity_id, chain_events in chains.items():
            for i in range(1, len(chain_events)):
                prev_event = chain_events[i - 1]
                curr_event = chain_events[i]
                
                if curr_event.hash_before and curr_event.hash_before != prev_event.hash_after:
                    return False, f"Chain break at event {curr_event.id}: hash mismatch for entity {entity_id}"
        
        return True, None
    
    @staticmethod
    def get_events_for_export(
        db: Session,
        user_id: int,
        date_from: date,
        date_to: date
    ) -> List[Dict[str, Any]]:

        invoice_events = db.query(InvoiceVerifactuEvent).filter(
            and_(
                InvoiceVerifactuEvent.user_id == user_id,
                func.date(InvoiceVerifactuEvent.created_at) >= date_from,
                func.date(InvoiceVerifactuEvent.created_at) <= date_to
            )
        ).order_by(InvoiceVerifactuEvent.created_at.asc()).all()
        
        report_events = db.query(VerifactuEvent).filter(
            and_(
                VerifactuEvent.user_id == user_id,
                func.date(VerifactuEvent.created_at) >= date_from,
                func.date(VerifactuEvent.created_at) <= date_to
            )
        ).order_by(VerifactuEvent.created_at.asc()).all()
        
        export_records = []
        
        for event in invoice_events:
            invoice = db.query(Invoice).filter(Invoice.id == event.invoice_id).first()
            export_records.append({
                "registro_id": f"INV-EVT-{event.id}",
                "tipo_registro": "FACTURA",
                "tipo_evento": event.event_type,
                "codigo_evento": event.event_code,
                "descripcion": event.description,
                "numero_factura": invoice.invoice_number if invoice else None,
                "fecha_factura": invoice.invoice_date.isoformat() if invoice else None,
                "huella_anterior": event.hash_before,
                "huella_posterior": event.hash_after,
                "fecha_evento": event.created_at.isoformat(),
                "ip_origen": event.ip_address,
                "datos_adicionales": event.event_data
            })
        
        for event in report_events:
            export_records.append({
                "registro_id": f"REP-EVT-{event.id}",
                "tipo_registro": "DECLARACION",
                "tipo_evento": event.event_type,
                "codigo_evento": event.event_code,
                "descripcion": event.description,
                "report_id": event.report_id,
                "huella_anterior": event.hash_before,
                "huella_posterior": event.hash_after,
                "fecha_evento": event.created_at.isoformat(),
                "ip_origen": event.ip_address,
            })
        
        export_records.sort(key=lambda x: x["fecha_evento"])
        
        return export_records

@router.get("/invoice/{invoice_id}", response_model=List[EventLogResponse])
async def get_invoice_events(
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
    ).order_by(desc(InvoiceVerifactuEvent.created_at)).all()
    
    return [
        EventLogResponse(
            id=e.id,
            event_type=e.event_type,
            event_code=e.event_code,
            description=e.description,
            invoice_id=e.invoice_id,
            invoice_number=invoice.invoice_number,
            report_id=None,
            hash_before=e.hash_before,
            hash_after=e.hash_after,
            ip_address=e.ip_address,
            user_agent=e.user_agent,
            created_at=e.created_at,
            event_data=e.event_data
        )
        for e in events
    ]


@router.get("/list", response_model=EventListResponse)
async def list_events(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    event_type: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(InvoiceVerifactuEvent).filter(
        InvoiceVerifactuEvent.user_id == current_user.id
    )
    
    if event_type:
        query = query.filter(InvoiceVerifactuEvent.event_type == event_type)
    
    if date_from:
        query = query.filter(func.date(InvoiceVerifactuEvent.created_at) >= date_from)
    
    if date_to:
        query = query.filter(func.date(InvoiceVerifactuEvent.created_at) <= date_to)
    
    total = query.count()
    
    events = query.order_by(desc(InvoiceVerifactuEvent.created_at))\
        .offset((page - 1) * page_size)\
        .limit(page_size)\
        .all()
    
    invoice_ids = [e.invoice_id for e in events]
    invoices = {i.id: i.invoice_number for i in db.query(Invoice).filter(Invoice.id.in_(invoice_ids)).all()}
    
    return EventListResponse(
        events=[
            EventLogResponse(
                id=e.id,
                event_type=e.event_type,
                event_code=e.event_code,
                description=e.description,
                invoice_id=e.invoice_id,
                invoice_number=invoices.get(e.invoice_id),
                report_id=None,
                hash_before=e.hash_before,
                hash_after=e.hash_after,
                ip_address=e.ip_address,
                user_agent=e.user_agent,
                created_at=e.created_at,
                event_data=e.event_data
            )
            for e in events
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )


@router.get("/summary", response_model=EventSummary)
async def get_events_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    type_counts = db.query(
        InvoiceVerifactuEvent.event_type,
        func.count(InvoiceVerifactuEvent.id)
    ).filter(
        InvoiceVerifactuEvent.user_id == current_user.id
    ).group_by(InvoiceVerifactuEvent.event_type).all()
    
    events_by_type = {t: c for t, c in type_counts}
    total_events = sum(events_by_type.values())
    
    # Get date range
    first_event = db.query(InvoiceVerifactuEvent).filter(
        InvoiceVerifactuEvent.user_id == current_user.id
    ).order_by(InvoiceVerifactuEvent.created_at.asc()).first()
    
    last_event = db.query(InvoiceVerifactuEvent).filter(
        InvoiceVerifactuEvent.user_id == current_user.id
    ).order_by(InvoiceVerifactuEvent.created_at.desc()).first()
    
    is_valid, error_msg = VerifactuEventService.verify_chain_integrity(
        db, current_user.id, "invoice"
    )
    
    return EventSummary(
        total_events=total_events,
        events_by_type=events_by_type,
        first_event_date=first_event.created_at if first_event else None,
        last_event_date=last_event.created_at if last_event else None,
        chain_integrity=is_valid,
        chain_integrity_details=error_msg
    )


@router.get("/export", response_model=EventExportResponse)
async def export_events(
    date_from: date,
    date_to: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if date_to < date_from:
        raise HTTPException(status_code=400, detail="date_to must be after date_from")
    
    if (date_to - date_from).days > 365:
        raise HTTPException(status_code=400, detail="Export range cannot exceed 1 year")
    
    events = VerifactuEventService.get_events_for_export(
        db, current_user.id, date_from, date_to
    )
    
    is_valid, _ = VerifactuEventService.verify_chain_integrity(
        db, current_user.id, "invoice"
    )
    
    export_data = json.dumps({
        "user_nif": current_user.nif or current_user.email,
        "date_from": date_from.isoformat(),
        "date_to": date_to.isoformat(),
        "total_records": len(events),
        "export_timestamp": datetime.utcnow().isoformat()
    }, sort_keys=True)
    
    signature = hashlib.sha256(export_data.encode()).hexdigest()
    
    return EventExportResponse(
        export_date=datetime.utcnow(),
        user_nif=current_user.nif or current_user.email,
        total_records=len(events),
        date_from=date_from,
        date_to=date_to,
        events=events,
        hash_chain_valid=is_valid,
        signature=signature
    )


@router.get("/verify-integrity")
async def verify_integrity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoice_valid, invoice_error = VerifactuEventService.verify_chain_integrity(
        db, current_user.id, "invoice"
    )
    
    report_valid, report_error = VerifactuEventService.verify_chain_integrity(
        db, current_user.id, "report"
    )
    
    return {
        "invoice_chain": {
            "valid": invoice_valid,
            "error": invoice_error
        },
        "report_chain": {
            "valid": report_valid,
            "error": report_error
        },
        "overall_valid": invoice_valid and report_valid,
        "verified_at": datetime.utcnow().isoformat()
    }


@router.get("/types")
async def get_event_types():
    return {
        "event_types": [
            {
                "type": event_type.value,
                "code": VerifactuEventService.EVENT_CODES.get(event_type.value),
                "description": VerifactuEventService.EVENT_DESCRIPTIONS.get(event_type.value)
            }
            for event_type in VerifactuEventType
        ]
    }