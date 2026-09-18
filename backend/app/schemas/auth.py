from pydantic import BaseModel, EmailStr
from typing import Optional


class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None
    tenant_slug: str
    locale: Optional[str] = "en"


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    tenant_id: str
    locale: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    locale: str
    is_active: bool

    class Config:
        from_attributes = True
