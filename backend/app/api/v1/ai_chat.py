from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from ...core.database import get_db
from ...ai.engine import AIBookingEngine
from ...events.rabbitmq import event_bus

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


class ChatMessage(BaseModel):
    session_id: str
    message: str
    tenant_id: str
    locale: Optional[str] = "en"
    channel: Optional[str] = "web"


class ChatResponse(BaseModel):
    response: str
    intent: str
    actions: List[str]
    data: Optional[Dict[str, Any]] = None


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatMessage,
    db: AsyncSession = Depends(get_db),
):
    engine = AIBookingEngine(db, body.tenant_id, body.locale)
    result = await engine.process_message(body.session_id, body.message, body.channel)

    await event_bus.publish("ai.intent.detected", {
        "session_id": body.session_id,
        "tenant_id": body.tenant_id,
        "intent": result["intent"],
        "locale": body.locale,
    })

    return ChatResponse(
        response=result["response"],
        intent=result["intent"],
        actions=result.get("actions", []),
        data=result.get("data"),
    )


@router.get("/slots", response_model=List[Dict[str, Any]])
async def nearest_slots(
    tenant_id: str = Query(...),
    locale: str = "en",
    db: AsyncSession = Depends(get_db),
):
    engine = AIBookingEngine(db, tenant_id, locale)
    slots = await engine.get_nearest_slots()
    return slots
