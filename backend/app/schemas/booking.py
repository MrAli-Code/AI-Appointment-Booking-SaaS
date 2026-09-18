from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class BookingCreate(BaseModel):
    service_id: str
    staff_id: Optional[str] = None
    start_time: str
    customer_name: str
    customer_email: str
    customer_phone: str
    notes: Optional[str] = None
    source: Optional[str] = "web"
    locale: Optional[str] = "en"


class BookingReschedule(BaseModel):
    new_start_time: str


class BookingResponse(BaseModel):
    id: str
    service_id: Optional[str]
    staff_id: Optional[str]
    start_time: datetime
    end_time: datetime
    status: str
    customer_name: str
    customer_email: str
    customer_phone: str
    notes: Optional[str]
    source: str

    class Config:
        from_attributes = True


class SlotResponse(BaseModel):
    start: str
    end: str
    staff_id: Optional[str]
    staff_name: Optional[str]
    date: str
    time: str
