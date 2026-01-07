import hashlib
import base64
import qrcode
from io import BytesIO
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class VerifactuRecordType(str, Enum):
    INVOICE_ISSUED = "F1"      # Factura emitida
    INVOICE_RECEIVED = "F2"   # Factura recibida  
    CREDIT_NOTE = "R1"        # Factura rectificativa
    SIMPLIFIED = "F3"         # Factura simplificada
    REPORT = "R0"             # Tax report submission


class VerifactuEventType(str, Enum):
    INVOICE_CREATED = "ALTA_FACTURA"
    INVOICE_CANCELLED = "ANULACION_FACTURA"
    INVOICE_CORRECTED = "RECTIFICACION_FACTURA"
    REPORT_CREATED = "ALTA_DECLARACION"
    REPORT_SUBMITTED = "ENVIO_DECLARACION"
    HASH_GENERATED = "GENERACION_HUELLA"
    QR_GENERATED = "GENERACION_QR"
    SYSTEM_ERROR = "ERROR_SISTEMA"


class VerifactuRecordData(BaseModel):
    nif: str
    document_number: str
    document_date: date
    total_amount: Decimal
    vat_amount: Decimal = Decimal("0.00")
    vat_rate: float = 21.0
    record_type: VerifactuRecordType = VerifactuRecordType.INVOICE_ISSUED
    description: Optional[str] = None
    recipient_nif: Optional[str] = None
    recipient_name: Optional[str] = None


class VerifactuHashResult(BaseModel):
    hash_value: str
    previous_hash: Optional[str]
    hash_input: str
    timestamp: datetime


class VerifactuQRResult(BaseModel):
    qr_base64: str
    verification_url: str
    qr_params: Dict[str, str]


class VerifactuXMLResult(BaseModel):
    xml_content: str
    record_id: str
    timestamp: datetime


class VerifactuService:

    
    AEAT_VERIFICATION_URL = "https://www2.agenciatributaria.gob.es/wlpl/BURT-JDIT/VerificacionFactura"
    
    GENESIS_HASH = "GENESIS"
    
    @staticmethod
    def generate_hash(
        data: VerifactuRecordData,
        previous_hash: Optional[str] = None
    ) -> VerifactuHashResult:
        
        prev = previous_hash or VerifactuService.GENESIS_HASH
        
        hash_input = "|".join([
            data.nif.upper().strip(),
            data.document_number.strip(),
            data.document_date.isoformat(),
            f"{data.total_amount:.2f}",
            f"{data.vat_amount:.2f}",
            prev
        ])
        
        hash_value = hashlib.sha256(hash_input.encode('utf-8')).hexdigest()
        
        return VerifactuHashResult(
            hash_value=hash_value,
            previous_hash=previous_hash,
            hash_input=hash_input,
            timestamp=datetime.utcnow()
        )
    
    @staticmethod
    def generate_qr_code(
        data: VerifactuRecordData,
        hash_value: str
    ) -> VerifactuQRResult:
      
        qr_params = {
            "nif": data.nif.upper().strip(),
            "num": data.document_number.strip(),
            "fecha": data.document_date.isoformat(),
            "importe": f"{data.total_amount:.2f}",
            "huella": hash_value[:12]  
        }
        
        params_str = "&".join(f"{k}={v}" for k, v in qr_params.items())
        verification_url = f"{VerifactuService.AEAT_VERIFICATION_URL}?{params_str}"
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4
        )
        qr.add_data(verification_url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        qr_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return VerifactuQRResult(
            qr_base64=qr_base64,
            verification_url=verification_url,
            qr_params=qr_params
        )
    
    @staticmethod
    def create_xml_record(
        data: VerifactuRecordData,
        hash_result: VerifactuHashResult,
        record_id: str
    ) -> VerifactuXMLResult:
        timestamp = datetime.utcnow()
        
        xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<sif:SuministroInformacion xmlns:sif="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SusFactura.xsd">
    <sif:Cabecera>
        <sif:ObligadoEmision>
            <sif:NombreRazon>{data.nif}</sif:NombreRazon>
            <sif:NIF>{data.nif}</sif:NIF>
        </sif:ObligadoEmision>
        <sif:TipoRegistro>{data.record_type.value}</sif:TipoRegistro>
    </sif:Cabecera>
    <sif:RegistroFactura>
        <sif:IDFactura>
            <sif:IDRegistro>{record_id}</sif:IDRegistro>
            <sif:IDEmisorFactura>{data.nif}</sif:IDEmisorFactura>
            <sif:NumSerieFactura>{data.document_number}</sif:NumSerieFactura>
            <sif:FechaExpedicionFactura>{data.document_date.isoformat()}</sif:FechaExpedicionFactura>
        </sif:IDFactura>
        <sif:DatosFactura>
            <sif:ImporteTotal>{data.total_amount}</sif:ImporteTotal>
            <sif:BaseImponible>{data.total_amount - data.vat_amount}</sif:BaseImponible>
            <sif:CuotaRepercutida>{data.vat_amount}</sif:CuotaRepercutida>
            <sif:TipoImpositivo>{data.vat_rate}</sif:TipoImpositivo>
        </sif:DatosFactura>
        {f'<sif:Contraparte><sif:NIF>{data.recipient_nif}</sif:NIF><sif:NombreRazon>{data.recipient_name or ""}</sif:NombreRazon></sif:Contraparte>' if data.recipient_nif else ''}
        <sif:HuellaRegistro>
            <sif:Huella>{hash_result.hash_value}</sif:Huella>
            <sif:HuellaAnterior>{hash_result.previous_hash or VerifactuService.GENESIS_HASH}</sif:HuellaAnterior>
            <sif:FechaHoraHusoGenRegistro>{timestamp.isoformat()}Z</sif:FechaHoraHusoGenRegistro>
        </sif:HuellaRegistro>
    </sif:RegistroFactura>
</sif:SuministroInformacion>"""
        
        return VerifactuXMLResult(
            xml_content=xml_content,
            record_id=record_id,
            timestamp=timestamp
        )
    
    @staticmethod
    def validate_nif(nif: str) -> bool:
        if not nif:
            return False
            
        nif = nif.upper().strip().replace("-", "").replace(" ", "")
        
        if len(nif) != 9:
            return False
            
        letters = "TRWAGMYFPDXBNJZSQVHLCKE"
        
        try:
            if nif[0] in "XYZ":
                num = int(nif[1:8])
                if nif[0] == "X":
                    num = num
                elif nif[0] == "Y":
                    num = num + 10000000
                else:
                    num = num + 20000000
            else:
                num = int(nif[:8])
            
            expected_letter = letters[num % 23]
            return nif[-1] == expected_letter
        except (ValueError, IndexError):
            return False
    
    @staticmethod
    def get_legal_text(language: str = "es") -> str:
        texts = {
            "es": "Factura verificable en la sede electrónica de la AEAT - VERI*FACTU",
            "en": "Invoice verifiable at AEAT electronic headquarters - VERI*FACTU"
        }
        return texts.get(language, texts["es"])