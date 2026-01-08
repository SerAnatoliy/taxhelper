import os
import ssl
import logging
import tempfile
from datetime import datetime
from typing import Optional, Dict, Any, Tuple
from dataclasses import dataclass
from enum import Enum
import httpx
from lxml import etree
from cryptography import x509
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AEATEnvironment(str, Enum):
    SANDBOX = "sandbox"
    PRODUCTION = "production"


@dataclass
class AEATConfig:
    environment: AEATEnvironment = AEATEnvironment.SANDBOX
    cert_path: Optional[str] = None
    cert_password: Optional[str] = None
    cert_content: Optional[bytes] = None  
    timeout: int = 30
    
    SANDBOX_URL = "https://prewww1.aeat.es/wlpl/SSII-FACT/ws/fe/SiiFactFEV1SOAP"
    PRODUCTION_URL = "https://www1.agenciatributaria.gob.es/wlpl/SSII-FACT/ws/fe/SiiFactFEV1SOAP"
    
    VERIFACTU_SANDBOX = "https://prewww10.aeat.es/wlpl/TIKE-CONT/ws/SusFactura"
    VERIFACTU_PRODUCTION = "https://www10.aeat.es/wlpl/TIKE-CONT/ws/SuusFactura"
    
    @property
    def base_url(self) -> str:
        return self.SANDBOX_URL if self.environment == AEATEnvironment.SANDBOX else self.PRODUCTION_URL
    
    @property
    def verifactu_url(self) -> str:
        return self.VERIFACTU_SANDBOX if self.environment == AEATEnvironment.SANDBOX else self.VERIFACTU_PRODUCTION


@dataclass 
class AEATResponse:
    success: bool
    csv_code: Optional[str] = None
    response_code: Optional[str] = None
    response_message: Optional[str] = None
    timestamp: datetime = None
    raw_response: Optional[str] = None
    errors: Optional[list] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow()


class AEATClient:    
    # SOAP Namespaces
    NAMESPACES = {
        'soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
        'sif': 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd',
        'sifr': 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/RespuestaSuministro.xsd',
    }
    
    def __init__(self, config: AEATConfig):
        self.config = config
        self._ssl_context = None
        self._temp_cert_file = None
        self._temp_key_file = None
        
    def _setup_ssl_context(self) -> ssl.SSLContext:
        if self._ssl_context:
            return self._ssl_context
            
        ctx = ssl.create_default_context(ssl.Purpose.SERVER_AUTH)
        ctx.check_hostname = True
        ctx.verify_mode = ssl.CERT_REQUIRED
        
        if self.config.cert_path and os.path.exists(self.config.cert_path):
            self._load_pfx_certificate(ctx)
        elif self.config.cert_content:
            self._load_cert_from_bytes(ctx)
        else:
            raise ValueError("No certificate provided. Set cert_path or cert_content.")
            
        self._ssl_context = ctx
        return ctx
    
    def _load_pfx_certificate(self, ctx: ssl.SSLContext):
        from cryptography.hazmat.primitives.serialization import pkcs12
        
        with open(self.config.cert_path, 'rb') as f:
            pfx_data = f.read()
        
        password = self.config.cert_password.encode() if self.config.cert_password else None
        private_key, certificate, chain = pkcs12.load_key_and_certificates(
            pfx_data, password, default_backend()
        )
        
        self._temp_key_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pem')
        self._temp_cert_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pem')
        
        key_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        )
        self._temp_key_file.write(key_pem)
        self._temp_key_file.flush()
        
        cert_pem = certificate.public_bytes(serialization.Encoding.PEM)
        self._temp_cert_file.write(cert_pem)
        
        if chain:
            for ca_cert in chain:
                self._temp_cert_file.write(ca_cert.public_bytes(serialization.Encoding.PEM))
        self._temp_cert_file.flush()
        
        ctx.load_cert_chain(
            certfile=self._temp_cert_file.name,
            keyfile=self._temp_key_file.name
        )
        
        logger.info(f"Loaded certificate: {certificate.subject}")
        
    def _load_cert_from_bytes(self, ctx: ssl.SSLContext):
        from cryptography.hazmat.primitives.serialization import pkcs12
        
        password = self.config.cert_password.encode() if self.config.cert_password else None
        private_key, certificate, chain = pkcs12.load_key_and_certificates(
            self.config.cert_content, password, default_backend()
        )
        
        self._temp_key_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pem')
        self._temp_cert_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pem')
        
        key_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        )
        self._temp_key_file.write(key_pem)
        self._temp_key_file.flush()
        
        cert_pem = certificate.public_bytes(serialization.Encoding.PEM)
        self._temp_cert_file.write(cert_pem)
        if chain:
            for ca_cert in chain:
                self._temp_cert_file.write(ca_cert.public_bytes(serialization.Encoding.PEM))
        self._temp_cert_file.flush()
        
        ctx.load_cert_chain(
            certfile=self._temp_cert_file.name,
            keyfile=self._temp_key_file.name
        )
    
    def _build_soap_envelope(self, xml_content: str) -> str:
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
    <soapenv:Header/>
    <soapenv:Body>
        {xml_content}
    </soapenv:Body>
</soapenv:Envelope>"""

    def _parse_response(self, response_xml: str) -> AEATResponse:
        try:
            root = etree.fromstring(response_xml.encode('utf-8'))
            
            # Find response body
            body = root.find('.//soapenv:Body', self.NAMESPACES)
            if body is None:
                body = root.find('.//{http://schemas.xmlsoap.org/soap/envelope/}Body')
            
            # Check for SOAP Fault
            fault = root.find('.//soapenv:Fault', self.NAMESPACES)
            if fault is None:
                fault = root.find('.//{http://schemas.xmlsoap.org/soap/envelope/}Fault')
            
            if fault is not None:
                fault_string = fault.findtext('.//faultstring', default='Unknown error')
                return AEATResponse(
                    success=False,
                    response_code='SOAP_FAULT',
                    response_message=fault_string,
                    raw_response=response_xml
                )
            
            csv_elem = root.find('.//*[local-name()="CSV"]')
            csv_code = csv_elem.text if csv_elem is not None else None
            
            estado = root.find('.//*[local-name()="EstadoEnvio"]')
            estado_text = estado.text if estado is not None else None
            
            errores = root.findall('.//*[local-name()="RegistroRechazado"]')
            errors = []
            for error in errores:
                codigo = error.findtext('.//*[local-name()="CodigoErrorRegistro"]', '')
                desc = error.findtext('.//*[local-name()="DescripcionErrorRegistro"]', '')
                errors.append({'code': codigo, 'description': desc})
            
            success = estado_text in ('Correcto', 'AceptadoConErrores', 'Aceptado') or csv_code is not None
            
            return AEATResponse(
                success=success,
                csv_code=csv_code,
                response_code=estado_text,
                response_message=f"Estado: {estado_text}",
                raw_response=response_xml,
                errors=errors if errors else None
            )
            
        except etree.XMLSyntaxError as e:
            logger.error(f"Failed to parse AEAT response: {e}")
            return AEATResponse(
                success=False,
                response_code='PARSE_ERROR',
                response_message=str(e),
                raw_response=response_xml
            )
    
    async def submit_invoice(self, xml_content: str) -> AEATResponse:
        try:
            ssl_ctx = self._setup_ssl_context()
            soap_request = self._build_soap_envelope(xml_content)
            
            logger.info(f"Submitting to AEAT ({self.config.environment.value}): {self.config.verifactu_url}")
            
            async with httpx.AsyncClient(
                verify=ssl_ctx,
                timeout=self.config.timeout
            ) as client:
                response = await client.post(
                    self.config.verifactu_url,
                    content=soap_request.encode('utf-8'),
                    headers={
                        'Content-Type': 'application/soap+xml; charset=utf-8',
                        'SOAPAction': 'SuministroFactura'
                    }
                )
                
                logger.info(f"AEAT response status: {response.status_code}")
                
                if response.status_code == 200:
                    return self._parse_response(response.text)
                else:
                    return AEATResponse(
                        success=False,
                        response_code=str(response.status_code),
                        response_message=f"HTTP Error: {response.status_code}",
                        raw_response=response.text
                    )
                    
        except httpx.SSLError as e:
            logger.error(f"SSL Error connecting to AEAT: {e}")
            return AEATResponse(
                success=False,
                response_code='SSL_ERROR',
                response_message=f"Certificate error: {str(e)}"
            )
        except httpx.TimeoutException:
            logger.error("Timeout connecting to AEAT")
            return AEATResponse(
                success=False,
                response_code='TIMEOUT',
                response_message="Connection timeout"
            )
        except Exception as e:
            logger.error(f"Error submitting to AEAT: {e}")
            return AEATResponse(
                success=False,
                response_code='ERROR',
                response_message=str(e)
            )
    
    async def submit_report(self, xml_content: str, modelo: str) -> AEATResponse:
        endpoint = self._get_modelo_endpoint(modelo)
        
        try:
            ssl_ctx = self._setup_ssl_context()
            soap_request = self._build_soap_envelope(xml_content)
            
            logger.info(f"Submitting Modelo {modelo} to AEAT: {endpoint}")
            
            async with httpx.AsyncClient(
                verify=ssl_ctx,
                timeout=self.config.timeout
            ) as client:
                response = await client.post(
                    endpoint,
                    content=soap_request.encode('utf-8'),
                    headers={
                        'Content-Type': 'application/soap+xml; charset=utf-8',
                        'SOAPAction': f'Presentacion{modelo}'
                    }
                )
                
                if response.status_code == 200:
                    return self._parse_response(response.text)
                else:
                    return AEATResponse(
                        success=False,
                        response_code=str(response.status_code),
                        response_message=f"HTTP Error: {response.status_code}",
                        raw_response=response.text
                    )
                    
        except Exception as e:
            logger.error(f"Error submitting Modelo {modelo}: {e}")
            return AEATResponse(
                success=False,
                response_code='ERROR',
                response_message=str(e)
            )
    
    def _get_modelo_endpoint(self, modelo: str) -> str:
        endpoints = {
            '303': '/wlpl/SSII-FACT/ws/fe/SiiFactFEV1SOAP',  # IVA
            '130': '/wlpl/PFRP-FISC/ws/pf/PF130V1SOAP',      # IRPF 
            '111': '/wlpl/PFRP-FISC/ws/pf/PF111V1SOAP',      # Retenciones
            '390': '/wlpl/SSII-FACT/ws/fe/SiiFactFEV1SOAP',  # Resumen anual IVA
        }
        
        base = "https://prewww1.aeat.es" if self.config.environment == AEATEnvironment.SANDBOX else "https://www1.agenciatributaria.gob.es"
        path = endpoints.get(modelo, endpoints['303'])
        
        return f"{base}{path}"
    
    async def verify_certificate(self) -> Dict[str, Any]:
        try:
            from cryptography.hazmat.primitives.serialization import pkcs12
            
            if self.config.cert_path:
                with open(self.config.cert_path, 'rb') as f:
                    pfx_data = f.read()
            else:
                pfx_data = self.config.cert_content
                
            password = self.config.cert_password.encode() if self.config.cert_password else None
            _, certificate, _ = pkcs12.load_key_and_certificates(pfx_data, password, default_backend())
            
            return {
                'valid': True,
                'subject': certificate.subject.rfc4514_string(),
                'issuer': certificate.issuer.rfc4514_string(),
                'not_before': certificate.not_valid_before_utc.isoformat(),
                'not_after': certificate.not_valid_after_utc.isoformat(),
                'serial_number': str(certificate.serial_number),
                'is_expired': datetime.utcnow() > certificate.not_valid_after_utc.replace(tzinfo=None)
            }
        except Exception as e:
            return {
                'valid': False,
                'error': str(e)
            }
    
    def cleanup(self):
        import os
        if self._temp_cert_file and os.path.exists(self._temp_cert_file.name):
            os.unlink(self._temp_cert_file.name)
        if self._temp_key_file and os.path.exists(self._temp_key_file.name):
            os.unlink(self._temp_key_file.name)
    
    def __del__(self):
        self.cleanup()


def create_aeat_client(
    environment: str = "sandbox",
    cert_path: str = None,
    cert_password: str = None
) -> AEATClient:
    env = AEATEnvironment(environment or os.getenv('AEAT_ENVIRONMENT', 'sandbox'))
    
    config = AEATConfig(
        environment=env,
        cert_path=cert_path or os.getenv('AEAT_CERT_PATH'),
        cert_password=cert_password or os.getenv('AEAT_CERT_PASSWORD')
    )
    
    return AEATClient(config)