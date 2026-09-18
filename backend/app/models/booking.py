import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..core.database import Base
from .base import TimestampMixin


class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    staff_id = Column(UUID(as_uuid=True), ForeignKey("staff.id", ondelete="SET NULL"), nullable=True)
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="SET NULL"), nullable=True)

    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False)
    status = Column(String(50), default="pending")
    customer_name = Column(String(255))
    customer_email = Column(String(255))
    customer_phone = Column(String(50))
    notes = Column(Text)
    source = Column(String(50), default="web")
    is_vip = Column(Boolean, default=False)
    locale = Column(String(10), default="en")
    metadata = Column(JSON, default=dict)

    tenant = relationship("Tenant", back_populates="bookings")
    user = relationship("User")
    staff = relationship("Staff", back_populates="bookings")
    service = relationship("Service", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False, cascade="all, delete-orphan")
