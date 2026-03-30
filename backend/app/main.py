from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import projects, execute, ai
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    mode = "Schema-Only Mode (No DB Execution)" if settings.SCHEMA_ONLY_MODE else "Full Mode (DB Execution Enabled)"
    logger.info(f"🚀 {settings.PROJECT_NAME} starting in {mode}")
    logger.info(f"📊 LLM Model: {settings.MODEL_NAME}")
    logger.info(f"🔧 API Version: {settings.API_V1_STR}")

@app.get("/")
def root():
    return {
        "message": "Welcome to QueryNest API",
        "mode": "schema-only" if settings.SCHEMA_ONLY_MODE else "full",
        "schemaOnlyMode": settings.SCHEMA_ONLY_MODE
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "schemaOnlyMode": settings.SCHEMA_ONLY_MODE
    }

app.include_router(projects.router, prefix=f"{settings.API_V1_STR}/projects", tags=["projects"])
app.include_router(execute.router, prefix=f"{settings.API_V1_STR}/execute", tags=["execute"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai"])
