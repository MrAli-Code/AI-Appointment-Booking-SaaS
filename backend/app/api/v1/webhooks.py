from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ...core.database import get_db
from ...services.payment_service import PaymentService

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/payment/stripe")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.json()
    event_type = payload.get("type", "")
    data = payload.get("data", {}).get("object", {})

    if event_type == "payment_intent.succeeded":
        payment_id = data.get("metadata", {}).get("payment_id")
        transaction_id = data.get("id")
        if payment_id:
            service = PaymentService(db)
            await service.confirm_payment(payment_id, transaction_id)

    elif event_type == "payment_intent.payment_failed":
        payment_id = data.get("metadata", {}).get("payment_id")
        if payment_id:
            service = PaymentService(db)
            await service.fail_payment(payment_id, "stripe_failed")

    return {"status": "ok"}


@router.post("/payment/zarinpal")
async def zarinpal_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.json()
    status = payload.get("status")
    payment_id = payload.get("metadata", {}).get("payment_id")
    authority = payload.get("authority")

    if status == "OK" and payment_id:
        service = PaymentService(db)
        await service.confirm_payment(payment_id, authority)

    return {"status": "ok"}
