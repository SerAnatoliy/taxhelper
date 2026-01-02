from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, func
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, date, timedelta
from decimal import Decimal
from enum import Enum
import hashlib
import json
import uuid
import base64
import qrcode
from io import BytesIO
import logging

from database import get_db, User, Transaction, Report, ReportRecord
from auth import get_current_user

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["reports"])

class ReportType(str, Enum):
    IVA_Q1 = "IVA_Q1"
    IVA_Q2 = "IVA_Q2"
    IVA_Q3 = "IVA_Q3"
    IVA_Q4 = "IVA_Q4"
    IVA_ANNUAL = "IVA_ANNUAL"
    IRPF_Q1 = "IRPF_Q1"
    IRPF_Q2 = "IRPF_Q2"
    IRPF_Q3 = "IRPF_Q3"
    IRPF_Q4 = "IRPF_Q4"
    IRPF_ANNUAL = "IRPF_ANNUAL"

class ReportStatus(str, Enum):
    DRAFT = "Draft"
    PENDING = "Pending"
    SUBMITTED = "Submitted"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"

class Period(str, Enum):
    Q1_2025 = "Q1_2025"
    Q2_2025 = "Q2_2025"
    Q3_2025 = "Q3_2025"
    Q4_2025 = "Q4_2025"
    ANNUAL_2025 = "ANNUAL_2025"
    Q1_2026 = "Q1_2026"
    Q2_2026 = "Q2_2026"

class ReportCreateRequest(BaseModel):
    report_type: ReportType
    period: Period

class CalculationResult(BaseModel):
    income: Decimal = Field(default=Decimal("0.00"))
    expenses: Decimal = Field(default=Decimal("0.00"))
    taxable_base: Decimal = Field(default=Decimal("0.00"))
    vat_collected: Decimal = Field(default=Decimal("0.00"))
    vat_deductible: Decimal = Field(default=Decimal("0.00"))
    vat_due: Decimal = Field(default=Decimal("0.00"))
    irpf_rate: float = Field(default=0.19)
    irpf_retention: Decimal = Field(default=Decimal("0.00"))
    total_tax_due: Decimal = Field(default=Decimal("0.00"))
    deductions_applied: List[dict] = Field(default_factory=list)

class VerifactuRecord(BaseModel):
    record_id: str
    nif_issuer: str
    invoice_number: str
    invoice_date: date
    total_amount: Decimal
    vat_amount: Decimal
    vat_rate: float
    hash_chain: str  
    previous_hash: Optional[str] = None
    timestamp: datetime
    qr_code_data: str
    signature: Optional[str] = None

class ReportPreview(BaseModel):
    report_id: int
    report_type: ReportType
    period: Period
    status: ReportStatus
    calculation: CalculationResult
    verifactu_records: List[VerifactuRecord] = []
    qr_code_base64: Optional[str] = None
    created_at: datetime
    deadline: date
    legal_reference: str

class ReportResponse(BaseModel):
    id: int
    report_type: str
    period: str
    status: str
    deadline: date
    submit_date: Optional[date]
    total_tax: Decimal
    created_at: datetime

class ReportListResponse(BaseModel):
    reports: List[ReportResponse]
    total: int

class StepOneData(BaseModel):
    report_type: ReportType
    period: Period

class StepTwoData(BaseModel):
    report_id: int
    confirm_calculation: bool = True

class StepThreeData(BaseModel):
    report_id: int
    review_confirmed: bool = True

class SubmitRequest(BaseModel):
    report_id: int
    digital_signature: Optional[str] = None

class VerifactuService:
    
    @staticmethod
    def generate_hash(data: dict, previous_hash: Optional[str] = None) -> str:
        hash_input = "|".join([
            data.get("nif", ""),
            data.get("invoice_number", ""),
            data.get("invoice_date", ""),
            str(data.get("total_amount", 0)),
            str(data.get("vat_amount", 0)),
            previous_hash or "GENESIS"
        ])
        return hashlib.sha256(hash_input.encode('utf-8')).hexdigest()
    
    @staticmethod
    def generate_qr_code(report_data: dict) -> str:
        qr_url = f"https://www2.agenciatributaria.gob.es/wlpl/BURT-JDIT/VerificacionFactura"
        qr_params = {
            "nif": report_data.get("nif", ""),
            "num": report_data.get("invoice_number", ""),
            "fecha": report_data.get("date", ""),
            "importe": str(report_data.get("total", 0)),
            "huella": report_data.get("hash", "")[:12]  
        }
        qr_content = f"{qr_url}?{'&'.join(f'{k}={v}' for k, v in qr_params.items())}"
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(qr_content)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    @staticmethod
    def create_xml_record(record: VerifactuRecord) -> str:
        xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<sif:SuministroInformacion xmlns:sif="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SusFactura.xsd">
    <sif:Cabecera>
        <sif:ObligadoEmision>
            <sif:NombreRazon>{record.nif_issuer}</sif:NombreRazon>
            <sif:NIF>{record.nif_issuer}</sif:NIF>
        </sif:ObligadoEmision>
    </sif:Cabecera>
    <sif:RegistroFactura>
        <sif:IDFactura>
            <sif:IDEmisorFactura>{record.nif_issuer}</sif:IDEmisorFactura>
            <sif:NumSerieFactura>{record.invoice_number}</sif:NumSerieFactura>
            <sif:FechaExpedicionFactura>{record.invoice_date.isoformat()}</sif:FechaExpedicionFactura>
        </sif:IDFactura>
        <sif:ImporteTotal>{record.total_amount}</sif:ImporteTotal>
        <sif:Huella>{record.hash_chain}</sif:Huella>
        <sif:HuellaAnterior>{record.previous_hash or 'GENESIS'}</sif:HuellaAnterior>
        <sif:FechaHoraHusoGenRegistro>{record.timestamp.isoformat()}</sif:FechaHoraHusoGenRegistro>
    </sif:RegistroFactura>
</sif:SuministroInformacion>"""
        return xml


def get_period_dates(period: Period) -> tuple[date, date]:
    year = int(period.value.split("_")[-1])
    if "Q1" in period.value:
        return date(year, 1, 1), date(year, 3, 31)
    elif "Q2" in period.value:
        return date(year, 4, 1), date(year, 6, 30)
    elif "Q3" in period.value:
        return date(year, 7, 1), date(year, 9, 30)
    elif "Q4" in period.value:
        return date(year, 10, 1), date(year, 12, 31)
    else:  # Annual
        return date(year, 1, 1), date(year, 12, 31)

def get_deadline(report_type: ReportType, period: Period) -> date:
    _, end_date = get_period_dates(period)
    
    if "IVA" in report_type.value or "IRPF" in report_type.value:
        if "ANNUAL" in report_type.value:
            return date(end_date.year + 1, 1, 30)
        else:
            return date(end_date.year, end_date.month + 1, 20) if end_date.month < 12 else date(end_date.year + 1, 1, 20)
    
    return end_date + timedelta(days=20)

def get_legal_reference(report_type: ReportType) -> str:
    refs = {
        "IVA": "Art. 29 LIVA - Ley 37/1992 del IVA",
        "IRPF": "Art. 109 LIRPF - Ley 35/2006 del IRPF"
    }
    key = "IVA" if "IVA" in report_type.value else "IRPF"
    return refs.get(key, "Real Decreto 1007/2023 - VerifactU")

def calculate_irpf_rate(user: User, income: Decimal) -> float:
    base_rate = 0.07 if hasattr(user, 'registration_date') and \
        (datetime.now().date() - user.registration_date).days < 730 else 0.15
    
    if user.family_status == "married_joint":
        base_rate *= 0.95
    
    regional_adjustments = {
        "Madrid": -0.005,
        "Cataluña": 0.01,
        "Andalucía": 0.0,
        "País Vasco": -0.02,  
        "Navarra": -0.02,    
    }
    
    adjustment = regional_adjustments.get(user.region, 0.0)
    final_rate = max(0.07, min(0.21, base_rate + adjustment))
    
    return final_rate

@router.get("/list", response_model=ReportListResponse)
async def list_reports(
    skip: int = 0,
    limit: int = 10,
    status: Optional[ReportStatus] = None,
    report_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Report).filter(Report.user_id == current_user.id)
    
    if status:
        query = query.filter(Report.status == status.value)
    if report_type:
        query = query.filter(Report.report_type.contains(report_type))
    
    total = query.count()
    reports = query.order_by(desc(Report.created_at)).offset(skip).limit(limit).all()
    
    return ReportListResponse(
        reports=[ReportResponse(
            id=r.id,
            report_type=r.report_type,
            period=r.period,
            status=r.status,
            deadline=r.deadline,
            submit_date=r.submit_date,
            total_tax=r.total_tax or Decimal("0.00"),
            created_at=r.created_at
        ) for r in reports],
        total=total
    )

@router.post("/wizard/step1", response_model=dict)
async def wizard_step_one(
    data: StepOneData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Report).filter(
        Report.user_id == current_user.id,
        Report.report_type == data.report_type.value,
        Report.period == data.period.value,
        Report.status != ReportStatus.REJECTED.value
    ).first()
    
    if existing and existing.status == ReportStatus.SUBMITTED.value:
        raise HTTPException(
            status_code=400,
            detail=f"Report for {data.period.value} already submitted"
        )
    
    if existing:
        report = existing
        report.status = ReportStatus.DRAFT.value
    else:
        report = Report(
            user_id=current_user.id,
            report_type=data.report_type.value,
            period=data.period.value,
            status=ReportStatus.DRAFT.value,
            deadline=get_deadline(data.report_type, data.period),
            created_at=datetime.utcnow()
        )
        db.add(report)
    
    db.commit()
    db.refresh(report)
    
    return {
        "report_id": report.id,
        "report_type": report.report_type,
        "period": report.period,
        "deadline": report.deadline.isoformat(),
        "next_step": 2
    }

@router.post("/wizard/step2", response_model=CalculationResult)
async def wizard_step_two(
    data: StepTwoData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Step 2: Review tax calculation"""
    report = db.query(Report).filter(
        Report.id == data.report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    start_date, end_date = get_period_dates(Period(report.period))
    
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).all()
    
    income = sum(Decimal(str(t.amount)) for t in transactions if t.type == "income")
    expenses = sum(Decimal(str(t.amount)) for t in transactions if t.type in ["expense", "invoice", "receipt"])
    
    vat_collected = income * Decimal("0.21")
    vat_deductible = expenses * Decimal("0.21")
    vat_due = vat_collected - vat_deductible
    
    taxable_base = income - expenses
    irpf_rate = calculate_irpf_rate(current_user, income)
    irpf_retention = taxable_base * Decimal(str(irpf_rate))
    
    if "IVA" in report.report_type:
        total_tax_due = max(Decimal("0.00"), vat_due)
    else:
        total_tax_due = max(Decimal("0.00"), irpf_retention)
    
    deductions = []
    if current_user.num_children and current_user.num_children > 0:
        child_deduction = Decimal(str(current_user.num_children)) * Decimal("1200")
        deductions.append({
            "type": "family",
            "description": f"Child deduction ({current_user.num_children} children)",
            "amount": float(child_deduction),
            "legal_ref": "Art. 58 LIRPF"
        })
    
    report.total_tax = total_tax_due
    report.calculation_data = json.dumps({
        "income": str(income),
        "expenses": str(expenses),
        "vat_collected": str(vat_collected),
        "vat_deductible": str(vat_deductible),
        "irpf_rate": irpf_rate
    })
    db.commit()
    
    return CalculationResult(
        income=income,
        expenses=expenses,
        taxable_base=taxable_base,
        vat_collected=vat_collected,
        vat_deductible=vat_deductible,
        vat_due=vat_due,
        irpf_rate=irpf_rate,
        irpf_retention=irpf_retention,
        total_tax_due=total_tax_due,
        deductions_applied=deductions
    )

@router.post("/wizard/step3", response_model=ReportPreview)
async def wizard_step_three(
    data: StepThreeData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Step 3: Report preview with VerifactU data"""
    report = db.query(Report).filter(
        Report.id == data.report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    calc_data = json.loads(report.calculation_data) if report.calculation_data else {}
    
    verifactu_service = VerifactuService()
    
    last_record = db.query(ReportRecord).filter(
        ReportRecord.user_id == current_user.id
    ).order_by(desc(ReportRecord.created_at)).first()
    
    previous_hash = last_record.hash_chain if last_record else None
    
    hash_data = {
        "nif": current_user.nif or current_user.email,
        "invoice_number": f"REP-{report.id}-{report.period}",
        "invoice_date": datetime.now().date().isoformat(),
        "total_amount": float(report.total_tax or 0),
        "vat_amount": float(calc_data.get("vat_collected", 0))
    }
    
    current_hash = verifactu_service.generate_hash(hash_data, previous_hash)
    
    qr_data = {
        "nif": current_user.nif or "PENDING",
        "invoice_number": f"REP-{report.id}",
        "date": datetime.now().date().isoformat(),
        "total": float(report.total_tax or 0),
        "hash": current_hash
    }
    qr_base64 = verifactu_service.generate_qr_code(qr_data)
    
    verifactu_record = VerifactuRecord(
        record_id=str(uuid.uuid4()),
        nif_issuer=current_user.nif or "PENDING",
        invoice_number=f"REP-{report.id}-{report.period}",
        invoice_date=datetime.now().date(),
        total_amount=report.total_tax or Decimal("0.00"),
        vat_amount=Decimal(calc_data.get("vat_collected", "0")),
        vat_rate=21.0,
        hash_chain=current_hash,
        previous_hash=previous_hash,
        timestamp=datetime.utcnow(),
        qr_code_data=qr_base64
    )
    
    report.verifactu_hash = current_hash
    report.status = ReportStatus.PENDING.value
    db.commit()
    
    calculation = CalculationResult(
        income=Decimal(calc_data.get("income", "0")),
        expenses=Decimal(calc_data.get("expenses", "0")),
        vat_collected=Decimal(calc_data.get("vat_collected", "0")),
        vat_deductible=Decimal(calc_data.get("vat_deductible", "0")),
        irpf_rate=calc_data.get("irpf_rate", 0.19),
        total_tax_due=report.total_tax or Decimal("0.00")
    )
    
    return ReportPreview(
        report_id=report.id,
        report_type=ReportType(report.report_type),
        period=Period(report.period),
        status=ReportStatus(report.status),
        calculation=calculation,
        verifactu_records=[verifactu_record],
        qr_code_base64=qr_base64,
        created_at=report.created_at,
        deadline=report.deadline,
        legal_reference=get_legal_reference(ReportType(report.report_type))
    )

@router.post("/submit")
async def submit_report(
    data: SubmitRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(
        Report.id == data.report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.status == ReportStatus.SUBMITTED.value:
        raise HTTPException(status_code=400, detail="Report already submitted")
    
    verifactu_service = VerifactuService()
    calc_data = json.loads(report.calculation_data) if report.calculation_data else {}
    
    record = VerifactuRecord(
        record_id=str(uuid.uuid4()),
        nif_issuer=current_user.nif or "PENDING",
        invoice_number=f"REP-{report.id}-{report.period}",
        invoice_date=datetime.now().date(),
        total_amount=report.total_tax or Decimal("0.00"),
        vat_amount=Decimal(calc_data.get("vat_collected", "0")),
        vat_rate=21.0,
        hash_chain=report.verifactu_hash or "PENDING",
        previous_hash=None,
        timestamp=datetime.utcnow(),
        qr_code_data=""
    )
    
    xml_record = verifactu_service.create_xml_record(record)
    
    db_record = ReportRecord(
        user_id=current_user.id,
        report_id=report.id,
        record_type="submission",
        hash_chain=report.verifactu_hash,
        xml_content=xml_record,
        created_at=datetime.utcnow()
    )
    db.add(db_record)
    
    report.status = ReportStatus.SUBMITTED.value
    report.submit_date = datetime.now().date()
    report.xml_submission = xml_record
    
    db.commit()
    
    background_tasks.add_task(send_to_aeat, report.id, xml_record)
    
    return {
        "success": True,
        "message": "Report submitted successfully to Hacienda",
        "report_id": report.id,
        "submission_date": report.submit_date.isoformat(),
        "verifactu_hash": report.verifactu_hash,
        "csv_code": f"CSV{report.id:08d}"  
    }

@router.get("/download/{report_id}")
async def download_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    verifactu_service = VerifactuService()
    calc_data = json.loads(report.calculation_data) if report.calculation_data else {}
    
    qr_data = {
        "nif": current_user.nif or "PENDING",
        "invoice_number": f"REP-{report.id}",
        "date": report.submit_date.isoformat() if report.submit_date else datetime.now().date().isoformat(),
        "total": float(report.total_tax or 0),
        "hash": report.verifactu_hash or "PENDING"
    }
    
    return {
        "report_id": report.id,
        "report_type": report.report_type,
        "period": report.period,
        "status": report.status,
        "total_tax": str(report.total_tax),
        "deadline": report.deadline.isoformat(),
        "submit_date": report.submit_date.isoformat() if report.submit_date else None,
        "calculation": calc_data,
        "qr_code_base64": verifactu_service.generate_qr_code(qr_data),
        "verifactu_hash": report.verifactu_hash,
        "legal_text": "Factura verificable en la sede electrónica de la AEAT - VERI*FACTU",
        "download_url": f"/api/reports/pdf/{report.id}"
    }


async def send_to_aeat(report_id: int, xml_content: str):
    logger.info(f"Sending report {report_id} to AEAT...")
    # In production, this would:
    # 1. Establish secure connection with AEAT servers
    # 2. Authenticate using digital certificate
    # 3. Send XML via SOAP/REST API
    # 4. Process response and update report status
    await asyncio.sleep(2)  # Simulate API call
    logger.info(f"Report {report_id} sent to AEAT successfully")

import asyncio