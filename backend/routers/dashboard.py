from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from decimal import Decimal

from core.database import get_db, User, Transaction, Invoice
from core.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


class TaxPeriod(BaseModel):
    quarter: str  
    year: int
    start_date: date
    end_date: date
    report_due_date: date
    periodo_name: str  


class PeriodFinancials(BaseModel):
    period: TaxPeriod
    total_income: float
    total_expenses: float
    net_balance: float
    estimated_iva: float  
    estimated_irpf: float  
    invoice_count: int
    expense_count: int


def get_current_tax_period() -> TaxPeriod:
    today = date.today()
    current_year = today.year
    
    deadlines = [
        (1, 30, "Q4", -1, 10, 12),
        (4, 20, "Q1", 0, 1, 3),
        (7, 20, "Q2", 0, 4, 6),
        (10, 20, "Q3", 0, 7, 9),
    ]
    
    for deadline_month, deadline_day, quarter, year_offset, start_month, end_month in deadlines:
        deadline_date = date(current_year, deadline_month, deadline_day)
        
        if today <= deadline_date:
            period_year = current_year + year_offset
            
            if quarter == "Q4":
                start_date = date(period_year, start_month, 1)
                end_date = date(period_year, 12, 31)
            else:
                start_date = date(period_year, start_month, 1)
                if end_month == 12:
                    end_date = date(period_year, 12, 31)
                else:
                    end_date = date(period_year, end_month + 1, 1) - timedelta(days=1)
            
            return TaxPeriod(
                quarter=quarter,
                year=period_year,
                start_date=start_date,
                end_date=end_date,
                report_due_date=deadline_date,
                periodo_name=f"IVA/IRPF {quarter} {period_year}"
            )
    
    return TaxPeriod(
        quarter="Q4",
        year=current_year,
        start_date=date(current_year, 10, 1),
        end_date=date(current_year, 12, 31),
        report_due_date=date(current_year + 1, 1, 30),
        periodo_name=f"IVA/IRPF Q4 {current_year}"
    )


from datetime import timedelta

@router.get("/period-financials", response_model=PeriodFinancials)
async def get_period_financials(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    period = get_current_tax_period()
    
    period_start = datetime.combine(period.start_date, datetime.min.time())
    period_end = datetime.combine(period.end_date, datetime.max.time())
    
    income_result = db.query(func.sum(Invoice.total)).filter(
        Invoice.user_id == current_user.id,
        Invoice.invoice_date >= period_start,
        Invoice.invoice_date <= period_end
    ).scalar()
    
    total_income = float(income_result) if income_result else 0.0
    
    invoice_count = db.query(func.count(Invoice.id)).filter(
        Invoice.user_id == current_user.id,
        Invoice.invoice_date >= period_start,
        Invoice.invoice_date <= period_end
    ).scalar() or 0
    
    expense_result = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= period_start,
        Transaction.date <= period_end,
        Transaction.type.in_(["expense", "invoice", "receipt"])
    ).scalar()
    
    total_expenses = float(expense_result) if expense_result else 0.0
    
    expense_count = db.query(func.count(Transaction.id)).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= period_start,
        Transaction.date <= period_end,
        Transaction.type.in_(["expense", "invoice", "receipt"])
    ).scalar() or 0
    
    net_balance = total_income - total_expenses
    estimated_iva = total_income * 0.21  
    estimated_irpf = max(0, net_balance * 0.20)
    
    return PeriodFinancials(
        period=period,
        total_income=total_income,
        total_expenses=total_expenses,
        net_balance=net_balance,
        estimated_iva=estimated_iva,
        estimated_irpf=estimated_irpf,
        invoice_count=invoice_count,
        expense_count=expense_count
    )


@router.get("/current-period", response_model=TaxPeriod)
async def get_current_period(
    current_user: User = Depends(get_current_user)
):
    return get_current_tax_period()