import asyncio
import uuid
from datetime import time
from sqlalchemy import select
from app.core.database import async_session, init_db, engine
from app.core.security import hash_password
from app.models.tenant import Tenant
from app.models.user import User
from app.models.staff import Staff
from app.models.service import Service
from app.models.availability import Availability


async def seed():
    await init_db()

    async with async_session() as session:
        existing = await session.execute(select(Tenant).where(Tenant.slug == "demo"))
        if existing.scalar_one_or_none():
            print("Demo tenant already exists. Skipping seed.")
            return

        tenant = Tenant(
            id=uuid.uuid4(),
            name="Demo Beauty Salon",
            slug="demo",
            domain="demo.example.com",
            locale="en",
            settings={
                "timezone": "America/New_York",
                "default_duration": 60,
                "buffer_minutes": 15,
                "max_advance_days": 60,
            },
            branding={
                "primary_color": "#3B82F6",
                "logo_url": None,
                "business_hours": "Mon-Sat 9:00-18:00",
            },
        )
        session.add(tenant)
        await session.flush()

        admin = User(
            tenant_id=tenant.id,
            email="admin@demo.com",
            password_hash=hash_password("admin123"),
            full_name="Admin User",
            role="admin",
            locale="en",
        )
        session.add(admin)

        staff_members = [
            Staff(tenant_id=tenant.id, name="Sarah Johnson", email="sarah@demo.com",
                  role="Senior Stylist", color="#3B82F6", max_daily_bookings=10, buffer_minutes=15),
            Staff(tenant_id=tenant.id, name="Mike Chen", email="mike@demo.com",
                  role="Barber", color="#10B981", max_daily_bookings=12, buffer_minutes=10),
            Staff(tenant_id=tenant.id, name="Emily Davis", email="emily@demo.com",
                  role="Nail Artist", color="#F59E0B", max_daily_bookings=8, buffer_minutes=20),
        ]

        for staff in staff_members:
            session.add(staff)
        await session.flush()

        services = [
            Service(tenant_id=tenant.id, name="Haircut", name_fa="کوتاهی مو",
                    description="Professional haircut and styling", description_fa="کوتاهی و حالت‌دهی حرفه‌ای مو",
                    duration_minutes=45, price=45.00, currency="USD", category="Hair", color="#3B82F6"),
            Service(tenant_id=tenant.id, name="Hair Coloring", name_fa="رنگ مو",
                    description="Full hair coloring service", description_fa="خدمات رنگ موی کامل",
                    duration_minutes=90, price=120.00, currency="USD", category="Hair", color="#8B5CF6"),
            Service(tenant_id=tenant.id, name="Manicure", name_fa="مانیکور",
                    description="Classic manicure with polish", description_fa="مانیکور کلاسیک با لاک",
                    duration_minutes=30, price=35.00, currency="USD", category="Nails", color="#F59E0B"),
            Service(tenant_id=tenant.id, name="Pedicure", name_fa="پدیکور",
                    description="Relaxing pedicure treatment", description_fa="پدیکور آرامش‌بخش",
                    duration_minutes=45, price=50.00, currency="USD", category="Nails", color="#EF4444"),
            Service(tenant_id=tenant.id, name="Beard Trim", name_fa="اصلاح ریش",
                    description="Precision beard trimming and shaping", description_fa="اصلاح و فرم‌دهی دقیق ریش",
                    duration_minutes=20, price=25.00, currency="USD", category="Grooming", color="#10B981"),
        ]

        for service in services:
            session.add(service)
        await session.flush()

        for staff in staff_members:
            for day in range(6):
                if day < 5:
                    av = Availability(
                        staff_id=staff.id, day_of_week=day,
                        start_time=time(9, 0), end_time=time(17, 0)
                    )
                else:
                    av = Availability(
                        staff_id=staff.id, day_of_week=day,
                        start_time=time(10, 0), end_time=time(15, 0)
                    )
                session.add(av)

        await session.commit()
        print("Seed data created successfully!")
        print(f"  Tenant slug: demo")
        print(f"  Admin email: admin@demo.com / admin123")


if __name__ == "__main__":
    asyncio.run(seed())
