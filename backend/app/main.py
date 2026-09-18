import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .core.config import settings
from .core.database import init_db
from .events.rabbitmq import event_bus
from .api.v1 import auth, bookings, ai_chat, payments, admin, webhooks, tenants

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME}...")
    await init_db()
    await event_bus.connect()
    yield
    await event_bus.close()
    logger.info("Application shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "locale": request.headers.get("Accept-Language", "en")},
    )


@app.get("/health")
async def health():
    return {"status": "healthy", "service": settings.APP_NAME, "version": "1.0.0"}


app.include_router(auth.router, prefix="/api/v1")
app.include_router(bookings.router, prefix="/api/v1")
app.include_router(ai_chat.router, prefix="/api/v1")
app.include_router(payments.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(webhooks.router, prefix="/api/v1")
app.include_router(tenants.router, prefix="/api/v1")
