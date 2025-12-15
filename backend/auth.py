import base64
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, validator
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
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

class UserUpdate(BaseModel):
    family_status: str | None = None
    num_children: int | None = None
    region: str | None = None

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
SECRET_KEY = os.getenv("SECRET_KEY")
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
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
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

@router.get("/profile", response_model=dict)
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "family_status": current_user.family_status,
        "num_children": current_user.num_children,
        "region": current_user.region,
        "created_at": current_user.created_at,
        "stripe_customer_id": current_user.stripe_customer_id  
    }

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
        mime_front_type = dni_front_file.content_type  # e.g., "image/jpeg"
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
        
        mime_back_type = dni_back_file.content_type  # e.g., "image/jpeg"
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