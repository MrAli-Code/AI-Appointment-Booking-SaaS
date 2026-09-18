import uuid
from sqlalchemy import Column, String, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..core.database import Base
from .base import TimestampMixin


class Tenant(Base, TimestampMixin):
    __tablename__ = "tenants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    domain = Column(String(255), unique=True)
    locale = Column(String(10), default="en")
    is_active = Column(Boolean, default=True)
    settings = Column(JSON, default=dict)
    branding = Column(JSON, default=dict)

    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    staff = relationship("Staff", back_populates="tenant", cascade="all, delete-orphan")
    services = relationship("Service", back_populates="tenant", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="tenant", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="tenant", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="tenant", cascade="all, delete-orphan")
