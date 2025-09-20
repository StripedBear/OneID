from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
import os

from app.core.config import settings
from app.api.routes import auth as auth_routes
from app.api.routes import channels as channels_routes
from app.api.routes import public as public_routes
from app.api.routes import contacts as contacts_routes
from app.api.routes import oauth as oauth_routes

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.1.0",
    description="MVP: Living Contact Book / DNS for People",
)

# Раздача статических файлов (аватары)
uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Session middleware для OAuth
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

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
    return JSONResponse({"status": "ok", "service": "oneid", "version": "0.1.0"})

# API v1 роутер
api_router = APIRouter(prefix=settings.API_V1_PREFIX)
api_router.include_router(auth_routes.router)
api_router.include_router(channels_routes.router)
api_router.include_router(public_routes.router)
api_router.include_router(contacts_routes.router, prefix="/contacts", tags=["contacts"])
api_router.include_router(oauth_routes.router)

app.include_router(api_router)
