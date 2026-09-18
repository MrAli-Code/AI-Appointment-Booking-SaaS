import uuid
from sqlalchemy import Column, String, Boolean, Integer, Time, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..core.database import Base
from .base import TimestampMixin


class Staff(Base, TimestampMixin):
    __tablename__ = "staff"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255))
    phone = Column(String(50))
    role = Column(String(100))
    color = Column(String(7), default="#3B82F6")
    is_active = Column(Boolean, default=True)
    max_daily_bookings = Column(Integer, default=20)
    buffer_minutes = Column(Integer, default=15)
    metadata = Column(JSON, default=dict)

    tenant = relationship("Tenant", back_populates="staff")
    availabilities = relationship("Availability", back_populates="staff", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="staff")
