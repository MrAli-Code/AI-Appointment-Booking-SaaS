from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from ...core.database import get_db
from ...core.dependencies import get_current_user
from ...models.user import User
from ...services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments"])


class PaymentCreateRequest(BaseModel):
    booking_id: str
    amount: Decimal
    currency: str = "USD"
    method: str = "card"


class PaymentResponse(BaseModel):
    id: str
    booking_id: Optional[str]
    amount: float
    currency: str
    status: str
    method: Optional[str]
    transaction_id: Optional[str]
    paid_at: Optional[datetime]
    refunded_at: Optional[datetime]

    class Config:
        from_attributes = True


@router.post("/", response_model=PaymentResponse)
async def create_payment(
    data: PaymentCreateRequest,
    tenant_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    service = PaymentService(db)
    payment = await service.create_payment(
        booking_id=data.booking_id,
        tenant_id=tenant_id,
        amount=data.amount,
        currency=data.currency,
        method=data.method,
    )
    return PaymentResponse(
        id=str(payment.id), booking_id=str(payment.booking_id) if payment.booking_id else None,
        amount=float(payment.amount), currency=payment.currency,
        status=payment.status, method=payment.method,
        transaction_id=payment.transaction_id,
        paid_at=payment.paid_at, refunded_at=payment.refunded_at,
    )


@router.post("/{payment_id}/confirm", response_model=PaymentResponse)
async def confirm_payment(
    payment_id: str,
    transaction_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    service = PaymentService(db)
    try:
        payment = await service.confirm_payment(payment_id, transaction_id)
        return PaymentResponse(
            id=str(payment.id), booking_id=str(payment.booking_id) if payment.booking_id else None,
            amount=float(payment.amount), currency=payment.currency,
            status=payment.status, method=payment.method,
            transaction_id=payment.transaction_id,
            paid_at=payment.paid_at, refunded_at=payment.refunded_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{payment_id}/refund", response_model=PaymentResponse)
async def refund_payment(
    payment_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    service = PaymentService(db)
    try:
        payment = await service.refund_payment(payment_id)
        return PaymentResponse(
            id=str(payment.id), booking_id=str(payment.booking_id) if payment.booking_id else None,
            amount=float(payment.amount), currency=payment.currency,
            status=payment.status, method=payment.method,
            transaction_id=payment.transaction_id,
            paid_at=payment.paid_at, refunded_at=payment.refunded_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
