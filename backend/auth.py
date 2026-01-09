import base64
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, validator, Field
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, date
from typing import Optional
import re
import hmac
import hashlib
import requests
import time
import os
import json
import stripe

from dotenv import load_dotenv

load_dotenv()

from database import get_db, User 

router = APIRouter(prefix="/auth", tags=["auth"])

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter (a-z)')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter (A-Z)')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit (0-9)')
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>/?]', v):
            raise ValueError('Password must contain at least one special character (e.g., !@#$%)')
        if not re.match(r'^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};:"\\|,.<>/?]+$', v):
            raise ValueError('Password must contain only Latin letters, digits, and special characters')
        return v
class ProfileUpdate(BaseModel):
    """Schema for updating profile (personal information only)"""
    full_name: Optional[str] = Field(None, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    family_status: Optional[str] = Field(None, max_length=20)
    num_children: Optional[int] = Field(None, ge=0, le=20)
    
    # Address
    street_address: Optional[str] = Field(None, max_length=300)
    city: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=10)
    province: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=50)
    country: Optional[str] = Field(None, max_length=50)
    
    # Fiscal
    nif: Optional[str] = Field(None, max_length=15)
    tax_regime: Optional[str] = Field(None, max_length=50)
    business_address: Optional[str] = Field(None, max_length=300)
    
    @validator('phone_number')
    def validate_phone(cls, v):
        if v and not re.match(r'^[+]?[\d\s\-()]{6,20}$', v):
            raise ValueError('Invalid phone number format')
        return v
    
    @validator('postal_code')
    def validate_postal_code(cls, v):
        if v and not re.match(r'^\d{5}$', v):
            raise ValueError('Spanish postal code must be 5 digits')
        return v
    
    @validator('nif')
    def validate_nif(cls, v):
        if v:
            v = v.upper().strip()
            if not re.match(r'^[0-9]{8}[A-Z]$|^[XYZ][0-9]{7}[A-Z]$|^[ABCDEFGHJNPQRSUVW][0-9]{7}[A-Z0-9]$', v):
                raise ValueError('Invalid NIF/NIE/CIF format')
        return v


class ProfileResponse(BaseModel):
    """Response schema for profile data"""
    id: int
    email: str
    full_name: Optional[str]
    phone_number: Optional[str]
    date_of_birth: Optional[date]
    family_status: Optional[str]
    num_children: Optional[int]
    
    # Address
    street_address: Optional[str]
    city: Optional[str]
    postal_code: Optional[str]
    province: Optional[str]
    region: Optional[str]
    country: Optional[str]
    
    # Fiscal
    nif: Optional[str]
    tax_regime: Optional[str]
    business_address: Optional[str]
    
    # Meta
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class SettingsUpdate(BaseModel):
    """Schema for updating settings (consents & preferences)"""
    marketing_consent: Optional[bool] = None
    terms_accepted: Optional[bool] = None  # Will set terms_accepted_at
    privacy_accepted: Optional[bool] = None  # Will set privacy_accepted_at
    kyc_consent: Optional[bool] = None
    email_notifications: Optional[bool] = None
    deadline_reminders: Optional[bool] = None


class SettingsResponse(BaseModel):
    """Response schema for settings data"""
    # Consents
    marketing_consent: bool
    terms_accepted_at: Optional[datetime]
    privacy_accepted_at: Optional[datetime]
    kyc_consent: bool
    
    # Notification preferences
    email_notifications: bool
    deadline_reminders: bool
    
    # KYC status (read-only)
    verified_kyc: bool
    kyc_verified_at: Optional[datetime]
    
    # Subscription info (read-only)
    subscription_status: Optional[str]
    subscription_end_date: Optional[datetime]
    
    # Certificate status (read-only)
    has_certificate: bool
    certificate_valid_until: Optional[datetime]
    
    class Config:
        from_attributes = True
        
class UserUpdate(BaseModel):
    family_status: str | None = None
    num_children: int | None = None
    region: str | None = None
    city: str | None = None  
    business_address: str | None = None 

    @validator('family_status')
    def validate_family_status(cls, v):
        if v and v not in ['single', 'married', 'divorced', 'widowed']:  
            raise ValueError('Invalid family status. Must be single, married, divorced, widowed')
        return v

    @validator('region')
    def validate_region(cls, v):
        if v and v not in ['Madrid', 'Barcelona', 'Valencia', 'Andalusia', 'Basque Country', 'Catalonia', 'Galicia', 'Canary Islands', 'Balearic Islands', 'Castile and León', 'Castile-La Mancha', 'Extremadura', 'Navarre', 'La Rioja', 'Aragon', 'Asturias', 'Cantabria', 'Murcia']:
            raise ValueError('Invalid region. Must be one of Spain\'s autonomous communities')
        return v

# Auth Config
AUTH_SECRET_KEY = os.getenv("AUTH_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Auth Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, AUTH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, AUTH_SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# Endpoints
@router.post("/register", response_model=Token)
def register(user_create: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_create.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user_create.password)
    db_user = User(full_name=user_create.full_name, email=user_create.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    access_token = create_access_token(data={"sub": user_create.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email/password")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.patch("/profile", response_model=dict)
def update_profile(update_data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    update_dict = update_data.dict(exclude_unset=True)  
    
    for field, value in update_dict.items():
        current_value = getattr(current_user, field)
        if current_value is not None and value is None or value == "":
            raise HTTPException(status_code=400, detail=f"Cannot clear already set field '{field}'. Once set, it cannot be emptied.")
        
        setattr(current_user, field, value)  
    
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated successfully", "user": {"full_name": current_user.full_name, "family_status": current_user.family_status, "num_children": current_user.num_children, "region": current_user.region}}

@router.get("/profile", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get user profile (personal information)"""
    return ProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        phone_number=current_user.phone_number,
        date_of_birth=current_user.date_of_birth,
        family_status=current_user.family_status,
        num_children=current_user.num_children,
        street_address=current_user.street_address,
        city=current_user.city,
        postal_code=current_user.postal_code,
        province=current_user.province,
        region=current_user.region,
        country=current_user.country or 'ES',
        nif=current_user.nif,
        tax_regime=current_user.tax_regime,
        business_address=current_user.business_address,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )


@router.patch("/profile", response_model=ProfileResponse)
def update_profile(
    update_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile (personal information only)"""
    update_dict = update_data.dict(exclude_unset=True)
    
    # Apply updates
    for field, value in update_dict.items():
        setattr(current_user, field, value)
    
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    
    return get_profile(current_user)


@router.get("/settings", response_model=SettingsResponse)
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user settings (consents, preferences, account status)"""
    # Check certificate status
    cert = current_user.certificate
    has_cert = cert is not None and cert.is_active
    cert_valid = cert.valid_until if has_cert else None
    
    return SettingsResponse(
        marketing_consent=current_user.marketing_consent or False,
        terms_accepted_at=current_user.terms_accepted_at,
        privacy_accepted_at=current_user.privacy_accepted_at,
        kyc_consent=current_user.kyc_consent or False,
        email_notifications=current_user.email_notifications if current_user.email_notifications is not None else True,
        deadline_reminders=current_user.deadline_reminders if current_user.deadline_reminders is not None else True,
        verified_kyc=current_user.verified_kyc or False,
        kyc_verified_at=current_user.kyc_verified_at,
        subscription_status=current_user.subscription_status,
        subscription_end_date=current_user.subscription_end_date,
        has_certificate=has_cert,
        certificate_valid_until=cert_valid
    )


@router.patch("/settings", response_model=SettingsResponse)
def update_settings(
    update_data: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user settings (consents & preferences)"""
    update_dict = update_data.dict(exclude_unset=True)
    
    # Handle consent timestamps
    if update_dict.get('terms_accepted') is True:
        current_user.terms_accepted_at = datetime.utcnow()
        del update_dict['terms_accepted']
    elif 'terms_accepted' in update_dict:
        del update_dict['terms_accepted']
        
    if update_dict.get('privacy_accepted') is True:
        current_user.privacy_accepted_at = datetime.utcnow()
        del update_dict['privacy_accepted']
    elif 'privacy_accepted' in update_dict:
        del update_dict['privacy_accepted']
    
    # Apply remaining updates
    for field, value in update_dict.items():
        setattr(current_user, field, value)
    
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    
    return get_settings(current_user, db)


@router.post("/settings/change-password", response_model=dict)
def change_password(
    current_password: str = Form(...),
    new_password: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    current_user.hashed_password = get_password_hash(new_password)
    current_user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Password changed successfully"}

    
@router.post("/kyc", response_model=dict)
async def kyc_verify(
    dni_number: str = Form(...),
    dni_front_file: UploadFile = File(...),
    dni_back_file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"DEBUG: DNI received: {dni_number}")
    dni = dni_number.upper().strip()
    if not re.match(r'^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$|^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$', dni):
        raise HTTPException(status_code=400, detail="Invalid DNI/NIE format. DNI: 8 digits + letter (e.g., 12345678Z). NIE: X/Y/Z + 7 digits + letter (e.g., X1234567Z).")
    
    current_user.nie_dni = dni
    db.commit()
    db.refresh(current_user)
    

    front_content = await dni_front_file.read()
    back_content = await dni_back_file.read()
    temp_front = f"/tmp/{dni_front_file.filename}"
    temp_back = f"/tmp/{dni_back_file.filename}"
    with open(temp_front, "wb") as f:
        f.write(front_content)
    with open(temp_back, "wb") as f:
        f.write(back_content)    
        
    try:
        api_key = os.getenv('VERIFF_API_KEY')
        shared_secret = os.getenv('VERIFF_SHARED_SECRET')
        if not api_key or not shared_secret:
            raise HTTPException(status_code=500, detail="Veriff API key or shared secret not set in .env")

        base_url = "https://stationapi.veriff.com/v1"
        headers = {
            "X-AUTH-CLIENT": api_key,
            "Content-Type": "application/json"
        }
        
        verification_data = {
            # "callback": "https://yourapp.com/kyc-callback",  # add when deployed
            "person": {
                "firstName": current_user.full_name.split()[0] if current_user.full_name else "Test",
                "lastName": current_user.full_name.split()[-1] if current_user.full_name else "User",
                "idNumber": dni 
            },
            "document": {
                "number": dni,
                "country": "ES",  
                "type": "ID_CARD",  
                "idCardType": None,

            },
            "vendorData": str(current_user.id),  
            "consents": [
            {
                "type": "ine",
                "approved": True
            }]
 }
        
        session_data = {
            "verification": verification_data  
        }
        print(f"DEBUG Session data: {json.dumps(session_data, indent=2)}")  # Лог data
        session_response = requests.post(f"{base_url}/sessions", headers=headers, json=session_data)
        print(f"DEBUG Veriff session response: status {session_response.status_code}, text: {session_response.text[:200]}")
        
        if session_response.status_code != 201:
            raise HTTPException(status_code=500, detail=f"Session creation failed: {session_response.text}")
        session_id = session_response.json()["verification"]["id"]
        print(f"DEBUG: Veriff session ID: {session_id}")

        media_url = f"{base_url}/sessions/{session_id}/media"
        ts_iso = datetime.utcnow().isoformat(timespec='milliseconds') + 'Z'  
        mime_front_type = dni_front_file.content_type  
        base64_content = base64.b64encode(front_content).decode('utf-8')
        content_front_uri = f"data:{mime_front_type};base64,{base64_content}"  
        image_front_data = {
            "image": {
                "context": "document-front",  
                "content": content_front_uri,  
                "timestamp": ts_iso  
            }
        }
        raw_front_json = json.dumps(
            image_front_data, 
            separators=(',', ':'), 
            ensure_ascii=False
            ).encode("utf-8")  
        print(f"DEBUG Raw JSON (first 100 chars): {raw_front_json[:100]}...")
        hmac_front_digest = hmac.new(
            shared_secret.encode("utf-8"), 
            raw_front_json,
            hashlib.sha256
            ).hexdigest()
        
        media_front_headers = {
            "X-AUTH-CLIENT": api_key,
            "X-HMAC-SIGNATURE": hmac_front_digest,  
            "Content-Type": "application/json"
        }

        print("SIGNATURE:", hmac_front_digest)
        front_response = requests.post(
            media_url, 
            headers=media_front_headers, 
            data=raw_front_json)
        print(f"DEBUG Front upload response: status {front_response.status_code}, text: {front_response.text[:200]}")
        if front_response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Front upload failed: {front_response.text}")
        
        mime_back_type = dni_back_file.content_type 
        base64_content = base64.b64encode(back_content).decode('utf-8')
        content_back_uri = f"data:{mime_back_type};base64,{base64_content}"  
        image_back_data = {
            "image": {
                "context": "document-back",  
                "content": content_back_uri,  
                "timestamp": ts_iso  
            }
        }
        raw_back_json = json.dumps(
            image_back_data, 
            separators=(',', ':'), 
            ensure_ascii=False
            ).encode("utf-8")  
        print(f"DEBUG Raw JSON (first 100 chars): {raw_back_json[:100]}...")
        hmac_back_digest = hmac.new(
            shared_secret.encode("utf-8"), 
            raw_back_json,
            hashlib.sha256
            ).hexdigest()

        media_back_headers = {
            "X-AUTH-CLIENT": api_key,
            "X-HMAC-SIGNATURE": hmac_back_digest,  
            "Content-Type": "application/json"
        }

        print("SIGNATURE:", hmac_back_digest)
        back_response = requests.post(media_url, headers=media_back_headers, data=raw_back_json)
        print(f"DEBUG Back upload response: status {back_response.status_code}, text: {back_response.text[:200]}")
        if back_response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Back upload failed: {back_response.text}")

        patch_url = f"{base_url}/sessions/{session_id}"
        patch_body = {
            "verification": {
                "status": "submitted"  
            }
        }
        print(f"DEBUG Patch data: {json.dumps(patch_body, indent=2)}")  

        raw_patch_json = json.dumps(
            patch_body, 
            separators=(',', ':'), 
            ensure_ascii=False
            ).encode("utf-8")  
        print(f"DEBUG Raw JSON (first 100 chars): {raw_patch_json[:100]}...")
        patch_signature = hmac.new(
            shared_secret.encode("utf-8"), 
            raw_patch_json,
            hashlib.sha256
            ).hexdigest()

        patch_headers = {
            "X-AUTH-CLIENT": api_key,
            "X-HMAC-SIGNATURE": patch_signature,  
            "Content-Type": "application/json"
        }

        print("PATCH RAW:", raw_patch_json.decode())
        print("PATCH SIG:", patch_signature)
        patch_response = requests.patch(patch_url, headers=patch_headers, data=raw_patch_json)
        print(f"DEBUG PATCH response: status {patch_response.status_code}, text: {patch_response.text[:200]}")
        if patch_response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"PATCH failed: {patch_response.text}")

        sdk_url = f"https://veriff.me/sdk/web/{session_id}"

        decision_url = f"{base_url}/sessions/{session_id}/decision"
        raw_sig=session_id.encode("utf-8")
        decision_sig=hmac.new(
            shared_secret.encode("utf-8"), 
            raw_sig,
            hashlib.sha256
            ).hexdigest()
        decision_headers = {
            "X-AUTH-CLIENT": api_key,
            "X-HMAC-SIGNATURE": decision_sig
        }
        
        start_time = time.time()
        timeout=120
        poll_interval=10
        while time.time() - start_time < timeout:
            decision_response = requests.get(decision_url, headers=decision_headers)
            print(f"DEBUG Decision poll response: status {decision_response.status_code}, text: {decision_response.text[:200]}")
            
            if decision_response.status_code != 200:
                time.sleep(poll_interval)
                continue
            
            decision_data = decision_response.json()
            verification = decision_data.get("verification")
            if not verification:
                time.sleep(poll_interval)
                continue
            
            status = verification.get("status")
            reason = verification.get("reason")
            print(f"DEBUG Verification status: {status}, reason: {reason}")

            if status.lower() == "approved":
                current_user.verified_kyc = True
                db.commit()
                db.refresh(current_user)
                return {
                    "message": "KYC verified successfully",
                    "verified": True,
                    "dni": dni,
                    "session_id": session_id,
                    "veriff_url": sdk_url
                }
            else:
                raise HTTPException(status_code=400, detail="KYC rejected. Check document.")
        time.sleep(poll_interval)

        raise HTTPException(status_code=408, detail="KYC timeout. Retry later.")
    
    finally:
        os.unlink(temp_back)