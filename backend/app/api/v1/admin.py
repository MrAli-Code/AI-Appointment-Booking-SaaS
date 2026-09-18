from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
from datetime import datetime, date, timedelta
from ...core.database import get_db
from ...core.dependencies import get_current_admin
from ...models.user import User
from ...models.tenant import Tenant
from ...models.staff import Staff
from ...models.service import Service
from ...models.booking import Booking
from ...models.availability import Availability
from ...models.payment import Payment
from ...schemas.booking import BookingResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    tenant_id = admin.tenant_id

    today = date.today()
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())

    total_bookings = await db.scalar(
        select(func.count(Booking.id)).where(Booking.tenant_id == tenant_id)
    )
    today_bookings = await db.scalar(
        select(func.count(Booking.id)).where(
            Booking.tenant_id == tenant_id,
            Booking.start_time >= today_start,
            Booking.start_time <= today_end,
        )
    )
    upcoming = await db.scalar(
        select(func.count(Booking.id)).where(
            Booking.tenant_id == tenant_id,
            Booking.start_time >= datetime.utcnow(),
            Booking.status.in_(["confirmed", "pending"]),
        )
    )
    total_revenue = await db.scalar(
        select(func.coalesce(func.sum(Payment.amount), 0)).where(
            Payment.tenant_id == tenant_id,
            Payment.status == "completed",
        )
    )
    staff_count = await db.scalar(
        select(func.count(Staff.id)).where(Staff.tenant_id == tenant_id, Staff.is_active == True)
    )
    service_count = await db.scalar(
        select(func.count(Service.id)).where(Service.tenant_id == tenant_id, Service.is_active == True)
    )

    return {
        "total_bookings": total_bookings or 0,
        "today_bookings": today_bookings or 0,
        "upcoming_bookings": upcoming or 0,
        "total_revenue": float(total_revenue or 0),
        "active_staff": staff_count or 0,
        "active_services": service_count or 0,
    }


@router.get("/analytics")
async def get_analytics(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    tenant_id = admin.tenant_id
    since = datetime.utcnow() - timedelta(days=days)

    result = await db.execute(
        select(
            func.date(Booking.start_time).label("date"),
            func.count(Booking.id).label("count"),
            func.coalesce(func.sum(Payment.amount), 0).label("revenue"),
        )
        .select_from(Booking)
        .outerjoin(Payment, Payment.booking_id == Booking.id)
        .where(
            Booking.tenant_id == tenant_id,
            Booking.start_time >= since,
        )
        .group_by(func.date(Booking.start_time))
        .order_by(func.date(Booking.start_time))
    )
    rows = result.all()

    return {
        "period_days": days,
        "data": [
            {"date": str(r.date), "bookings": r.count, "revenue": float(r.revenue)}
            for r in rows
        ],
    }


@router.get("/bookings", response_model=List[BookingResponse])
async def get_admin_bookings(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    tenant_id = admin.tenant_id
    query = select(Booking).where(Booking.tenant_id == tenant_id)
    if status:
        query = query.where(Booking.status == status)
    query = query.order_by(Booking.created_at.desc()).offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    bookings = result.scalars().all()

    return [
        BookingResponse(
            id=str(b.id), service_id=str(b.service_id) if b.service_id else None,
            staff_id=str(b.staff_id) if b.staff_id else None,
            start_time=b.start_time, end_time=b.end_time, status=b.status,
            customer_name=b.customer_name, customer_email=b.customer_email,
            customer_phone=b.customer_phone, notes=b.notes, source=b.source,
        ) for b in bookings
    ]


@router.get("/staff")
async def get_staff(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(
        select(Staff).where(Staff.tenant_id == admin.tenant_id, Staff.is_active == True)
    )
    staff_list = result.scalars().all()
    return [
        {
            "id": str(s.id), "name": s.name, "email": s.email,
            "phone": s.phone, "role": s.role, "color": s.color,
            "is_active": s.is_active,
        }
        for s in staff_list
    ]


@router.get("/services")
async def get_services(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(
        select(Service).where(Service.tenant_id == admin.tenant_id, Service.is_active == True)
    )
    services = result.scalars().all()
    return [
        {
            "id": str(s.id), "name": s.name, "name_fa": s.name_fa,
            "description": s.description, "description_fa": s.description_fa,
            "duration_minutes": s.duration_minutes, "price": float(s.price),
            "currency": s.currency, "category": s.category, "color": s.color,
        }
        for s in services
    ]
