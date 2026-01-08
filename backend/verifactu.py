import hashlib
import base64
import qrcode
from io import BytesIO
from datetime import datetime, date, timezone
from decimal import Decimal
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class VerifactuRecordType(str, Enum):
    INVOICE_ISSUED = "F1"      # Factura emitida
    INVOICE_RECEIVED = "F2"    # Factura recibida  
    CREDIT_NOTE = "R1"         # Factura rectificativa
    SIMPLIFIED = "F3"          # Factura simplificada
    REPORT = "R0"              # Tax report submission


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
    seller_name: str = ""  
    document_number: str
    document_date: date
    total_amount: Decimal
    vat_amount: Decimal = Decimal("0.00")
    vat_rate: float = 21.0
    record_type: VerifactuRecordType = VerifactuRecordType.INVOICE_ISSUED
    description: Optional[str] = "Factura"
    recipient_nif: Optional[str] = None  
    recipient_name: Optional[str] = None
    recipient_country: str = "ES"  
    recipient_id_type: Optional[str] = None  
    recipient_id: Optional[str] = None  
 
    software_name: str = "TaxHelper"
    software_version: str = "1.0.0"
    software_nif: str = ""  


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
    
    QR_URL_SANDBOX = "https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR"
    QR_URL_PRODUCTION = "https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR"
    
    AEAT_VERIFICATION_URL = "https://www2.agenciatributaria.gob.es/wlpl/BURT-JDIT/VerificacionFactura"
    
    GENESIS_HASH = "0" * 64 
    
    NS_SUMINISTRO_LR = "https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroLR.xsd"
    NS_SUMINISTRO_INFO = "https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd"
    
    @staticmethod
    def generate_hash(
        data: VerifactuRecordData,
        previous_hash: Optional[str] = None
    ) -> VerifactuHashResult:
        
        prev = previous_hash or VerifactuService.GENESIS_HASH
        
        timestamp = datetime.now(timezone.utc)
        fecha_hora = timestamp.strftime("%Y-%m-%dT%H:%M:%S+01:00")
        
        hash_input = "&".join([
            f"IDEmisorFactura={data.nif.upper().strip()}",
            f"NumSerieFactura={data.document_number.strip()}",
            f"FechaExpedicionFactura={data.document_date.strftime('%d-%m-%Y')}",
            f"TipoFactura={data.record_type.value}",
            f"CuotaTotal={data.vat_amount:.2f}",
            f"ImporteTotal={data.total_amount:.2f}",
            f"HuellaAnterior={prev}",
            f"FechaHoraHusoGenRegistro={fecha_hora}"
        ])
        
        hash_value = hashlib.sha256(hash_input.encode('utf-8')).hexdigest().upper()
        
        return VerifactuHashResult(
            hash_value=hash_value,
            previous_hash=prev,
            hash_input=hash_input,
            timestamp=timestamp
        )
    
    @staticmethod
    def generate_qr_code(
        data: VerifactuRecordData,
        hash_value: str,
        is_sandbox: bool = True
    ) -> VerifactuQRResult:
        
        base_url = VerifactuService.QR_URL_SANDBOX if is_sandbox else VerifactuService.QR_URL_PRODUCTION
        
        qr_params = {
            "nif": data.nif.upper().strip(),
            "numserie": data.document_number.strip(),
            "fecha": data.document_date.strftime("%d-%m-%Y"),
            "importe": f"{data.total_amount:.2f}",
        }
        
        params_str = "&".join(f"{k}={v}" for k, v in qr_params.items())
        verification_url = f"{base_url}?{params_str}"
        
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
        record_id: str,
        previous_record: Optional[Dict[str, str]] = None
    ) -> VerifactuXMLResult:

        timestamp = hash_result.timestamp
        fecha_hora_huso = timestamp.strftime("%Y-%m-%dT%H:%M:%S+01:00")
        fecha_expedicion = data.document_date.strftime("%d-%m-%Y")
        
        base_imponible = data.total_amount - data.vat_amount
        
        if previous_record and previous_record.get('hash'):
            encadenamiento = f"""<sum1:Encadenamiento>
                <sum1:RegistroAnterior>
                    <sum1:IDEmisorFactura>{previous_record.get('nif', data.nif)}</sum1:IDEmisorFactura>
                    <sum1:NumSerieFactura>{previous_record.get('num_serie', '')}</sum1:NumSerieFactura>
                    <sum1:FechaExpedicionFactura>{previous_record.get('fecha', '')}</sum1:FechaExpedicionFactura>
                    <sum1:Huella>{previous_record.get('hash')}</sum1:Huella>
                </sum1:RegistroAnterior>
            </sum1:Encadenamiento>"""
        else:
            encadenamiento = """<sum1:Encadenamiento>
                <sum1:PrimerRegistro>S</sum1:PrimerRegistro>
            </sum1:Encadenamiento>"""
        
        if data.recipient_nif:
            destinatarios = f"""<sum1:Destinatarios>
                <sum1:IDDestinatario>
                    <sum1:NombreRazon>{data.recipient_name or 'Cliente'}</sum1:NombreRazon>
                    <sum1:NIF>{data.recipient_nif}</sum1:NIF>
                </sum1:IDDestinatario>
            </sum1:Destinatarios>"""
        elif data.recipient_id_type and data.recipient_id:
            # Foreign or other ID type
            destinatarios = f"""<sum1:Destinatarios>
                <sum1:IDDestinatario>
                    <sum1:NombreRazon>{data.recipient_name or 'Cliente'}</sum1:NombreRazon>
                    <sum1:IDOtro>
                        <sum1:CodigoPais>{data.recipient_country}</sum1:CodigoPais>
                        <sum1:IDType>{data.recipient_id_type}</sum1:IDType>
                        <sum1:ID>{data.recipient_id}</sum1:ID>
                    </sum1:IDOtro>
                </sum1:IDDestinatario>
            </sum1:Destinatarios>"""
        elif data.record_type == VerifactuRecordType.SIMPLIFIED:
            # Simplified invoice (F3) - anonymous/cash customer
            # Use IDOtro with type "07" (not census registered)
            destinatarios = """<sum1:Destinatarios>
                <sum1:IDDestinatario>
                    <sum1:NombreRazon>CLIENTE CONTADO</sum1:NombreRazon>
                    <sum1:IDOtro>
                        <sum1:CodigoPais>ES</sum1:CodigoPais>
                        <sum1:IDType>07</sum1:IDType>
                        <sum1:ID>CF</sum1:ID>
                    </sum1:IDOtro>
                </sum1:IDDestinatario>
            </sum1:Destinatarios>"""
        else:
            # Regular invoice needs a valid recipient - use anonymous placeholder
            # This will likely trigger validation warnings but at least submits
            destinatarios = """<sum1:Destinatarios>
                <sum1:IDDestinatario>
                    <sum1:NombreRazon>PENDIENTE IDENTIFICAR</sum1:NombreRazon>
                    <sum1:IDOtro>
                        <sum1:CodigoPais>ES</sum1:CodigoPais>
                        <sum1:IDType>07</sum1:IDType>
                        <sum1:ID>PENDIENTE</sum1:ID>
                    </sum1:IDOtro>
                </sum1:IDDestinatario>
            </sum1:Destinatarios>"""
        
        software_nif = data.software_nif or data.nif
        
        xml_content = f"""<sum:RegFactuSistemaFacturacion>
    <sum:Cabecera>
        <sum1:ObligadoEmision>
            <sum1:NombreRazon>{data.seller_name or data.nif}</sum1:NombreRazon>
            <sum1:NIF>{data.nif.upper().strip()}</sum1:NIF>
        </sum1:ObligadoEmision>
    </sum:Cabecera>
    <sum:RegistroFactura>
        <sum1:RegistroAlta>
            <sum1:IDVersion>1.0</sum1:IDVersion>
            <sum1:IDFactura>
                <sum1:IDEmisorFactura>{data.nif.upper().strip()}</sum1:IDEmisorFactura>
                <sum1:NumSerieFactura>{data.document_number}</sum1:NumSerieFactura>
                <sum1:FechaExpedicionFactura>{fecha_expedicion}</sum1:FechaExpedicionFactura>
            </sum1:IDFactura>
            <sum1:NombreRazonEmisor>{data.seller_name or data.nif}</sum1:NombreRazonEmisor>
            <sum1:TipoFactura>{data.record_type.value}</sum1:TipoFactura>
            <sum1:DescripcionOperacion>{data.description or 'Factura'}</sum1:DescripcionOperacion>
            {destinatarios}
            <sum1:Desglose>
                <sum1:DetalleDesglose>
                    <sum1:ClaveRegimen>01</sum1:ClaveRegimen>
                    <sum1:CalificacionOperacion>S1</sum1:CalificacionOperacion>
                    <sum1:TipoImpositivo>{data.vat_rate:.2f}</sum1:TipoImpositivo>
                    <sum1:BaseImponibleOimporteNoSujeto>{base_imponible:.2f}</sum1:BaseImponibleOimporteNoSujeto>
                    <sum1:CuotaRepercutida>{data.vat_amount:.2f}</sum1:CuotaRepercutida>
                </sum1:DetalleDesglose>
            </sum1:Desglose>
            <sum1:CuotaTotal>{data.vat_amount:.2f}</sum1:CuotaTotal>
            <sum1:ImporteTotal>{data.total_amount:.2f}</sum1:ImporteTotal>
            {encadenamiento}
            <sum1:SistemaInformatico>
                <sum1:NombreRazon>{data.seller_name or 'TaxHelper User'}</sum1:NombreRazon>
                <sum1:NIF>{software_nif}</sum1:NIF>
                <sum1:NombreSistemaInformatico>{data.software_name}</sum1:NombreSistemaInformatico>
                <sum1:IdSistemaInformatico>01</sum1:IdSistemaInformatico>
                <sum1:Version>{data.software_version}</sum1:Version>
                <sum1:NumeroInstalacion>1</sum1:NumeroInstalacion>
                <sum1:TipoUsoPosibleSoloVerifactu>S</sum1:TipoUsoPosibleSoloVerifactu>
                <sum1:TipoUsoPosibleMultiOT>N</sum1:TipoUsoPosibleMultiOT>
                <sum1:IndicadorMultiplesOT>N</sum1:IndicadorMultiplesOT>
            </sum1:SistemaInformatico>
            <sum1:FechaHoraHusoGenRegistro>{fecha_hora_huso}</sum1:FechaHoraHusoGenRegistro>
            <sum1:TipoHuella>01</sum1:TipoHuella>
            <sum1:Huella>{hash_result.hash_value}</sum1:Huella>
        </sum1:RegistroAlta>
    </sum:RegistroFactura>
</sum:RegFactuSistemaFacturacion>"""
        
        return VerifactuXMLResult(
            xml_content=xml_content,
            record_id=record_id,
            timestamp=timestamp
        )
    
    @staticmethod
    def build_soap_envelope(xml_content: str) -> str:
        """Wrap XML content in SOAP envelope with correct namespaces"""
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:sum="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroLR.xsd"
    xmlns:sum1="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd">
    <soapenv:Header/>
    <soapenv:Body>
        {xml_content}
    </soapenv:Body>
</soapenv:Envelope>"""
    
    @staticmethod
    def validate_nif(nif: str) -> bool:
        """Validate Spanish NIF/NIE format"""
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
            elif nif[0].isalpha():
                return len(nif) == 9 and nif[1:8].isdigit()
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