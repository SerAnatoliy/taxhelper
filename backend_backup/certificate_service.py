import os
import hashlib
import logging
from datetime import datetime
from typing import Optional, Tuple, Dict, Any
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.serialization import pkcs12
from cryptography.x509 import load_der_x509_certificate
import base64

from sqlalchemy.orm import Session
from database import UserCertificate, AEATSubmission, User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CertificateEncryptionError(Exception):
    pass


class CertificateService:
    
    def __init__(self):
        self._master_key = self._get_master_key()
    
    def _get_master_key(self) -> bytes:
        key = os.getenv('CERTIFICATE_ENCRYPTION_KEY')
        if not key:
            logger.warning("CERTIFICATE_ENCRYPTION_KEY not set! Using generated key (NOT FOR PRODUCTION)")
            key = Fernet.generate_key().decode()
            os.environ['CERTIFICATE_ENCRYPTION_KEY'] = key
        
        try:
            Fernet(key.encode() if isinstance(key, str) else key)
            return key.encode() if isinstance(key, str) else key
        except Exception:
            return self._derive_key_from_secret(key.encode(), b'master_salt_v1')
    
    def _derive_key_from_secret(self, secret: bytes, salt: bytes) -> bytes:
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        key = base64.urlsafe_b64encode(kdf.derive(secret))
        return key
    
    def _get_fernet(self, salt: bytes) -> Fernet:
        derived_key = self._derive_key_from_secret(self._master_key, salt)
        return Fernet(derived_key)
    
    def _generate_salt(self) -> bytes:
        return os.urandom(16)
    
    def _calculate_fingerprint(self, cert_data: bytes, password: str) -> str:
        try:
            pwd = password.encode() if password else None
            _, certificate, _ = pkcs12.load_key_and_certificates(
                cert_data, pwd, default_backend()
            )
            der_bytes = certificate.public_bytes(
                encoding=__import__('cryptography.hazmat.primitives.serialization', 
                                   fromlist=['Encoding']).Encoding.DER
            )
            return hashlib.sha256(der_bytes).hexdigest()
        except Exception as e:
            logger.warning(f"Could not extract cert for fingerprint: {e}")
            return hashlib.sha256(cert_data).hexdigest()
    
    def _extract_cert_metadata(self, cert_data: bytes, password: str) -> Dict[str, Any]:
        try:
            pwd = password.encode() if password else None
            _, certificate, _ = pkcs12.load_key_and_certificates(
                cert_data, pwd, default_backend()
            )
            
            subject = certificate.subject.rfc4514_string()
            
            nif = None
            for attr in certificate.subject:
                if 'serialNumber' in attr.oid._name or 'NIF' in str(attr.value).upper():
                    nif = attr.value
                    break
            
            cn = None
            for attr in certificate.subject:
                if attr.oid._name == 'commonName':
                    cn = attr.value
                    break
            
            return {
                'subject_cn': cn or subject[:255],
                'subject_nif': nif[:20] if nif else None,
                'issuer': certificate.issuer.rfc4514_string()[:255],
                'serial_number': str(certificate.serial_number)[:100],
                'valid_from': certificate.not_valid_before_utc.replace(tzinfo=None),
                'valid_until': certificate.not_valid_after_utc.replace(tzinfo=None),
                'is_expired': datetime.utcnow() > certificate.not_valid_after_utc.replace(tzinfo=None)
            }
        except Exception as e:
            logger.error(f"Failed to extract cert metadata: {e}")
            raise CertificateEncryptionError(f"Invalid certificate: {str(e)}")
    
    def store_certificate(
        self,
        db: Session,
        user_id: int,
        cert_data: bytes,
        password: str,
        cert_type: str = "FNMT",
        ip_address: str = None
    ) -> UserCertificate:

        metadata = self._extract_cert_metadata(cert_data, password)
        fingerprint = self._calculate_fingerprint(cert_data, password)
        
        salt = self._generate_salt()
        fernet = self._get_fernet(salt)
        
        cert_encrypted = fernet.encrypt(cert_data)
        password_encrypted = fernet.encrypt(password.encode())
        
        existing = db.query(UserCertificate).filter(
            UserCertificate.user_id == user_id
        ).first()
        
        if existing:
            existing.certificate_type = cert_type
            existing.subject_cn = metadata['subject_cn']
            existing.subject_nif = metadata['subject_nif']
            existing.issuer = metadata['issuer']
            existing.serial_number = metadata['serial_number']
            existing.valid_from = metadata['valid_from']
            existing.valid_until = metadata['valid_until']
            existing.certificate_data_encrypted = cert_encrypted
            existing.password_encrypted = password_encrypted
            existing.encryption_salt = salt
            existing.fingerprint = fingerprint
            existing.is_active = True
            existing.is_expired = metadata['is_expired']
            existing.updated_at = datetime.utcnow()
            existing.uploaded_ip = ip_address
            
            db.commit()
            db.refresh(existing)
            logger.info(f"Updated certificate for user {user_id}")
            return existing
        
        cert_record = UserCertificate(
            user_id=user_id,
            certificate_type=cert_type,
            subject_cn=metadata['subject_cn'],
            subject_nif=metadata['subject_nif'],
            issuer=metadata['issuer'],
            serial_number=metadata['serial_number'],
            valid_from=metadata['valid_from'],
            valid_until=metadata['valid_until'],
            certificate_data_encrypted=cert_encrypted,
            password_encrypted=password_encrypted,
            encryption_salt=salt,
            fingerprint=fingerprint,
            is_expired=metadata['is_expired'],
            uploaded_ip=ip_address
        )
        
        db.add(cert_record)
        db.commit()
        db.refresh(cert_record)
        
        logger.info(f"Stored new certificate for user {user_id}, fingerprint: {fingerprint[:16]}...")
        return cert_record
    
    def get_certificate(
        self,
        db: Session,
        user_id: int
    ) -> Optional[Tuple[bytes, str]]:
        cert_record = db.query(UserCertificate).filter(
            UserCertificate.user_id == user_id,
            UserCertificate.is_active == True
        ).first()
        
        if not cert_record:
            return None
        
        try:
            fernet = self._get_fernet(cert_record.encryption_salt)
            
            cert_data = fernet.decrypt(cert_record.certificate_data_encrypted)
            password = fernet.decrypt(cert_record.password_encrypted).decode()
            
            cert_record.last_used_at = datetime.utcnow()
            cert_record.use_count += 1
            db.commit()
            
            return cert_data, password
            
        except Exception as e:
            logger.error(f"Failed to decrypt certificate for user {user_id}: {e}")
            raise CertificateEncryptionError("Failed to decrypt certificate")
    
    def get_certificate_info(
        self,
        db: Session,
        user_id: int
    ) -> Optional[Dict[str, Any]]:
        cert_record = db.query(UserCertificate).filter(
            UserCertificate.user_id == user_id
        ).first()
        
        if not cert_record:
            return None
        
        return {
            'id': cert_record.id,
            'certificate_type': cert_record.certificate_type,
            'subject_cn': cert_record.subject_cn,
            'subject_nif': cert_record.subject_nif,
            'issuer': cert_record.issuer,
            'serial_number': cert_record.serial_number,
            'valid_from': cert_record.valid_from.isoformat() if cert_record.valid_from else None,
            'valid_until': cert_record.valid_until.isoformat() if cert_record.valid_until else None,
            'is_active': cert_record.is_active,
            'is_expired': cert_record.is_expired or (
                cert_record.valid_until and datetime.utcnow() > cert_record.valid_until
            ),
            'fingerprint': cert_record.fingerprint,
            'last_used_at': cert_record.last_used_at.isoformat() if cert_record.last_used_at else None,
            'use_count': cert_record.use_count,
            'uploaded_at': cert_record.uploaded_at.isoformat()
        }
    
    def delete_certificate(
        self,
        db: Session,
        user_id: int
    ) -> bool:
        cert_record = db.query(UserCertificate).filter(
            UserCertificate.user_id == user_id
        ).first()
        
        if not cert_record:
            return False
        
        db.delete(cert_record)
        db.commit()
        
        logger.info(f"Deleted certificate for user {user_id}")
        return True
    
    def log_submission(
        self,
        db: Session,
        user_id: int,
        submission_type: str,
        entity_id: int,
        environment: str,
        success: bool,
        csv_code: str = None,
        response_code: str = None,
        response_message: str = None,
        xml_sent: str = None,
        response_raw: str = None,
        error_codes: list = None,
        ip_address: str = None,
        user_agent: str = None,
        duration_ms: int = None,
        endpoint_url: str = None
    ) -> AEATSubmission:
        
        cert_record = db.query(UserCertificate).filter(
            UserCertificate.user_id == user_id
        ).first()
        
        submission = AEATSubmission(
            user_id=user_id,
            submission_type=submission_type,
            entity_id=entity_id,
            environment=environment,
            endpoint_url=endpoint_url,
            xml_sent=xml_sent,
            xml_hash=hashlib.sha256(xml_sent.encode()).hexdigest() if xml_sent else None,
            success=success,
            csv_code=csv_code,
            response_code=response_code,
            response_message=response_message,
            response_raw=response_raw,
            error_codes=error_codes,
            response_received_at=datetime.utcnow(),
            duration_ms=duration_ms,
            ip_address=ip_address,
            user_agent=user_agent[:500] if user_agent else None,
            certificate_fingerprint=cert_record.fingerprint if cert_record else None
        )
        
        db.add(submission)
        db.commit()
        db.refresh(submission)
        
        return submission
    
    def get_submission_history(
        self,
        db: Session,
        user_id: int,
        limit: int = 50,
        submission_type: str = None
    ) -> list:
        query = db.query(AEATSubmission).filter(
            AEATSubmission.user_id == user_id
        )
        
        if submission_type:
            query = query.filter(AEATSubmission.submission_type == submission_type)
        
        submissions = query.order_by(
            AEATSubmission.submitted_at.desc()
        ).limit(limit).all()
        
        return [
            {
                'id': s.id,
                'submission_type': s.submission_type,
                'entity_id': s.entity_id,
                'environment': s.environment,
                'success': s.success,
                'csv_code': s.csv_code,
                'response_code': s.response_code,
                'response_message': s.response_message,
                'submitted_at': s.submitted_at.isoformat(),
                'duration_ms': s.duration_ms
            }
            for s in submissions
        ]


_certificate_service = None

def get_certificate_service() -> CertificateService:
    global _certificate_service
    if _certificate_service is None:
        _certificate_service = CertificateService()
    return _certificate_service