import uuid
from sqlalchemy import Column, String, Boolean, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..core.database import Base
from .base import TimestampMixin


class Conversation(Base, TimestampMixin):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    session_id = Column(String(255), nullable=False, index=True)
    channel = Column(String(50), default="web")
    locale = Column(String(10), default="en")
    context = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    metadata = Column(JSON, default=dict)

    tenant = relationship("Tenant", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base, TimestampMixin):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    intent = Column(String(100))
    metadata = Column(JSON, default=dict)

    conversation = relationship("Conversation", back_populates="messages")
