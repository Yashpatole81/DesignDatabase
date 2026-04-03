from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import projects, execute, ai
import logging

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
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
    logger.info(f"🚀 {settings.PROJECT_NAME} starting in Schema-Only Mode")
    logger.info(f"📊 LLM Model: {settings.MODEL_NAME}")

@app.get("/")
def root():
    return {"message": "Welcome to DesignDatabase API", "mode": "schema-only"}

@app.get("/health")
def health_check():
    return {"status": "ok", "schemaOnlyMode": True}

app.include_router(projects.router, prefix=f"{settings.API_V1_STR}/projects", tags=["projects"])
app.include_router(execute.router, prefix=f"{settings.API_V1_STR}/execute", tags=["execute"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai"])
