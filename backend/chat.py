from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from openai import OpenAI
import os
import json
import uuid
import logging

from database import get_db, User, ChatMessage, Transaction
from auth import get_current_user

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

client = OpenAI(
    api_key=os.getenv("GROK_API_KEY"),
    base_url="https://api.x.ai/v1",
)

class ChatMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatMessageResponseData(BaseModel):
    answer: str
    deductions: Optional[dict] = None
    suggestions: Optional[List[str]] = None
    related_modelos: Optional[List[str]] = None
    estimated_tax: Optional[float] = None
    confidence: Optional[float] = None
    is_off_topic: bool = False

class ChatMessageResponse(BaseModel):
    id: int
    conversation_id: str
    role: str
    content: str
    response_data: Optional[dict] = None
    is_off_topic: bool = False
    created_at: datetime

class ConversationSummary(BaseModel):
    conversation_id: str
    last_message: str
    message_count: int
    created_at: datetime
    updated_at: datetime


def build_system_prompt(user: User, income: float, expenses: float) -> str:
    return f"""
You are TaxHelper AI, a specialized tax advisor for Spanish autónomos (self-employed workers).

## Your Expertise
- Spanish tax system: IVA, IRPF, Modelo 303, 130, 100, 390, 349
- Business expense deductions and categories
- Invoicing requirements and Verifactu compliance
- Quarterly and annual tax declarations
- Regional tax variations (Navarra, País Vasco, Canarias, etc.)
- Autónomo registration, fees, and social security

## IMPORTANT: Topic Restriction
You ONLY answer questions related to:
- Spanish taxes and tax declarations
- Business expenses and deductions
- Invoicing and billing
- Autónomo obligations and registration
- Tax deadlines and forms (Modelos)
- Business finances and accounting

If the user asks about ANYTHING NOT related to these topics (e.g., cooking, weather, sports, general knowledge), you MUST respond with is_off_topic: true and politely redirect them.

## Response Format
Always respond in valid JSON format:
{{
  "answer": "Your direct, helpful answer here",
  "deductions": {{"IRPF": 21, "IVA": 21}},
  "suggestions": ["Actionable tip 1", "Actionable tip 2"],
  "related_modelos": ["303", "130"],
  "estimated_tax": 1500.00,
  "confidence": 0.95,
  "is_off_topic": false
}}

Notes:
- "deductions", "suggestions", "related_modelos", "estimated_tax" can be null if not applicable
- "confidence" should reflect how certain you are (0.0-1.0)
- "is_off_topic" must be true if question is not tax/business related

## User Context
- Name: {user.full_name}
- Region: {user.region or 'Not specified'}
- Family Status: {user.family_status or 'Not specified'}
- Children: {user.num_children or 0}
- Income (last 6 months): €{income:,.2f}
- Expenses (last 6 months): €{expenses:,.2f}

Be concise, practical, and always consider their specific situation.
"""


def parse_ai_response(content: str) -> dict:
    try:
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        parsed = json.loads(content.strip())
        return parsed
    except json.JSONDecodeError:
        return {
            "answer": content,
            "is_off_topic": False,
            "confidence": 0.5
        }


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(
    request: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    conv_id = request.conversation_id or str(uuid.uuid4())[:8]
    
    user_msg = ChatMessage(
        user_id=current_user.id,
        conversation_id=conv_id,
        role="user",
        content=request.message
    )
    db.add(user_msg)
    db.commit()
    
    from_date = datetime.now() - timedelta(days=180)
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= from_date
    ).all()
    
    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expenses = sum(t.amount for t in transactions if t.type == "expense")
    
    history = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id,
        ChatMessage.conversation_id == conv_id
    ).order_by(ChatMessage.created_at.desc()).limit(10).all()
    
    system_prompt = build_system_prompt(current_user, total_income, total_expenses)
    messages = [{"role": "system", "content": system_prompt}]
    
    for msg in reversed(history):
        if msg.role == "assistant" and msg.response_data:
            messages.append({
                "role": "assistant",
                "content": json.dumps(msg.response_data)
            })
        else:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
    
    try:
        response = client.chat.completions.create(
            model="grok-3",
            messages=messages,
            temperature=0.1,
            max_tokens=600
        )
        
        assistant_content = response.choices[0].message.content
        parsed_data = parse_ai_response(assistant_content)
        tokens_used = response.usage.total_tokens if response.usage else None
        
    except Exception as e:
        logger.error(f"Grok API error: {e}")
        parsed_data = {
            "answer": "I'm sorry, I encountered an error processing your request. Please try again.",
            "is_off_topic": False,
            "confidence": 0
        }
        tokens_used = None
    
    assistant_msg = ChatMessage(
        user_id=current_user.id,
        conversation_id=conv_id,
        role="assistant",
        content=parsed_data.get("answer", ""),
        response_data=parsed_data,
        is_off_topic=parsed_data.get("is_off_topic", False),
        tokens_used=tokens_used
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)
    
    return ChatMessageResponse(
        id=assistant_msg.id,
        conversation_id=conv_id,
        role="assistant",
        content=assistant_msg.content,
        response_data=parsed_data,
        is_off_topic=assistant_msg.is_off_topic,
        created_at=assistant_msg.created_at
    )


@router.get("/conversation/{conversation_id}", response_model=List[ChatMessageResponse])
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id,
        ChatMessage.conversation_id == conversation_id
    ).order_by(ChatMessage.created_at).all()
    
    return [
        ChatMessageResponse(
            id=m.id,
            conversation_id=m.conversation_id,
            role=m.role,
            content=m.content,
            response_data=m.response_data,
            is_off_topic=m.is_off_topic,
            created_at=m.created_at
        )
        for m in messages
    ]


@router.get("/conversations", response_model=List[ConversationSummary])
async def get_conversations(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from sqlalchemy import func
    
    subquery = db.query(
        ChatMessage.conversation_id,
        func.count(ChatMessage.id).label('message_count'),
        func.min(ChatMessage.created_at).label('created_at'),
        func.max(ChatMessage.created_at).label('updated_at')
    ).filter(
        ChatMessage.user_id == current_user.id
    ).group_by(
        ChatMessage.conversation_id
    ).subquery()
    
    conversations = db.query(subquery).order_by(
        desc(subquery.c.updated_at)
    ).limit(limit).all()
    
    result = []
    for conv in conversations:
        last_msg = db.query(ChatMessage).filter(
            ChatMessage.conversation_id == conv.conversation_id
        ).order_by(desc(ChatMessage.created_at)).first()
        
        result.append(ConversationSummary(
            conversation_id=conv.conversation_id,
            last_message=last_msg.content[:100] if last_msg else "",
            message_count=conv.message_count,
            created_at=conv.created_at,
            updated_at=conv.updated_at
        ))
    
    return result


@router.delete("/conversation/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    deleted = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id,
        ChatMessage.conversation_id == conversation_id
    ).delete()
    
    db.commit()
    
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {"status": "deleted", "messages_removed": deleted}


@router.post("/new")
async def start_new_conversation(
    current_user: User = Depends(get_current_user)
):
    conv_id = str(uuid.uuid4())[:8]
    return {"conversation_id": conv_id}