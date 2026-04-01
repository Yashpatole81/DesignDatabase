from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

class ExecuteRequest(BaseModel):
    sql_statements: List[str]

@router.post("/")
async def execute_schema(payload: ExecuteRequest):
    if not payload.sql_statements:
        raise HTTPException(status_code=400, detail="No SQL statements provided")

    for sql in payload.sql_statements:
        upper_sql = sql.upper()
        if "DROP DATABASE" in upper_sql:
            raise HTTPException(status_code=403, detail="Dangerous query detected: DROP DATABASE is blocked.")
        if "DELETE" in upper_sql and "WHERE" not in upper_sql:
            raise HTTPException(status_code=403, detail="Dangerous query detected: DELETE without WHERE is blocked.")

    return {
        "status": "success",
        "message": f"Validated {len(payload.sql_statements)} SQL statements (schema-only mode, not executed).",
        "sql_statements": payload.sql_statements
    }
