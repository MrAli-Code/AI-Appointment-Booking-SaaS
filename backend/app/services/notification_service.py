import logging
from typing import Optional
from ..events.rabbitmq import event_bus

logger = logging.getLogger(__name__)


class NotificationService:
    async def send_sms(self, phone: str, message: str):
        logger.info(f"SMS to {phone}: {message}")

    async def send_email(self, email: str, subject: str, body: str):
        logger.info(f"Email to {email}: {subject} - {body}")

    async def send_whatsapp(self, phone: str, message: str):
        logger.info(f"WhatsApp to {phone}: {message}")

    async def send_telegram(self, chat_id: str, message: str):
        logger.info(f"Telegram to {chat_id}: {message}")

    async def notify_booking_confirmed(self, booking_data: dict):
        locale = booking_data.get("locale", "en")
        name = booking_data.get("customer_name", "Customer")
        service = booking_data.get("service_name", "Service")
        date_time = booking_data.get("start_time", "")

        message = f"Dear {name}, your appointment for {service} on {date_time} is confirmed!"

        if booking_data.get("customer_email"):
            await self.send_email(
                booking_data["customer_email"],
                "Booking Confirmed",
                message
            )

        if booking_data.get("customer_phone"):
            await self.send_sms(booking_data["customer_phone"], message)

        await event_bus.publish("notification.sent", {
            "type": "booking_confirmed",
            "channel": "email" if booking_data.get("customer_email") else "sms",
            "recipient": booking_data.get("customer_email") or booking_data.get("customer_phone"),
        })


notification_service = NotificationService()
