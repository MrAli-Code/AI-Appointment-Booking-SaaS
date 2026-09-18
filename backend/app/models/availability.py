import uuid
from sqlalchemy import Column, String, Boolean, Integer, Time, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..core.database import Base
from .base import TimestampMixin


class Availability(Base, TimestampMixin):
    __tablename__ = "availabilities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    staff_id = Column(UUID(as_uuid=True), ForeignKey("staff.id", ondelete="CASCADE"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_active = Column(Boolean, default=True)
    specific_date = Column(Date, nullable=True)

    staff = relationship("Staff", back_populates="availabilities")
