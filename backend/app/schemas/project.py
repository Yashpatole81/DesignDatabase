from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.project import DBTypeEnum

class ProjectBase(BaseModel):
    name: str
    db_type: DBTypeEnum

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    db_type: Optional[DBTypeEnum] = None

class ProjectResponse(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
