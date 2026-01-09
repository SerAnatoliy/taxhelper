#!/usr/bin/env python3
"""
Backend Reorganization Migration Script
=======================================
This script reorganizes the TaxHelper backend from a flat structure
to a modular architecture with proper separation of concerns.

Usage:
    1. Backup your backend folder first!
    2. Run from project root: python migrate_backend.py
    3. Review changes and fix any remaining import issues
    4. Run tests to verify everything works

Author: Claude Assistant
Date: 2026-01-09
"""

import os
import re
import shutil
from pathlib import Path
from typing import Dict, List, Tuple

# Configuration
BACKEND_DIR = Path("backend")
DRY_RUN = False  # Set to False to actually execute changes

# New directory structure
NEW_DIRS = [
    "core",
    "models",
    "schemas",
    "routers",
    "services",
    "utils",
]

# File movements: (source, destination)
FILE_MOVES: Dict[str, str] = {
    # Routers
    "auth.py": "routers/auth.py",
    "bank.py": "routers/bank.py",
    "chat.py": "routers/chat.py",
    "dashboard.py": "routers/dashboard.py",
    "expenses.py": "routers/expenses.py",
    "invoices.py": "routers/invoices.py",
    "reminders.py": "routers/reminders.py",
    "reports.py": "routers/reports.py",
    "veriff.py": "routers/veriff.py",
    "verifactu_events.py": "routers/verifactu_events.py",
    "aeat_submission.py": "routers/aeat_submission.py",
}

# Import replacements for main.py
MAIN_IMPORT_REPLACEMENTS = {
    "from expenses import router as expenses_router": "from routers.expenses import router as expenses_router",
    "from bank import router as bank_router": "from routers.bank import router as bank_router",
    "from veriff import router as veriff_router": "from routers.veriff import router as veriff_router",
    "from reminders import router as reminders_router": "from routers.reminders import router as reminders_router",
    "from chat import router as chat_router": "from routers.chat import router as chat_router",
    "from invoices import router as invoice_router": "from routers.invoices import router as invoice_router",
    "from dashboard import router as dashboard_router": "from routers.dashboard import router as dashboard_router",
    "from reports import router as reports_router": "from routers.reports import router as reports_router",
    "from verifactu_events import router as verifactu_events_router": "from routers.verifactu_events import router as verifactu_events_router",
    "from aeat_submission import router as aeat_router": "from routers.aeat_submission import router as aeat_router",
    "from auth import router as auth_router": "from routers.auth import router as auth_router",
}

# Import replacements for router files (they import from database.py and auth.py)
ROUTER_IMPORT_REPLACEMENTS = {
    "from database import": "from core.database import",
    "from auth import": "from core.auth import",
}


def log(msg: str, level: str = "INFO"):
    prefix = {"INFO": "ℹ️", "SUCCESS": "✅", "WARNING": "⚠️", "ERROR": "❌", "ACTION": "🔧"}
    print(f"{prefix.get(level, 'ℹ️')} {msg}")


def create_directories():
    """Create new directory structure."""
    log("Creating new directories...", "ACTION")
    for dir_name in NEW_DIRS:
        dir_path = BACKEND_DIR / dir_name
        if not dir_path.exists():
            if not DRY_RUN:
                dir_path.mkdir(parents=True)
            log(f"  Created: {dir_path}", "SUCCESS")
        else:
            log(f"  Exists: {dir_path}", "WARNING")


def create_init_files():
    """Create __init__.py files for all new packages."""
    log("Creating __init__.py files...", "ACTION")
    for dir_name in NEW_DIRS:
        init_path = BACKEND_DIR / dir_name / "__init__.py"
        if not init_path.exists():
            if not DRY_RUN:
                init_path.write_text('"""Package initialization."""\n')
            log(f"  Created: {init_path}", "SUCCESS")


def move_files():
    """Move files to their new locations."""
    log("Moving files to new locations...", "ACTION")
    for src, dst in FILE_MOVES.items():
        src_path = BACKEND_DIR / src
        dst_path = BACKEND_DIR / dst
        
        if src_path.exists():
            if not DRY_RUN:
                shutil.copy2(src_path, dst_path)  # Copy first, delete later
            log(f"  Moved: {src} -> {dst}", "SUCCESS")
        else:
            log(f"  Not found: {src}", "WARNING")


def update_imports_in_file(file_path: Path, replacements: Dict[str, str]) -> int:
    """Update imports in a single file. Returns number of replacements made."""
    if not file_path.exists():
        return 0
    
    content = file_path.read_text()
    original = content
    count = 0
    
    for old, new in replacements.items():
        if old in content:
            content = content.replace(old, new)
            count += 1
    
    if content != original and not DRY_RUN:
        file_path.write_text(content)
    
    return count


def update_main_py():
    """Update imports in main.py."""
    log("Updating main.py imports...", "ACTION")
    main_path = BACKEND_DIR / "main.py"
    count = update_imports_in_file(main_path, MAIN_IMPORT_REPLACEMENTS)
    log(f"  Updated {count} imports in main.py", "SUCCESS")


def update_router_imports():
    """Update imports in all router files."""
    log("Updating router file imports...", "ACTION")
    routers_dir = BACKEND_DIR / "routers"
    
    if not routers_dir.exists():
        log("  Routers directory not found yet", "WARNING")
        return
    
    for router_file in routers_dir.glob("*.py"):
        if router_file.name == "__init__.py":
            continue
        count = update_imports_in_file(router_file, ROUTER_IMPORT_REPLACEMENTS)
        if count > 0:
            log(f"  Updated {count} imports in {router_file.name}", "SUCCESS")


def create_core_database():
    """Create core/database.py with connection setup only."""
    log("Creating core/database.py...", "ACTION")
    
    core_db_content = '''"""
Database connection and session management.
Models are imported from the models package.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_HOST = os.getenv("DATABASE_HOST", "localhost")
DATABASE_USERNAME = os.getenv("DATABASE_USERNAME", "postgres")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD", "password")
DATABASE_NAME = os.getenv("DATABASE_NAME", "taxhelper")
DATABASE_PORT = os.getenv("DATABASE_PORT", "5432")

SQLALCHEMY_DATABASE_URL = f"postgresql://{DATABASE_USERNAME}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Re-export models for backward compatibility
# TODO: Update imports throughout codebase to use models package directly
from models import (
    User, BankAccount, Transaction, Invoice, InvoiceItem,
    Report, ReportRecord, Reminder, VerifactuEvent, InvoiceVerifactuEvent
)
'''
    
    core_db_path = BACKEND_DIR / "core" / "database.py"
    if not DRY_RUN:
        core_db_path.write_text(core_db_content)
    log(f"  Created: {core_db_path}", "SUCCESS")


def create_core_auth():
    """Create core/auth.py with authentication utilities."""
    log("Creating core/auth.py (security utilities)...", "ACTION")
    
    core_auth_content = '''"""
Authentication and security utilities.
Contains JWT handling, password hashing, and user dependencies.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os

from core.database import get_db
from models.user import User

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get the current authenticated user."""
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
'''
    
    core_auth_path = BACKEND_DIR / "core" / "auth.py"
    if not DRY_RUN:
        core_auth_path.write_text(core_auth_content)
    log(f"  Created: {core_auth_path}", "SUCCESS")


def create_models_init():
    """Create models/__init__.py that exports all models."""
    log("Creating models/__init__.py...", "ACTION")
    
    models_init_content = '''"""
SQLAlchemy models package.
Import all models here for easy access.
"""
from models.user import User
from models.bank import BankAccount
from models.transaction import Transaction
from models.invoice import Invoice, InvoiceItem
from models.report import Report, ReportRecord
from models.reminder import Reminder
from models.verifactu import VerifactuEvent, InvoiceVerifactuEvent

__all__ = [
    "User",
    "BankAccount",
    "Transaction",
    "Invoice",
    "InvoiceItem",
    "Report",
    "ReportRecord",
    "Reminder",
    "VerifactuEvent",
    "InvoiceVerifactuEvent",
]
'''
    
    models_init_path = BACKEND_DIR / "models" / "__init__.py"
    if not DRY_RUN:
        models_init_path.write_text(models_init_content)
    log(f"  Created: {models_init_path}", "SUCCESS")


def create_routers_init():
    """Create routers/__init__.py that exports all routers."""
    log("Creating routers/__init__.py...", "ACTION")
    
    routers_init_content = '''"""
API routers package.
"""
from routers.auth import router as auth_router
from routers.expenses import router as expenses_router
from routers.bank import router as bank_router
from routers.veriff import router as veriff_router
from routers.reminders import router as reminders_router
from routers.chat import router as chat_router
from routers.invoices import router as invoice_router
from routers.dashboard import router as dashboard_router
from routers.reports import router as reports_router
from routers.verifactu_events import router as verifactu_events_router
from routers.aeat_submission import router as aeat_router

__all__ = [
    "auth_router",
    "expenses_router",
    "bank_router",
    "veriff_router",
    "reminders_router",
    "chat_router",
    "invoice_router",
    "dashboard_router",
    "reports_router",
    "verifactu_events_router",
    "aeat_router",
]
'''
    
    routers_init_path = BACKEND_DIR / "routers" / "__init__.py"
    if not DRY_RUN:
        routers_init_path.write_text(routers_init_content)
    log(f"  Created: {routers_init_path}", "SUCCESS")


def create_new_main():
    """Create a new cleaner main.py."""
    log("Creating new main.py...", "ACTION")
    
    new_main_content = '''"""
TaxHelper API - Main Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import stripe
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Import all routers
from routers import (
    auth_router,
    expenses_router,
    bank_router,
    veriff_router,
    reminders_router,
    chat_router,
    invoice_router,
    dashboard_router,
    reports_router,
    verifactu_events_router,
    aeat_router,
)

# Create FastAPI application
app = FastAPI(
    title="TaxHelper API",
    description="Fintech API for autónomos in Spain",
    version="0.2.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(expenses_router)
app.include_router(bank_router)
app.include_router(veriff_router)
app.include_router(reminders_router)
app.include_router(chat_router)
app.include_router(invoice_router)
app.include_router(dashboard_router)
app.include_router(reports_router)
app.include_router(verifactu_events_router)
app.include_router(aeat_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return JSONResponse(content={"message": "TaxHelper Backend Ready!"})


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
'''
    
    new_main_path = BACKEND_DIR / "main_new.py"
    if not DRY_RUN:
        new_main_path.write_text(new_main_content)
    log(f"  Created: {new_main_path} (rename to main.py after review)", "SUCCESS")


def cleanup_old_files():
    """Remove old files after migration (optional step)."""
    log("Old files to remove (after verification):", "WARNING")
    for src in FILE_MOVES.keys():
        src_path = BACKEND_DIR / src
        if src_path.exists():
            log(f"  - {src_path}", "WARNING")
    log("  Run with CLEANUP=True to remove these files", "WARNING")


def generate_manual_steps():
    """Print manual steps required after running the script."""
    print("\n" + "=" * 60)
    print("📋 MANUAL STEPS REQUIRED AFTER MIGRATION")
    print("=" * 60)
    print("""
1. EXTRACT MODELS from database.py:
   - Create separate files in models/ for each model:
     - models/user.py (User model)
     - models/bank.py (BankAccount model)
     - models/transaction.py (Transaction model)
     - models/invoice.py (Invoice, InvoiceItem models)
     - models/report.py (Report, ReportRecord models)
     - models/reminder.py (Reminder model)
     - models/verifactu.py (VerifactuEvent, InvoiceVerifactuEvent)

2. UPDATE ROUTER IMPORTS:
   Each router file needs updated imports:
   - from core.database import get_db
   - from core.auth import get_current_user
   - from models import User, Transaction, etc.

3. REVIEW main_new.py:
   - Compare with original main.py
   - Rename main.py -> main_old.py
   - Rename main_new.py -> main.py

4. UPDATE alembic/env.py:
   - Update import: from core.database import Base, SQLALCHEMY_DATABASE_URL

5. TEST EVERYTHING:
   - Run: cd backend && python -c "from main import app"
   - Run: uvicorn main:app --reload
   - Run your test suite

6. CLEANUP:
   - Delete old router files from backend/ root
   - Delete main_old.py after verification
   - Delete database_old.py after model extraction
""")


def main():
    """Run the migration."""
    print("=" * 60)
    print("🚀 TaxHelper Backend Reorganization Script")
    print("=" * 60)
    
    if DRY_RUN:
        log("DRY RUN MODE - No changes will be made", "WARNING")
        log("Set DRY_RUN = False to execute changes\n", "WARNING")
    
    # Check if backend directory exists
    if not BACKEND_DIR.exists():
        log(f"Backend directory not found: {BACKEND_DIR}", "ERROR")
        log("Run this script from the project root directory", "ERROR")
        return
    
    # Execute migration steps
    create_directories()
    create_init_files()
    move_files()
    create_core_database()
    create_core_auth()
    create_models_init()
    create_routers_init()
    create_new_main()
    
    if not DRY_RUN:
        update_router_imports()
    
    cleanup_old_files()
    generate_manual_steps()
    
    print("\n" + "=" * 60)
    if DRY_RUN:
        log("DRY RUN COMPLETE - Review output above", "SUCCESS")
        log("Set DRY_RUN = False and run again to execute", "INFO")
    else:
        log("MIGRATION COMPLETE - Follow manual steps above", "SUCCESS")
    print("=" * 60)


if __name__ == "__main__":
    main()