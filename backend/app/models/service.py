import uuid
from sqlalchemy import Column, String, Boolean, Integer, Numeric, ForeignKey, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..core.database import Base
from .base import TimestampMixin


class Service(Base, TimestampMixin):
    __tablename__ = "services"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    name_fa = Column(String(255))
    description = Column(Text)
    description_fa = Column(Text)
    duration_minutes = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="USD")
    is_active = Column(Boolean, default=True)
    category = Column(String(100))
    color = Column(String(7), default="#10B981")
    metadata = Column(JSON, default=dict)

    tenant = relationship("Tenant", back_populates="services")
    bookings = relationship("Booking", back_populates="service")
