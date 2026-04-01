from pydantic import BaseModel
from typing import Optional
from enum import Enum

class DBTypeEnum(str, Enum):
    mysql = "MySQL"
    postgresql = "PostgreSQL"

class ProjectCreate(BaseModel):
    name: str
    db_type: DBTypeEnum

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    db_type: Optional[DBTypeEnum] = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    db_type: DBTypeEnum
