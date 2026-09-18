import json
import logging
from typing import Callable, Awaitable
import aio_pika
from ..core.config import settings

logger = logging.getLogger(__name__)

EXCHANGE_NAME = "ai_booking"
EXCHANGE_TYPE = "topic"

EVENT_ROUTING = {
    "booking.created": "booking.created",
    "booking.cancelled": "booking.cancelled",
    "booking.rescheduled": "booking.rescheduled",
    "payment.success": "payment.success",
    "payment.failed": "payment.failed",
    "notification.sent": "notification.sent",
    "ai.intent.detected": "ai.intent.detected",
    "ai.escalation": "ai.escalation",
}


class EventBus:
    def __init__(self):
        self._connection = None
        self._channel = None
        self._exchange = None

    async def connect(self):
        try:
            self._connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)
            self._channel = await self._connection.channel()
            self._exchange = await self._channel.declare_exchange(EXCHANGE_NAME, type=EXCHANGE_TYPE, durable=True)
            logger.info("Connected to RabbitMQ")
        except Exception as e:
            logger.warning(f"RabbitMQ connection failed: {e}. Events will be disabled.")

    async def publish(self, event_type: str, payload: dict):
        if not self._exchange:
            logger.warning(f"Exchange not available, skipping event: {event_type}")
            return
        routing_key = EVENT_ROUTING.get(event_type)
        if not routing_key:
            logger.error(f"Unknown event type: {event_type}")
            return
        message = aio_pika.Message(
            body=json.dumps(payload).encode(),
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
            content_type="application/json",
        )
        await self._exchange.publish(message, routing_key=routing_key)
        logger.info(f"Published event: {event_type}")

    async def consume(self, routing_key: str, callback: Callable[[dict], Awaitable[None]]):
        if not self._channel:
            logger.warning("Channel not available, cannot consume")
            return
        queue = await self._channel.declare_queue(durable=True, auto_delete=False)
        await queue.bind(self._exchange, routing_key=routing_key)

        async def on_message(message: aio_pika.IncomingMessage):
            async with message.process():
                payload = json.loads(message.body.decode())
                await callback(payload)

        await queue.consume(on_message)
        logger.info(f"Consuming events with routing key: {routing_key}")

    async def close(self):
        if self._connection:
            await self._connection.close()
            logger.info("RabbitMQ connection closed")


event_bus = EventBus()
