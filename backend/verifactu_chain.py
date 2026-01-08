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


@dataclass
class ChainRecord:
    invoice_number: str
    invoice_date: date
    invoice_type: str
    hash_value: str
    previous_hash: Optional[str]
    csv_code: Optional[str]
    created_at: datetime


class VerifactuChainManager:
    
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
        
        if last_record:
            return ChainInfo(
                nif=nif,
                software_id=software_id,
                total_records=total,
                last_hash=last_record.hash_value,
                last_invoice_number=last_record.invoice_number,
                last_invoice_date=last_record.invoice_date.date() if last_record.invoice_date else None,
                is_first_record=False,
                chain_valid=True,  # TODO: Validate chain integrity
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
                chain_valid=True
            )
    
    def get_previous_hash(self, nif: str, software_id: str = "01") -> str:
        chain_info = self.get_chain_info(nif, software_id)
        
        if chain_info.is_first_record:
            logger.info(f"First record in chain for NIF {nif}, software {software_id}")
            return ""
        
        return chain_info.last_hash or ""
    
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
            return False, f"First record has non-empty previous_hash: {records[0].previous_hash}"
        
        for i in range(1, len(records)):
            expected_prev = records[i - 1].hash_value
            actual_prev = records[i].previous_hash
            
            if expected_prev != actual_prev:
                return False, (
                    f"Chain broken at record {i}: "
                    f"expected previous={expected_prev[:16]}..., "
                    f"got {actual_prev[:16] if actual_prev else 'None'}..."
                )
        
        return True, f"Chain valid with {len(records)} records"
    
    async def sync_from_aeat(self, nif: str, software_id: str = "01") -> bool:

        if not self.aeat_client:
            logger.warning("AEAT client not configured, cannot sync from AEAT")
            return False
        
        # TODO: Implement AEAT ConsultaLR API call
        # This would query AEAT for submitted invoices and rebuild local chain
        
        logger.info(f"Syncing chain from AEAT for NIF {nif}...")
        
        # Placeholder for AEAT consultation
        # response = await self.aeat_client.query_invoices(nif, software_id)
        
        return False  # Not implemented yet
    
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