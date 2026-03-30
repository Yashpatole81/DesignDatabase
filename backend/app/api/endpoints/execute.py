from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel
from typing import List

from app.db.session import get_db

router = APIRouter()

class ExecuteRequest(BaseModel):
    sql_statements: List[str]

@router.post("/")
async def execute_schema(payload: ExecuteRequest, db: AsyncSession = Depends(get_db)):
    """
    Safely executes an array of SQL statements strictly inside a transaction.
    Rolls back automatically if any statement causes a DataError.
    """
    if not payload.sql_statements:
        raise HTTPException(status_code=400, detail="No SQL statements provided")

    # Safety checks
    for sql in payload.sql_statements:
        upper_sql = sql.upper()
        if "DROP DATABASE" in upper_sql:
            raise HTTPException(status_code=403, detail="Dangerous query detected: DROP DATABASE blocks execution.")
        if "DELETE" in upper_sql and "WHERE" not in upper_sql:
            raise HTTPException(status_code=403, detail="Dangerous query detected: DELETE without WHERE is blocked.")

    try:
        for sql in payload.sql_statements:
            if not sql.strip():
                continue
            await db.execute(text(sql))
        # Commit the transaction once all statements execute successfully
        await db.commit()
        return {"status": "success", "message": f"Successfully executed {len(payload.sql_statements)} statements."}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database execution failed: {str(e)}")
