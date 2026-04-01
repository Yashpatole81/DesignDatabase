from fastapi import APIRouter, HTTPException
from app.schemas.schema_design import GenerateSchemaRequest, AIOutputResponse, SchemaDesign, TableDef, ColumnDef, PositionDef
from app.services.llm_service import generate_completion
from app.services.validation_service import validate_schema
from app.services.sql_service import generate_sql
import json
import logging
import traceback
import re

logger = logging.getLogger(__name__)

router = APIRouter()

def generate_fallback_schema(user_prompt: str) -> SchemaDesign:
    """Generate a basic schema when LLM times out"""
    logger.warning("Using fallback schema generation")
    
    # Extract table names from prompt using simple keyword matching
    prompt_lower = user_prompt.lower()
    tables = []
    
    # Common patterns
    if "employee" in prompt_lower or "emp" in prompt_lower:
        tables.append(TableDef(
            id="emp_1",
            name="employees",
            columns=[
                ColumnDef(id="emp_id", name="id", type="INT", key="PK"),
                ColumnDef(id="emp_name", name="name", type="VARCHAR(100)", key="NONE"),
                ColumnDef(id="emp_email", name="email", type="VARCHAR(100)", key="UNIQUE"),
                ColumnDef(id="emp_mgr_id", name="manager_id", type="INT", key="FK"),
                ColumnDef(id="emp_created", name="created_at", type="TIMESTAMP", key="NONE")
            ],
            position=PositionDef(x=100, y=100)
        ))
    
    if "manager" in prompt_lower and "employee" not in prompt_lower:
        tables.append(TableDef(
            id="mgr_1",
            name="managers",
            columns=[
                ColumnDef(id="mgr_id", name="id", type="INT", key="PK"),
                ColumnDef(id="mgr_name", name="name", type="VARCHAR(100)", key="NONE"),
                ColumnDef(id="mgr_dept", name="department", type="VARCHAR(50)", key="NONE")
            ],
            position=PositionDef(x=400, y=100)
        ))
    
    if "salary" in prompt_lower or "salaries" in prompt_lower:
        tables.append(TableDef(
            id="sal_1",
            name="salaries",
            columns=[
                ColumnDef(id="sal_id", name="id", type="INT", key="PK"),
                ColumnDef(id="sal_emp_id", name="employee_id", type="INT", key="FK"),
                ColumnDef(id="sal_amount", name="amount", type="DECIMAL(10,2)", key="NONE"),
                ColumnDef(id="sal_effective", name="effective_date", type="DATE", key="NONE")
            ],
            position=PositionDef(x=250, y=300)
        ))
    
    # If no tables matched, create a generic one
    if not tables:
        tables.append(TableDef(
            id="tbl_1",
            name="main_table",
            columns=[
                ColumnDef(id="col_id", name="id", type="INT", key="PK"),
                ColumnDef(id="col_name", name="name", type="VARCHAR(100)", key="NONE")
            ],
            position=PositionDef(x=100, y=100)
        ))
    
    return SchemaDesign(tables=tables, relationships=[])


@router.post("/generate-schema", response_model=AIOutputResponse)
async def generate_schema(payload: GenerateSchemaRequest):
    # Simplify prompt - only send user request, not full current schema
    prompt = f"""
<<<<<<< HEAD
User wants: {payload.prompt}

Output JSON with tables, columns, relationships.
Use "PK" for primary key, "FK" for foreign key, "UNIQUE" for unique, "NONE" for no constraint.

Format:
{{"tables":[{{"id":"1","name":"tablename","columns":[{{"id":"col1","name":"colname","type":"VARCHAR(50)","key":"PK"}}],"position":{{"x":100,"y":100}}}}],"relationships":[{{"id":"rel1","sourceTableId":"1","targetTableId":"2","sourceColumnId":"col1","targetColumnId":"col2"}}],"explanation":"Created schema"}}
=======
Current schema:
{current_schema_str}

User: "{payload.prompt}"

Generate database schema. For 'key' field use: "PK", "FK", "UNIQUE", or "NONE" (not empty string).

Return JSON:
{{
    "tables": [{{"id": "str", "name": "str", "columns": [{{"id": "str", "name": "str", "type": "str", "key": "NONE"}}], "position": {{"x": 0, "y": 0}}}}],
    "relationships": [],
    "explanation": "Brief explanation"
}}
>>>>>>> a463491a0e31a80eefcdf3f7b956c561848067dd
"""
    try:
        raw_json = await generate_completion(prompt)
        parsed = json.loads(raw_json)
        
        for t in parsed.get("tables", []):
            if "position" not in t or not t["position"]:
                t["position"] = {"x": 100.0, "y": 100.0}

        new_schema = SchemaDesign(**parsed)
        explanation = parsed.get("explanation", f"Generated schema with {len(new_schema.tables)} tables.")
        
    except ValueError as ve:
        if "timed out" in str(ve).lower():
            logger.warning(f"LLM timeout, using fallback for: {payload.prompt}")
            new_schema = generate_fallback_schema(payload.prompt)
            explanation = f"Generated basic schema (LLM unavailable)"
        else:
            raise
    except json.JSONDecodeError as jde:
        logger.error(f"Invalid JSON: {str(jde)}")
        logger.error(f"Content: {raw_json!r}")
        raise HTTPException(status_code=500, detail=f"Invalid JSON: {str(jde)}")
    except Exception as e:
        logger.error(f"Failed: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed: {str(e)}")
    
    try:
        val_result = validate_schema(new_schema)
        sql_stmts = generate_sql(new_schema)
        logger.info(f"Generated {len(sql_stmts)} SQL for {len(new_schema.tables)} tables")
        
        return AIOutputResponse(
            tables=new_schema.tables,
            relationships=new_schema.relationships,
            sql=sql_stmts,
            explanation=explanation,
            warnings=val_result["warnings"] + val_result["errors"]
        )
<<<<<<< HEAD
=======
    except json.JSONDecodeError as jde:
        logger.error(f"LLM returned invalid JSON: {str(jde)}")
        logger.error(f"Offending content: {raw_json!r}")
        raise HTTPException(status_code=500, detail=f"LLM did not return valid JSON. Error: {str(jde)}")
>>>>>>> a463491a0e31a80eefcdf3f7b956c561848067dd
    except Exception as e:
        logger.error(f"Processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
