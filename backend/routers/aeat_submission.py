from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal
import os
import base64
import logging

from core.database import (
    get_db, User, Invoice, Report
)
from core.auth import get_current_user
from verifactu import VerifactuService, VerifactuRecordData, VerifactuRecordType, VerifactuEventType
from routers.verifactu_events import VerifactuEventService
from aeat_client import AEATClient, AEATConfig, AEATEnvironment, AEATResponse, create_aeat_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/aeat", tags=["aeat-submission"])

class CertificateUpload(BaseModel):
    certificate_base64: str = Field(..., description="Base64 encoded .p12/.pfx certificate")
    password: str = Field(..., description="Certificate password")


class CertificateInfo(BaseModel):
    valid: bool
    subject: Optional[str] = None
    issuer: Optional[str] = None
    not_before: Optional[str] = None
    not_after: Optional[str] = None
    serial_number: Optional[str] = None
    is_expired: Optional[bool] = None
    error: Optional[str] = None


class SubmissionRequest(BaseModel):
    invoice_id: Optional[int] = None
    report_id: Optional[int] = None
    use_sandbox: bool = True


class SubmissionResponse(BaseModel):
    success: bool
    csv_code: Optional[str] = None
    response_code: Optional[str] = None
    response_message: Optional[str] = None
    submitted_at: datetime
    environment: str
    entity_type: str
    entity_id: int


class AEATStatusResponse(BaseModel):
    configured: bool
    environment: str
    certificate_loaded: bool
    certificate_info: Optional[CertificateInfo] = None
    last_submission: Optional[datetime] = None
    sandbox_url: str
    production_url: str

from certificate_service import get_certificate_service, CertificateEncryptionError

def get_aeat_client_for_user(db: Session, user_id: int, use_sandbox: bool = True) -> AEATClient:
    cert_service = get_certificate_service()
    
    cert_data = cert_service.get_certificate(db, user_id)
    
    if cert_data:
        cert_bytes, password = cert_data
        config = AEATConfig(
            environment=AEATEnvironment.SANDBOX if use_sandbox else AEATEnvironment.PRODUCTION,
            cert_content=cert_bytes,
            cert_password=password
        )
        return AEATClient(config)
    
    cert_path = os.getenv('AEAT_CERT_PATH')
    if cert_path and os.path.exists(cert_path):
        return create_aeat_client(
            environment='sandbox' if use_sandbox else 'production',
            cert_path=cert_path,
            cert_password=os.getenv('AEAT_CERT_PASSWORD')
        )
    
    raise HTTPException(
        status_code=400,
        detail="No certificate configured. Please upload your digital certificate."
    )


async def log_submission_event(
    db: Session,
    user_id: int,
    entity_type: str,
    entity_id: int,
    success: bool,
    response: AEATResponse,
    ip_address: str = None
):
    event_type = VerifactuEventType.REPORT_SUBMITTED if success else VerifactuEventType.SYSTEM_ERROR
    
    if entity_type == "invoice":
        VerifactuEventService.log_invoice_event(
            db=db,
            user_id=user_id,
            invoice_id=entity_id,
            event_type=event_type,
            hash_after=response.csv_code or "FAILED",
            ip_address=ip_address,
            event_data={
                "aeat_response_code": response.response_code,
                "aeat_response_message": response.response_message,
                "submission_timestamp": response.timestamp.isoformat()
            },
            description=f"AEAT Submission: {response.response_message}"
        )
    else:
        VerifactuEventService.log_report_event(
            db=db,
            user_id=user_id,
            report_id=entity_id,
            event_type=event_type,
            hash_after=response.csv_code or "FAILED",
            ip_address=ip_address,
            event_data={
                "aeat_response_code": response.response_code,
                "aeat_response_message": response.response_message
            }
        )

@router.get("/status", response_model=AEATStatusResponse)
async def get_aeat_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cert_service = get_certificate_service()
    cert_info = cert_service.get_certificate_info(db, current_user.id)
    system_cert = os.getenv('AEAT_CERT_PATH')
    
    certificate_loaded = cert_info is not None or (system_cert and os.path.exists(system_cert))
    
    cert_details = None
    if cert_info:
        cert_details = CertificateInfo(
            valid=not cert_info.get('is_expired', True),
            subject=cert_info.get('subject_cn'),
            issuer=cert_info.get('issuer'),
            not_before=cert_info.get('valid_from'),
            not_after=cert_info.get('valid_until'),
            serial_number=cert_info.get('serial_number'),
            is_expired=cert_info.get('is_expired', False)
        )
    elif certificate_loaded:
        try:
            client = get_aeat_client_for_user(db, current_user.id)
            cert_verify = await client.verify_certificate()
            cert_details = CertificateInfo(**cert_verify)
            client.cleanup()
        except Exception as e:
            cert_details = CertificateInfo(valid=False, error=str(e))
    
    submissions = cert_service.get_submission_history(db, current_user.id, limit=1)
    last_submission = datetime.fromisoformat(submissions[0]['submitted_at']) if submissions else None
    
    return AEATStatusResponse(
        configured=certificate_loaded,
        environment=os.getenv('AEAT_ENVIRONMENT', 'sandbox'),
        certificate_loaded=certificate_loaded,
        certificate_info=cert_details,
        last_submission=last_submission,
        sandbox_url=AEATConfig.VERIFACTU_SANDBOX,
        production_url=AEATConfig.VERIFACTU_PRODUCTION
    )


@router.post("/certificate/upload", response_model=CertificateInfo)
async def upload_certificate(
    cert_data: CertificateUpload,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        cert_bytes = base64.b64decode(cert_data.certificate_base64)
        
        cert_service = get_certificate_service()
        client_ip = request.client.host if request.client else None
        
        cert_record = cert_service.store_certificate(
            db=db,
            user_id=current_user.id,
            cert_data=cert_bytes,
            password=cert_data.password,
            ip_address=client_ip
        )
        
        logger.info(f"Certificate uploaded for user {current_user.id}")
        
        return CertificateInfo(
            valid=not cert_record.is_expired,
            subject=cert_record.subject_cn,
            issuer=cert_record.issuer,
            not_before=cert_record.valid_from.isoformat() if cert_record.valid_from else None,
            not_after=cert_record.valid_until.isoformat() if cert_record.valid_until else None,
            serial_number=cert_record.serial_number,
            is_expired=cert_record.is_expired
        )
        
    except base64.binascii.Error:
        raise HTTPException(status_code=400, detail="Invalid base64 encoding")
    except CertificateEncryptionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Certificate upload failed: {e}")
        raise HTTPException(status_code=400, detail=f"Certificate error: {str(e)}")


@router.post("/certificate/upload-file", response_model=CertificateInfo)
async def upload_certificate_file(
    request: Request,
    certificate: UploadFile = File(...),
    password: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not certificate.filename.endswith(('.p12', '.pfx')):
        raise HTTPException(status_code=400, detail="Only .p12 or .pfx files accepted")
    
    try:
        cert_bytes = await certificate.read()
        
        cert_service = get_certificate_service()
        client_ip = request.client.host if request.client else None
        
        cert_record = cert_service.store_certificate(
            db=db,
            user_id=current_user.id,
            cert_data=cert_bytes,
            password=password or "",
            ip_address=client_ip
        )
        
        return CertificateInfo(
            valid=not cert_record.is_expired,
            subject=cert_record.subject_cn,
            issuer=cert_record.issuer,
            not_before=cert_record.valid_from.isoformat() if cert_record.valid_from else None,
            not_after=cert_record.valid_until.isoformat() if cert_record.valid_until else None,
            serial_number=cert_record.serial_number,
            is_expired=cert_record.is_expired
        )
        
    except CertificateEncryptionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/certificate")
async def delete_certificate(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cert_service = get_certificate_service()
    deleted = cert_service.delete_certificate(db, current_user.id)
    
    if deleted:
        return {"message": "Certificate removed"}
    return {"message": "No certificate stored"}


@router.post("/submit/invoice/{invoice_id}", response_model=SubmissionResponse)
async def submit_invoice_to_aeat(
    invoice_id: int,
    use_sandbox: bool = True,
    request: Request = None,
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if not invoice.verifactu_hash:
        raise HTTPException(
            status_code=400, 
            detail="Invoice has no VeriFactu hash. Please generate hash first."
        )
    
    record_data = VerifactuRecordData(
        nif=current_user.nif or "PENDING",
        document_number=invoice.invoice_number,
        document_date=invoice.invoice_date.date() if hasattr(invoice.invoice_date, 'date') else invoice.invoice_date,
        total_amount=Decimal(str(invoice.total)),
        vat_amount=Decimal(str(invoice.total)) * Decimal("0.21"),
        record_type=VerifactuRecordType.INVOICE_ISSUED
    )
    
    prev_invoice = db.query(Invoice).filter(
        Invoice.user_id == current_user.id,
        Invoice.id < invoice_id,
        Invoice.verifactu_hash.isnot(None)
    ).order_by(desc(Invoice.id)).first()
    
    hash_result = VerifactuService.generate_hash(
        record_data,
        prev_invoice.verifactu_hash if prev_invoice else None
    )
    
    xml_result = VerifactuService.create_xml_record(
        record_data,
        hash_result,
        f"INV-{invoice.id}"
    )
    
    try:
        client = get_aeat_client_for_user(db, current_user.id, use_sandbox)
        
        start_time = datetime.utcnow()
        response = await client.submit_invoice(xml_result.xml_content)
        duration_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        client.cleanup()
        
        invoice.verifactu_submitted = response.success
        if response.csv_code:
            invoice.csv_code = response.csv_code
        invoice.aeat_submitted_at = datetime.utcnow()
        invoice.aeat_environment = "sandbox" if use_sandbox else "production"
        
        cert_service = get_certificate_service()
        cert_service.log_submission(
            db=db,
            user_id=current_user.id,
            submission_type="invoice",
            entity_id=invoice_id,
            environment="sandbox" if use_sandbox else "production",
            success=response.success,
            csv_code=response.csv_code,
            response_code=response.response_code,
            response_message=response.response_message,
            xml_sent=xml_result.xml_content,
            response_raw=response.raw_response,
            error_codes=response.errors,
            ip_address=client_ip,
            duration_ms=duration_ms,
            endpoint_url=client.config.verifactu_url
        )
        
        await log_submission_event(
            db, current_user.id, "invoice", invoice_id,
            response.success, response, client_ip
        )
        
        db.commit()
        
        return SubmissionResponse(
            success=response.success,
            csv_code=response.csv_code,
            response_code=response.response_code,
            response_message=response.response_message,
            submitted_at=response.timestamp,
            environment="sandbox" if use_sandbox else "production",
            entity_type="invoice",
            entity_id=invoice_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AEAT submission failed: {e}")
        raise HTTPException(status_code=500, detail=f"Submission failed: {str(e)}")


@router.post("/submit/report/{report_id}", response_model=SubmissionResponse)
async def submit_report_to_aeat(
    report_id: int,
    use_sandbox: bool = True,
    request: Request = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not report.xml_submission:
        raise HTTPException(status_code=400, detail="Report has no XML. Please generate first.")
    
    modelo = report.modelo or "303"
    
    try:
        client = get_aeat_client_for_user(db, current_user.id, use_sandbox)
        
        start_time = datetime.utcnow()
        response = await client.submit_report(report.xml_submission, modelo)
        duration_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        client.cleanup()
        
        if response.success:
            report.status = "accepted"
            report.csv_code = response.csv_code
        else:
            report.status = "rejected"
        report.aeat_submitted_at = datetime.utcnow()
        report.aeat_environment = "sandbox" if use_sandbox else "production"
        
        client_ip = request.client.host if request and request.client else None
        cert_service = get_certificate_service()
        cert_service.log_submission(
            db=db,
            user_id=current_user.id,
            submission_type="report",
            entity_id=report_id,
            environment="sandbox" if use_sandbox else "production",
            success=response.success,
            csv_code=response.csv_code,
            response_code=response.response_code,
            response_message=response.response_message,
            xml_sent=report.xml_submission,
            response_raw=response.raw_response,
            error_codes=response.errors,
            ip_address=client_ip,
            duration_ms=duration_ms
        )
        
        await log_submission_event(
            db, current_user.id, "report", report_id,
            response.success, response, client_ip
        )
        
        db.commit()
        
        return SubmissionResponse(
            success=response.success,
            csv_code=response.csv_code,
            response_code=response.response_code,
            response_message=response.response_message,
            submitted_at=response.timestamp,
            environment="sandbox" if use_sandbox else "production",
            entity_type="report",
            entity_id=report_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Report submission failed: {e}")
        raise HTTPException(status_code=500, detail=f"Submission failed: {str(e)}")


@router.post("/test-connection")
async def test_aeat_connection(
    use_sandbox: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    try:
        client = get_aeat_client_for_user(db, current_user.id, use_sandbox)
        
        cert_info = await client.verify_certificate()
        
        if not cert_info.get('valid'):
            return {
                "success": False,
                "step": "certificate",
                "error": cert_info.get('error', 'Certificate validation failed')
            }
        
        test_xml = """<sif:SuministroInformacion xmlns:sif="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd">
            <sif:Cabecera><sif:Test>1</sif:Test></sif:Cabecera>
        </sif:SuministroInformacion>"""
        
        response = await client.submit_invoice(test_xml)
        client.cleanup()
        
        return {
            "success": True,
            "certificate": cert_info,
            "connection_test": {
                "ssl_ok": True,
                "endpoint_reached": True,
                "response_code": response.response_code,
                "note": "Error response is expected for test request"
            },
            "environment": "sandbox" if use_sandbox else "production"
        }
        
    except HTTPException as e:
        return {
            "success": False,
            "step": "setup",
            "error": e.detail
        }
    except Exception as e:
        return {
            "success": False,
            "step": "connection",
            "error": str(e)
        }


@router.get("/submissions/history")
async def get_submission_history(
    limit: int = 20,
    submission_type: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cert_service = get_certificate_service()
    submissions = cert_service.get_submission_history(
        db, current_user.id, limit=limit, submission_type=submission_type
    )
    
    return {
        "submissions": submissions,
        "total": len(submissions)
    }