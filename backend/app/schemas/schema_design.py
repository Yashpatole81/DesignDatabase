from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal

class ColumnDef(BaseModel):
    id: str
    name: str
    type: str
    key: Optional[Literal["PK", "FK", "UNIQUE", "NONE"]] = "NONE"

    @field_validator('key', mode='before')
    @classmethod
    def normalize_key(cls, v):
        if v == "" or v is None:
            return "NONE"
        return v

class PositionDef(BaseModel):
    x: float
    y: float

class TableDef(BaseModel):
    id: str
    name: str
    columns: List[ColumnDef]
    position: Optional[PositionDef] = None

class RelationshipDef(BaseModel):
    id: str
    sourceTableId: str
    targetTableId: str
    sourceColumnId: Optional[str] = None
    targetColumnId: Optional[str] = None

class SchemaDesign(BaseModel):
    tables: List[TableDef]
    relationships: List[RelationshipDef]

class AIOutputResponse(BaseModel):
    tables: List[TableDef]
    relationships: List[RelationshipDef]
    sql: List[str]
    explanation: str
    warnings: List[str]

class GenerateSchemaRequest(BaseModel):
    schema_design: SchemaDesign
    prompt: str
