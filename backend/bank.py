from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import os
import plaid
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.country_code import CountryCode
from plaid.model.products import Products
import pandas as pd
from io import BytesIO
from fastapi import UploadFile, File
import re

from dotenv import load_dotenv
load_dotenv()

from database import get_db, User, BankAccount, Transaction
from auth import get_current_user

router = APIRouter(prefix="/bank", tags=["bank"])


PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
PLAID_SECRET = os.getenv("PLAID_SECRET")
PLAID_ENV = os.getenv("PLAID_ENV", "sandbox")

PLAID_ENV_MAP = {
    "sandbox": plaid.Environment.Sandbox,
    "development": plaid.Environment.Development,
    "production": plaid.Environment.Production,
}

configuration = plaid.Configuration(
    host=PLAID_ENV_MAP.get(PLAID_ENV, plaid.Environment.Sandbox),
    api_key={
        "clientId": PLAID_CLIENT_ID,
        "secret": PLAID_SECRET,
    }
)
api_client = plaid.ApiClient(configuration)
plaid_client = plaid_api.PlaidApi(api_client)


class LinkTokenResponse(BaseModel):
    link_token: str
    expiration: str


class PublicTokenExchangeRequest(BaseModel):
    public_token: str


class BankAccountResponse(BaseModel):
    id: int
    bank_name: str
    account_name: str
    account_mask: str
    account_type: str
    connected_at: datetime
    
    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    id: int
    date: datetime
    amount: float
    description: str
    type: str
    category: Optional[str]
    
    class Config:
        from_attributes = True


class SyncResponse(BaseModel):
    message: str
    transactions_added: int
    accounts_synced: int

@router.post("/create-link-token", response_model=LinkTokenResponse)
async def create_link_token(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        request = LinkTokenCreateRequest(
            user=LinkTokenCreateRequestUser(
                client_user_id=str(current_user.id)
            ),
            client_name="TaxHelper",
            products=[Products("transactions")],
            country_codes=[CountryCode("ES"), CountryCode("US")],  
            language="es",
        )
        
        response = plaid_client.link_token_create(request)
        
        return LinkTokenResponse(
            link_token=response.link_token,
            expiration=response.expiration.isoformat()
        )
        
    except plaid.ApiException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create link token: {e.body}"
        )


@router.post("/exchange-token", response_model=SyncResponse)
async def exchange_public_token(
    request: PublicTokenExchangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        exchange_request = ItemPublicTokenExchangeRequest(
            public_token=request.public_token
        )
        exchange_response = plaid_client.item_public_token_exchange(exchange_request)
        access_token = exchange_response.access_token
        item_id = exchange_response.item_id
        
        accounts_request = AccountsGetRequest(access_token=access_token)
        accounts_response = plaid_client.accounts_get(accounts_request)
        
        accounts_synced = 0
        for account in accounts_response.accounts:
            existing = db.query(BankAccount).filter(
                BankAccount.user_id == current_user.id,
                BankAccount.plaid_account_id == account.account_id
            ).first()
            
            if not existing:
                bank_account = BankAccount(
                    user_id=current_user.id,
                    bank_name=accounts_response.item.institution_id or "Unknown Bank",
                    account_name=account.name,
                    account_mask=account.mask,
                    account_type=account.type.value if account.type else "unknown",
                    plaid_account_id=account.account_id,
                    plaid_item_id=item_id,
                    access_token=access_token,  # Store encrypted in production!
                    last_sync=datetime.utcnow()
                )
                db.add(bank_account)
                accounts_synced += 1
        
        db.commit()
        
        transactions_added = await sync_transactions(
            access_token=access_token,
            user_id=current_user.id,
            db=db
        )
        
        return SyncResponse(
            message="Bank connected successfully",
            transactions_added=transactions_added,
            accounts_synced=accounts_synced
        )
        
    except plaid.ApiException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to connect bank: {e.body}"
        )


async def sync_transactions(
    access_token: str,
    user_id: int,
    db: Session,
    days: int = 90
) -> int:
    start_date = (datetime.now() - timedelta(days=days)).date()
    end_date = datetime.now().date()
    
    try:
        request = TransactionsGetRequest(
            access_token=access_token,
            start_date=start_date,
            end_date=end_date,
            options=TransactionsGetRequestOptions(
                count=500,
                offset=0
            )
        )
        
        response = plaid_client.transactions_get(request)
        transactions = response.transactions
        
        while len(transactions) < response.total_transactions:
            request = TransactionsGetRequest(
                access_token=access_token,
                start_date=start_date,
                end_date=end_date,
                options=TransactionsGetRequestOptions(
                    count=500,
                    offset=len(transactions)
                )
            )
            response = plaid_client.transactions_get(request)
            transactions.extend(response.transactions)
        
        transactions_added = 0
        for txn in transactions:
            existing = db.query(Transaction).filter(
                Transaction.user_id == user_id,
                Transaction.plaid_transaction_id == txn.transaction_id
            ).first()
            
            if not existing:
                amount = abs(txn.amount)
                txn_type = "expense" if txn.amount > 0 else "income"
                
                transaction = Transaction(
                    user_id=user_id,
                    date=datetime.combine(txn.date, datetime.min.time()),
                    amount=amount,
                    type=txn_type,
                    category=txn.category[0] if txn.category else None,
                    description=txn.name or txn.merchant_name or "Unknown",
                    provider="plaid",
                    plaid_transaction_id=txn.transaction_id
                )
                db.add(transaction)
                transactions_added += 1
        
        db.commit()
        return transactions_added
        
    except plaid.ApiException as e:
        print(f"Error syncing transactions: {e.body}")
        return 0


@router.post("/sync", response_model=SyncResponse)
async def sync_bank_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bank_accounts = db.query(BankAccount).filter(
        BankAccount.user_id == current_user.id
    ).all()
    
    if not bank_accounts:
        raise HTTPException(status_code=404, detail="No bank accounts connected")
    
    total_transactions = 0
    for account in bank_accounts:
        if account.access_token:
            count = await sync_transactions(
                access_token=account.access_token,
                user_id=current_user.id,
                db=db
            )
            total_transactions += count
            account.last_sync = datetime.utcnow()
    
    db.commit()
    
    return SyncResponse(
        message="Sync completed",
        transactions_added=total_transactions,
        accounts_synced=len(bank_accounts)
    )


@router.get("/accounts", response_model=List[BankAccountResponse])
async def get_bank_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    accounts = db.query(BankAccount).filter(
        BankAccount.user_id == current_user.id
    ).all()
    
    return [
        BankAccountResponse(
            id=acc.id,
            bank_name=acc.bank_name,
            account_name=acc.account_name or "Account",
            account_mask=acc.account_mask or "****",
            account_type=acc.account_type or "unknown",
            connected_at=acc.last_sync or acc.created_at or datetime.utcnow()
        )
        for acc in accounts
    ]


@router.get("/transactions", response_model=List[TransactionResponse])
async def get_transactions(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.date.desc()).offset(offset).limit(limit).all()
    
    return [
        TransactionResponse(
            id=txn.id,
            date=txn.date,
            amount=float(txn.amount),
            description=txn.description,
            type=txn.type,
            category=txn.category
        )
        for txn in transactions
    ]


@router.delete("/disconnect/{account_id}")
async def disconnect_bank(
    account_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    account = db.query(BankAccount).filter(
        BankAccount.id == account_id,
        BankAccount.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Bank account not found")
    
    db.delete(account)
    db.commit()
    
    return {"message": "Bank account disconnected"}

class UploadResponse(BaseModel):
    message: str
    transactions_created: int
    total_rows: int


@router.post("/upload", response_model=UploadResponse)
async def upload_bank_statement(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    filename = file.filename.lower()
    content = await file.read()
    
    try:
        if filename.endswith('.csv'):
            for encoding in ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']:
                try:
                    df = pd.read_csv(BytesIO(content), encoding=encoding)
                    break
                except UnicodeDecodeError:
                    continue
            else:
                raise HTTPException(status_code=400, detail="Could not decode CSV file")
        elif filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(BytesIO(content))
        else:
            raise HTTPException(
                status_code=400, 
                detail="Unsupported file type. Please upload CSV or Excel (.xlsx, .xls)"
            )
        
        if df.empty:
            raise HTTPException(status_code=400, detail="The uploaded file is empty")
        
        df.columns = df.columns.str.lower().str.strip()
        
        date_patterns = ['fecha', 'date', 'fecha operación', 'fecha valor', 'f. valor', 'fecha op']
        amount_patterns = ['importe', 'amount', 'cantidad', 'euros', 'importe (€)', 'importe eur']
        desc_patterns = ['concepto', 'description', 'descripción', 'movimiento', 'detalle', 'observaciones']
        
        date_col = None
        amount_col = None
        desc_col = None
        
        for col in df.columns:
            col_lower = col.lower()
            if not date_col and any(p in col_lower for p in date_patterns):
                date_col = col
            if not amount_col and any(p in col_lower for p in amount_patterns):
                amount_col = col
            if not desc_col and any(p in col_lower for p in desc_patterns):
                desc_col = col
        
        if not date_col or not amount_col:
            if len(df.columns) >= 2:
                date_col = df.columns[0]
                amount_col = df.columns[1]
                desc_col = df.columns[2] if len(df.columns) > 2 else None
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Could not identify date and amount columns. Please ensure your file has headers like 'Fecha', 'Importe', 'Concepto'."
                )
        
        transactions_created = 0
        
        for idx, row in df.iterrows():
            try:
                date_val = row[date_col]
                if pd.isna(date_val):
                    continue
                    
                if isinstance(date_val, str):
                    for fmt in ['%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d', '%d/%m/%y']:
                        try:
                            date_val = datetime.strptime(date_val.strip(), fmt)
                            break
                        except ValueError:
                            continue
                    else:
                        date_val = pd.to_datetime(date_val, dayfirst=True)
                elif hasattr(date_val, 'to_pydatetime'):
                    date_val = date_val.to_pydatetime()
                
                amount_val = row[amount_col]
                if pd.isna(amount_val):
                    continue
                    
                if isinstance(amount_val, str):
                    amount_str = re.sub(r'[€$\s]', '', amount_val)
                    if ',' in amount_str and '.' in amount_str:
                        amount_str = amount_str.replace('.', '').replace(',', '.')
                    elif ',' in amount_str:
                        amount_str = amount_str.replace(',', '.')
                    amount = float(amount_str)
                else:
                    amount = float(amount_val)
                
                if amount == 0:
                    continue
                
                description = "Bank transaction"
                if desc_col and not pd.isna(row[desc_col]):
                    description = str(row[desc_col])[:500]  
                
                txn_type = "income" if amount > 0 else "expense"
                
                transaction = Transaction(
                    user_id=current_user.id,
                    date=date_val if isinstance(date_val, datetime) else datetime.now(),
                    amount=abs(amount),
                    type=txn_type,
                    description=description,
                    provider="manual_upload"
                )
                db.add(transaction)
                transactions_created += 1
                
            except Exception as e:
                print(f"Skipping row {idx}: {e}")
                continue
        
        db.commit()
        
        if transactions_created == 0:
            raise HTTPException(
                status_code=400,
                detail="No valid transactions found in the file. Please check the file format."
            )
        
        return UploadResponse(
            message="Bank statement processed successfully",
            transactions_created=transactions_created,
            total_rows=len(df)
        )
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="The uploaded file is empty")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")