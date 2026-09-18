from typing import Optional
from decimal import Decimal
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.payment import Payment
from ..models.booking import Booking
from ..events.rabbitmq import event_bus


class PaymentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_payment(self, booking_id: str, tenant_id: str, amount: Decimal, currency: str = "USD", method: str = "card") -> Payment:
        payment = Payment(
            tenant_id=tenant_id,
            booking_id=booking_id,
            amount=amount,
            currency=currency,
            status="pending",
            method=method,
        )
        self.db.add(payment)
        await self.db.commit()
        await self.db.refresh(payment)
        return payment

    async def confirm_payment(self, payment_id: str, transaction_id: str) -> Payment:
        result = await self.db.execute(select(Payment).where(Payment.id == payment_id))
        payment = result.scalar_one_or_none()
        if not payment:
            raise ValueError("Payment not found")

        payment.status = "completed"
        payment.transaction_id = transaction_id
        payment.paid_at = datetime.utcnow()

        booking_result = await self.db.execute(select(Booking).where(Booking.id == payment.booking_id))
        booking = booking_result.scalar_one_or_none()
        if booking:
            booking.status = "confirmed"

        await self.db.commit()
        await self.db.refresh(payment)

        await event_bus.publish("payment.success", {
            "payment_id": str(payment.id),
            "booking_id": str(payment.booking_id),
            "amount": float(payment.amount),
            "currency": payment.currency,
        })

        return payment

    async def fail_payment(self, payment_id: str, reason: str = "failed") -> Payment:
        result = await self.db.execute(select(Payment).where(Payment.id == payment_id))
        payment = result.scalar_one_or_none()
        if not payment:
            raise ValueError("Payment not found")

        payment.status = "failed"

        await self.db.commit()
        await self.db.refresh(payment)

        await event_bus.publish("payment.failed", {
            "payment_id": str(payment.id),
            "booking_id": str(payment.booking_id),
            "reason": reason,
        })

        return payment

    async def refund_payment(self, payment_id: str) -> Payment:
        result = await self.db.execute(select(Payment).where(Payment.id == payment_id))
        payment = result.scalar_one_or_none()
        if not payment:
            raise ValueError("Payment not found")

        payment.status = "refunded"
        payment.refunded_at = datetime.utcnow()

        await self.db.commit()
        await self.db.refresh(payment)
        return payment
