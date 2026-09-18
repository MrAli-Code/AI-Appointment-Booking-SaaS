import uuid
from sqlalchemy import Column, String, Boolean, Numeric, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..core.database import Base
from .base import TimestampMixin


class Payment(Base, TimestampMixin):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="USD")
    status = Column(String(50), default="pending")
    method = Column(String(50))
    transaction_id = Column(String(255))
    paid_at = Column(DateTime)
    refunded_at = Column(DateTime)
    metadata = Column(JSON, default=dict)

    tenant = relationship("Tenant", back_populates="payments")
    booking = relationship("Booking", back_populates="payment")
