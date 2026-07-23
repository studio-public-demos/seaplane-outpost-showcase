from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import time
from datetime import datetime, timezone, timedelta

from app.core.config import settings
from app.core.database import engine, get_db
from app.api.v1 import api_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='{"timestamp":"%(asctime)s","level":"%(levelname)s","message":"%(message)s","module":"%(module)s"}'
)
logger = logging.getLogger(__name__)

# IST timezone
IST = timezone(timedelta(hours=5, minutes=30))

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Sonipat D-DEOC API starting up", extra={"service": "sonipat-ddeoc-api"})
    yield
    logger.info("Sonipat D-DEOC API shutting down", extra={"service": "sonipat-ddeoc-api"})

app = FastAPI(
    title="Sonipat District Disaster Management and Emergency Operations Platform",
    short_name="Sonipat D-DEOC",
    description="API for district disaster management, incident response, GIS decision support, and emergency operations coordination.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Security middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-Server-Time"] = datetime.now(IST).isoformat()
    return response

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "sonipat-ddeoc-api", "timestamp": datetime.now(IST).isoformat()}

@app.get("/ready")
async def readiness_check():
    return {"status": "ready", "service": "sonipat-ddeoc-api", "timestamp": datetime.now(IST).isoformat()}
