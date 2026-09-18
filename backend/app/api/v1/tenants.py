from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from ...core.database import get_db
from ...models.tenant import Tenant
from ...models.staff import Staff
from ...models.service import Service
from ...models.availability import Availability
from ...core.dependencies import get_current_admin
from ...models.user import User

router = APIRouter(prefix="/tenants", tags=["Tenants"])


class TenantCreate(BaseModel):
    name: str
    slug: str
    domain: Optional[str] = None
    locale: Optional[str] = "en"


class ServiceCreate(BaseModel):
    name: str
    name_fa: Optional[str] = None
    description: Optional[str] = None
    description_fa: Optional[str] = None
    duration_minutes: int
    price: float
    currency: str = "USD"
    category: Optional[str] = None
    color: Optional[str] = "#10B981"


class StaffCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    color: Optional[str] = "#3B82F6"


class AvailabilityCreate(BaseModel):
    staff_id: str
    day_of_week: int
    start_time: str
    end_time: str


@router.post("/")
async def create_tenant(data: TenantCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Tenant).where(Tenant.slug == data.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Slug already exists")

    tenant = Tenant(
        name=data.name, slug=data.slug,
        domain=data.domain, locale=data.locale,
    )
    db.add(tenant)
    await db.commit()
    await db.refresh(tenant)
    return {"id": str(tenant.id), "name": tenant.name, "slug": tenant.slug}


@router.get("/{slug}")
async def get_tenant(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tenant).where(Tenant.slug == slug))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {
        "id": str(tenant.id), "name": tenant.name, "slug": tenant.slug,
        "domain": tenant.domain, "locale": tenant.locale,
        "is_active": tenant.is_active, "branding": tenant.branding,
    }


@router.post("/services")
async def create_service(
    data: ServiceCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = Service(
        tenant_id=admin.tenant_id,
        name=data.name, name_fa=data.name_fa,
        description=data.description, description_fa=data.description_fa,
        duration_minutes=data.duration_minutes, price=data.price,
        currency=data.currency, category=data.category, color=data.color,
    )
    db.add(service)
    await db.commit()
    await db.refresh(service)
    return {
        "id": str(service.id), "name": service.name,
        "duration_minutes": service.duration_minutes, "price": float(service.price),
    }


@router.post("/staff")
async def create_staff(
    data: StaffCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    staff = Staff(
        tenant_id=admin.tenant_id,
        name=data.name, email=data.email, phone=data.phone,
        role=data.role, color=data.color,
    )
    db.add(staff)
    await db.commit()
    await db.refresh(staff)
    return {"id": str(staff.id), "name": staff.name, "role": staff.role}


@router.post("/availability")
async def create_availability(
    data: AvailabilityCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    from datetime import time
    start = time.fromisoformat(data.start_time)
    end = time.fromisoformat(data.end_time)

    availability = Availability(
        staff_id=data.staff_id,
        day_of_week=data.day_of_week,
        start_time=start,
        end_time=end,
    )
    db.add(availability)
    await db.commit()
    await db.refresh(availability)
    return {"id": str(availability.id), "day_of_week": data.day_of_week}
