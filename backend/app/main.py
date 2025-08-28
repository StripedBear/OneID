from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings

from fastapi import APIRouter
from app.api.routes import auth as auth_routes
from app.api.routes import channels as channels_routes
from app.api.routes import public as public_routes

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.1.0",
    description="MVP: Живая записная книжка / DNS для людей",
)

# CORS — для локальной разработки с Next.js и для продакшена через .env
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Системный эндпоинт
@app.get("/health", summary="Health check", tags=["_service"])
def health() -> JSONResponse:
    return JSONResponse({"status": "ok", "service": "human-dns", "version": "0.1.0"})

# API v1 роутер
api_router = APIRouter(prefix=settings.API_V1_PREFIX)
api_router.include_router(auth_routes.router)
api_router.include_router(channels_routes.router)
api_router.include_router(public_routes.router)

app.include_router(api_router)
