from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.sql import func
import uuid
from app.db.base import Base
import enum

class DBTypeEnum(str, enum.Enum):
    mysql = "MySQL"
    postgresql = "PostgreSQL"

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True, nullable=False)
    db_type = Column(Enum(DBTypeEnum), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
