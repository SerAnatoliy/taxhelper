from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import os
import requests
import hmac
import hashlib
import json

from dotenv import load_dotenv
load_dotenv()

from database import get_db, User
from auth import get_current_user

router = APIRouter(prefix="/veriff", tags=["veriff"])

VERIFF_API_KEY = os.getenv("VERIFF_API_KEY")
VERIFF_API_SECRET = os.getenv("VERIFF_SHARED_SECRET")
VERIFF_BASE_URL = "https://stationapi.veriff.com/v1"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

class CreateSessionResponse(BaseModel):
    verification_id: str
    session_url: str
    status: str


class VerificationStatusResponse(BaseModel):
    verification_id: str
    status: str
    verified: bool

def generate_hmac_signature(payload: dict) -> str:
    payload_json = json.dumps(payload, separators=(',', ':'))
    signature = hmac.new(
        VERIFF_API_SECRET.encode('utf-8'),
        payload_json.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return signature


@router.post("/create-session", response_model=CreateSessionResponse)
async def create_verification_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not VERIFF_API_KEY or not VERIFF_API_SECRET:
        raise HTTPException(
            status_code=500, 
            detail="Veriff not configured. Please contact support."
        )
    
    name_parts = (current_user.full_name or "").split(" ", 1)
    first_name = name_parts[0] if name_parts else "User"
    last_name = name_parts[1] if len(name_parts) > 1 else ""
    
    payload = {
        "verification": {
            "callback": f"{FRONTEND_URL}/onboarding?step=2&veriff=callback",
            "person": {
                "firstName": first_name,
                "lastName": last_name,
            },
            "document": {
                "country": "ES",  
                "type": "ID_CARD"  
            },
            "vendorData": str(current_user.id),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "X-AUTH-CLIENT": VERIFF_API_KEY,
    }
    
    try:
        response = requests.post(
            f"{VERIFF_BASE_URL}/sessions",
            json=payload,
            headers=headers
        )
        
        if response.status_code != 201:
            print(f"Veriff error: {response.status_code} - {response.text}")
            raise HTTPException(
                status_code=500,
                detail="Failed to create verification session"
            )
        
        data = response.json()
        verification = data.get("verification", {})
        
        current_user.veriff_session_id = verification.get("id")
        db.commit()
        
        return CreateSessionResponse(
            verification_id=verification.get("id"),
            session_url=verification.get("url"),
            status=verification.get("status", "created")
        )
        
    except requests.RequestException as e:
        print(f"Veriff request error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to connect to verification service"
        )


@router.get("/status/{verification_id}", response_model=VerificationStatusResponse)
async def get_verification_status(
    verification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    headers = {
        "Content-Type": "application/json",
        "X-AUTH-CLIENT": VERIFF_API_KEY,
    }
    
    try:
        response = requests.get(
            f"{VERIFF_BASE_URL}/sessions/{verification_id}",
            headers=headers
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Verification not found")
        
        data = response.json()
        verification = data.get("verification", {})
        status = verification.get("status", "unknown")
        
        if status == "approved":
            current_user.verified_kyc = True
            db.commit()
        
        return VerificationStatusResponse(
            verification_id=verification_id,
            status=status,
            verified=status == "approved"
        )
        
    except requests.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to check verification status"
        )


@router.post("/webhook")
async def veriff_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    signature = request.headers.get("x-hmac-signature")
    
    body = await request.body()
    
    expected_signature = hmac.new(
        VERIFF_API_SECRET.encode('utf-8'),
        body,
        hashlib.sha256
    ).hexdigest()
    
    if signature != expected_signature:
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    payload = await request.json()
    
    verification = payload.get("verification", {})
    vendor_data = verification.get("vendorData")  
    status = verification.get("status")
    verification_id = verification.get("id")
    
    print(f"Veriff webhook: user={vendor_data}, status={status}, id={verification_id}")
    
    if vendor_data:
        try:
            user_id = int(vendor_data)
            user = db.query(User).filter(User.id == user_id).first()
            
            if user:
                if status == "approved":
                    user.verified_kyc = True
                    user.kyc_verified_at = datetime.utcnow()
                elif status == "declined" or status == "resubmission_requested":
                    user.verified_kyc = False
                
                user.veriff_status = status
                db.commit()
                
        except (ValueError, TypeError):
            print(f"Invalid vendor_data: {vendor_data}")
    
    return {"status": "received"}


@router.post("/skip")
async def skip_verification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.kyc_skipped = True
    db.commit()
    return {"status": "skipped", "message": "You can complete verification later in settings"}