"""
Test script to verify hash calculation matches AEAT's expected format.
Run this to validate the hash algorithm before submitting invoices.
"""

import hashlib

def test_hash_calculation():
    """
    Test using AEAT's exact input from the error message to verify our algorithm.
    
    AEAT's expected input:
    IDEmisorFactura=Z0117657V&NumSerieFactura=SIMP-20260108224152&FechaExpedicionFactura=08-01-2026&TipoFactura=F2&CuotaTotal=2.10&ImporteTotal=12.10&Huella=&FechaHoraHusoGenRegistro=2026-01-08T21:41:52+01:00
    
    AEAT's calculated hash:
    9F30C89EA4D29CBCE4DDBBDF4CF9852B1FF90AC3A7F23E71B0E05FB4C5316647
    """
    
    # AEAT's exact input string (note: Huella= is empty for first record)
    aeat_input = "IDEmisorFactura=Z0117657V&NumSerieFactura=SIMP-20260108224152&FechaExpedicionFactura=08-01-2026&TipoFactura=F2&CuotaTotal=2.10&ImporteTotal=12.10&Huella=&FechaHoraHusoGenRegistro=2026-01-08T21:41:52+01:00"
    
    # AEAT's expected hash
    aeat_expected_hash = "9F30C89EA4D29CBCE4DDBBDF4CF9852B1FF90AC3A7F23E71B0E05FB4C5316647"
    
    # Calculate hash
    calculated_hash = hashlib.sha256(aeat_input.encode('utf-8')).hexdigest().upper()
    
    print("=" * 70)
    print("HASH CALCULATION TEST")
    print("=" * 70)
    print()
    print("Input string:")
    print(aeat_input)
    print()
    print(f"Expected hash (from AEAT): {aeat_expected_hash}")
    print(f"Calculated hash:           {calculated_hash}")
    print()
    
    if calculated_hash == aeat_expected_hash:
        print("✅ SUCCESS! Hash calculation matches AEAT's algorithm!")
    else:
        print("❌ MISMATCH! Hash calculation differs from AEAT's.")
        print()
        print("Checking byte-by-byte...")
        for i, (a, b) in enumerate(zip(aeat_expected_hash, calculated_hash)):
            if a != b:
                print(f"  First difference at position {i}: expected '{a}', got '{b}'")
                break
    
    print()
    print("=" * 70)
    print("KEY FINDINGS FROM AEAT ERROR:")
    print("=" * 70)
    print("""
1. Field name is "Huella" NOT "HuellaAnterior"
2. For first record in chain, Huella is EMPTY (Huella=)
3. For subsequent records, Huella contains previous record's hash
4. Timestamp must be in Spain local time with correct offset (+01:00 or +02:00)
5. All decimal values use 2 decimal places with dot separator (2.10, not 2,10)
""")


def build_hash_input(
    nif: str,
    num_serie: str,
    fecha_expedicion: str,  # DD-MM-YYYY format
    tipo_factura: str,
    cuota_total: str,  # e.g., "2.10"
    importe_total: str,  # e.g., "12.10"
    huella_anterior: str,  # Empty string for first record
    fecha_hora_huso: str  # e.g., "2026-01-08T21:41:52+01:00"
) -> tuple[str, str]:
    """
    Build hash input string and calculate hash.
    Returns (input_string, hash_value)
    """
    hash_input = "&".join([
        f"IDEmisorFactura={nif}",
        f"NumSerieFactura={num_serie}",
        f"FechaExpedicionFactura={fecha_expedicion}",
        f"TipoFactura={tipo_factura}",
        f"CuotaTotal={cuota_total}",
        f"ImporteTotal={importe_total}",
        f"Huella={huella_anterior}",
        f"FechaHoraHusoGenRegistro={fecha_hora_huso}"
    ])
    
    hash_value = hashlib.sha256(hash_input.encode('utf-8')).hexdigest().upper()
    
    return hash_input, hash_value


if __name__ == "__main__":
    test_hash_calculation()
    
    print()
    print("=" * 70)
    print("TESTING OUR BUILD FUNCTION")
    print("=" * 70)
    
    # Test with same values
    input_str, hash_val = build_hash_input(
        nif="Z0117657V",
        num_serie="SIMP-20260108224152",
        fecha_expedicion="08-01-2026",
        tipo_factura="F2",
        cuota_total="2.10",
        importe_total="12.10",
        huella_anterior="",  # Empty for first record!
        fecha_hora_huso="2026-01-08T21:41:52+01:00"
    )
    
    print(f"\nGenerated input: {input_str}")
    print(f"Generated hash:  {hash_val}")
    print(f"Expected hash:   9F30C89EA4D29CBCE4DDBBDF4CF9852B1FF90AC3A7F23E71B0E05FB4C5316647")
    
    if hash_val == "9F30C89EA4D29CBCE4DDBBDF4CF9852B1FF90AC3A7F23E71B0E05FB4C5316647":
        print("\n✅ Our function generates correct hashes!")
    else:
        print("\n❌ Function needs adjustment")