import json
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from sqlalchemy.ext.asyncio import AsyncSession
from ..core.config import settings
from ..i18n.translations import t
from ..models.conversation import Conversation, Message
from ..models.tenant import Tenant
from ..models.service import Service
from ..services.booking_service import BookingService

logger = logging.getLogger(__name__)


class AIBookingEngine:
    def __init__(self, db: AsyncSession, tenant_id: str, locale: str = "en"):
        self.db = db
        self.tenant_id = tenant_id
        self.locale = locale
        self.booking_service = BookingService(db)
        self._conversation_context = {}

    async def get_or_create_conversation(self, session_id: str, channel: str = "web") -> Conversation:
        from sqlalchemy import select
        result = await self.db.execute(
            select(Conversation).where(
                Conversation.session_id == session_id,
                Conversation.tenant_id == self.tenant_id,
                Conversation.is_active == True
            )
        )
        conv = result.scalar_one_or_none()
        if not conv:
            conv = Conversation(
                tenant_id=self.tenant_id,
                session_id=session_id,
                channel=channel,
                locale=self.locale,
            )
            self.db.add(conv)
            await self.db.commit()
            await self.db.refresh(conv)
        return conv

    async def add_message(self, conversation_id: str, role: str, content: str, intent: Optional[str] = None) -> Message:
        msg = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            intent=intent,
        )
        self.db.add(msg)
        await self.db.commit()
        await self.db.refresh(msg)
        return msg

    async def detect_intent(self, message: str) -> str:
        msg_lower = message.lower().strip()

        greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "سلام", "hi", "hello", "start"]
        booking_intents = ["book", "appointment", "schedule", "reserve", "رزرو", "قرار", "booking"]
        cancel_intents = ["cancel", "لغو", "کنسل"]
        reschedule_intents = ["reschedule", "change", "move", "تغییر", "تغییر زمان"]
        view_intents = ["view", "show", "list", "appointments", "my bookings", "نمایش", "قرار ملاقات"]
        human_intents = ["human", "agent", "representative", "talk", "اپراتور", "انسان", "گفتگو"]
        payment_intents = ["pay", "payment", "پرداخت", "پرداخت"]

        if any(g in msg_lower for g in greetings):
            return "greeting"
        if any(k in msg_lower for k in booking_intents):
            return "book"
        if any(k in msg_lower for k in cancel_intents):
            return "cancel"
        if any(k in msg_lower for k in reschedule_intents):
            return "reschedule"
        if any(k in msg_lower for k in view_intents):
            return "view"
        if any(k in msg_lower for k in human_intents):
            return "human"
        if any(k in msg_lower for k in payment_intents):
            return "payment"
        if any(c.isdigit() for c in message):
            return "menu_selection"

        return "unknown"

    async def process_message(self, session_id: str, message: str, channel: str = "web") -> Dict[str, Any]:
        conv = await self.get_or_create_conversation(session_id, channel)
        await self.add_message(conv.id, "user", message)

        intent = await self.detect_intent(message)
        await self.add_message(conv.id, "system", f"Intent detected: {intent}", intent="intent_detected")

        result = await self._handle_intent(conv, intent, message)

        await self.add_message(conv.id, "assistant", result["response"], intent=intent)
        return result

    async def _handle_intent(self, conv: Conversation, intent: str, message: str) -> Dict[str, Any]:
        tenant_result = await self.db.execute(
            select(Tenant).where(Tenant.id == self.tenant_id)
        )
        tenant = tenant_result.scalar_one_or_none()
        business_name = tenant.name if tenant else "Business"

        if intent == "greeting":
            hour = datetime.now().hour
            if hour < 12:
                greeting = t("greeting_morning", self.locale)
            elif hour < 18:
                greeting = t("greeting_afternoon", self.locale)
            else:
                greeting = t("greeting_evening", self.locale)
            welcome = t("welcome", self.locale, business=business_name)
            menu = t("menu_options", self.locale)
            return {
                "response": f"{greeting}\n{welcome}\n\n{menu}",
                "intent": "greeting",
                "actions": ["show_menu"],
            }

        elif intent == "book":
            services_result = await self.db.execute(
                select(Service).where(
                    Service.tenant_id == self.tenant_id,
                    Service.is_active == True
                )
            )
            services = services_result.scalars().all()
            if not services:
                return {
                    "response": t("no_slots", self.locale, date="today"),
                    "intent": "book",
                    "actions": [],
                }

            service_list = "\n".join(
                [f"{i+1}. {s.name_fa if self.locale == 'fa' and s.name_fa else s.name} - {s.price} {s.currency} ({s.duration_minutes}min)"
                 for i, s in enumerate(services)]
            )
            return {
                "response": f"{t('ask_service', self.locale)}\n\n{service_list}",
                "intent": "book",
                "actions": ["select_service"],
                "services": [{"id": str(s.id), "name": s.name, "name_fa": s.name_fa, "price": float(s.price),
                              "duration": s.duration_minutes} for s in services],
            }

        elif intent == "cancel":
            return {
                "response": t("booking_cancel", self.locale),
                "intent": "cancel",
                "actions": ["confirm_cancellation"],
            }

        elif intent == "reschedule":
            return {
                "response": t("booking_reschedule", self.locale, date="[new_date]", time="[new_time]"),
                "intent": "reschedule",
                "actions": ["select_new_time"],
            }

        elif intent == "view":
            return {
                "response": t("no_appointments", self.locale),
                "intent": "view",
                "actions": [],
            }

        elif intent == "human":
            return {
                "response": t("human_escalation", self.locale),
                "intent": "human",
                "actions": ["escalate_to_human"],
            }

        elif intent == "payment":
            return {
                "response": t("payment_pending", self.locale, amount="0", currency="USD"),
                "intent": "payment",
                "actions": ["process_payment"],
            }

        elif intent == "menu_selection":
            selection = message.strip()
            if selection == "1":
                return await self._handle_intent(conv, "book", message)
            elif selection == "2":
                return await self._handle_intent(conv, "view", message)
            elif selection == "3":
                return await self._handle_intent(conv, "cancel", message)
            elif selection == "4":
                return await self._handle_intent(conv, "reschedule", message)
            elif selection == "5":
                return await self._handle_intent(conv, "human", message)

        return {
            "response": t("menu_options", self.locale),
            "intent": "unknown",
            "actions": ["show_menu"],
        }

    async def get_nearest_slots(self, days_ahead: int = 14) -> List[Dict]:
        slots = []
        for day_offset in range(days_ahead):
            target_date = date.today()
            from datetime import timedelta
            target_date += timedelta(days=day_offset)
            day_slots = await self.booking_service.get_available_slots(
                tenant_id=self.tenant_id, target_date=target_date, locale=self.locale
            )
            slots.extend(day_slots)
            if len(slots) >= 5:
                break
        return slots[:5]
