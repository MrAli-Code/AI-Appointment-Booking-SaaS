from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import date
from ...core.database import get_db
from ...core.dependencies import get_current_user, get_current_admin
from ...models.user import User
from ...schemas.booking import BookingCreate, BookingReschedule, BookingResponse, SlotResponse
from ...services.booking_service import BookingService
from ...events.rabbitmq import event_bus
from ...services.notification_service import notification_service

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.get("/slots", response_model=list[SlotResponse])
async def get_available_slots(
    tenant_id: str = Query(...),
    staff_id: Optional[str] = None,
    service_id: Optional[str] = None,
    target_date: Optional[date] = None,
    locale: str = "en",
    db: AsyncSession = Depends(get_db),
):
    service = BookingService(db)
    slots = await service.get_available_slots(tenant_id, staff_id, service_id, target_date, locale)
    return slots


@router.post("/", response_model=BookingResponse)
async def create_booking(
    data: BookingCreate,
    tenant_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user),
):
    try:
        service = BookingService(db)
        booking = await service.create_booking(
            tenant_id=tenant_id, data=data,
            user_id=str(user.id) if user else None
        )
        await event_bus.publish("booking.created", {
            "booking_id": str(booking.id),
            "tenant_id": tenant_id,
            "service_id": data.service_id,
            "start_time": booking.start_time.isoformat(),
            "customer_email": data.customer_email,
            "customer_phone": data.customer_phone,
            "locale": data.locale or "en",
        })
        return BookingResponse(
            id=str(booking.id),
            service_id=str(booking.service_id) if booking.service_id else None,
            staff_id=str(booking.staff_id) if booking.staff_id else None,
            start_time=booking.start_time,
            end_time=booking.end_time,
            status=booking.status,
            customer_name=booking.customer_name,
            customer_email=booking.customer_email,
            customer_phone=booking.customer_phone,
            notes=booking.notes,
            source=booking.source,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        service = BookingService(db)
        booking = await service.cancel_booking(booking_id)
        await event_bus.publish("booking.cancelled", {
            "booking_id": booking_id,
            "tenant_id": str(booking.tenant_id),
        })
        return BookingResponse(
            id=str(booking.id),
            service_id=str(booking.service_id) if booking.service_id else None,
            staff_id=str(booking.staff_id) if booking.staff_id else None,
            start_time=booking.start_time,
            end_time=booking.end_time,
            status=booking.status,
            customer_name=booking.customer_name,
            customer_email=booking.customer_email,
            customer_phone=booking.customer_phone,
            notes=booking.notes,
            source=booking.source,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{booking_id}/reschedule", response_model=BookingResponse)
async def reschedule_booking(
    booking_id: str,
    data: BookingReschedule,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        service = BookingService(db)
        booking = await service.reschedule_booking(booking_id, data)
        await event_bus.publish("booking.rescheduled", {
            "booking_id": booking_id,
            "new_start_time": data.new_start_time,
        })
        return BookingResponse(
            id=str(booking.id),
            service_id=str(booking.service_id) if booking.service_id else None,
            staff_id=str(booking.staff_id) if booking.staff_id else None,
            start_time=booking.start_time,
            end_time=booking.end_time,
            status=booking.status,
            customer_name=booking.customer_name,
            customer_email=booking.customer_email,
            customer_phone=booking.customer_phone,
            notes=booking.notes,
            source=booking.source,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/my", response_model=list[BookingResponse])
async def get_my_bookings(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    service = BookingService(db)
    bookings = await service.get_user_bookings(str(user.id))
    return [
        BookingResponse(
            id=str(b.id), service_id=str(b.service_id) if b.service_id else None,
            staff_id=str(b.staff_id) if b.staff_id else None,
            start_time=b.start_time, end_time=b.end_time, status=b.status,
            customer_name=b.customer_name, customer_email=b.customer_email,
            customer_phone=b.customer_phone, notes=b.notes, source=b.source,
        ) for b in bookings
    ]


@router.get("/admin", response_model=list[BookingResponse])
async def get_all_bookings(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = BookingService(db)
    bookings = await service.get_tenant_bookings(str(admin.tenant_id), status)
    return [
        BookingResponse(
            id=str(b.id), service_id=str(b.service_id) if b.service_id else None,
            staff_id=str(b.staff_id) if b.staff_id else None,
            start_time=b.start_time, end_time=b.end_time, status=b.status,
            customer_name=b.customer_name, customer_email=b.customer_email,
            customer_phone=b.customer_phone, notes=b.notes, source=b.source,
        ) for b in bookings
    ]
