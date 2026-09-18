from datetime import datetime, date, time, timedelta
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from ..models.booking import Booking
from ..models.staff import Staff
from ..models.service import Service
from ..models.availability import Availability
from ..models.user import User
from ..schemas.booking import BookingCreate, BookingReschedule
from ..i18n.translations import t


class BookingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_available_slots(
        self, tenant_id: str, staff_id: Optional[str] = None,
        service_id: str = None, target_date: date = None, locale: str = "en"
    ) -> List[dict]:
        if not target_date:
            target_date = date.today()
        day_of_week = target_date.weekday()

        query = select(Availability).where(
            Availability.is_active == True,
            or_(
                and_(Availability.day_of_week == day_of_week, Availability.specific_date == None),
                Availability.specific_date == target_date
            )
        )
        if staff_id:
            query = query.where(Availability.staff_id == staff_id)

        result = await self.db.execute(query)
        availabilities = result.scalars().all()

        service = None
        if service_id:
            result = await self.db.execute(select(Service).where(Service.id == service_id))
            service = result.scalar_one_or_none()

        duration = service.duration_minutes if service else 60
        buffer = 15

        booked_query = select(Booking).where(
            Booking.tenant_id == tenant_id,
            Booking.start_time >= datetime.combine(target_date, time.min),
            Booking.start_time < datetime.combine(target_date, time.max),
            Booking.status.in_(["confirmed", "pending"])
        )
        if staff_id:
            booked_query = booked_query.where(Booking.staff_id == staff_id)
        booked_result = await self.db.execute(booked_query)
        booked_slots = booked_result.scalars().all()

        booked_intervals = []
        for b in booked_slots:
            booked_intervals.append((b.start_time, b.end_time))

        slots = []
        for av in availabilities:
            current = datetime.combine(target_date, av.start_time)
            end_boundary = datetime.combine(target_date, av.end_time)

            while current + timedelta(minutes=duration) <= end_boundary:
                slot_end = current + timedelta(minutes=duration)
                is_booked = any(
                    current < b_end and slot_end > b_start
                    for b_start, b_end in booked_intervals
                )
                if not is_booked:
                    staff = None
                    if av.staff_id:
                        staff_result = await self.db.execute(select(Staff).where(Staff.id == av.staff_id))
                        staff = staff_result.scalar_one_or_none()

                    slots.append({
                        "start": current.isoformat(),
                        "end": slot_end.isoformat(),
                        "staff_id": str(av.staff_id) if av.staff_id else None,
                        "staff_name": staff.name if staff else None,
                        "date": target_date.isoformat(),
                        "time": current.strftime("%H:%M"),
                    })
                current += timedelta(minutes=buffer)

        return sorted(slots, key=lambda s: s["start"])

    async def create_booking(self, tenant_id: str, data: BookingCreate, user_id: Optional[str] = None) -> Booking:
        start = datetime.fromisoformat(data.start_time)
        service_result = await self.db.execute(select(Service).where(Service.id == data.service_id))
        service = service_result.scalar_one_or_none()
        if not service:
            raise ValueError("Service not found")

        end = start + timedelta(minutes=service.duration_minutes)

        booking = Booking(
            tenant_id=tenant_id,
            user_id=user_id,
            staff_id=data.staff_id,
            service_id=data.service_id,
            start_time=start,
            end_time=end,
            status="pending",
            customer_name=data.customer_name,
            customer_email=data.customer_email,
            customer_phone=data.customer_phone,
            notes=data.notes,
            source=data.source or "web",
            locale=data.locale or "en",
        )
        self.db.add(booking)
        await self.db.commit()
        await self.db.refresh(booking)
        return booking

    async def cancel_booking(self, booking_id: str) -> Booking:
        result = await self.db.execute(select(Booking).where(Booking.id == booking_id))
        booking = result.scalar_one_or_none()
        if not booking:
            raise ValueError("Booking not found")
        booking.status = "cancelled"
        await self.db.commit()
        await self.db.refresh(booking)
        return booking

    async def reschedule_booking(self, booking_id: str, data: BookingReschedule) -> Booking:
        result = await self.db.execute(select(Booking).where(Booking.id == booking_id))
        booking = result.scalar_one_or_none()
        if not booking:
            raise ValueError("Booking not found")

        new_start = datetime.fromisoformat(data.new_start_time)
        service_result = await self.db.execute(select(Service).where(Service.id == booking.service_id))
        service = service_result.scalar_one_or_none()
        duration = service.duration_minutes if service else 60

        booking.start_time = new_start
        booking.end_time = new_start + timedelta(minutes=duration)
        booking.status = "confirmed"
        await self.db.commit()
        await self.db.refresh(booking)
        return booking

    async def get_user_bookings(self, user_id: str) -> List[Booking]:
        result = await self.db.execute(
            select(Booking).where(Booking.user_id == user_id).order_by(Booking.start_time)
        )
        return result.scalars().all()

    async def get_tenant_bookings(self, tenant_id: str, status: Optional[str] = None) -> List[Booking]:
        query = select(Booking).where(Booking.tenant_id == tenant_id)
        if status:
            query = query.where(Booking.status == status)
        query = query.order_by(Booking.start_time)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_upcoming_bookings(self, tenant_id: str) -> List[Booking]:
        result = await self.db.execute(
            select(Booking).where(
                Booking.tenant_id == tenant_id,
                Booking.start_time >= datetime.utcnow(),
                Booking.status.in_(["confirmed", "pending"])
            ).order_by(Booking.start_time)
        )
        return result.scalars().all()
