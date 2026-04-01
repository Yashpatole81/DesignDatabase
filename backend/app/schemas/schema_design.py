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
        # Map common variations to expected values
        key_map = {
            "PRIMARY": "PK",
            "PRIMARY KEY": "PK",
            "FOREIGN": "FK",
            "FOREIGN KEY": "FK",
        }
        return key_map.get(v.upper() if isinstance(v, str) else v, v)

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
    sourceTableId: Optional[str] = None
    targetTableId: Optional[str] = None
    sourceColumnId: Optional[str] = None
    targetColumnId: Optional[str] = None

    @field_validator('sourceTableId', 'targetTableId', mode='before')
    @classmethod
    def normalize_table_ids(cls, v, info):
        # Handle LLM using 'from'/'to' instead of 'sourceTableId'/'targetTableId'
        if v is None and info.data:
            field_name = info.field_name
            if field_name == 'sourceTableId' and 'from' in info.data:
                return info.data['from']
            elif field_name == 'targetTableId' and 'to' in info.data:
                return info.data['to']
        return v

    @field_validator('sourceColumnId', 'targetColumnId', mode='before')
    @classmethod
    def normalize_column_ids(cls, v, info):
        # Handle LLM using 'from_column'/'to_column' instead of 'sourceColumnId'/'targetColumnId'
        if v is None and info.data:
            field_name = info.field_name
            if field_name == 'sourceColumnId' and 'from_column' in info.data:
                return info.data['from_column']
            elif field_name == 'targetColumnId' and 'to_column' in info.data:
                return info.data['to_column']
        return v

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
