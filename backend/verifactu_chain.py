import logging
from datetime import datetime, date
from typing import Optional, Dict, Any, List, Tuple
from decimal import Decimal
from dataclasses import dataclass
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_

from database import VerifactuChainRecord, Invoice

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ChainInfo:
    nif: str
    software_id: str
    total_records: int
    last_hash: Optional[str]
    last_invoice_number: Optional[str]
    last_invoice_date: Optional[date]
    is_first_record: bool
    chain_valid: bool
    last_csv: Optional[str] = None
    validation_message: Optional[str] = None


@dataclass
class ChainRecord:
    invoice_number: str
    invoice_date: date
    invoice_type: str
    hash_value: str
    previous_hash: Optional[str]
    csv_code: Optional[str]
    created_at: datetime


@dataclass
class AEATInvoiceRecord:
    nif: str
    invoice_number: str
    invoice_date: date
    invoice_type: str
    hash_value: str
    csv_code: str
    status: str  
    submission_date: datetime


class VerifactuChainManager:

    CONSULTA_SANDBOX = "https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP"
    CONSULTA_PRODUCTION = "https://www1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP"
    
    NAMESPACES = {
        'soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
        'sfLRC': 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/ConsultaLR.xsd',
        'sf': 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd',
    }
    
    def __init__(self, db: Session, aeat_client=None):
        self.db = db
        self.aeat_client = aeat_client
    
    def get_chain_info(self, nif: str, software_id: str = "01") -> ChainInfo:
        nif = nif.upper().strip()
        
        total = self.db.query(VerifactuChainRecord).filter(
            and_(
                VerifactuChainRecord.nif == nif,
                VerifactuChainRecord.software_id == software_id
            )
        ).count()
        
        last_record = self.db.query(VerifactuChainRecord).filter(
            and_(
                VerifactuChainRecord.nif == nif,
                VerifactuChainRecord.software_id == software_id
            )
        ).order_by(desc(VerifactuChainRecord.created_at)).first()
        
        chain_valid, validation_message = self.validate_chain_integrity(nif, software_id)
        
        if last_record:
            return ChainInfo(
                nif=nif,
                software_id=software_id,
                total_records=total,
                last_hash=last_record.hash_value,
                last_invoice_number=last_record.invoice_number,
                last_invoice_date=last_record.invoice_date.date() if last_record.invoice_date else None,
                is_first_record=False,
                chain_valid=chain_valid,
                validation_message=validation_message,
                last_csv=last_record.csv_code
            )
        else:
            return ChainInfo(
                nif=nif,
                software_id=software_id,
                total_records=0,
                last_hash=None,
                last_invoice_number=None,
                last_invoice_date=None,
                is_first_record=True,
                chain_valid=True,
                validation_message="No records in chain"
            )
    
    def get_previous_hash(self, nif: str, software_id: str = "01") -> str:
        nif = nif.upper().strip()
        
        last_record = self.db.query(VerifactuChainRecord).filter(
            and_(
                VerifactuChainRecord.nif == nif,
                VerifactuChainRecord.software_id == software_id
            )
        ).order_by(desc(VerifactuChainRecord.created_at)).first()
        
        if not last_record:
            logger.info(f"First record in chain for NIF {nif}, software {software_id}")
            return ""
        
        return last_record.hash_value or ""
    
    def add_record(
        self,
        nif: str,
        invoice_number: str,
        invoice_date: date,
        invoice_type: str,
        hash_value: str,
        previous_hash: str,
        hash_input: str = None,
        software_id: str = "01",
        invoice_id: int = None
    ) -> VerifactuChainRecord:
        nif = nif.upper().strip()
        
        record = VerifactuChainRecord(
            nif=nif,
            software_id=software_id,
            invoice_number=invoice_number,
            invoice_date=datetime.combine(invoice_date, datetime.min.time()),
            invoice_type=invoice_type,
            hash_value=hash_value,
            previous_hash=previous_hash if previous_hash else None,
            hash_input=hash_input,
            invoice_id=invoice_id,
            created_at=datetime.utcnow()
        )
        
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        
        logger.info(
            f"Added chain record: NIF={nif}, Invoice={invoice_number}, "
            f"Hash={hash_value[:16]}..., Previous={previous_hash[:16] if previous_hash else 'FIRST'}..."
        )
        
        return record
    
    def update_aeat_response(
        self,
        nif: str,
        invoice_number: str,
        invoice_date: date,
        csv_code: str,
        accepted: bool,
        environment: str = "sandbox",
        software_id: str = "01"
    ) -> bool:
        nif = nif.upper().strip()
        
        record = self.db.query(VerifactuChainRecord).filter(
            and_(
                VerifactuChainRecord.nif == nif,
                VerifactuChainRecord.software_id == software_id,
                VerifactuChainRecord.invoice_number == invoice_number
            )
        ).first()
        
        if record:
            record.csv_code = csv_code
            record.aeat_accepted = accepted
            record.aeat_submitted_at = datetime.utcnow()
            record.aeat_environment = environment
            self.db.commit()
            
            logger.info(f"Updated chain record {invoice_number} with CSV: {csv_code}")
            return True
        
        logger.warning(f"Chain record not found for invoice {invoice_number}")
        return False
    
    def get_chain_records(
        self,
        nif: str,
        software_id: str = "01",
        limit: int = 100
    ) -> List[ChainRecord]:
        nif = nif.upper().strip()

        records = self.db.query(VerifactuChainRecord).filter(
            and_(
                VerifactuChainRecord.nif == nif,
                VerifactuChainRecord.software_id == software_id
            )
        ).order_by(desc(VerifactuChainRecord.created_at)).limit(limit).all()
        
        return [
            ChainRecord(
                invoice_number=r.invoice_number,
                invoice_date=r.invoice_date.date() if r.invoice_date else None,
                invoice_type=r.invoice_type,
                hash_value=r.hash_value,
                previous_hash=r.previous_hash,
                csv_code=r.csv_code,
                created_at=r.created_at
            )
            for r in records
        ]
    
    def validate_chain_integrity(self, nif: str, software_id: str = "01") -> Tuple[bool, str]:
        nif = nif.upper().strip()
        
        records = self.db.query(VerifactuChainRecord).filter(
            and_(
                VerifactuChainRecord.nif == nif,
                VerifactuChainRecord.software_id == software_id
            )
        ).order_by(VerifactuChainRecord.created_at).all()
        
        if not records:
            return True, "No records in chain"
        
        if records[0].previous_hash:
            return False, f"First record has non-empty previous_hash: {records[0].previous_hash[:16]}..."
        
        for i in range(1, len(records)):
            expected_prev = records[i - 1].hash_value
            actual_prev = records[i].previous_hash
            
            if expected_prev != actual_prev:
                return False, (
                    f"Chain broken at record {i} ({records[i].invoice_number}): "
                    f"expected previous={expected_prev[:16]}..., "
                    f"got {actual_prev[:16] if actual_prev else 'None'}..."
                )
        
        return True, f"Chain valid with {len(records)} records"
    
    def _build_consulta_xml(
        self,
        nif: str,
        ejercicio: int,
        periodo: str,
        nombre_razon: str = None,
        software_id: str = "01"
    ) -> str:
        if not nombre_razon:
            nombre_razon = f"OBLIGADO {nif}"
        
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:sum="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/ConsultaLR.xsd"
    xmlns:sum1="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd">
    <soapenv:Header/>
    <soapenv:Body>
        <sum:ConsultaFactuSistemaFacturacion>
            <sum:Cabecera>
                <sum1:IDVersion>1.0</sum1:IDVersion>
                <sum1:ObligadoEmision>
                    <sum1:NombreRazon>{nombre_razon}</sum1:NombreRazon>
                    <sum1:NIF>{nif}</sum1:NIF>
                </sum1:ObligadoEmision>
            </sum:Cabecera>
            <sum:FiltroConsulta>
                <sum:PeriodoImputacion>
                    <sum1:Ejercicio>{ejercicio}</sum1:Ejercicio>
                    <sum1:Periodo>{periodo}</sum1:Periodo>
                </sum:PeriodoImputacion>
            </sum:FiltroConsulta>
        </sum:ConsultaFactuSistemaFacturacion>
    </soapenv:Body>
</soapenv:Envelope>"""
    
    def _parse_consulta_response(self, response_xml: str) -> Tuple[List[AEATInvoiceRecord], str]:
        import xml.etree.ElementTree as ET
        
        records = []
        status_msg = ""
        
        try:
            if response_xml.startswith('\ufeff'):
                response_xml = response_xml[1:]
            
            root = ET.fromstring(response_xml)
            
            fault = root.find('.//{http://schemas.xmlsoap.org/soap/envelope/}Fault')
            if fault is not None:
                fault_string = fault.find('faultstring')
                error_msg = fault_string.text if fault_string is not None else 'Unknown error'
                
                if 'Codigo[4104]' in error_msg:
                    return [], f"AEAT Error 4104: NIF not authorized for ConsultaLR. The certificate may not have permission to query records for this NIF, or the NIF is not registered in AEAT's census."
                elif 'Codigo[4102]' in error_msg:
                    return [], f"AEAT Error 4102: XML Schema validation failed - {error_msg}"
                else:
                    return [], f"SOAP Fault: {error_msg}"
            
            ns_patterns = [
                {
                    'soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
                    'ns': 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/RespuestaConsultaLR.xsd',
                    'sf': 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd',
                },
                {
                    'soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
                    'ns': 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/ConsultaLR.xsd',
                    'sf': 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd',
                },
            ]
            
            for tag in ['EstadoEnvio', 'Estado', 'ResultadoConsulta']:
                estado = root.find(f'.//{{{ns_patterns[0]["ns"]}}}{tag}')
                if estado is None:
                    estado = root.find(f'.//*[local-name()="{tag}"]')
                if estado is not None and estado.text:
                    status_msg = estado.text
                    break
            
            registro_elements = []
            for elem_name in ['RegistroRespuestaConsultaFactu', 'RegistroFactura', 'DatosRegistroFactura']:
                registro_elements.extend(root.findall(f'.//*[local-name()="{elem_name}"]'))
            
            for registro in registro_elements:
                try:
                    record = self._parse_single_registro(registro, ns_patterns[0])
                    if record:
                        records.append(record)
                except Exception as e:
                    logger.warning(f"Error parsing individual registro: {e}")
                    continue
            
            if not records and not status_msg:
                if 'Correcto' in response_xml or 'OK' in response_xml:
                    status_msg = "Query successful - no records found for this period"
                else:
                    status_msg = "No records found in response"
                    
        except ET.ParseError as e:
            logger.error(f"XML Parse error in ConsultaLR response: {e}")
            logger.debug(f"Response content: {response_xml[:500]}...")
            return [], f"XML Parse Error: {e}"
        except Exception as e:
            logger.error(f"Error parsing ConsultaLR response: {e}")
            return [], f"Error: {e}"
        
        return records, status_msg or f"Found {len(records)} records"
    
    def _parse_single_registro(self, registro, ns: dict) -> Optional[AEATInvoiceRecord]:
        
        def find_element(parent, *names):
            for name in names:
                # Try with namespace
                elem = parent.find(f'.//*[local-name()="{name}"]')
                if elem is not None:
                    return elem
            return None
        
        def get_text(parent, *names, default=''):
            elem = find_element(parent, *names)
            return elem.text if elem is not None and elem.text else default
        
        nif = get_text(registro, 'IDEmisorFactura', 'NIF', 'NIFEmisor')
        if not nif:
            id_factura = find_element(registro, 'IDFactura')
            if id_factura:
                nif = get_text(id_factura, 'IDEmisorFactura', 'NIF')
        
        num_serie = get_text(registro, 'NumSerieFactura', 'NumSerie', 'NumeroFactura')
        if not num_serie:
            id_factura = find_element(registro, 'IDFactura')
            if id_factura:
                num_serie = get_text(id_factura, 'NumSerieFactura', 'NumSerie')
        
        fecha_str = get_text(registro, 'FechaExpedicionFactura', 'FechaExpedicion', 'Fecha')
        if not fecha_str:
            id_factura = find_element(registro, 'IDFactura')
            if id_factura:
                fecha_str = get_text(id_factura, 'FechaExpedicionFactura', 'FechaExpedicion')
        
        if not all([nif, num_serie, fecha_str]):
            logger.debug(f"Missing required fields: nif={nif}, num_serie={num_serie}, fecha={fecha_str}")
            return None
        
        invoice_date = date.today()
        try:
            if '-' in fecha_str:
                parts = fecha_str.split('-')
                if len(parts[0]) == 4:  
                    invoice_date = date(int(parts[0]), int(parts[1]), int(parts[2]))
                else:  
                    invoice_date = date(int(parts[2]), int(parts[1]), int(parts[0]))
        except (ValueError, IndexError) as e:
            logger.warning(f"Could not parse date '{fecha_str}': {e}")
        
        hash_value = get_text(registro, 'Huella', 'Hash', 'HuellaRegistro')
        csv_code = get_text(registro, 'CSV', 'CodigoCSV')
        status = get_text(registro, 'EstadoRegistro', 'Estado', default='Desconocido')
        tipo_factura = get_text(registro, 'TipoFactura', 'Tipo', default='F1')
        
        fecha_registro_str = get_text(registro, 'FechaHoraRegistroAEAT', 'FechaRegistro', 'TimestampAEAT')
        submission_date = datetime.utcnow()
        if fecha_registro_str:
            try:
                submission_date = datetime.fromisoformat(
                    fecha_registro_str.replace('Z', '+00:00')
                )
            except ValueError:
                pass
        
        return AEATInvoiceRecord(
            nif=nif,
            invoice_number=num_serie,
            invoice_date=invoice_date,
            invoice_type=tipo_factura,
            hash_value=hash_value,
            csv_code=csv_code,
            status=status,
            submission_date=submission_date
        )
    
    async def query_aeat_invoices(
        self,
        nif: str,
        ejercicio: int,
        periodo: str,
        nombre_razon: str = None,
        software_id: str = "01",
        use_sandbox: bool = True
    ) -> Tuple[bool, List[AEATInvoiceRecord], str]:
        if not self.aeat_client:
            return False, [], "AEAT client not configured"
        
        import httpx
        
        nif = nif.upper().strip()
        url = self.CONSULTA_SANDBOX if use_sandbox else self.CONSULTA_PRODUCTION
        
        try:
            request_xml = self._build_consulta_xml(nif, ejercicio, periodo, nombre_razon, software_id)
            
            logger.info(f"Querying AEAT ConsultaLR for NIF {nif}, {ejercicio}/{periodo}")
            logger.debug(f"ConsultaLR URL: {url}")
            logger.debug(f"Request XML:\n{request_xml[:500]}...")
            
            ssl_ctx = self.aeat_client._setup_ssl_context()
            
            async with httpx.AsyncClient(
                verify=ssl_ctx,
                timeout=30.0
            ) as client:
                response = await client.post(
                    url,
                    content=request_xml.encode('utf-8'),
                    headers={
                        'Content-Type': 'text/xml; charset=utf-8',
                        'SOAPAction': 'ConsultaFactuSistemaFacturacion'
                    }
                )
                
                logger.info(f"ConsultaLR response status: {response.status_code}")
                
                if response.status_code == 200:
                    logger.info(f"AEAT Response (first 2000 chars):\n{response.text[:2000]}")
                    records, status_msg = self._parse_consulta_response(response.text)
                    return True, records, status_msg
                elif response.status_code == 500:
                    logger.warning(f"AEAT returned 500 - checking for SOAP Fault")
                    records, status_msg = self._parse_consulta_response(response.text)
                    if "SOAP Fault" in status_msg:
                        return False, [], status_msg
                    return True, records, status_msg
                else:
                    error_preview = response.text[:300] if response.text else "No response body"
                    return False, [], f"HTTP Error: {response.status_code} - {error_preview}"
                    
        except httpx.SSLError as e:
            logger.error(f"SSL Error querying AEAT: {e}")
            return False, [], f"Certificate error: {str(e)}"
        except httpx.TimeoutException:
            logger.error("Timeout querying AEAT ConsultaLR")
            return False, [], "Connection timeout"
        except Exception as e:
            logger.error(f"Error querying AEAT ConsultaLR: {e}")
            import traceback
            traceback.print_exc()
            return False, [], str(e)
    
    async def sync_from_aeat(
        self,
        nif: str,
        ejercicio: int = None,
        periodo: str = None,
        software_id: str = "01",
        use_sandbox: bool = True
    ) -> Tuple[bool, int, str]:
        if not self.aeat_client:
            logger.warning("AEAT client not configured, cannot sync from AEAT")
            return False, 0, "AEAT client not configured"
        
        if ejercicio is None:
            ejercicio = datetime.now().year
        if periodo is None:
            quarter = (datetime.now().month - 1) // 3 + 1
            periodo = f"{quarter}T"
        
        nif = nif.upper().strip()
        logger.info(f"Syncing chain from AEAT for NIF {nif}, {ejercicio}/{periodo}...")
        
        success, aeat_records, message = await self.query_aeat_invoices(
            nif=nif,
            ejercicio=ejercicio,
            periodo=periodo,
            software_id=software_id,
            use_sandbox=use_sandbox
        )
        
        if not success:
            return False, 0, message
        
        if not aeat_records:
            return True, 0, "No records found in AEAT for this period"
        
        updated_count = 0
        created_count = 0
        
        for aeat_record in aeat_records:
            local_record = self.db.query(VerifactuChainRecord).filter(
                and_(
                    VerifactuChainRecord.nif == nif,
                    VerifactuChainRecord.software_id == software_id,
                    VerifactuChainRecord.invoice_number == aeat_record.invoice_number
                )
            ).first()
            
            if local_record:
                local_record.csv_code = aeat_record.csv_code
                local_record.aeat_accepted = aeat_record.status == 'Correcto'
                local_record.aeat_submitted_at = aeat_record.submission_date
                local_record.aeat_environment = 'sandbox' if use_sandbox else 'production'
                updated_count += 1
                logger.debug(f"Updated local record {aeat_record.invoice_number}")
            else:
                new_record = VerifactuChainRecord(
                    nif=nif,
                    software_id=software_id,
                    invoice_number=aeat_record.invoice_number,
                    invoice_date=datetime.combine(aeat_record.invoice_date, datetime.min.time()),
                    invoice_type=aeat_record.invoice_type,
                    hash_value=aeat_record.hash_value,
                    previous_hash=None,  
                    csv_code=aeat_record.csv_code,
                    aeat_accepted=aeat_record.status == 'Correcto',
                    aeat_submitted_at=aeat_record.submission_date,
                    aeat_environment='sandbox' if use_sandbox else 'production',
                    created_at=datetime.utcnow()
                )
                self.db.add(new_record)
                created_count += 1
                logger.info(f"Created local record from AEAT: {aeat_record.invoice_number}")
        
        self.db.commit()
        
        total = updated_count + created_count
        return True, total, f"Synced {total} records ({updated_count} updated, {created_count} created)"
    
    async def verify_against_aeat(
        self,
        nif: str,
        ejercicio: int,
        periodo: str,
        software_id: str = "01",
        use_sandbox: bool = True
    ) -> Tuple[bool, Dict[str, Any]]:
        nif = nif.upper().strip()
        
        success, aeat_records, message = await self.query_aeat_invoices(
            nif=nif,
            ejercicio=ejercicio,
            periodo=periodo,
            software_id=software_id,
            use_sandbox=use_sandbox
        )
        
        if not success:
            return False, {"error": message, "success": False}
        
        aeat_lookup = {r.invoice_number: r for r in aeat_records}
        
        local_records = self.db.query(VerifactuChainRecord).filter(
            and_(
                VerifactuChainRecord.nif == nif,
                VerifactuChainRecord.software_id == software_id
            )
        ).all()
        
        report = {
            "success": True,
            "nif": nif,
            "ejercicio": ejercicio,
            "periodo": periodo,
            "total_local": len(local_records),
            "total_aeat": len(aeat_records),
            "matched": [],
            "hash_mismatch": [],
            "missing_in_aeat": [],
            "missing_locally": [],
            "summary": ""
        }
        
        local_invoice_numbers = set()
        
        for local in local_records:
            local_invoice_numbers.add(local.invoice_number)
            
            if local.invoice_number in aeat_lookup:
                aeat = aeat_lookup[local.invoice_number]
                if local.hash_value == aeat.hash_value:
                    report["matched"].append({
                        "invoice": local.invoice_number,
                        "hash": local.hash_value[:16] + "...",
                        "csv": aeat.csv_code
                    })
                else:
                    report["hash_mismatch"].append({
                        "invoice": local.invoice_number,
                        "local_hash": local.hash_value[:16] + "...",
                        "aeat_hash": aeat.hash_value[:16] + "..."
                    })
            else:
                if local.aeat_submitted_at:
                    report["missing_in_aeat"].append({
                        "invoice": local.invoice_number,
                        "submitted_at": local.aeat_submitted_at.isoformat() if local.aeat_submitted_at else None
                    })
        
        for inv_num in aeat_lookup:
            if inv_num not in local_invoice_numbers:
                aeat = aeat_lookup[inv_num]
                report["missing_locally"].append({
                    "invoice": inv_num,
                    "date": aeat.invoice_date.isoformat(),
                    "csv": aeat.csv_code
                })
        
        all_match = (
            len(report["hash_mismatch"]) == 0 and
            len(report["missing_in_aeat"]) == 0 and
            len(report["missing_locally"]) == 0
        )
        
        if all_match:
            report["summary"] = f"✅ All {len(report['matched'])} records verified successfully"
        else:
            issues = []
            if report["hash_mismatch"]:
                issues.append(f"{len(report['hash_mismatch'])} hash mismatches")
            if report["missing_in_aeat"]:
                issues.append(f"{len(report['missing_in_aeat'])} missing in AEAT")
            if report["missing_locally"]:
                issues.append(f"{len(report['missing_locally'])} missing locally")
            report["summary"] = f"⚠️ Issues found: {', '.join(issues)}"
        
        return all_match, report
    
    def reset_chain(self, nif: str, software_id: str = "01", confirm: bool = False) -> int:
        if not confirm:
            raise ValueError("Must confirm=True to reset chain")
        
        nif = nif.upper().strip()
        
        deleted = self.db.query(VerifactuChainRecord).filter(
            and_(
                VerifactuChainRecord.nif == nif,
                VerifactuChainRecord.software_id == software_id
            )
        ).delete()
        
        self.db.commit()
        
        logger.warning(f"RESET chain for NIF {nif}: deleted {deleted} records")
        return deleted


def get_chain_manager(db: Session, aeat_client=None) -> VerifactuChainManager:
    return VerifactuChainManager(db, aeat_client)