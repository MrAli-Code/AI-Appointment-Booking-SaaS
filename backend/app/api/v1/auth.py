from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ...core.database import get_db
from ...core.security import hash_password, verify_password, create_access_token
from ...models.tenant import Tenant
from ...models.user import User
from ...schemas.auth import SignupRequest, LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse)
async def signup(data: SignupRequest, db: AsyncSession = Depends(get_db)):
    tenant_result = await db.execute(select(Tenant).where(Tenant.slug == data.tenant_slug))
    tenant = tenant_result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        tenant_id=tenant.id,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        role="customer",
        locale=data.locale or tenant.locale,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role, "tenant_id": str(tenant.id)})
    return TokenResponse(
        access_token=token, user_id=str(user.id),
        role=user.role, tenant_id=str(tenant.id), locale=user.locale
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": str(user.id), "role": user.role,
        "tenant_id": str(user.tenant_id)
    })
    return TokenResponse(
        access_token=token, user_id=str(user.id),
        role=user.role, tenant_id=str(user.tenant_id), locale=user.locale
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(user.id), email=user.email, full_name=user.full_name,
        role=user.role, locale=user.locale, is_active=user.is_active
    )


from ...core.dependencies import get_current_user
