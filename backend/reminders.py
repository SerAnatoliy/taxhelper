from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
from dateutil.relativedelta import relativedelta 
from enum import Enum

from database import get_db, User, Reminder
from auth import get_current_user

router = APIRouter(prefix="/reminders", tags=["reminders"])


class SpanishTaxDeadlines:
    
    @staticmethod
    def get_quarterly_deadlines(year: int) -> List[dict]:
        return [
            {"modelo": "303", "name": "IVA Q4", "due_date": date(year, 1, 30), "quarter": "Q4", "description": "Quarterly VAT declaration"},
            {"modelo": "130", "name": "IRPF Q4", "due_date": date(year, 1, 30), "quarter": "Q4", "description": "Quarterly income tax prepayment"},
            {"modelo": "303", "name": "IVA Q1", "due_date": date(year, 4, 20), "quarter": "Q1", "description": "Quarterly VAT declaration"},
            {"modelo": "130", "name": "IRPF Q1", "due_date": date(year, 4, 20), "quarter": "Q1", "description": "Quarterly income tax prepayment"},
            {"modelo": "303", "name": "IVA Q2", "due_date": date(year, 7, 20), "quarter": "Q2", "description": "Quarterly VAT declaration"},
            {"modelo": "130", "name": "IRPF Q2", "due_date": date(year, 7, 20), "quarter": "Q2", "description": "Quarterly income tax prepayment"},
            {"modelo": "303", "name": "IVA Q3", "due_date": date(year, 10, 20), "quarter": "Q3", "description": "Quarterly VAT declaration"},
            {"modelo": "130", "name": "IRPF Q3", "due_date": date(year, 10, 20), "quarter": "Q3", "description": "Quarterly income tax prepayment"},
        ]
    
    @staticmethod
    def get_annual_deadlines(year: int) -> List[dict]:
        return [
            {"modelo": "390", "name": "IVA Annual Summary", "due_date": date(year, 1, 30), "description": "Annual VAT summary declaration"},
            {"modelo": "100", "name": "IRPF Annual (Renta)", "due_date": date(year, 6, 30), "description": "Annual income tax declaration"},
            {"modelo": "347", "name": "Operations > €3,005.06", "due_date": date(year, 2, 28), "description": "Declaration of operations with third parties"},
        ]
    
    @staticmethod
    def get_all_upcoming(from_date: date = None, months_ahead: int = 6) -> List[dict]:
        if from_date is None:
            from_date = date.today()
        
        current_year = from_date.year
        next_year = current_year + 1
        
        all_deadlines = []
        
        for year in [current_year, next_year]:
            all_deadlines.extend(SpanishTaxDeadlines.get_quarterly_deadlines(year))
            all_deadlines.extend(SpanishTaxDeadlines.get_annual_deadlines(year))
        
        end_date = from_date + relativedelta(months=+months_ahead)
        
        upcoming = [
            d for d in all_deadlines 
            if d["due_date"] >= from_date and d["due_date"] <= end_date
        ]
        
        upcoming.sort(key=lambda x: x["due_date"])
        
        return upcoming


class ReminderCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: datetime
    reminder_type: str = "custom"
    modelo: Optional[str] = None
    notify_days_before: int = 7


class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    is_completed: Optional[bool] = None
    notify_days_before: Optional[int] = None


class ReminderResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    due_date: datetime
    reminder_type: str
    modelo: Optional[str]
    is_completed: bool
    notify_days_before: int
    days_until_due: int
    is_overdue: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TaxDeadlineResponse(BaseModel):
    modelo: str
    name: str
    due_date: date
    description: str
    days_until_due: int
    is_overdue: bool
    quarter: Optional[str] = None


class AllDeadlinesResponse(BaseModel):
    tax_deadlines: List[TaxDeadlineResponse]
    custom_reminders: List[ReminderResponse]


def calculate_days_until(due_date: datetime) -> int:
    if isinstance(due_date, date) and not isinstance(due_date, datetime):
        due_date = datetime.combine(due_date, datetime.min.time())
    delta = due_date - datetime.now()
    return delta.days


@router.get("/tax-deadlines", response_model=List[TaxDeadlineResponse])
async def get_tax_deadlines(
    months_ahead: int = 6,
    current_user: User = Depends(get_current_user)
):
    deadlines = SpanishTaxDeadlines.get_all_upcoming(months_ahead=months_ahead)

    return [
        TaxDeadlineResponse(
            modelo=d["modelo"],
            name=d["name"],
            due_date=d["due_date"],
            description=d["description"],
            days_until_due=calculate_days_until(datetime.combine(d["due_date"], datetime.min.time())),
            is_overdue=d["due_date"] < date.today(),
            quarter=d.get("quarter")
        )
        for d in deadlines
    ]


@router.get("/", response_model=List[ReminderResponse])
async def get_reminders(
    include_completed: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Reminder).filter(Reminder.user_id == current_user.id)
    
    if not include_completed:
        query = query.filter(Reminder.is_completed == False)
    
    reminders = query.order_by(Reminder.due_date.asc()).all()
    
    return [
        ReminderResponse(
            id=r.id,
            title=r.title,
            description=r.description,
            due_date=r.due_date,
            reminder_type=r.reminder_type,
            modelo=r.modelo,
            is_completed=r.is_completed,
            notify_days_before=r.notify_days_before,
            days_until_due=calculate_days_until(r.due_date),
            is_overdue=r.due_date < datetime.now(),
            created_at=r.created_at
        )
        for r in reminders
    ]


@router.get("/all", response_model=AllDeadlinesResponse)
async def get_all_deadlines(
    months_ahead: int = 6,
    include_completed: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tax_deadlines = SpanishTaxDeadlines.get_all_upcoming(months_ahead=months_ahead)
    tax_deadline_responses = [
        TaxDeadlineResponse(
            modelo=d["modelo"],
            name=d["name"],
            due_date=d["due_date"],
            description=d["description"],
            days_until_due=calculate_days_until(datetime.combine(d["due_date"], datetime.min.time())),
            is_overdue=d["due_date"] < date.today(),
            quarter=d.get("quarter")
        )
        for d in tax_deadlines
    ]
    
    query = db.query(Reminder).filter(Reminder.user_id == current_user.id)
    if not include_completed:
        query = query.filter(Reminder.is_completed == False)
    reminders = query.order_by(Reminder.due_date.asc()).all()
    
    reminder_responses = [
        ReminderResponse(
            id=r.id,
            title=r.title,
            description=r.description,
            due_date=r.due_date,
            reminder_type=r.reminder_type,
            modelo=r.modelo,
            is_completed=r.is_completed,
            notify_days_before=r.notify_days_before,
            days_until_due=calculate_days_until(r.due_date),
            is_overdue=r.due_date < datetime.now(),
            created_at=r.created_at
        )
        for r in reminders
    ]
    
    return AllDeadlinesResponse(
        tax_deadlines=tax_deadline_responses,
        custom_reminders=reminder_responses
    )


@router.post("/", response_model=ReminderResponse)
async def create_reminder(
    reminder: ReminderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_reminder = Reminder(
        user_id=current_user.id,
        title=reminder.title,
        description=reminder.description,
        due_date=reminder.due_date,
        reminder_type=reminder.reminder_type,
        modelo=reminder.modelo,
        notify_days_before=reminder.notify_days_before
    )
    
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    
    return ReminderResponse(
        id=db_reminder.id,
        title=db_reminder.title,
        description=db_reminder.description,
        due_date=db_reminder.due_date,
        reminder_type=db_reminder.reminder_type,
        modelo=db_reminder.modelo,
        is_completed=db_reminder.is_completed,
        notify_days_before=db_reminder.notify_days_before,
        days_until_due=calculate_days_until(db_reminder.due_date),
        is_overdue=db_reminder.due_date < datetime.now(),
        created_at=db_reminder.created_at
    )


@router.patch("/{reminder_id}", response_model=ReminderResponse)
async def update_reminder(
    reminder_id: int,
    update: ReminderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()
    
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    update_data = update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reminder, field, value)
    
    db.commit()
    db.refresh(reminder)
    
    return ReminderResponse(
        id=reminder.id,
        title=reminder.title,
        description=reminder.description,
        due_date=reminder.due_date,
        reminder_type=reminder.reminder_type,
        modelo=reminder.modelo,
        is_completed=reminder.is_completed,
        notify_days_before=reminder.notify_days_before,
        days_until_due=calculate_days_until(reminder.due_date),
        is_overdue=reminder.due_date < datetime.now(),
        created_at=reminder.created_at
    )


@router.delete("/{reminder_id}")
async def delete_reminder(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()
    
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    db.delete(reminder)
    db.commit()
    
    return {"message": "Reminder deleted successfully"}


@router.post("/{reminder_id}/complete")
async def mark_reminder_complete(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()
    
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    reminder.is_completed = True
    db.commit()
    
    return {"message": "Reminder marked as completed"}