import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from ..core.database import Base


class TimestampMixin:
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class TenantMixin:
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
