from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, validator
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import re

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
SECRET_KEY = "your-secret-key-change-in-prod"
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