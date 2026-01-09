

import asyncio
import sys
import os
from datetime import datetime, date
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from aeat_client import AEATClient, AEATConfig, AEATEnvironment
from verifactu import (
    VerifactuService, 
    VerifactuRecordData, 
    VerifactuRecordType
)
from verifactu_chain import (
    VerifactuChainManager, 
    VerifactuChainRecord,
    get_chain_manager
)
from core.base import Base


# Create a local SQLite database for testing
TEST_DB_URL = "sqlite:///./test_verifactu_chain.db"
engine = create_engine(TEST_DB_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def print_header(text):
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)


def print_success(text):
    print(f"✅ {text}")


def print_error(text):
    print(f"❌ {text}")


def print_info(text):
    print(f"ℹ️  {text}")


def print_warning(text):
    print(f"⚠️  {text}")


def init_test_database():
    """Initialize the test database with chain record table"""
    # Create tables
    VerifactuChainRecord.__table__.create(bind=engine, checkfirst=True)
    print_success("Test database initialized")
    return SessionLocal()


async def test_certificate(cert_path: str, cert_password: str):
    """Test 1: Verify certificate can be loaded and is valid"""
    print_header("TEST 1: Certificate Validation")
    
    try:
        config = AEATConfig(
            environment=AEATEnvironment.SANDBOX,
            cert_path=cert_path,
            cert_password=cert_password
        )
        client = AEATClient(config)
        
        cert_info = await client.verify_certificate()
        
        if cert_info.get('valid'):
            print_success("Certificate loaded successfully!")
            print(f"    Subject: {cert_info.get('subject', 'N/A')}")
            print(f"    Issuer: {cert_info.get('issuer', 'N/A')}")
            print(f"    Valid From: {cert_info.get('not_before', 'N/A')}")
            print(f"    Valid Until: {cert_info.get('not_after', 'N/A')}")
            
            if cert_info.get('is_expired'):
                print_error("WARNING: Certificate is EXPIRED!")
                return None
            else:
                print_success("Certificate is valid and not expired")
                return client
        else:
            print_error(f"Certificate validation failed: {cert_info.get('error')}")
            return None
            
    except Exception as e:
        print_error(f"Failed to load certificate: {e}")
        return None


async def test_connection(client: AEATClient):
    """Test 2: Test SSL connection to AEAT sandbox"""
    print_header("TEST 2: AEAT Sandbox Connection")
    
    print_info(f"Connecting to: {client.config.verifactu_url}")
    
    test_xml = """<sum:RegFactuSistemaFacturacion>
    <sum:Cabecera>
        <sum1:ObligadoEmision>
            <sum1:NombreRazon>TEST</sum1:NombreRazon>
            <sum1:NIF>00000000T</sum1:NIF>
        </sum1:ObligadoEmision>
    </sum:Cabecera>
</sum:RegFactuSistemaFacturacion>"""
    
    try:
        response = await client.submit_invoice(test_xml)
        print_success("SSL connection established successfully!")
        print(f"    Response Code: {response.response_code}")
        
        if response.response_code == 'SOAP_FAULT':
            print_info("SOAP Fault received (expected for test request)")
        
        return True
        
    except Exception as e:
        print_error(f"Connection failed: {e}")
        return False


async def test_chained_invoice_submission(
    client: AEATClient, 
    db_session,
    nif: str, 
    seller_name: str
):
    """Test 3: Submit invoice with proper chain management"""
    print_header("TEST 3: Chained Invoice Submission")
    
    # Initialize chain manager
    chain_manager = get_chain_manager(db_session)
    
    # Get current chain state
    chain_info = chain_manager.get_chain_info(nif)
    
    print_info("Current chain state:")
    print(f"    Total records: {chain_info.total_records}")
    print(f"    Is first record: {chain_info.is_first_record}")
    if chain_info.last_hash:
        print(f"    Last hash: {chain_info.last_hash[:32]}...")
        print(f"    Last invoice: {chain_info.last_invoice_number}")
    
    # Get previous hash for chaining
    previous_hash = chain_manager.get_previous_hash(nif)
    
    # Create invoice data
    invoice_number = f"CHAIN-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    record_data = VerifactuRecordData(
        nif=nif,
        seller_name=seller_name,
        document_number=invoice_number,
        document_date=date.today(),
        total_amount=Decimal("12.10"),
        vat_amount=Decimal("2.10"),
        vat_rate=21.0,
        record_type=VerifactuRecordType.INVOICE_SIMPLIFIED,  # F2
        description="Test invoice with chain management",
        software_name="TaxHelper",
        software_version="1.0.0",
        software_nif=nif
    )
    
    print_info(f"\nCreating invoice:")
    print(f"    Invoice Number: {invoice_number}")
    print(f"    Type: F2 (Simplified)")
    print(f"    Total: €{record_data.total_amount}")
    print(f"    Previous Hash: {'FIRST RECORD' if not previous_hash else previous_hash[:32] + '...'}")
    
    # Generate hash with proper chaining
    hash_result = VerifactuService.generate_hash(
        record_data, 
        previous_hash if previous_hash else None
    )
    
    print_success(f"Hash generated: {hash_result.hash_value[:32]}...")
    print_info(f"Hash input: {hash_result.hash_input[:80]}...")
    
    # Add to local chain BEFORE submitting
    chain_record = chain_manager.add_record(
        nif=nif,
        invoice_number=invoice_number,
        invoice_date=date.today(),
        invoice_type="F2",
        hash_value=hash_result.hash_value,
        previous_hash=previous_hash,
        hash_input=hash_result.hash_input
    )
    print_success(f"Added to local chain (record #{chain_record.id})")
    
    # Generate XML
    xml_result = VerifactuService.create_xml_record(
        record_data,
        hash_result,
        invoice_number,
        previous_record={
            'nif': nif,
            'num_serie': chain_info.last_invoice_number,
            'fecha': chain_info.last_invoice_date.strftime('%d-%m-%Y') if chain_info.last_invoice_date else None,
            'hash': previous_hash
        } if previous_hash else None
    )
    
    print_success("XML generated")
    
    # Generate QR code
    qr_result = VerifactuService.generate_qr_code(
        record_data, 
        hash_result.hash_value, 
        is_sandbox=True
    )
    print_success(f"QR Code generated")
    
    # Submit to AEAT
    print_info("\nSubmitting to AEAT sandbox...")
    
    try:
        response = await client.submit_invoice(xml_result.xml_content)
        
        print(f"\n    Success: {response.success}")
        print(f"    Response Code: {response.response_code}")
        print(f"    Message: {response.response_message}")
        
        if response.csv_code:
            print_success(f"CSV Code: {response.csv_code}")
            
            # Update chain record with AEAT response
            chain_manager.update_aeat_response(
                nif=nif,
                invoice_number=invoice_number,
                invoice_date=date.today(),
                csv_code=response.csv_code,
                accepted=response.success,
                environment="sandbox"
            )
            print_success("Chain record updated with AEAT response")
        
        if response.errors:
            print_warning("Warnings/Errors:")
            for err in response.errors:
                code = err.get('code', 'N/A')
                desc = err.get('description', 'No description')
                
                # Check for specific warnings
                if code == '2007':
                    print_warning(f"  [{code}] Chain warning - this is expected for new software ID")
                elif code == '2000':
                    print_error(f"  [{code}] Hash mismatch!")
                    print(f"         {desc}")
                else:
                    print_info(f"  [{code}] {desc[:100]}")
        
        return response
        
    except Exception as e:
        print_error(f"Submission failed: {e}")
        import traceback
        traceback.print_exc()
        return None


def show_chain_status(db_session, nif: str):
    """Show current chain status"""
    print_header("CHAIN STATUS")
    
    chain_manager = get_chain_manager(db_session)
    chain_info = chain_manager.get_chain_info(nif)
    
    print(f"NIF: {nif}")
    print(f"Total Records: {chain_info.total_records}")
    print(f"Chain Valid: {chain_info.chain_valid}")
    
    if chain_info.last_hash:
        print(f"Last Hash: {chain_info.last_hash[:32]}...")
        print(f"Last Invoice: {chain_info.last_invoice_number}")
        print(f"Last Date: {chain_info.last_invoice_date}")
        print(f"Last CSV: {chain_info.last_csv}")
    
    # Show recent records
    records = chain_manager.get_chain_records(nif, limit=5)
    if records:
        print("\nRecent Records:")
        for r in records:
            status = "✓" if r.csv_code else "○"
            prev = r.previous_hash[:8] + "..." if r.previous_hash else "FIRST"
            print(f"  {status} {r.invoice_number} | {r.hash_value[:16]}... | prev: {prev}")
    
    # Validate chain integrity
    is_valid, message = chain_manager.validate_chain_integrity(nif)
    print(f"\nChain Integrity: {'✅ ' + message if is_valid else '❌ ' + message}")


async def main():
    print("\n" + "🇪🇸 " * 20)
    print("     AEAT SANDBOX TEST - With Chain Management")
    print("🇪🇸 " * 20)
    
    # Get certificate
    if len(sys.argv) >= 3:
        cert_path = sys.argv[1]
        cert_password = sys.argv[2]
    else:
        cert_path = os.getenv('AEAT_CERT_PATH')
        cert_password = os.getenv('AEAT_CERT_PASSWORD')
    
    if not cert_path or not os.path.exists(cert_path):
        print_error("Certificate not found!")
        print("\nUsage: python test_aeat_sandbox.py /path/to/cert.p12 password")
        return
    
    print_info(f"Certificate: {cert_path}")
    print_info(f"Environment: SANDBOX")
    
    # Initialize test database
    db_session = init_test_database()
    
    try:
        # Test 1: Certificate
        client = await test_certificate(cert_path, cert_password)
        if not client:
            return
        
        # Test 2: Connection
        if not await test_connection(client):
            client.cleanup()
            return
        
        # Get NIF from certificate
        cert_info = await client.verify_certificate()
        default_nif = "TEST00000T"
        default_name = "Test User"
        
        if cert_info.get('valid'):
            subject = cert_info.get('subject', '')
            if 'IDCES-' in subject:
                import re
                match = re.search(r'IDCES-([A-Z0-9]+)', subject)
                if match:
                    default_nif = match.group(1)
            if 'CN=' in subject:
                import re
                match = re.search(r'CN=([^,]+)', subject)
                if match:
                    name_parts = match.group(1).split(' - ')
                    default_name = name_parts[0] if name_parts else match.group(1)
        
        # User input
        print_header("TEST 3 SETUP")
        print(f"\nDetected from certificate:")
        print(f"  NIF: {default_nif}")
        print(f"  Name: {default_name}")
        
        nif = input(f"\nEnter NIF (or Enter for '{default_nif}'): ").strip() or default_nif
        seller_name = input(f"Enter name (or Enter for '{default_name}'): ").strip() or default_name
        
        # Show current chain status
        show_chain_status(db_session, nif)
        
        # Ask if user wants to continue
        proceed = input("\nSubmit new invoice? (y/n): ").strip().lower()
        if proceed != 'y':
            print_info("Skipped invoice submission")
        else:
            # Test 3: Submit chained invoice
            await test_chained_invoice_submission(client, db_session, nif, seller_name)
        
        # Show final chain status
        show_chain_status(db_session, nif)
        
        # Cleanup
        client.cleanup()
        
        # Summary
        print_header("TEST COMPLETE")
        print_success("All tests completed!")
        
    finally:
        db_session.close()


if __name__ == "__main__":
    asyncio.run(main())